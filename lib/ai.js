// ניתוח AI לחוות דעת ראשונית — מבוסס על מודל Claude של Anthropic.
// המערכת מקבלת את תיאור העובדות (וכן תמונות/מסמכים מצורפים), מנתחת, מעריכה
// סיכויים, ומבססת את הניתוח על מקורות משפטיים אמיתיים מתוך הספרייה בלבד.

import Anthropic from '@anthropic-ai/sdk'
import { readFile } from 'fs/promises'
import path from 'path'
import { SOURCE_TYPE_LABELS } from './legal-sources'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './data/uploads'
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5'

export function hasAiKey() {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

const PROSPECT_VALUES = ['high', 'medium_high', 'medium', 'medium_low', 'low']

// סכימת הפלט המובנה שהמודל מחויב להחזיר
const OPINION_SCHEMA = {
  type: 'object',
  properties: {
    background: { type: 'string', description: 'רקע עובדתי מסודר כפי שעולה מהחומר' },
    legalQuestions: { type: 'string', description: 'השאלות המשפטיות הטעונות הכרעה' },
    strengths: { type: 'string', description: 'נקודות החוזק של הצד המיוצג' },
    weaknesses: { type: 'string', description: 'נקודות החולשה והסיכונים' },
    analysis: { type: 'string', description: 'ניתוח משפטי מפורט המפנה למקורות הרלוונטיים' },
    prospects: { type: 'string', enum: PROSPECT_VALUES, description: 'הערכת סיכויי ההליך' },
    prospectsReasoning: { type: 'string', description: 'נימוק להערכת הסיכויים' },
    recommendations: { type: 'string', description: 'המלצות מעשיות לדרך הפעולה' },
    documentObservations: { type: 'string', description: 'ממצאים מהתמונות/המסמכים שנותחו; ריק אם לא צורפו' },
    citedSourceIds: {
      type: 'array',
      items: { type: 'string' },
      description: 'מזהי המקורות המשפטיים (id) מתוך הרשימה שסופקה, עליהם נשען הניתוח',
    },
  },
  required: [
    'background', 'legalQuestions', 'strengths', 'weaknesses', 'analysis',
    'prospects', 'prospectsReasoning', 'recommendations', 'documentObservations', 'citedSourceIds',
  ],
  additionalProperties: false,
}

// בניית בלוקי תוכן מקבצים מצורפים (תמונות ו-PDF נתמכים לניתוח ישיר)
async function buildFileBlocks(files) {
  const blocks = []
  const skipped = []
  for (const f of files) {
    const mime = f.mime_type || ''
    try {
      const buf = await readFile(path.join(UPLOAD_DIR, f.stored_name))
      const b64 = buf.toString('base64')
      if (mime.startsWith('image/')) {
        blocks.push({ type: 'text', text: `— מצורף (תמונה/צילום מסך): ${f.original_name} —` })
        blocks.push({ type: 'image', source: { type: 'base64', media_type: mime, data: b64 } })
      } else if (mime === 'application/pdf') {
        blocks.push({ type: 'text', text: `— מצורף (מסמך PDF): ${f.original_name} —` })
        blocks.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: b64 } })
      } else {
        skipped.push(f.original_name)
      }
    } catch {
      skipped.push(f.original_name)
    }
  }
  return { blocks, skipped }
}

function sourcesForPrompt(sources) {
  return sources.map(s =>
    `- id: ${s.id} | ${s.name}, ${s.citation} [${SOURCE_TYPE_LABELS[s.type] || s.type}] — ${s.note}`
  ).join('\n')
}

