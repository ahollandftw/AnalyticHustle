import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Analytic Hustle - MLB Analytics & Insights",
  description: "Your premier destination for MLB analytics and insights",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full dark" style={{ colorScheme: "dark" }}>
      <body className={inter.className + " h-full bg-[#0A0C10]"}>
        {children}
      </body>
    </html>
  )
}


import './globals.css'