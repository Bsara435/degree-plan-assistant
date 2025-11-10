import type { ReactNode } from "react";
import { BottomNav } from "../../components/layout/BottomNav";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--dark-navy)] text-white">
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  );
}



