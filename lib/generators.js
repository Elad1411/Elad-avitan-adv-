// מחוללי מסמכים משפטיים — מפיקים HTML מוכן להדפסה/ייצוא Word.
// כל מסמך משובץ עם רשימת המקורות המשפטיים שנבחרו (לפחות 3), כולל מראה מקום וקישור.

import { SOURCE_TYPE_LABELS } from './legal-sources'

const LAWYER = {
  name: 'עו"ד אלעד אביטן',
  office: 'משרד עורכי דין אלעד אביטן',
  email: 'office@eladavitan-law.co.il',
}

export function esc(s) {
  if (s === null || s === undefined) return ''
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function nl2p(s, style = '') {
  const t = esc(s).trim()
  if (!t) return ''
  return t.split(/\n{2,}/).map(p =>
    `<p style="margin:0 0 8pt;${style}">${p.replace(/\n/g, '<br/>')}</p>`
  ).join('')
}

export function heDate(d = new Date()) {
  return new Date(d).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })
}

function money(n) {
  const num = Number(n)
  if (!num && num !== 0) return ''
  return num.toLocaleString('he-IL') + ' ₪'
}

function letterhead(subtitle = '') {
  return `
  <div style="text-align:center;border-bottom:2pt solid #1a1a1a;padding-bottom:10pt;margin-bottom:16pt;">
    <div style="font-size:16pt;font-weight:bold;">${LAWYER.office}</div>
    <div style="font-size:10pt;color:#444;">ליטיגציה מסחרית · דיני עבודה · דיני משפחה · לשון הרע · תעבורה · חוזים · מקרקעין · משפט מינהלי</div>
    ${subtitle ? `<div style="font-size:10pt;color:#444;margin-top:2pt;">${esc(subtitle)}</div>` : ''}
  </div>`
}

function docTitle(main, sub = '') {
  return `
  <div style="text-align:center;margin:14pt 0;">
    <div style="font-size:15pt;font-weight:bold;text-decoration:underline;">${esc(main)}</div>
    ${sub ? `<div style="font-size:11pt;margin-top:4pt;">${esc(sub)}</div>` : ''}
  </div>`
}

function sectionTitle(t) {
  return `<h3 style="font-size:12pt;font-weight:bold;text-decoration:underline;margin:14pt 0 6pt;">${esc(t)}</h3>`
}

// רשימת מקורות משפטיים — מראה מקום + קישור. חובה בכל מסמך.
export function sourcesSection(sources, title = 'מקורות משפטיים ומראי מקום') {
  if (!sources || !sources.length) return ''
  const items = sources.map(s => `
    <li style="margin-bottom:6pt;">
      <strong>${esc(s.name)}</strong>, ${esc(s.citation)}
      [${SOURCE_TYPE_LABELS[s.type] || esc(s.type)}]
      — ${esc(s.note)}
      <br/><span style="font-size:9pt;color:#333;">קישור: <a href="${esc(s.link)}" style="color:#1a4a8a;">${esc(s.link)}</a>${s.searchHint ? ` (${esc(s.searchHint)})` : ''}</span>
    </li>`).join('')
  return `${sectionTitle(title)}<ol style="padding-right:18pt;margin:0;">${items}</ol>`
}

function signature(role = LAWYER.name) {
  return `
  <div style="margin-top:28pt;display:flex;justify-content:space-between;">
    <div>
      <div style="border-top:1pt solid #000;width:180pt;padding-top:4pt;text-align:center;">${esc(role)}</div>
    </div>
    <div style="font-size:10pt;color:#444;align-self:flex-end;">תאריך: ${heDate()}</div>
  </div>`
}

function disclaimerBox(text) {
  return `
  <div style="border:1pt solid #888;background:#f6f6f6;padding:8pt;margin-top:16pt;font-size:9.5pt;color:#333;">
    ${esc(text)}
  </div>`
}

