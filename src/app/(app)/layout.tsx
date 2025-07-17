
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Rabbit,
  Wrench,
  Warehouse,
  BrainCircuit,
  Settings,
  CircleDollarSign,
  FileText,
  LineChart,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { AccountingProvider } from "@/hooks/use-accounting";
import { InvoicesProvider } from "@/hooks/use-invoices";
import { AnimalsProvider } from "@/hooks/use-animals";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/animals", icon: Rabbit, label: "Animals" },
  { href: "/cycles", icon: Wrench, label: "Production Cycles" },
  { href: "/inventory", icon: Warehouse, label: "Inventory" },
  { href: "/accounting", icon: CircleDollarSign, label: "Accounting" },
  { href: "/invoices", icon: FileText, label: "Invoices" },
  { href: "/ai-insights", icon: BrainCircuit, label: "AI Insights" },
  { href: "/reports", icon: LineChart, label: "Reports" },
];

function SidebarItems() {
  const pathname = usePathname();
  return (
    <>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary">
            <Rabbit className="text-primary-foreground h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold font-headline text-foreground group-data-[state=collapsed]:hidden">KPM Farm</h1>
          <SidebarTrigger className="ml-auto group-data-[state=collapsed]:hidden" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/settings">
              <SidebarMenuButton tooltip="Settings" isActive={pathname === '/settings'}>
                <Settings /> <span>Settings</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
              <SidebarMenuButton tooltip="Profile">
                  <div className="flex items-center gap-2 w-full">
                      <Avatar className="h-7 w-7">
                          <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="user avatar"/>
                          <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                          <p className="truncate text-sm font-medium">Farmer</p>
                      </div>
                  </div>
              </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  )
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false)

  if (isMobile === null) {
    return null; // or a loading skeleton
  }
  
  return (
    <>
      {isMobile ? (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetContent side="left" className="w-[18rem] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden">
            <SidebarItems />
          </SheetContent>
        </Sheet>
      ) : (
        <Sidebar>
          <SidebarItems />
        </Sidebar>
      )}

      <SidebarInset>
        <main className="p-4 sm:p-6 lg:p-8 bg-background min-h-screen">
          {children}
        </main>
      </SidebarInset>
    </>
  );
}

// Wrap the layout with the provider
export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AnimalsProvider>
      <AccountingProvider>
        <InvoicesProvider>
          <SidebarProvider>
              <AppLayout>{children}</AppLayout>
          </SidebarProvider>
        </InvoicesProvider>
      </AccountingProvider>
    </AnimalsProvider>
  )
}
