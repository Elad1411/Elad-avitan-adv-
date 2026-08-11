// ניתוח וטיוטות AI — מבוסס על מודל Claude של Anthropic.
// המערכת מקבלת עובדות (וכן תמונות/מסמכים מצורפים), מנתחת ומנסחת טיוטות,
// ומבססת את הניתוח על מקורות משפטיים אמיתיים מתוך הספרייה בלבד.

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
const PRELIM_KEYS = ['limitation', 'laches', 'no_cause', 'no_jurisdiction', 'no_privity', 'abuse']

/* ===== סכימות פלט מובנה ===== */

const OPINION_SCHEMA = {
  type: 'object',
  properties: {
    background: { type: 'string' },
    legalQuestions: { type: 'string' },
    strengths: { type: 'string' },
    weaknesses: { type: 'string' },
    analysis: { type: 'string' },
    prospects: { type: 'string', enum: PROSPECT_VALUES },
    prospectsReasoning: { type: 'string' },
    recommendations: { type: 'string' },
    documentObservations: { type: 'string' },
    citedSourceIds: { type: 'array', items: { type: 'string' } },
  },
  required: [
    'background', 'legalQuestions', 'strengths', 'weaknesses', 'analysis',
    'prospects', 'prospectsReasoning', 'recommendations', 'documentObservations', 'citedSourceIds',
  ],
  additionalProperties: false,
}

const CLAIM_SCHEMA = {
  type: 'object',
  properties: {
    claimNature: { type: 'string', description: 'מהות התביעה בקצרה' },
    jurisdiction: { type: 'string', description: 'נימוקי סמכות עניינית ומקומית' },
    summary: { type: 'string', description: 'תמצית הטענות' },
    facts: { type: 'string', description: 'פירוט עובדות — עובדה אחת בכל שורה' },
    legalArguments: { type: 'string', description: 'הטיעון המשפטי — טענה אחת בכל שורה' },
    remedies: { type: 'string', description: 'הסעדים המבוקשים — סעד אחד בכל שורה' },
    citedSourceIds: { type: 'array', items: { type: 'string' } },
  },
  required: ['claimNature', 'jurisdiction', 'summary', 'facts', 'legalArguments', 'remedies', 'citedSourceIds'],
  additionalProperties: false,
}

const DEFENSE_SCHEMA = {
  type: 'object',
  properties: {
    preliminaryDefenses: { type: 'array', items: { type: 'string', enum: PRELIM_KEYS } },
    responses: { type: 'string', description: 'מענה לטענות כתב התביעה — סעיף אחד בכל שורה' },
    defendantVersion: { type: 'string', description: 'גרסת הנתבע — עובדה אחת בכל שורה' },
    counterArguments: { type: 'string', description: 'הטיעון המשפטי — טענה אחת בכל שורה' },
    citedSourceIds: { type: 'array', items: { type: 'string' } },
  },
  required: ['preliminaryDefenses', 'responses', 'defendantVersion', 'counterArguments', 'citedSourceIds'],
  additionalProperties: false,
}

/* ===== עזרי בנייה ===== */

// בניית בלוקי תוכן מקבצים מצורפים (תמונות ו-PDF נתמכים לניתוח ישיר)
async function buildFileBlocks(files) {
  const blocks = []
  const skipped = []
  for (const f of files || []) {
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

function factsText(facts, role, areaLabel) {
  return [
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
  ].filter(Boolean).join('\n')
}

const SOURCE_RULES = `כללי מקורות מחייבים:
1. הסתמך אך ורק על המקורות המשפטיים שסופקו ברשימה. אל תמציא ואל תצטט חוקים, תקנות או פסקי דין שאינם ברשימה.
2. בשדה citedSourceIds החזר אך ורק מזהי id שמופיעים ברשימת המקורות שסופקה, ורק כאלה הרלוונטיים באמת.
3. אם צורפו תמונות/מסמכים — למד אותם ובסס עליהם את הניתוח.
4. כתוב בעברית משפטית מקצועית. החזר אך ורק אובייקט JSON תקין אחד, ללא תגיות XML וללא טקסט לפני או אחרי.`

/* ===== ליבת הקריאה למודל ===== */

async function generate({ system, blocks, schema }) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: 'disabled' },
    output_config: { effort: 'high', format: { type: 'json_schema', schema } },
    system,
    messages: [{ role: 'user', content: blocks }],
  })

  if (response.stop_reason === 'refusal') {
    throw new Error('המודל סירב לנתח את הבקשה. נסה לנסח מחדש את העובדות.')
  }
  const textBlock = (response.content || []).find(b => b.type === 'text')
  if (!textBlock) throw new Error('לא התקבל פלט מהמודל')

  const parsed = parseJsonLoose(textBlock.text)
  if (!parsed) throw new Error('הפלט מהמודל לא היה בפורמט תקין')

  return { parsed, model: response.model }
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

/* ===== 1. חוות דעת ראשונית ===== */

