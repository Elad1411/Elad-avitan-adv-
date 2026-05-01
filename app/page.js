'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' })
  const [formSent, setFormSent] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      setFormSent(true)
      setFormData({ name: '', phone: '', email: '', message: '' })
    } catch {
      setFormSent(true)
    } finally {
      setFormLoading(false)
    }
  }

  const navLinks = [
    { href: '#about', label: 'אודות' },
    { href: '#services', label: 'תחומי עיסוק' },
    { href: '#contact', label: 'צור קשר' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* ========== NAVBAR ========== */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-black/95 backdrop-blur-md border-b border-[#1e1e1e] shadow-2xl'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-right">
            <div className="text-gold-500 font-black text-xl leading-tight">עו&quot;ד אלעד אביטן</div>
            <div className="text-gray-500 text-xs font-light tracking-wider">משרד עורכי דין</div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-gold-400 transition-colors font-medium text-sm tracking-wide"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="tel:054-4680810" className="text-gold-400 hover:text-gold-300 text-sm font-medium transition-colors">
              054-4680810
            </a>
            <Link href="/portal" className="btn-gold text-sm py-2 px-5">
              כניסת לקוחות
            </Link>
          </div>

          <button
            className="md:hidden text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="תפריט"
          >
            <div className="w-6 h-0.5 bg-white mb-1.5 transition-all"></div>
            <div className="w-6 h-0.5 bg-white mb-1.5 transition-all"></div>
            <div className="w-6 h-0.5 bg-white transition-all"></div>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-black/98 border-t border-[#1e1e1e] px-6 py-4">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="block py-3 text-gray-300 hover:text-gold-400 border-b border-[#1a1a1a] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 space-y-3">
              <a href="tel:054-4680810" className="block text-center text-gold-400 font-bold text-lg">054-4680810</a>
              <Link href="/portal" className="btn-gold block text-center" onClick={() => setMenuOpen(false)}>
                כניסת לקוחות
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ========== HERO ========== */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 hero-overlay z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/hero.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-20 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-gold-500" />
              <span className="text-gold-400 text-sm font-medium tracking-[0.2em] uppercase">
                משרד עורכי הדין
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-none mb-4">
              עו&quot;ד
              <br />
              <span className="text-gold-400">אלעד</span>
              <br />
              אביטן
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-light mb-4 tracking-wide">
              הגנה נחרצת. תוצאות מוכחות.
            </p>
            <p className="text-base text-gray-400 mb-10 leading-relaxed max-w-lg">
              ייצוג משפטי מקצועי ומסור בתחומי המשפט הפלילי,
              תעבורה וליטיגציה אזרחית-מסחרית.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#contact"
                className="btn-gold text-base px-10 py-4 text-center"
              >
                קבע פגישת ייעוץ
              </a>
              <a
                href="tel:054-4680810"
                className="btn-outline-gold text-base px-10 py-4 text-center"
              >
                054-4680810
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 right-1/2 translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-60">
          <span className="text-gray-500 text-xs tracking-widest">גלול למטה</span>
          <div className="w-px h-8 bg-gradient-to-b from-gold-500 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ========== ABOUT ========== */}
      <section id="about" className="py-28 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-px bg-gold-500" />
                <span className="text-gold-400 text-sm font-medium tracking-[0.2em] uppercase">אודות המשרד</span>
              </div>
              <h2 className="section-title">
                ניסיון, מקצועיות
                <br />
                ומסירות מלאה
              </h2>
              <div className="gold-line" />
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                משרד עורכי הדין אלעד אביטן מספק ייצוג משפטי מקצועי ומסור ללקוחותיו.
                עם שנות ניסיון עשירות בבתי המשפט בישראל, המשרד מתמחה בדיני פלילי,
                תעבורה וליטיגציה אזרחית-מסחרית.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                אנו מאמינים כי כל לקוח ראוי לייצוג מקצועי מלא ולתשומת לב אישית.
                גישתנו משלבת ידע משפטי מעמיק עם הבנת הצרכים האישיים של כל לקוח.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed mb-12">
                המשרד ממוקם בגן יבנה ומשרת לקוחות בכל רחבי הארץ, תוך מתן שירות
                זמין ואישי לאורך כל הדרך.
              </p>

              <div className="grid grid-cols-3 gap-6 border-t border-[#1e1e1e] pt-8">
                {[
                  { num: '15+', label: 'שנות ניסיון' },
                  { num: '500+', label: 'תיקים טופלו' },
                  { num: '24/7', label: 'זמינות ללקוח' },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-4xl font-black text-gold-500 mb-1">{stat.num}</div>
                    <div className="text-gray-500 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative h-[600px] rounded-2xl overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: "url('/images/about.jpg')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-gold-500 text-black p-6 rounded-xl shadow-2xl">
                <div className="text-2xl font-black leading-tight">עו&quot;ד</div>
                <div className="text-2xl font-black leading-tight">אלעד אביטן</div>
                <div className="text-sm font-medium mt-1 opacity-80">גן יבנה</div>
              </div>
              <div className="absolute top-6 -right-4 bg-[#111] border border-[#222] rounded-xl p-4 shadow-xl">
                <div className="text-gold-400 text-sm font-medium mb-1">✓ זמינות מלאה</div>
                <div className="text-gray-500 text-xs">054-4680810</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SERVICES ========== */}
      <section id="services" className="py-28 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-6 h-px bg-gold-500" />
              <span className="text-gold-400 text-sm font-medium tracking-[0.2em] uppercase">השירותים שלנו</span>
              <div className="w-6 h-px bg-gold-500" />
            </div>
            <h2 className="section-title">תחומי התמחות</h2>
            <div className="gold-line mx-auto" />
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              המשרד מתמחה בשלושה תחומי משפט מרכזיים תוך מתן שירות מקצועי ומסור
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Criminal */}
            <div className="group card-dark p-8 hover:border-gold-500/40 transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gold-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-gold-500/20 transition-colors">
                <svg className="w-7 h-7 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">דיני פלילי</h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                ייצוג מקצועי ונחוש בכל סוגי התיקים הפליליים. מחקירה ועד גזר הדין,
                אנו נלחמים עבור זכויותיך בכל שלב של ההליך המשפטי.
              </p>
              <ul className="space-y-2">
                {['עבירות אלימות', 'עבירות רכוש וכלכלה', 'עבירות סמים', 'ייצוג בחקירות'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-gray-500 text-sm">
                    <span className="text-gold-500 font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Traffic */}
            <div className="group card-dark p-8 border-gold-500/30 hover:border-gold-500/60 transition-all duration-300 hover:-translate-y-2 relative md:mt-4">
              <div className="absolute -top-4 right-1/2 translate-x-1/2 bg-gold-500 text-black text-xs font-black px-5 py-1.5 rounded-full shadow-lg">
                פופולרי
              </div>
              <div className="w-14 h-14 bg-gold-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-gold-500/20 transition-colors">
                <svg className="w-7 h-7 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h2m8-12h2l3 3v5h-2m-5-8v8" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">תעבורה</h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                טיפול מקצועי בכל עבירות התנועה. שמירה על רישיון הנהיגה שלך
                ומניעת השלכות לא רצויות על חיי היום-יום.
              </p>
              <ul className="space-y-2">
                {['שלילת רישיון נהיגה', 'תאונות דרכים', 'נהיגה בשכרות', 'קנסות ודוחות'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-gray-500 text-sm">
                    <span className="text-gold-500 font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Civil */}
            <div className="group card-dark p-8 hover:border-gold-500/40 transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gold-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-gold-500/20 transition-colors">
                <svg className="w-7 h-7 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">ליטיגציה אזרחית-מסחרית</h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                ייצוג בסכסוכים אזרחיים ומסחריים. פתרון יעיל ומקצועי של מחלוקות
                עסקיות, חוזיות ונזיקיות.
              </p>
              <ul className="space-y-2">
                {['סכסוכים עסקיים', 'הפרת חוזים', 'תביעות נזיקין', 'גביית חובות'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-gray-500 text-sm">
                    <span className="text-gold-500 font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========== WHY US ========== */}
      <section className="py-28 bg-[#0d0d0d] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-gold-500 blur-3xl" />
          <div className="absolute bottom-20 left-20 w-64 h-64 rounded-full bg-gold-500 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-6 h-px bg-gold-500" />
              <span className="text-gold-400 text-sm font-medium tracking-[0.2em] uppercase">היתרונות שלנו</span>
              <div className="w-6 h-px bg-gold-500" />
            </div>
            <h2 className="section-title">למה לבחור במשרדנו?</h2>
            <div className="gold-line mx-auto" />
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'ניסיון רב',
                text: 'שנות ניסיון עשירות בייצוג לקוחות בבתי משפט בכל רחבי הארץ',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ),
                title: 'גישה אישית',
                text: 'כל לקוח מקבל תשומת לב אישית ומסירות מלאה לתיקו',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'זמינות גבוהה',
                text: 'אנו זמינים עבורך בכל שעה ומעדכנים אותך בכל התפתחות בתיק',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                ),
                title: 'תוצאות מוכחות',
                text: 'מוניטין מוכח של הצלחות בתיקים מורכבים ורגישים',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="card-dark p-7 hover:border-gold-500/30 transition-all duration-300 hover:-translate-y-1 text-center"
              >
                <div className="w-16 h-16 bg-gold-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 text-gold-500">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CONTACT ========== */}
      <section id="contact" className="py-28 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-6 h-px bg-gold-500" />
              <span className="text-gold-400 text-sm font-medium tracking-[0.2em] uppercase">יצירת קשר</span>
              <div className="w-6 h-px bg-gold-500" />
            </div>
            <h2 className="section-title">נשמח לשמוע ממך</h2>
            <div className="gold-line mx-auto" />
            <p className="text-gray-400 max-w-xl mx-auto">
              מלאו את הטופס ונחזור אליכם בהקדם, או פנו אלינו ישירות בטלפון
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            {/* Info */}
            <div className="space-y-6">
              {[
                {
                  icon: (
                    <svg className="w-6 h-6 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                  title: 'כתובת המשרד',
                  content: 'רח\' בן גוריון 65, גן יבנה',
                  href: null,
                },
                {
                  icon: (
                    <svg className="w-6 h-6 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  ),
                  title: 'טלפון',
                  content: '054-4680810',
                  href: 'tel:054-4680810',
                },
                {
                  icon: (
                    <svg className="w-6 h-6 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ),
                  title: 'אי-מייל',
                  content: 'office@eladavitan-law.co.il',
                  href: 'mailto:office@eladavitan-law.co.il',
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-gold-400 font-medium mb-1 text-sm">{item.title}</div>
                    {item.href ? (
                      <a href={item.href} className="text-gray-300 hover:text-gold-400 transition-colors text-lg font-medium">
                        {item.content}
                      </a>
                    ) : (
                      <div className="text-gray-300 text-lg">{item.content}</div>
                    )}
                  </div>
                </div>
              ))}

              <div className="card-dark p-6 mt-8">
                <h4 className="text-gold-400 font-bold mb-4">שעות פעילות</h4>
                <div className="space-y-2 text-sm">
                  {[
                    { day: 'ראשון – חמישי', hours: '09:00 – 18:00' },
                    { day: 'שישי', hours: '09:00 – 13:00' },
                    { day: 'שבת', hours: 'סגור', closed: true },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center py-1 border-b border-[#1e1e1e] last:border-0">
                      <span className="text-gray-400">{row.day}</span>
                      <span className={row.closed ? 'text-red-400' : 'text-gold-400 font-medium'}>
                        {row.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div>
              {formSent ? (
                <div className="card-dark p-10 text-center h-full flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-green-900/30 border border-green-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-3">ההודעה נשלחה בהצלחה!</h4>
                  <p className="text-gray-400 mb-8">נחזור אליך בהקדם האפשרי. תודה שפנית אלינו.</p>
                  <button
                    onClick={() => setFormSent(false)}
                    className="text-gold-500 hover:text-gold-400 underline text-sm transition-colors"
                  >
                    שלח הודעה נוספת
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="card-dark p-8 space-y-5">
                  <h3 className="text-xl font-bold text-white mb-6">שלח הודעה</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label-dark">שם מלא *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="input-dark"
                        placeholder="ישראל ישראלי"
                      />
                    </div>
                    <div>
                      <label className="label-dark">טלפון *</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="input-dark"
                        placeholder="050-0000000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label-dark">אי-מייל</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="input-dark"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="label-dark">הודעה *</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      className="input-dark resize-none"
                      placeholder="תאר את עניינך בקצרה..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="btn-gold w-full py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {formLoading ? 'שולח...' : 'שלח הודעה'}
                  </button>
                  <p className="text-gray-600 text-xs text-center">
                    המידע שמסרת ישמר בסודיות מלאה
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="bg-black border-t border-[#111] py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-right">
              <div className="text-gold-500 font-black text-lg">עו&quot;ד אלעד אביטן</div>
              <div className="text-gray-600 text-sm">משרד עורכי דין | גן יבנה</div>
            </div>
            <div className="flex flex-wrap gap-6 text-gray-600 text-sm justify-center">
              <a href="#about" className="hover:text-gold-400 transition-colors">אודות</a>
              <a href="#services" className="hover:text-gold-400 transition-colors">תחומי עיסוק</a>
              <a href="#contact" className="hover:text-gold-400 transition-colors">צור קשר</a>
              <Link href="/portal" className="hover:text-gold-400 transition-colors">פורטל לקוחות</Link>
            </div>
            <div className="text-gray-700 text-sm text-center">
              © {new Date().getFullYear()} כל הזכויות שמורות לעו&quot;ד אלעד אביטן
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
