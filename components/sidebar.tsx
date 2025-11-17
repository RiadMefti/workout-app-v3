"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Menu,
  ChevronLeft,
  Home,
  Dumbbell,
  Settings,
  User,
} from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Update CSS variable when collapsed state changes
    document.documentElement.style.setProperty(
      '--sidebar-width',
      collapsed ? '64px' : '256px'
    );
  }, [collapsed]);

  const menuItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Dumbbell, label: "Workouts", href: "/workouts" },
    { icon: User, label: "Profile", href: "/profile" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <VisuallyHidden>
            <SheetTitle>Navigation Menu</SheetTitle>
          </VisuallyHidden>
          <nav className="flex flex-col h-full p-4">
            <div className="mb-8 pt-4">
              <h2 className="text-xl font-bold">Workout App</h2>
            </div>
            <div className="flex flex-col gap-2">
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-full border-r bg-background transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          {!collapsed && <h2 className="text-xl font-bold">Workout App</h2>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={collapsed ? "mx-auto" : ""}
          >
            {collapsed ? (
              <Menu className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>
        <nav className="flex flex-col gap-2 p-4">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
}
