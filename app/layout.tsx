import "./style.css"
import { KRXALinkBar } from "@/src/krxa/ui/link.bar"

export const metadata = { title: "KRXA MVP", description: "KRXA LinkBar + Context Engine MVP" }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ko"><body>{children}<KRXALinkBar /></body></html>
}
