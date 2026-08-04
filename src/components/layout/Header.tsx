import React from 'react';
import { Bell, Search } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-[56px] border-b border-[#2A2A2E] bg-[#141417]/95 flex items-center justify-between px-[20px] flex-shrink-0 sticky top-0 z-10">
      <div className="relative w-[260px]">
        <Search className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[#71717A] w-[14px] h-[14px]" />
        <input
          type="text"
          placeholder="Search threats, incidents, reports…"
          className="w-full bg-[#0A0A0B] border border-[#2A2A2E] rounded-[6px] p-[7px_12px_7px_32px] text-[#E1E1E6] text-[12px] outline-none focus:border-[#7C3AED] transition-colors"
        />
      </div>

      <div className="flex items-center gap-[12px]">
        <button className="relative w-[34px] h-[34px] rounded-[6px] border border-[#2A2A2E] bg-transparent flex items-center justify-center cursor-pointer text-[#71717A] hover:text-[#E1E1E6] hover:border-[#444]">
          <Bell className="w-[16px] h-[16px]" />
          <span className="absolute top-[7px] right-[7px] w-[6px] h-[6px] rounded-full bg-[#7C3AED] border-[1.5px] border-[#141417]"></span>
        </button>
        
        <div className="w-[1px] h-[24px] bg-[#2A2A2E]"></div>
        
        <div className="flex items-center gap-[8px] cursor-pointer p-[4px_8px] rounded-[6px] border border-transparent hover:border-[#2A2A2E] hover:bg-white/5 transition-all">
          <div className="text-right">
            <div className="text-[12px] font-semibold text-white leading-[1.2]">Admin User</div>
            <div className="text-[10px] text-[#71717A]">Security Manager</div>
          </div>
          <div className="w-[30px] h-[30px] rounded-full bg-[rgba(124,58,237,0.12)] border-[1.5px] border-[rgba(124,58,237,0.4)] flex items-center justify-center text-[11px] font-semibold text-[#7C3AED]">
            AU
          </div>
        </div>
      </div>
    </header>
  );
}
