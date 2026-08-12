'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { DOC_TYPES, wrapDocument } from '@/lib/generators'

export default function DocumentViewPage() {
  const { docId } = useParams()
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/litigation/documents/${docId}`)
      .then(r => r.json())
      .then(data => { setDoc(data.document || null); setLoading(false) })
      .catch(() => setLoading(false))
  }, [docId])

  const downloadWord = () => {
    if (!doc) return
    const full = wrapDocument(doc.title, doc.html)
    const blob = new Blob(['﻿' + full], { type: 'application/msword;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${doc.title.replace(/[\\/:*?"<>|]/g, '-')}.doc`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  if (loading) return <div className="p-8 text-gray-500 bg-[#080808] min-h-screen">טוען מסמך...</div>
  if (!doc) return (
    <div className="p-8 bg-[#080808] min-h-screen">
      <p className="text-gray-500">המסמך לא נמצא.</p>
      <Link href="/admin/litigation" className="text-gold-400 hover:underline text-sm">חזרה לתיקי הליטיגציה</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#080808]">
      <div className="no-print sticky top-0 z-10 bg-[#0d0d0d] border-b border-[#1e1e1e] px-6 py-3 flex items-center gap-3 flex-wrap print:hidden">
        <Link href={`/admin/litigation/${doc.profile_id}`} className="text-gray-500 hover:text-gold-400 text-sm transition-colors">
          → חזרה לתיק
        </Link>
        <div className="flex-1">
          <span className="badge badge-active ml-2">{DOC_TYPES[doc.doc_type]?.label || doc.doc_type}</span>
          <span className="text-white text-sm font-medium">{doc.title}</span>
        </div>
        <button onClick={() => window.print()} className="btn-gold text-sm px-4 py-2">🖨️ הדפסה / PDF</button>
        <button onClick={downloadWord} className="btn-outline-gold text-sm px-4 py-2">⬇️ הורדה כ-Word</button>
      </div>

      <div className="py-8 px-4 print:p-0">
        <div
          className="doc-page mx-auto bg-white text-black rounded-sm shadow-2xl print:shadow-none"
          style={{
            maxWidth: '21cm', padding: '2.2cm 2.5cm', direction: 'rtl',
            fontFamily: "'David', 'Frank Ruehl', 'Times New Roman', serif",
            fontSize: '12pt', lineHeight: 1.55,
          }}
          dangerouslySetInnerHTML={{ __html: doc.html }}
        />
      </div>

      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .doc-page { box-shadow: none !important; border-radius: 0 !important; max-width: none !important; padding: 0 !important; }
          aside, nav { display: none !important; }
          main { margin: 0 !important; }
        }
      `}</style>
    </div>
  )
}
