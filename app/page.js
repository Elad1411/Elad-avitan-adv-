'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return count
}

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' })
  const [formSent, setFormSent] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef(null)

  const count1 = useCountUp(15, 2000, statsVisible)
  const count2 = useCountUp(500, 2500, statsVisible)
  const count3 = useCountUp(98, 2000, statsVisible)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
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
    { href: '#process', label: 'אופן הטיפול' },
    { href: '#contact', label: 'צור קשר' },
  ]

  const services = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
      title: 'ליטיגציה מסחרית',
      subtitle: 'Commercial Litigation',
      desc: 'ייצוג בסכסוכים אזרחיים ומסחריים מורכבים. ניהול הליכי משפט בבתי המשפט המחוזיים ועליון. פתרון יעיל של מחלוקות עסקיות וחוזיות.',
      items: ['סכסוכים בין שותפים', 'הפרת חוזים מסחריים', 'תביעות נזיקין', 'גביית חובות'],
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h2m8-12h2l3 3v5h-2m-5-8v8" />
        </svg>
      ),
      title: 'דיני תעבורה',
      subtitle: 'Traffic Law',
      desc: 'טיפול מקצועי בכל עבירות התנועה תוך שמירה מקסימלית על רישיון הנהיגה שלך ועל חופש התנועה.',
      items: ['שלילת רישיון נהיגה', 'תאונות דרכים', 'נהיגה בשכרות', 'קנסות ודוחות'],
      featured: true,
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'דיני פלילי',
      subtitle: 'Criminal Law',
      desc: 'ייצוג מקצועי ונחוש בכל סוגי התיקים הפליליים. מחקירה ועד גזר הדין, נלחמים עבור זכויותיך בכל שלב.',
      items: ['עבירות אלימות ורכוש', 'עבירות כלכליות', 'עבירות סמים', 'ייצוג בחקירות'],
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: 'דיני משפחה',
      subtitle: 'Family Law',
      desc: 'ליווי אישי ורגיש בסוגיות המשפחתיות הקשות ביותר. טיפול מקצועי ואנושי בכל שלב של ההליך.',
      items: ['גירושין והסכמי גירושין', 'משמורת וקשר ילדים', 'מזונות', 'חלוקת רכוש'],
    },
  ]

  const processSteps = [
    {
      num: '01',
      title: 'פגישת היכרות',
      desc: 'שיחה ראשונה חינם לבחינת המקרה, הצגת האפשרויות והגדרת הציפיות.',
    },
    {
      num: '02',
      title: 'בניית אסטרטגיה',
      desc: 'גיבוש תוכנית פעולה מותאמת אישית למקרה, עם הבנה מלאה של הסיכונים וההזדמנויות.',
    },
    {
      num: '03',
      title: 'ניהול ההליך',
      desc: 'ייצוג מלא ומסור בכל ההליכים המשפטיים, תוך עדכון שוטף ושקיפות מלאה.',
    },
    {
      num: '04',
      title: 'השגת התוצאה',
      desc: 'מחויבות להשגת התוצאה הטובה ביותר עבורך, בין בהסכם ובין בהכרעת בית המשפט.',
    },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" dir="rtl">

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-black/95 backdrop-blur-md border-b border-[#1e1e1e] shadow-2xl py-3'
          : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="text-right">
            <div className="text-gold-500 font-black text-xl leading-tight tracking-tight">
              עו&quot;ד אלעד אביתן
            </div>
            <div className="text-gray-500 text-xs font-light tracking-wider">משרד עורכי דין</div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-gold-400 transition-colors duration-200 font-medium text-sm tracking-wide cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <a
              href="tel:054-4680810"
              className="text-gold-400 hover:text-gold-300 text-sm font-bold transition-colors cursor-pointer"
            >
              054-4680810
            </a>
            <a href="#contact" className="btn-gold text-sm py-2 px-5">
              קבע פגישה
            </a>
          </div>

          <button
            className="md:hidden text-white p-2 cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="תפריט"
          >
            <div className={`w-6 h-0.5 bg-white transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <div className={`w-6 h-0.5 bg-white my-1.5 transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-6 h-0.5 bg-white transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-black/98 border-t border-[#1e1e1e] px-6 py-4">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="block py-3 text-gray-300 hover:text-gold-400 border-b border-[#1a1a1a] transition-colors cursor-pointer"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 space-y-3">
              <a href="tel:054-4680810" className="block text-center text-gold-400 font-black text-xl">
                054-4680810
              </a>
              <a href="#contact" className="btn-gold block text-center" onClick={() => setMenuOpen(false)}>
                קבע פגישת ייעוץ
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/hero.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-l from-black/10 via-black/60 to-black/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        <div className="relative z-20 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-px bg-gold-500" />
              <span className="text-gold-400 text-sm font-medium tracking-[0.25em] uppercase">
                משרד עורכי הדין
              </span>
            </div>

            <h1 className="font-black text-white leading-none mb-6">
              <span className="block text-5xl md:text-7xl lg:text-8xl">עו&quot;ד</span>
              <span className="block text-6xl md:text-8xl lg:text-9xl text-gold-400">אלעד</span>
              <span className="block text-5xl md:text-7xl lg:text-8xl">אביתן</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-200 font-light mb-3 tracking-wide">
              הגנה נחרצת. תוצאות מוכחות.
            </p>
            <p className="text-base text-gray-400 mb-10 leading-relaxed max-w-xl">
              ייצוג משפטי מקצועי בתחומי הליטיגציה המסחרית, דיני תעבורה,
              פלילי ומשפחה — לצדך בכל שלב.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#contact" className="btn-gold text-base px-10 py-4 text-center">
                קבע פגישת ייעוץ חינם
              </a>
              <a href="tel:054-4680810" className="btn-outline-gold text-base px-10 py-4 text-center">
                התקשר עכשיו
              </a>
            </div>

            <div className="mt-14 flex flex-wrap gap-8 border-t border-[#222] pt-8">
              {[
                { val: '15+', label: 'שנות ניסיון' },
                { val: '500+', label: 'תיקים הושלמו' },
                { val: '24/7', label: 'זמינות ללקוח' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-black text-gold-400">{s.val}</div>
                  <div className="text-gray-500 text-xs mt-1 tracking-wide">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-50">
          <div className="w-px h-10 bg-gradient-to-b from-gold-500 to-transparent animate-pulse" />
          <span className="text-gray-500 text-xs tracking-widest">גלול למטה</span>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div ref={statsRef} className="bg-gold-500 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { val: `${count1}+`, label: 'שנות ניסיון' },
              { val: `${count2}+`, label: 'תיקים שטופלו' },
              { val: `${count3}%`, label: 'שביעות רצון לקוחות' },
              { val: '24/7', label: 'זמינות מלאה' },
            ].map((s, i) => (
              <div key={i} className="text-black">
                <div className="text-3xl md:text-4xl font-black">{s.val}</div>
                <div className="text-sm font-medium opacity-70 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ABOUT ── */}
      <section id="about" className="py-28 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-px bg-gold-500" />
                <span className="text-gold-400 text-sm font-medium tracking-[0.2em] uppercase">אודות המשרד</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                ניסיון, מקצועיות
                <br />
                <span className="text-gold-400">ומסירות מלאה</span>
              </h2>
              <div className="gold-line" />

              <div className="space-y-5 text-gray-400 text-lg leading-relaxed">
                <p>
                  עורך דין אלעד אביתן הוא עורך דין בעל ניסיון עשיר ורב-שנתי בייצוג לקוחות
                  בבתי המשפט בישראל. המשרד מתמחה בליטיגציה מסחרית, דיני תעבורה, פלילי ומשפחה.
                </p>
                <p>
                  כל לקוח מקבל יחס אישי, מקצועי ומסור. אנו מאמינים שמאחורי כל תיק עומד אדם
                  שחייו עשויים להשתנות — ולכן מגישים לכל מקרה את מלוא הידע, הניסיון והמחויבות.
                </p>
                <p>
                  המשרד פועל מגן יבנה ומשרת לקוחות בכל רחבי הארץ, תוך שמירה על זמינות
                  מלאה ועדכון שוטף לאורך כל ההליך המשפטי.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-10">
                {['ליטיגציה מסחרית', 'דיני תעבורה', 'דיני פלילי', 'דיני משפחה'].map((area) => (
                  <div key={area} className="flex items-center gap-3 card-dark p-4 rounded-xl hover:border-gold-500/30 transition-colors cursor-default">
                    <svg className="w-4 h-4 text-gold-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-300 text-sm font-medium">{area}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <a href="#contact" className="btn-gold px-8 py-3 inline-block">
                  קבע פגישה עכשיו
                </a>
              </div>
            </div>

            <div className="order-1 lg:order-2 relative">
              <div className="relative h-[580px] rounded-2xl overflow-hidden shadow-2xl">
                <div
                  className="w-full h-full bg-cover bg-top"
                  style={{ backgroundImage: "url('/images/about.jpg')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>

              <div className="absolute -bottom-6 -right-4 bg-gold-500 text-black p-5 rounded-2xl shadow-2xl">
                <div className="text-lg font-black leading-tight">עו&quot;ד אלעד אביתן</div>
                <div className="text-xs font-medium mt-1 opacity-75">גן יבנה | 054-4680810</div>
              </div>

              <div className="absolute top-8 -left-4 bg-[#111] border border-[#222] rounded-xl p-4 shadow-2xl">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-gold-400 text-sm font-semibold">זמין לייעוץ</span>
                </div>
                <div className="text-gray-500 text-xs">054-4680810</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-28 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-6 h-px bg-gold-500" />
              <span className="text-gold-400 text-sm font-medium tracking-[0.2em] uppercase">תחומי עיסוק</span>
              <div className="w-6 h-px bg-gold-500" />
            </div>
            <h2 className="section-title">תחומי ההתמחות שלנו</h2>
            <div className="gold-line mx-auto" />
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              ייצוג מקצועי ומסור בארבעה תחומי משפט מרכזיים
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s, i) => (
              <div
                key={i}
                className={`group card-dark p-7 transition-all duration-300 hover:-translate-y-2 cursor-default relative ${
                  s.featured
                    ? 'border-gold-500/40 hover:border-gold-500/70'
                    : 'hover:border-gold-500/30'
                }`}
              >
                {s.featured && (
                  <div className="absolute -top-3 right-1/2 translate-x-1/2 bg-gold-500 text-black text-xs font-black px-4 py-1 rounded-full shadow">
                    פופולרי
                  </div>
                )}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-colors ${
                  s.featured
                    ? 'bg-gold-500/20 group-hover:bg-gold-500/30 text-gold-400'
                    : 'bg-gold-500/10 group-hover:bg-gold-500/20 text-gold-500'
                }`}>
                  {s.icon}
                </div>
                <div className="text-gold-600 text-xs font-medium tracking-wider uppercase mb-1">{s.subtitle}</div>
                <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm mb-5">{s.desc}</p>
                <ul className="space-y-2">
                  {s.items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-gray-500 text-sm">
                      <svg className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE STRIP ── */}
      <div className="relative h-64 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/strip.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/75" />
        <div className="relative h-full flex items-center justify-center px-6">
          <div className="text-center max-w-3xl mx-auto">
            <blockquote className="text-2xl md:text-3xl font-light text-white leading-relaxed">
              &ldquo;מאחורי כל תיק עומד אדם — ואנחנו כאן כדי להילחם עבורו.&rdquo;
            </blockquote>
            <div className="mt-4 text-gold-400 font-semibold text-sm tracking-wider">
              עו&quot;ד אלעד אביתן
            </div>
          </div>
        </div>
      </div>

      {/* ── PROCESS ── */}
      <section id="process" className="py-28 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-6 h-px bg-gold-500" />
              <span className="text-gold-400 text-sm font-medium tracking-[0.2em] uppercase">אופן הטיפול</span>
              <div className="w-6 h-px bg-gold-500" />
            </div>
            <h2 className="section-title">כיצד אנו עובדים</h2>
            <div className="gold-line mx-auto" />
            <p className="text-gray-400 max-w-xl mx-auto">
              תהליך ברור, שקוף ומקצועי — מהפגישה הראשונה ועד להשגת התוצאה
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <div key={i} className="card-dark p-7 hover:border-gold-500/30 transition-all duration-300 hover:-translate-y-1 cursor-default">
                <div className="text-5xl font-black text-gold-500/20 mb-4 leading-none">{step.num}</div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="py-28 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-6 h-px bg-gold-500" />
              <span className="text-gold-400 text-sm font-medium tracking-[0.2em] uppercase">יתרונות המשרד</span>
              <div className="w-6 h-px bg-gold-500" />
            </div>
            <h2 className="section-title">למה לבחור בנו?</h2>
            <div className="gold-line mx-auto" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'ניסיון רב-שנתי',
                text: 'מעל 15 שנות ניסיון בייצוג לקוחות בבתי משפט בכל רחבי ישראל, בתחומי משפט מגוונים.',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ),
                title: 'טיפול אישי',
                text: 'כל לקוח מקבל תשומת לב אישית ומחויבות מלאה. לא "עוד תיק" — אלא אדם שחייו חשובים לנו.',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'זמינות גבוהה',
                text: 'עונים לטלפון, מעדכנים בהתפתחויות ולא משאירים אותך לבד. זמינות 24/7 בעניינים דחופים.',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'תוצאות מוכחות',
                text: 'רקורד מוכח של הצלחות בתיקים מורכבים ורגישים. אנו נלחמים עד להשגת התוצאה הטובה ביותר.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="card-dark p-7 hover:border-gold-500/30 transition-all duration-300 hover:-translate-y-1 text-center cursor-default"
              >
                <div className="w-16 h-16 bg-gold-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 text-gold-500">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <div className="bg-gradient-to-r from-[#1a1200] via-[#2a1f00] to-[#1a1200] border-y border-gold-500/20 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
            יש לך שאלה משפטית?{' '}
            <span className="text-gold-400">נשמח לעזור.</span>
          </h3>
          <p className="text-gray-400 mb-8 text-lg">
            פגישת ייעוץ ראשונה ללא עלות וללא התחייבות
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contact" className="btn-gold px-10 py-4 text-base">
              קבע פגישה חינם
            </a>
            <a href="tel:054-4680810" className="btn-outline-gold px-10 py-4 text-base">
              054-4680810
            </a>
          </div>
        </div>
      </div>

      {/* ── CONTACT ── */}
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
              מלאו את הטופס ונחזור אליכם בהקדם, או פנו אלינו ישירות
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            <div className="space-y-6">
              {[
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
                {
                  icon: (
                    <svg className="w-6 h-6 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                  title: 'כתובת',
                  content: 'גן יבנה',
                  href: null,
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-gold-400 font-medium mb-1 text-sm">{item.title}</div>
                    {item.href ? (
                      <a href={item.href} className="text-gray-300 hover:text-gold-400 transition-colors text-lg font-medium cursor-pointer">
                        {item.content}
                      </a>
                    ) : (
                      <div className="text-gray-300 text-lg">{item.content}</div>
                    )}
                  </div>
                </div>
              ))}

              <div className="card-dark p-6 mt-2">
                <h4 className="text-gold-400 font-bold mb-4">שעות פעילות</h4>
                <div className="space-y-2 text-sm">
                  {[
                    { day: 'ראשון – חמישי', hours: '09:00 – 18:00' },
                    { day: 'שישי', hours: '09:00 – 13:00' },
                    { day: 'שבת', hours: 'סגור', closed: true },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-[#1e1e1e] last:border-0">
                      <span className="text-gray-400">{row.day}</span>
                      <span className={row.closed ? 'text-red-400' : 'text-gold-400 font-semibold'}>
                        {row.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-dark p-4 border-gold-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
                  <p className="text-gray-400 text-sm">
                    <span className="text-white font-semibold">בעניינים דחופים</span> — ניתן ליצור קשר בכל שעה
                  </p>
                </div>
              </div>
            </div>

            <div>
              {formSent ? (
                <div className="card-dark p-10 text-center h-full flex flex-col items-center justify-center min-h-[420px]">
                  <div className="w-20 h-20 bg-green-900/30 border border-green-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-3">ההודעה נשלחה בהצלחה!</h4>
                  <p className="text-gray-400 mb-8">נחזור אליך בהקדם האפשרי. תודה שפנית אלינו.</p>
                  <button
                    onClick={() => setFormSent(false)}
                    className="text-gold-500 hover:text-gold-400 underline text-sm transition-colors cursor-pointer"
                  >
                    שלח הודעה נוספת
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="card-dark p-8 space-y-5">
                  <div className="mb-2">
                    <h3 className="text-xl font-bold text-white">שלח הודעה</h3>
                    <p className="text-gray-500 text-sm mt-1">ניצור קשר בתוך 24 שעות</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label-dark" htmlFor="name">שם מלא *</label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="input-dark"
                        placeholder="ישראל ישראלי"
                      />
                    </div>
                    <div>
                      <label className="label-dark" htmlFor="phone">טלפון *</label>
                      <input
                        id="phone"
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
                    <label className="label-dark" htmlFor="email">אי-מייל</label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="input-dark"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="label-dark" htmlFor="message">תיאור העניין *</label>
                    <textarea
                      id="message"
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
                    {formLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        שולח...
                      </span>
                    ) : 'שלח הודעה'}
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

      {/* ── FOOTER ── */}
      <footer className="bg-black border-t border-[#111] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="text-gold-500 font-black text-xl mb-2">עו&quot;ד אלעד אביתן</div>
              <div className="text-gray-600 text-sm mb-4">משרד עורכי דין | גן יבנה</div>
              <p className="text-gray-700 text-xs leading-relaxed">
                ייצוג משפטי מקצועי בליטיגציה מסחרית,
                <br />דיני תעבורה, פלילי ומשפחה.
              </p>
            </div>

            <div>
              <div className="text-gray-400 font-semibold text-sm mb-4 tracking-wider uppercase">תחומי עיסוק</div>
              <div className="space-y-2">
                {['ליטיגציה מסחרית', 'דיני תעבורה', 'דיני פלילי', 'דיני משפחה'].map(area => (
                  <div key={area} className="text-gray-600 text-sm">{area}</div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-gray-400 font-semibold text-sm mb-4 tracking-wider uppercase">פרטי קשר</div>
              <div className="space-y-3">
                <a href="tel:054-4680810" className="flex items-center gap-2 text-gray-500 hover:text-gold-400 transition-colors text-sm cursor-pointer">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  054-4680810
                </a>
                <a href="mailto:office@eladavitan-law.co.il" className="flex items-center gap-2 text-gray-500 hover:text-gold-400 transition-colors text-sm cursor-pointer">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  office@eladavitan-law.co.il
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-[#111] pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-700 text-xs">
              © {new Date().getFullYear()} כל הזכויות שמורות לעו&quot;ד אלעד אביתן
            </div>
            <div className="flex gap-6 text-gray-700 text-xs">
              <a href="#about" className="hover:text-gold-400 transition-colors cursor-pointer">אודות</a>
              <a href="#services" className="hover:text-gold-400 transition-colors cursor-pointer">תחומי עיסוק</a>
              <a href="#contact" className="hover:text-gold-400 transition-colors cursor-pointer">צור קשר</a>
              <Link href="/portal" className="hover:text-gold-400 transition-colors cursor-pointer">פורטל לקוחות</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
