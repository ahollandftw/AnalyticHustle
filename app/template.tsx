"use client"

import { ClientLayout } from "./client-layout"
import { Providers } from "./providers"

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <ClientLayout>{children}</ClientLayout>
    </Providers>
  )
} 