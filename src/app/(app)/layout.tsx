
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
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
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AccountingProvider } from "@/hooks/use-accounting";
import { InvoicesProvider } from "@/hooks/use-invoices";
import { AnimalsProvider } from "@/hooks/use-animals";
import { PageHeader, PageHeaderTitle } from "@/components/page-header";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

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
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  }

  return (
    <>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary">
            <Rabbit className="text-primary-foreground h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold font-headline text-foreground group-data-[state=collapsed]:hidden">KPM Farm</h1>
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
                <SidebarMenuButton tooltip="Logout" onClick={handleSignOut}>
                    <LogOut /> <span>Logout</span>
                </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
              <SidebarMenuButton tooltip="Profile">
                  <div className="flex items-center gap-2 w-full">
                      <Avatar className="h-7 w-7">
                          <AvatarImage src={user?.photoURL || "https://placehold.co/40x40.png"} alt={user?.displayName || 'User'} data-ai-hint="user avatar"/>
                          <AvatarFallback>{user?.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                          <p className="truncate text-sm font-medium">{user?.displayName || user?.email}</p>
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
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Loading application...</p>
        </div>
    );
  }

  const getPageTitle = () => {
    if (pathname.startsWith('/animals/')) return "Animal Details";
    if (pathname.startsWith('/invoices/new')) return "Create Invoice";
    if (pathname.startsWith('/invoices/edit')) return "Edit Invoice";
    if (pathname.startsWith('/invoices/')) return "Invoice Details";
    const item = navItems.find(item => pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/'));
    return item?.label || 'Dashboard';
  };
  
  return (
    <>
      <Sidebar>
          <SidebarItems />
      </Sidebar>

      <SidebarInset>
        <PageHeader>
            <PageHeaderTitle>
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="md:hidden" />
                  <h1 className="text-2xl font-bold font-headline tracking-tight">{getPageTitle()}</h1>
                </div>
            </PageHeaderTitle>
            <div className="hidden md:flex items-center gap-2">
                 <SidebarTrigger />
            </div>
        </PageHeader>
        <main className="p-4 sm:p-6 lg:p-8 bg-background min-h-screen pt-0">
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
