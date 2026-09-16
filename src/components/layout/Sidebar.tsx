"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  AlertTriangle, 
  FileText, 
  CheckSquare, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { BRAND_CONTENT } from '@/content';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Threats', href: '/dashboard/threats', icon: ShieldAlert },
  { name: 'Incidents', href: '/dashboard/incidents', icon: AlertTriangle },
  { name: 'Compliance', href: '/dashboard/compliance', icon: CheckSquare },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] bg-[#141417] border-r border-[#2A2A2E] flex flex-col flex-shrink-0 h-full relative z-20">
      <div className="p-[20px_16px] border-b border-[#2A2A2E] flex items-center gap-[10px]">
        <div className="w-[30px] h-[30px] bg-[#7C3AED] rounded-[6px] flex items-center justify-center text-[13px] font-bold text-white tracking-[0.05em] flex-shrink-0">
          {BRAND_CONTENT.appName.charAt(0)}
        </div>
        <div>
          <div className="text-[14px] font-bold tracking-[0.18em] text-white font-mono uppercase">{BRAND_CONTENT.appName}</div>
          <div className="text-[9px] color-[#71717A] tracking-[0.12em] uppercase mt-[1px]">Shadow Root Security</div>
        </div>
      </div>
      
      <nav className="flex-1 p-[12px_10px] flex flex-col gap-[2px]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-item-refined ${isActive ? 'active' : ''}`}
            >
              <item.icon className="w-[15px] h-[15px] nav-icon" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-[12px_10px] border-t border-[#2A2A2E]">
        <button className="nav-item-refined w-full hover:!text-[#f87171]">
          <LogOut className="w-[15px] h-[15px] nav-icon" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