function partyBlock(label, p = {}) {
  const lines = [
    p.name ? `<strong>${esc(p.name)}</strong>` : '',
    p.idNumber ? `ת"ז/ח"פ: ${esc(p.idNumber)}` : '',
    p.address ? `מרחוב: ${esc(p.address)}` : '',
    p.phone ? `טלפון: ${esc(p.phone)}` : '',
    p.represented ? `ע"י ב"כ ${esc(p.represented)}` : '',
  ].filter(Boolean).join('<br/>')
  return `<div style="margin-bottom:8pt;"><u>${esc(label)}:</u><br/>${lines || '—'}</div>`
}

const FEE_TYPES = {
  fixed: 'שכר טרחה קבוע (גלובלי)',
  hourly: 'שכר טרחה לפי שעות',
  contingency: 'שכר טרחה מותנה בתוצאה (אחוזים)',
  mixed: 'שכר טרחה משולב',
}

// ============ 1. הסכם שכר טרחה ============
export function buildFeeAgreement({ client, data, sources, area }) {
  const feeDesc = {
    fixed: `שכר טרחה קבוע וכולל בסך ${money(data.feeAmount)} בתוספת מע"מ כדין.`,
    hourly: `שכר טרחה לפי שעות עבודה בפועל, בתעריף של ${money(data.feeAmount)} לשעת עבודה, בתוספת מע"מ כדין. המשרד ינהל רישום שעות ויעבירו ללקוח לפי דרישה.`,
    contingency: `שכר טרחה מותנה בתוצאה בשיעור ${esc(data.feePercent)}% (בתוספת מע"מ כדין) מכל סכום שייפסק או יתקבל לטובת הלקוח בהליך, לרבות בדרך של פשרה.`,
    mixed: `שכר טרחה משולב: סך של ${money(data.feeAmount)} בתוספת מע"מ כדין כמקדמה שאינה מותנית בתוצאה, ובנוסף ${esc(data.feePercent)}% (בתוספת מע"מ) מכל סכום שייפסק או יתקבל לטובת הלקוח.`,
  }[data.feeType] || esc(data.feeCustom || '')

  return `
  ${letterhead()}
  ${docTitle('הסכם שכר טרחה', `שנערך ונחתם ביום ${heDate()}`)}
  <table style="width:100%;margin-bottom:10pt;"><tr>
    <td style="width:50%;vertical-align:top;">${partyBlock('בין: עורך הדין', { name: LAWYER.name, address: data.officeAddress, phone: data.officePhone })}</td>
    <td style="vertical-align:top;">${partyBlock('לבין: הלקוח/ה', { name: client.name, idNumber: client.idNumber, address: client.address, phone: client.phone })}</td>
  </tr></table>

  ${sectionTitle('1. מהות הייצוג')}
  <p style="margin:0 0 8pt;">הלקוח שוכר בזאת את שירותיו המקצועיים של עורך הדין לשם ייצוגו וטיפולו המשפטי בעניין הבא:</p>
  ${nl2p(data.scope)}
  <p style="margin:0 0 8pt;">הטיפול יכלול, בין היתר: לימוד החומר, ייעוץ, ניסוח מסמכים וכתבי טענות, ייצוג מול הצד שכנגד ובפני הערכאות המוסמכות, והכל בכפוף לאמור בהסכם זה.</p>

  ${sectionTitle('2. שכר הטרחה')}
  <p style="margin:0 0 8pt;">${FEE_TYPES[data.feeType] ? `<strong>${FEE_TYPES[data.feeType]}.</strong> ` : ''}${feeDesc}</p>
  ${data.paymentTerms ? nl2p('תנאי תשלום: ' + data.paymentTerms) : ''}
  <p style="margin:0 0 8pt;">שכר הטרחה אינו כולל אגרות בית משפט, שכר מומחים, שליחויות, מסירות אישיות והוצאות צד ג\' — אלה יחולו על הלקוח וישולמו על ידו במישרין או כנגד דרישה.</p>

  ${sectionTitle('3. הוראות כלליות')}
  <ol style="padding-right:18pt;margin:0;">
    <li style="margin-bottom:5pt;">עורך הדין יפעל בנאמנות ובמסירות לטובת הלקוח, בהתאם לחוק לשכת עורכי הדין ולכללי האתיקה המקצועית, ואין בהסכם זה משום התחייבות לתוצאה.</li>
    <li style="margin-bottom:5pt;">הלקוח מתחייב לשתף פעולה, למסור מידע ומסמכים מלאים ונכונים, ולעדכן בכל שינוי רלוונטי.</li>
    <li style="margin-bottom:5pt;">כל צד רשאי להביא את הייצוג לסיומו בהודעה בכתב; במקרה כזה ייערך חשבון שכר טרחה בגין העבודה שבוצעה עד למועד הסיום, ולעניין שכר מותנה — בהתאם לתרומת העבודה שבוצעה לתוצאה שתתקבל.</li>
    <li style="margin-bottom:5pt;">סכום שלא ישולם במועדו יישא הפרשי הצמדה וריבית כדין.</li>
    ${data.extraTerms ? `<li style="margin-bottom:5pt;">${esc(data.extraTerms)}</li>` : ''}
  </ol>

  ${sourcesSection(sources, 'הבסיס הנורמטיבי להסכם')}

  <div style="margin-top:30pt;display:flex;justify-content:space-between;">
    <div style="border-top:1pt solid #000;width:170pt;padding-top:4pt;text-align:center;">${LAWYER.name}</div>
    <div style="border-top:1pt solid #000;width:170pt;padding-top:4pt;text-align:center;">${esc(client.name || 'הלקוח/ה')}</div>
  </div>`
}

