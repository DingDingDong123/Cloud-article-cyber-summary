import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "../utils";
import { 
  LayoutDashboard, 
  Rss, 
  FileText, 
  Brain, 
  Settings, 
  LogOut,
  User
} from "lucide-react";
import { Button } from "./ui/button";

const navigation = [
  {
    name: "Dashboard",
    href: createPageUrl("Dashboard"),
    icon: LayoutDashboard
  },
  {
    name: "Sources",
    href: createPageUrl("Sources"),
    icon: Rss
  },
  {
    name: "Summaries",
    href: createPageUrl("Summaries"),
    icon: Brain
  },
  {
    name: "Reports",
    href: createPageUrl("Reports"),
    icon: FileText
  },
  {
    name: "Settings",
    href: createPageUrl("Settings"),
    icon: Settings
  }
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-slate-200 bg-red-200">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <Link to="/" className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-semibold text-slate-900">Cyber Digest</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
            <User className="h-4 w-4 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">John Doe</p>
            <p className="text-xs text-slate-500 truncate">john@example.com</p>
          </div>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 