import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { SiteHeader } from './site-header';

export default function Layout({ children }) {
  return (
    <SidebarProvider style={{ "--sidebar-width": "16rem" }}>
      <AppSidebar />
      <SidebarInset className="bg-slate-50/50 text-black font-sans min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