// ============ 2. חוות דעת ראשונית ============
const PROSPECT_LABELS = {
  high: 'גבוהים (הערכה: מעל 70%)',
  medium_high: 'בינוניים-גבוהים (הערכה: 50%–70%)',
  medium: 'בינוניים (הערכה: 40%–60%)',
  medium_low: 'בינוניים-נמוכים (הערכה: 30%–50%)',
  low: 'נמוכים (הערכה: מתחת ל-30%)',
}

export function buildOpinion({ client, caseRow, data, sources, areaLabel, role }) {
  return `
  ${letterhead()}
  ${docTitle('חוות דעת ראשונית — הערכת סיכויי ההליך', `${esc(caseRow.title)} · תחום: ${esc(areaLabel)}`)}
  <p style="margin:0 0 4pt;"><strong>לכבוד:</strong> ${esc(client.name)}</p>
  <p style="margin:0 0 10pt;"><strong>מעמד הלקוח בהליך:</strong> ${role === 'plaintiff' ? 'תובע/ת' : 'נתבע/ת'}</p>

  ${sectionTitle('א. רקע עובדתי')}
  ${nl2p(data.background)}

  ${sectionTitle('ב. השאלות המשפטיות הטעונות הכרעה')}
  ${nl2p(data.legalQuestions)}

  ${sectionTitle('ג. ניתוח משפטי')}
  ${data.strengths ? `<p style="margin:0 0 4pt;"><strong>נקודות חוזק:</strong></p>${nl2p(data.strengths)}` : ''}
  ${data.weaknesses ? `<p style="margin:0 0 4pt;"><strong>נקודות חולשה וסיכונים:</strong></p>${nl2p(data.weaknesses)}` : ''}
  ${data.analysis ? nl2p(data.analysis) : ''}

  ${sectionTitle('ד. הערכת סיכויי ההליך')}
  <p style="margin:0 0 8pt;">על יסוד העובדות שנמסרו, המסמכים שהוצגו והדין החל, סיכויי ההליך מוערכים על ידי כ<strong>${PROSPECT_LABELS[data.prospects] || esc(data.prospects)}</strong>.</p>
  ${data.prospectsReasoning ? nl2p(data.prospectsReasoning) : ''}

  ${sectionTitle('ה. המלצות לדרך פעולה')}
  ${nl2p(data.recommendations)}

  ${sourcesSection(sources)}

  ${disclaimerBox('חוות דעת זו הינה ראשונית בלבד, מבוססת על העובדות והמסמכים שנמסרו על ידי הלקוח נכון למועד עריכתה, ואינה מהווה התחייבות לתוצאה. הערכת הסיכויים עשויה להשתנות עם קבלת מידע נוסף, גילוי מסמכים או התפתחויות בהליך.')}
  ${signature()}`
}

