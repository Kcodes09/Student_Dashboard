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
    <html lang="en">
      <body className="h-screen overflow-hidden">
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}


