import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "utils";
import { 
  LayoutDashboard, 
  Rss, 
  Brain, 
  FileText, 
  Settings, 
  User,
  LogOut,
  Zap
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "../Components/ui/sidebar";
import { Button } from "../Components/ui/button";
import { User as UserEntity } from "@/entities/User";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Sources",
    url: createPageUrl("Sources"),
    icon: Rss,
  },
  {
    title: "Summaries",
    url: createPageUrl("Summaries"),
    icon: Brain,
  },
  {
    title: "Reports",
    url: createPageUrl("Reports"),
    icon: FileText,
  },
  {
    title: "Settings",
    url: createPageUrl("Settings"),
    icon: Settings,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await UserEntity.me();
        setUser(userData);
      } catch (error) {
        console.error("User not authenticated");
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await UserEntity.logout();
  };

  return (
    <SidebarProvider>
      <style>
        {`
          :root {
            --primary: 216 87% 24%;
            --primary-foreground: 0 0% 98%;
            --secondary: 216 20% 95%;
            --background: 0 0% 100%;
            --foreground: 216 12% 8%;
            --muted: 216 20% 95%;
            --muted-foreground: 216 8% 45%;
            --accent: 216 87% 24%;
            --accent-foreground: 0 0% 98%;
            --border: 216 20% 90%;
            --ring: 216 87% 24%;
          }
          
          .gradient-bg {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          }
          
          .premium-shadow {
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          }
          
          .premium-shadow-lg {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          }
        `}
      </style>
      
      <div className="min-h-screen flex w-full gradient-bg">
        <Sidebar className="border-r border-slate-200/60 bg-white/80 backdrop-blur-xl">
          <SidebarHeader className="border-b border-slate-200/60 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center premium-shadow">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">IntelliSumm</h2>
                <p className="text-xs text-slate-500 font-medium">AI News Intelligence</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                Workspace
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`group hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-xl mb-1 h-11 ${
                          location.pathname === item.url 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200/50' 
                            : 'hover:premium-shadow'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3">
                          <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200/60 p-4">
            {user && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{user.full_name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/60 px-6 py-4 md:hidden premium-shadow">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold text-slate-900">IntelliSumm</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}