import Link from 'next/link'
import TermsContent from './TermsContent'
import { TERMS_TITLE } from '@/lib/terms'

export const metadata = {
  title: `${TERMS_TITLE} | עו"ד אלעד אביתן`,
  description: 'תקנון האתר ומדיניות הפרטיות של משרד עורכי הדין אלעד אביתן.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" dir="rtl">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="text-gold-500 hover:text-gold-400 text-sm transition-colors inline-flex items-center gap-2 mb-8"
        >
          <span>→</span> חזרה לעמוד הבית
        </Link>
        <div className="card-dark p-8 md:p-10">
          <TermsContent />
        </div>
      </div>
    </div>
  )
}
