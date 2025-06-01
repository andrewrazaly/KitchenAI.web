"use client"

import { Menu, Webhook, Users2, Play } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

const routes = [
  {
    label: 'API',
    icon: Webhook,
    href: '/api',
  },
  {
    label: 'Followers',
    icon: Users2,
    href: '/followers',
  },
  {
    label: 'Reels',
    icon: Play,
    href: '/reels',
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <nav className="flex flex-col gap-4 p-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 p-3 text-sm font-medium rounded-lg hover:bg-secondary",
                  pathname === route.href ? "bg-secondary" : "transparent"
                )}
              >
                <route.icon className="h-5 w-5" />
                {route.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <nav className="hidden lg:flex flex-col gap-4 p-4 border-r min-w-[240px]">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-2 p-3 text-sm font-medium rounded-lg hover:bg-secondary",
              pathname === route.href ? "bg-secondary" : "transparent"
            )}
          >
            <route.icon className="h-5 w-5" />
            {route.label}
          </Link>
        ))}
      </nav>
    </>
  )
}