// ============ 3. מכתב התרעה ============
export function buildWarningLetter({ client, data, sources }) {
  return `
  ${letterhead()}
  <p style="margin:0 0 2pt;">תאריך: ${heDate()}</p>
  <p style="margin:0 0 2pt;">בדואר רשום עם אישור מסירה ${data.alsoEmail ? 'ובדוא"ל' : ''}</p>
  <div style="margin:10pt 0;">
    <strong>לכבוד</strong><br/>
    ${esc(data.recipientName)}<br/>
    ${data.recipientId ? `ת"ז/ח"פ: ${esc(data.recipientId)}<br/>` : ''}
    ${data.recipientAddress ? `${esc(data.recipientAddress)}<br/>` : ''}
  </div>
  <p style="margin:0 0 10pt;">א.ג.נ.,</p>
  ${docTitle(`הנדון: ${data.subject || 'התראה בטרם נקיטת הליכים משפטיים'}`)}
  <ol style="padding-right:18pt;margin:0;">
    <li style="margin-bottom:8pt;">הריני מתכבד לפנות אליך בשם מרשי/תי, ${esc(client.name)} (להלן: "<strong>מרשי</strong>"), כדלקמן.</li>
    <li style="margin-bottom:8pt;">${nl2pInline(data.facts)}</li>
    <li style="margin-bottom:8pt;">התנהלותך כמפורט לעיל עומדת בניגוד לדין, ובכלל זה להוראות הדין המפורטות בסיפא למכתב זה, ומקימה למרשי עילות תביעה נגדך.</li>
    <li style="margin-bottom:8pt;"><strong>לפיכך, הנך נדרש/ת בזאת:</strong> ${nl2pInline(data.demands)}${data.demandAmount ? ` וכן לשלם למרשי סך של <strong>${money(data.demandAmount)}</strong>.` : ''}</li>
    <li style="margin-bottom:8pt;">ככל שלא תיענה לדרישות במלואן בתוך <strong>${esc(data.deadlineDays || '14')} ימים</strong> ממועד מכתב זה, ייאלץ מרשי למצות את מלוא זכויותיו על פי דין, לרבות נקיטת הליכים משפטיים נגדך ללא כל התראה נוספת — ובכלל זה תביעה כספית, בקשות לסעדים זמניים וכל סעד אחר שבדין, תוך חיובך במלוא ההוצאות ושכר טרחת עורך דין.</li>
    <li style="margin-bottom:8pt;">אין באמור במכתב זה, או בכל הימנעות מפעולה, כדי למצות את טענות מרשי או לגרוע מכל זכות או סעד העומדים לו על פי דין, וכל זכויות מרשי שמורות במלואן.</li>
  </ol>
  ${sourcesSection(sources, 'הוראות הדין העומדות בבסיס הדרישה')}
  ${signature()}`
}

function nl2pInline(s) {
  return esc(s).trim().replace(/\n/g, '<br/>')
}

