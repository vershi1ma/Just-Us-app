import './globals.css'
import NavBar from './components/NavBar'

export const metadata = {
  title: 'Just Us',
  description: 'Our little space',
  appleWebApp: {
    capable: true,
    title: 'Just Us',
    statusBarStyle: 'default',
  },
}

export const viewport = {
  themeColor: '#d68fa3',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="pb-20">
        {children}
        <NavBar />
      </body>
    </html>
  )
}
