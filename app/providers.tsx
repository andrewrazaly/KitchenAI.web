'use client';

import { ThemeProvider } from "next-themes";
import { NotificationProvider } from "./components/Notification";
import { SupabaseProvider } from "./providers/SupabaseProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SupabaseProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </SupabaseProvider>
    </ThemeProvider>
  );
} 