export async function analyzeOpinion({ role, areaLabel, facts, opposingClaim, sources, files }) {
  const { blocks: fileBlocks, skipped } = await buildFileBlocks(files)
  const system =
`אתה עוזר משפטי מומחה למשפט הישראלי, הכותב חוות דעת ראשונית עבור עורך דין.
תפקידך: לנתח את התיק על יסוד העובדות והמסמכים, להעריך את סיכויי ההליך, לזהות נקודות חוזק וחולשה, לבצע ניתוח משפטי, לנמק ולהמליץ על דרך פעולה.
${SOURCE_RULES}
5. הערכת הסיכויים חייבת להיות אחת מהערכים: high, medium_high, medium, medium_low, low.
6. גישה מאוזנת וזהירה — זו חוות דעת ראשונית ואינה מהווה התחייבות לתוצאה. אם צורפו מסמכים סכם את ממצאיך ב-documentObservations, אחרת השאר אותו ריק.
המפתחות הנדרשים: background, legalQuestions, strengths, weaknesses, analysis, prospects, prospectsReasoning, recommendations, documentObservations, citedSourceIds.`

  const blocks = [
    {
      type: 'text',
      text:
`נתח את התיק והפק חוות דעת ראשונית מובנית.

=== נתוני התיק ===
${factsText(facts, role, areaLabel)}
${opposingClaim ? `\nכתב התביעה שהתקבל נגד הלקוח:\n${opposingClaim}` : ''}

=== המקורות המשפטיים הזמינים (השתמש רק באלה) ===
${sourcesForPrompt(sources)}

${fileBlocks.length ? 'להלן התמונות/המסמכים המצורפים — למד ונתח אותם:' : 'לא צורפו תמונות או מסמכים.'}`,
    },
    ...fileBlocks,
  ]

  const { parsed, model } = await generate({ system, blocks, schema: OPINION_SCHEMA })
  return { analysis: parsed, skippedFiles: skipped, model }
}

/* ===== 2. טיוטת כתב תביעה ===== */

export async function draftClaim({ areaLabel, facts, sources, files }) {
  const { blocks: fileBlocks, skipped } = await buildFileBlocks(files)
  const system =
`אתה עורך דין ישראלי המנסח טיוטת כתב תביעה בשם התובע, לפי תקנות סדר הדין האזרחי, תשע"ט-2018.
תפקידך לנסח: מהות התביעה, נימוקי סמכות, תמצית טענות, פירוט עובדות ממוספר, טיעון משפטי, וסעדים מבוקשים — על יסוד העובדות והמקורות.
${SOURCE_RULES}
5. בשדות facts, legalArguments ו-remedies — פריט אחד בכל שורה (כל שורה תהפוך לסעיף/סעד נפרד).
6. אל תמציא סכומים או פרטי צדדים שלא נמסרו; אם חסר מידע נסח באופן כללי.
המפתחות הנדרשים: claimNature, jurisdiction, summary, facts, legalArguments, remedies, citedSourceIds.`

  const blocks = [
    {
      type: 'text',
      text:
`נסח טיוטת כתב תביעה מובנית עבור התובע.

=== נתוני התיק ===
${factsText(facts, 'plaintiff', areaLabel)}

=== המקורות המשפטיים הזמינים (השתמש רק באלה) ===
${sourcesForPrompt(sources)}

${fileBlocks.length ? 'להלן התמונות/המסמכים המצורפים — למד ונסח על פיהם:' : 'לא צורפו תמונות או מסמכים.'}`,
    },
    ...fileBlocks,
  ]

  const { parsed, model } = await generate({ system, blocks, schema: CLAIM_SCHEMA })
  return { analysis: parsed, skippedFiles: skipped, model }
}

/* ===== 3. טיוטת כתב הגנה ===== */

export async function draftDefense({ areaLabel, facts, opposingClaim, sources, files }) {
  const { blocks: fileBlocks, skipped } = await buildFileBlocks(files)
  const system =
`אתה עורך דין ישראלי המנסח טיוטת כתב הגנה בשם הנתבע, לפי תקנות סדר הדין האזרחי, תשע"ט-2018.
תפקידך לנסח: טענות מקדמיות רלוונטיות, מענה לטענות כתב התביעה, גרסת הנתבע לעובדות, וטיעון משפטי — על יסוד כתב התביעה שהתקבל, העובדות והמקורות.
${SOURCE_RULES}
5. preliminaryDefenses הוא מערך של מזהים מתוך: limitation (התיישנות), laches (שיהוי), no_cause (העדר עילה), no_jurisdiction (העדר סמכות), no_privity (העדר יריבות), abuse (שימוש לרעה בהליכי משפט) — כלול רק כאלה שיש להם בסיס ממשי בנסיבות.
6. בשדות responses, defendantVersion ו-counterArguments — פריט אחד בכל שורה.
המפתחות הנדרשים: preliminaryDefenses, responses, defendantVersion, counterArguments, citedSourceIds.`

  const blocks = [
    {
      type: 'text',
      text:
`נסח טיוטת כתב הגנה מובנית עבור הנתבע.

=== כתב התביעה שהתקבל נגד הלקוח ===
${opposingClaim || '(לא הוזן כתב תביעה — נסח מענה כללי על יסוד העובדות)'}

=== נתוני התיק (גרסת הלקוח) ===
${factsText(facts, 'defendant', areaLabel)}

=== המקורות המשפטיים הזמינים (השתמש רק באלה) ===
${sourcesForPrompt(sources)}

${fileBlocks.length ? 'להלן התמונות/המסמכים המצורפים — למד ונסח על פיהם:' : 'לא צורפו תמונות או מסמכים.'}`,
    },
    ...fileBlocks,
  ]

  const { parsed, model } = await generate({ system, blocks, schema: DEFENSE_SCHEMA })
  return { analysis: parsed, skippedFiles: skipped, model }
}
