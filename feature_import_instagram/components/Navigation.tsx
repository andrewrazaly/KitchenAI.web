"use client"

import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

export default function Navigation() {
  const location = useLocation()
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center sm:justify-start">
          <div className="flex space-x-4">
            {[
              { name: 'Home', href: '/' },
              { name: 'Inventory', href: '/inventory' },
              { name: 'Orders', href: '/orders' },
            ].map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'px-3 py-4 text-sm font-medium border-b-2 transition-colors',
                  location.pathname === item.href
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}