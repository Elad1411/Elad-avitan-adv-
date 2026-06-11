import { TERMS_SECTIONS, TERMS_TITLE, TERMS_VERSION } from '@/lib/terms'

// רכיב משותף המציג את גוף התקנון. משמש גם בעמוד הייעודי וגם בחלון הקופץ.
export default function TermsContent() {
  return (
    <div className="text-right">
      <h1 className="text-2xl md:text-3xl font-black text-gold-400 mb-1">{TERMS_TITLE}</h1>
      <p className="text-gray-500 text-xs mb-6">גרסה {TERMS_VERSION}</p>
      <div className="space-y-6">
        {TERMS_SECTIONS.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-bold text-white mb-2">{section.heading}</h2>
            <div className="space-y-2">
              {section.paragraphs.map((p, i) => (
                <p key={i} className="text-gray-400 text-sm leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
