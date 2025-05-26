import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Rss, Brain, FileText, TrendingUp } from "lucide-react";

const statConfigs = [
  {
    key: "sources",
    title: "Active Sources",
    icon: Rss,
    color: "blue",
    bgGradient: "from-blue-500 to-blue-600"
  },
  {
    key: "summaries",
    title: "Total Summaries",
    icon: Brain,
    color: "purple",
    bgGradient: "from-purple-500 to-purple-600"
  },
  {
    key: "reports",
    title: "Generated Reports",
    icon: FileText,
    color: "green",
    bgGradient: "from-green-500 to-green-600"
  },
  {
    key: "todaySummaries",
    title: "Today's Summaries",
    icon: TrendingUp,
    color: "orange",
    bgGradient: "from-orange-500 to-orange-600"
  }
];

export default function StatsOverview({ stats, loading }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {statConfigs.map((config) => (
        <Card key={config.key} className="bg-white/80 backdrop-blur-sm border-slate-200/60 premium-shadow-lg hover:premium-shadow-xl transition-all duration-300 group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                {config.title}
              </CardTitle>
              <div className={`p-2 rounded-xl bg-gradient-to-br ${config.bgGradient} opacity-90 group-hover:opacity-100 transition-opacity`}>
                <config.icon className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="space-y-1">
                <div className="text-3xl font-bold text-slate-900">
                  {stats[config.key]?.toLocaleString() || 0}
                </div>
                <div className="text-xs text-slate-500">
                  Updated just now
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}