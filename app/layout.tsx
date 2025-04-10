import type React from "react"
import type { Metadata } from "next/dist/lib/metadata/types/metadata-interface"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { TopNavigation } from "@/components/top-navigation"
import { MainSidebar } from "@/components/main-sidebar"
import { NotificationProvider } from "@/components/notification-provider"
import { TeamColorProvider } from "@/components/team-color-provider"
import { AuthProvider } from "@/components/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AbsoluteHeaters",
  description: "Comprehensive sports analytics dashboard for MLB, NBA, NFL, and NHL",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <TeamColorProvider>
              <NotificationProvider>
                <SidebarProvider>
                  <div className="flex min-h-screen flex-col">
                    <TopNavigation />
                    <div className="flex flex-1">
                      <MainSidebar />
                      <main className="flex-1 overflow-auto">{children}</main>
                    </div>
                  </div>
                  <Toaster />
                </SidebarProvider>
              </NotificationProvider>
            </TeamColorProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'