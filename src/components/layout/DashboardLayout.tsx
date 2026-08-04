import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0A0B] relative">
      <div className="scanline pointer-events-none z-50"></div>
      <Sidebar />
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-[24px] scroll-smooth custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