// ============ 4. כתב תביעה ============
export function buildStatementOfClaim({ client, caseRow, data, sources, areaLabel }) {
  const remedies = (data.remedies || '').split('\n').map(s => s.trim()).filter(Boolean)
  return `
  <div style="text-align:center;margin-bottom:8pt;">
    <div style="font-weight:bold;">בבית ${esc(data.court || 'משפט השלום')} ב${esc(data.courtCity || '')}</div>
    <div style="font-size:10pt;">ת"א _________</div>
  </div>
  <table style="width:100%;margin-bottom:10pt;"><tr>
    <td style="width:50%;vertical-align:top;">
      ${partyBlock('התובע/ת', { name: client.name, idNumber: client.idNumber, address: client.address, represented: `${LAWYER.name}${data.officeAddress ? `, ${data.officeAddress}` : ''}` })}
    </td>
    <td style="vertical-align:top;text-align:center;font-weight:bold;">— נגד —</td>
  </tr><tr>
    <td colspan="2">${partyBlock('הנתבע/ת', { name: data.defendantName, idNumber: data.defendantId, address: data.defendantAddress })}</td>
  </tr></table>

  ${docTitle('כתב תביעה', `${esc(data.claimNature || areaLabel)}${data.claimAmount ? ` · סכום התביעה: ${money(data.claimAmount)}` : ''}`)}

  ${sectionTitle('חלק ראשון — פרטי התביעה (לפי תקנה 10 לתקנות סדר הדין האזרחי, תשע"ט-2018)')}
  <ol style="padding-right:18pt;margin:0;">
    <li style="margin-bottom:5pt;"><strong>הסעד המבוקש:</strong> ${remedies.length ? remedies.map(esc).join('; ') : '—'}${data.claimAmount ? `; סכום התביעה: ${money(data.claimAmount)}` : ''}.</li>
    <li style="margin-bottom:5pt;"><strong>הסמכות העניינית והמקומית:</strong> ${nl2pInline(data.jurisdiction || 'לבית משפט נכבד זה הסמכות העניינית והמקומית לדון בתביעה, בהתאם לסכום התביעה ולמקום ביצוע ההתחייבות/מגורי הנתבע.')}</li>
    ${data.priorProceedings ? `<li style="margin-bottom:5pt;"><strong>הליכים קודמים בין הצדדים:</strong> ${nl2pInline(data.priorProceedings)}</li>` : ''}
  </ol>

  ${sectionTitle('חלק שני — תמצית הטענות')}
  ${nl2p(data.summary)}

  ${sectionTitle('חלק שלישי — פירוט העובדות')}
  ${numberedFromText(data.facts)}

  ${sectionTitle('הטיעון המשפטי')}
  ${numberedFromText(data.legalArguments, 20)}
  <p style="margin:8pt 0;">הוראות הדין והפסיקה עליהן נסמכת התביעה מפורטות ברשימת המקורות שלהלן, המהווה חלק בלתי נפרד מכתב טענות זה.</p>

  ${sectionTitle('הסעדים')}
  <p style="margin:0 0 6pt;">אשר על כן, מתבקש בית המשפט הנכבד להזמין את הנתבע/ת לדין ולחייבו/ה כדלקמן:</p>
  <ol style="padding-right:18pt;margin:0;">
    ${remedies.map(r => `<li style="margin-bottom:4pt;">${esc(r)}</li>`).join('') || '<li>—</li>'}
    <li style="margin-bottom:4pt;">לחייב את הנתבע/ת בהוצאות משפט ושכר טרחת עורך דין בתוספת מע"מ כדין.</li>
    <li style="margin-bottom:4pt;">כל סעד אחר שבית המשפט הנכבד ימצא לנכון בנסיבות העניין.</li>
  </ol>

  ${sourcesSection(sources, 'מקורות משפטיים עליהם נסמכת התביעה')}
  ${signature(`${LAWYER.name}, ב"כ התובע/ת`)}`
}

function numberedFromText(text, startAt = 1) {
  const items = String(text || '').split(/\n+/).map(s => s.trim()).filter(Boolean)
  if (!items.length) return ''
  return `<ol start="${startAt}" style="padding-right:18pt;margin:0;">${items.map(i => `<li style="margin-bottom:5pt;">${esc(i)}</li>`).join('')}</ol>`
}

// ============ 5. כתב הגנה ============
const PRELIM_DEFENSES = {
  limitation: 'התיישנות — התביעה הוגשה בחלוף תקופת ההתיישנות הקבועה בחוק ההתיישנות, תשי"ח-1958, ודינה סילוק על הסף.',
  laches: 'שיהוי — התובע/ת השתהה/תה שיהוי ניכר ובלתי מוסבר בהגשת התביעה, באופן שפגע בנתבע/ת ראייתית ומהותית.',
  no_cause: 'העדר עילה — כתב התביעה, אף בהנחה שכל האמור בו אמת, אינו מגלה עילת תביעה נגד הנתבע/ת.',
  no_jurisdiction: 'העדר סמכות — לבית משפט נכבד זה אין סמכות עניינית ו/או מקומית לדון בתביעה.',
  no_privity: 'העדר יריבות — אין כל יריבות משפטית בין התובע/ת לבין הנתבע/ת ביחס לנטען בכתב התביעה.',
  abuse: 'שימוש לרעה בהליכי משפט — התביעה הוגשה בחוסר תום לב ולמטרות פסולות.',
}

