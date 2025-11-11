import type { ReactNode } from "react";
import { AppHeader } from "../../components/layout/AppHeader";
import { BottomNav } from "../../components/layout/BottomNav";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F4F6FF] text-[var(--dark-navy)]">
      <AppHeader />
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  );
}
