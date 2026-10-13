import './globals.css'
import Providers from './providers'

export const metadata = {
  title: 'עו"ד אלעד אביתן | משרד עורכי דין | גן יבנה',
  description: 'משרד עורכי הדין אלעד אביתן - ייצוג מקצועי בליטיגציה מסחרית, דיני תעבורה, פלילי ומשפחה. גן יבנה | 054-4680810',
  keywords: 'עורך דין, פלילי, תעבורה, משפחה, ליטיגציה מסחרית, גן יבנה, אלעד אביתן',
}

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
