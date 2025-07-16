"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Bird,
  Rabbit,
  HeartPulse,
  Warehouse,
  LineChart,
  BrainCircuit,
  Settings,
  UserCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CowIcon, GoatIcon, PigIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/animals", icon: Rabbit, label: "Animals" },
  { href: "/cycles", icon: LineChart, label: "Cycles" },
  { href: "/inventory", icon: Warehouse, label: "Inventory" },
  { href: "/ai-insights", icon: BrainCircuit, label: "AI Insights" },
  { href: "/reports", icon: LineChart, label: "Reports" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-primary">
               <GoatIcon className="text-primary-foreground h-6 w-6" />
             </div>
            <h1 className="text-2xl font-bold font-headline text-foreground group-data-[state=collapsed]:hidden">FarmFlow</h1>
            <SidebarTrigger className="ml-auto group-data-[state=collapsed]:hidden" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
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
              <SidebarMenuButton tooltip="Settings">
                <Settings /> <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Profile">
                    <div className="flex items-center gap-2 w-full">
                        <Avatar className="h-7 w-7">
                            <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="user avatar"/>
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-medium">Éleveur</p>
                        </div>
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <main className="p-4 sm:p-6 lg:p-8 bg-background min-h-screen">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
