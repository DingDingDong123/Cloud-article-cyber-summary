import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Plus, Zap, Settings, Download } from "lucide-react";

const quickActions = [
  {
    title: "Add New Source",
    description: "Connect RSS feeds, APIs, or news URLs",
    icon: Plus,
    href: createPageUrl("Sources"),
    color: "blue"
  },
  {
    title: "Generate Report",
    description: "Create PDF intelligence reports",
    icon: Download,
    href: createPageUrl("Reports"),
    color: "green"
  },
  {
    title: "AI Processing",
    description: "Run immediate summarization",
    icon: Zap,
    href: createPageUrl("Summaries"),
    color: "purple"
  },
  {
    title: "Configure Settings",
    description: "Customize branding and delivery",
    icon: Settings,
    href: createPageUrl("Settings"),
    color: "orange"
  }
];

export default function QuickActions() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 premium-shadow-lg">
      <CardHeader className="border-b border-slate-200/60">
        <div className="text-lg font-bold text-slate-900">Quick Actions</div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 gap-3">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.href}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-auto p-4 hover:bg-slate-50 group transition-all"
              >
                <div className={`p-2 rounded-lg bg-${action.color}-100 group-hover:bg-${action.color}-200 transition-colors`}>
                  <action.icon className={`w-4 h-4 text-${action.color}-600`} />
                </div>
                <div className="text-left">
                  <div className="font-medium text-slate-900">{action.title}</div>
                  <div className="text-xs text-slate-500">{action.description}</div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}