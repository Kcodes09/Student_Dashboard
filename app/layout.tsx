import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "./components/ThemeProvider"
import AuthProvider from "./components/SessionProvider"

export const metadata: Metadata = {
  title: "Student Dashboard",
  description: "Smart Student Dashboard",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
                
                if (localStorage.getItem('worldCupMode') === 'true') {
                  const team = localStorage.getItem('activeTeam') || 'Argentina';
                  document.documentElement.dataset.team = team.toLowerCase().replace(/\\s+/g, '-');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="h-screen ">
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}


