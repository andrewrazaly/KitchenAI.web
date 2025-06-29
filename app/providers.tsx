'use client';

import { useState, useEffect } from 'react';
import { ThemeProvider } from "next-themes";
import { NotificationProvider } from "./components/Notification";
import { SupabaseProvider } from "./providers/SupabaseProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <SupabaseProvider>
      <NotificationProvider>
        {mounted ? (
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        ) : (
          <div suppressHydrationWarning>
            {children}
          </div>
        )}
      </NotificationProvider>
    </SupabaseProvider>
  );
} 