export function buildStatementOfDefense({ client, caseRow, data, sources }) {
  const prelim = (data.preliminaryDefenses || []).map(k => PRELIM_DEFENSES[k]).filter(Boolean)
  return `
  <div style="text-align:center;margin-bottom:8pt;">
    <div style="font-weight:bold;">בבית ${esc(data.court || 'משפט השלום')} ב${esc(data.courtCity || '')}</div>
    <div style="font-size:10pt;">ת"א ${esc(data.caseNumber || '_________')}</div>
  </div>
  <table style="width:100%;margin-bottom:10pt;"><tr>
    <td style="width:50%;vertical-align:top;">${partyBlock('התובע/ת', { name: data.plaintiffName, represented: data.plaintiffCounsel })}</td>
    <td style="vertical-align:top;text-align:center;font-weight:bold;">— נגד —</td>
  </tr><tr>
    <td colspan="2">${partyBlock('הנתבע/ת', { name: client.name, idNumber: client.idNumber, address: client.address, represented: LAWYER.name })}</td>
  </tr></table>

  ${docTitle('כתב הגנה')}
  <p style="margin:0 0 8pt;">הנתבע/ת, באמצעות ב"כ, מתכבד/ת להגיש את כתב ההגנה מטעמו/ה, כדלקמן:</p>

  ${sectionTitle('א. פתח דבר')}
  <ol style="padding-right:18pt;margin:0;">
    <li style="margin-bottom:5pt;">כל האמור בכתב התביעה מוכחש מכל וכל, אלא אם הודה בו הנתבע/ת במפורש בכתב הגנה זה. אין לראות באי-התייחסות לטענה כלשהי משום הודאה בה.</li>
    <li style="margin-bottom:5pt;">דין התביעה להידחות על הסף ולגופה, שכן היא נעדרת בסיס עובדתי ומשפטי, והכל כמפורט להלן.</li>
  </ol>

  ${prelim.length ? `${sectionTitle('ב. טענות מקדמיות')}<ol style="padding-right:18pt;margin:0;">${prelim.map(p => `<li style="margin-bottom:5pt;">${esc(p)}</li>`).join('')}</ol>` : ''}

  ${sectionTitle(`${prelim.length ? 'ג' : 'ב'}. מענה לטענות כתב התביעה`)}
  ${numberedFromText(data.responses)}

  ${sectionTitle(`${prelim.length ? 'ד' : 'ג'}. גרסת הנתבע/ת — העובדות לאשורן`)}
  ${numberedFromText(data.defendantVersion, 20)}

  ${data.counterArguments ? `${sectionTitle(`${prelim.length ? 'ה' : 'ד'}. הטיעון המשפטי`)}${numberedFromText(data.counterArguments, 40)}` : ''}

  ${sectionTitle('סוף דבר')}
  <p style="margin:0 0 6pt;">אשר על כן, מתבקש בית המשפט הנכבד לדחות את התביעה על כל רכיביה, ולחייב את התובע/ת בהוצאות משפט ושכר טרחת עורך דין בתוספת מע"מ כדין.</p>

  ${sourcesSection(sources, 'מקורות משפטיים עליהם נסמכת ההגנה')}
  ${signature(`${LAWYER.name}, ב"כ הנתבע/ת`)}`
}

// ============ 6. בקשות וסעדים ============
export const MOTION_TYPES = {
  temp_attachment: { label: 'בקשה למתן צו עיקול זמני', affidavit: true },
  temp_injunction: { label: 'בקשה למתן צו מניעה זמני', affidavit: true },
  exit_ban: { label: 'בקשה למתן צו עיכוב יציאה מן הארץ', affidavit: true },
  extension: { label: 'בקשה להארכת מועד', affidavit: false },
  disclosure: { label: 'בקשה לגילוי ועיון במסמכים', affidavit: false },
  dismissal: { label: 'בקשה לסילוק על הסף', affidavit: false },
  default_judgment: { label: 'בקשה למתן פסק דין בהעדר הגנה', affidavit: false },
  fee_exemption: { label: 'בקשה לפטור מאגרה', affidavit: true },
  amend_pleading: { label: 'בקשה לתיקון כתב טענות', affidavit: false },
  summary_judgment: { label: 'בקשה למחיקת כותרת / התנגדות לסדר דין מקוצר', affidavit: false },
}

