"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Users,
  IdentificationBadge,
  Gear,
} from "@phosphor-icons/react";

const classNames = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

type NavItem = {
  label: string;
  href: string;
  icon: (active: boolean) => JSX.Element;
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: (active) => (
      <House
        size={24}
        weight={active ? "fill" : "regular"}
        className={classNames(active ? "text-white" : "text-white/50")}
      />
    ),
  },
  {
    label: "Students",
    href: "/admin/students",
    icon: (active) => (
      <Users
        size={24}
        weight={active ? "fill" : "regular"}
        className={classNames(active ? "text-white" : "text-white/50")}
      />
    ),
  },
  {
    label: "Mentors",
    href: "/admin/mentors",
    icon: (active) => (
      <IdentificationBadge
        size={24}
        weight={active ? "fill" : "regular"}
        className={classNames(active ? "text-white" : "text-white/50")}
      />
    ),
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: (active) => (
      <Gear
        size={24}
        weight={active ? "fill" : "regular"}
        className={classNames(active ? "text-white" : "text-white/50")}
      />
    ),
  },
];

export function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 border-t border-white/10 bg-[var(--dark-navy)]/95 text-white shadow-[0_-4px_20px_rgba(18,8,75,0.2)] backdrop-blur">
      <div className="mx-auto flex h-16 max-w-md items-center justify-between px-6">
        {navItems.map((item) => {
          const hasChildRoute = pathname.startsWith(`${item.href}/`);
          const isActive = pathname === item.href || hasChildRoute;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={classNames(
                "flex flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors",
                isActive ? "text-white" : "text-white/50 hover:text-white/80"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {item.icon(isActive)}
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