const SYSTEM_PROMPT = `אתה עוזר משפטי מומחה למשפט הישראלי, הכותב חוות דעת ראשונית עבור עורך דין.
תפקידך: לנתח את התיק על יסוד העובדות והמסמכים שנמסרו, להעריך את סיכויי ההליך, לזהות נקודות חוזק וחולשה, לבצע ניתוח משפטי, לנמק ולהמליץ על דרך פעולה.

כללי עבודה מחייבים:
1. הסתמך אך ורק על המקורות המשפטיים שסופקו לך ברשימה. אל תמציא ואל תצטט חוקים, תקנות או פסקי דין שאינם ברשימה.
2. בשדה citedSourceIds החזר אך ורק מזהי id שמופיעים ברשימת המקורות שסופקה, ורק כאלה הרלוונטיים באמת לניתוח.
3. אם צורפו תמונות/מסמכים — למד אותם ונתח את התיק על פיהם; סכם את ממצאיך בשדה documentObservations. אם לא צורפו — השאר את השדה ריק.
4. כתוב בעברית משפטית מקצועית, בגוף שלישי, בגישה מאוזנת וזהירה. זו חוות דעת ראשונית ואינה מהווה התחייבות לתוצאה.
5. הערכת הסיכויים חייבת להיות אחת מהערכים: high, medium_high, medium, medium_low, low.
6. החזר אך ורק אובייקט JSON תקין אחד, ללא תגיות XML וללא טקסט לפני או אחרי, עם המפתחות הבאים בדיוק:
background, legalQuestions, strengths, weaknesses, analysis, prospects, prospectsReasoning, recommendations, documentObservations, citedSourceIds.`

export async function analyzeOpinion({ role, areaLabel, facts, opposingClaim, sources, files }) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const factsLines = [
    `הצד המיוצג: ${role === 'plaintiff' ? 'תובע/מבקש' : 'נתבע/משיב'}`,
    `תחום משפטי: ${areaLabel}`,
    facts.eventDate ? `תאריך האירוע: ${facts.eventDate}` : '',
    facts.eventPlace ? `מקום: ${facts.eventPlace}` : '',
    facts.chronology ? `\nתיאור העובדות כפי שנמסרו מהלקוח:\n${facts.chronology}` : '',
    facts.involved ? `\nגורמים מעורבים: ${facts.involved}` : '',
    facts.witnesses ? `עדים: ${facts.witnesses}` : '',
    facts.damages ? `נזקים: ${facts.damages}` : '',
    facts.damageAmount ? `אומדן נזק: ${facts.damageAmount} ₪` : '',
    facts.evidence ? `ראיות ומסמכים: ${facts.evidence}` : '',
    facts.actionsTaken ? `פעולות שנעשו: ${facts.actionsTaken}` : '',
    facts.criticalDates ? `מועדים קריטיים: ${facts.criticalDates}` : '',
    opposingClaim ? `\nכתב התביעה שהתקבל נגד הלקוח:\n${opposingClaim}` : '',
  ].filter(Boolean).join('\n')

  const { blocks: fileBlocks, skipped } = await buildFileBlocks(files || [])

  const userContent = [
    {
      type: 'text',
      text:
`נתח את התיק הבא והפק חוות דעת ראשונית מובנית.

=== נתוני התיק ===
${factsLines}

=== המקורות המשפטיים הזמינים (השתמש רק באלה) ===
${sourcesForPrompt(sources)}

${fileBlocks.length ? 'להלן התמונות/המסמכים המצורפים לתיק — למד ונתח אותם:' : 'לא צורפו תמונות או מסמכים לניתוח.'}`,
    },
    ...fileBlocks,
  ]

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: 'disabled' },
    output_config: { effort: 'high', format: { type: 'json_schema', schema: OPINION_SCHEMA } },
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContent }],
  })

  if (response.stop_reason === 'refusal') {
    throw new Error('המודל סירב לנתח את הבקשה. נסה לנסח מחדש את העובדות.')
  }

  const textBlock = (response.content || []).find(b => b.type === 'text')
  if (!textBlock) throw new Error('לא התקבל ניתוח מהמודל')

  const parsed = parseJsonLoose(textBlock.text)
  if (!parsed) throw new Error('הפלט מהמודל לא היה בפורמט תקין')

  return { analysis: parsed, skippedFiles: skipped, model: response.model }
}

// ניסיון עמיד לחלץ אובייקט JSON גם אם עטוף בטקסט/קוד
function parseJsonLoose(text) {
  try { return JSON.parse(text) } catch { /* continue */ }
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)) } catch { /* continue */ }
  }
  return null
}