export function buildMotion({ client, caseRow, data, sources, role }) {
  const mt = MOTION_TYPES[data.motionType] || { label: data.motionTitle || 'בקשה', affidavit: false }
  const applicantRole = role === 'plaintiff' ? 'התובע/ת (המבקש/ת)' : 'הנתבע/ת (המבקש/ת)'
  return `
  <div style="text-align:center;margin-bottom:8pt;">
    <div style="font-weight:bold;">בבית ${esc(data.court || 'משפט השלום')} ב${esc(data.courtCity || '')}</div>
    <div style="font-size:10pt;">ת"א ${esc(data.caseNumber || '_________')}</div>
  </div>
  <table style="width:100%;margin-bottom:10pt;"><tr>
    <td style="width:50%;vertical-align:top;">${partyBlock('המבקש/ת', { name: client.name, represented: LAWYER.name })}</td>
    <td style="vertical-align:top;text-align:center;font-weight:bold;">— נגד —</td>
  </tr><tr>
    <td colspan="2">${partyBlock('המשיב/ה', { name: data.respondentName })}</td>
  </tr></table>

  ${docTitle(mt.label)}
  <p style="margin:0 0 8pt;">${esc(applicantRole)}, באמצעות ב"כ, מתכבד/ת לפנות לבית המשפט הנכבד בבקשה זו, כדלקמן:</p>

  ${sectionTitle('א. הסעד המבוקש')}
  ${nl2p(data.requestedRelief)}

  ${sectionTitle('ב. הרקע העובדתי')}
  ${numberedFromText(data.background)}

  ${sectionTitle('ג. הנימוקים המשפטיים')}
  ${numberedFromText(data.legalGrounds, 10)}
  <p style="margin:8pt 0;">הבקשה נסמכת על הוראות הדין והפסיקה המפורטות ברשימת המקורות שלהלן.</p>

  ${data.urgency ? `${sectionTitle('ד. הדחיפות ומאזן הנוחות')}${nl2p(data.urgency)}` : ''}

  ${sectionTitle('סוף דבר')}
  <p style="margin:0 0 6pt;">אשר על כן, מתבקש בית המשפט הנכבד להיעתר לבקשה במלואה, ולחייב את המשיב/ה בהוצאות הבקשה ושכר טרחת עורך דין.</p>
  ${mt.affidavit ? '<p style="margin:0 0 6pt;"><strong>תצהיר המבקש/ת בתמיכה לבקשה מצורף לבקשה זו.</strong></p>' : ''}

  ${sourcesSection(sources, 'מקורות משפטיים עליהם נסמכת הבקשה')}
  ${signature(`${LAWYER.name}, ב"כ המבקש/ת`)}`
}

// ============ עטיפת מסמך מלאה (להדפסה / Word) ============
export function wrapDocument(title, bodyHtml) {
  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="utf-8"/>
<title>${esc(title)}</title>
<style>
  @page { size: A4; margin: 2.2cm 2.5cm; }
  body { font-family: 'David', 'Frank Ruehl', 'Times New Roman', serif; font-size: 12pt; line-height: 1.55; color: #111; direction: rtl; }
  a { color: #1a4a8a; }
  @media print { .no-print { display: none !important; } }
</style>
</head>
<body>${bodyHtml}</body>
</html>`
}

export const DOC_TYPES = {
  fee_agreement: { label: 'הסכם שכר טרחה', build: buildFeeAgreement },
  opinion: { label: 'חוות דעת ראשונית', build: buildOpinion },
  warning_letter: { label: 'מכתב התרעה', build: buildWarningLetter },
  statement_of_claim: { label: 'כתב תביעה', build: buildStatementOfClaim },
  statement_of_defense: { label: 'כתב הגנה', build: buildStatementOfDefense },
  motion: { label: 'בקשה לבית המשפט', build: buildMotion },
}
