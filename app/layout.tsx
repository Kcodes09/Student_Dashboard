import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/app/components/ThemeProvider"
import AuthProvider from "./components/SessionProvider"
import { NotificationManager } from "./components/NotificationManager"

import { ProductTour } from "./components/ProductTour"
import { PwaInstallPrompt } from "./components/PwaInstallPrompt"
import BranchPrompt from "./components/BranchPrompt"

export const metadata: Metadata = {
  title: "Student Dashboard",
  description: "Your smart academic companion — track attendance, classes, exams, and more.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Student Dashboard",
  },
}

export const viewport = {
  themeColor: "#ffffff",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
          crossOrigin="anonymous"
        />
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
          <ThemeProvider>
            <BranchPrompt />
            <PwaInstallPrompt />
            <NotificationManager />
            <ProductTour />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}


