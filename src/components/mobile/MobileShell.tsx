"use client";

import { MobileBottomNav } from "./MobileBottomNav"; // (Sau fără acolade dacă la tine e export default)

export function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:hidden min-h-[100dvh] flex flex-col bg-slate-50 relative">
      
      

      {/* Main content - cu spațiul de 100px jos, ca să nu se ascundă sub meniul de navigare */}
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-[100px] relative z-0">
        {children}
      </main>

      {/* Bottom navigation */}
      <MobileBottomNav />
    </div>
  );
}