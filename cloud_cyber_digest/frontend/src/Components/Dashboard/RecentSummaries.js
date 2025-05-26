import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Brain, ExternalLink, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";

const severityColors = {
  low: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200", 
  high: "bg-orange-100 text-orange-700 border-orange-200",
  critical: "bg-red-100 text-red-700 border-red-200"
};

const categoryColors = {
  finance: "bg-blue-100 text-blue-700",
  cloud: "bg-purple-100 text-purple-700",
  nation_state: "bg-red-100 text-red-700",
  ransomware: "bg-orange-100 text-orange-700",
  ai: "bg-green-100 text-green-700",
  regulation: "bg-indigo-100 text-indigo-700",
  breach: "bg-pink-100 text-pink-700",
  vulnerability: "bg-yellow-100 text-yellow-700"
};

export default function RecentSummaries({ summaries, loading }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 premium-shadow-lg">
      <CardHeader className="border-b border-slate-200/60">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            Recent Summaries
          </div>
          <Link to={createPageUrl("Summaries")}>
            <Button variant="ghost" size="sm" className="gap-2 text-slate-600 hover:text-slate-900">
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="flex gap-3">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        ) : summaries.length === 0 ? (
          <div className="p-12 text-center">
            <Brain className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No summaries yet</p>
            <p className="text-sm text-slate-400 mt-1">Add sources to start generating summaries</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200/60">
            {summaries.map((summary) => (
              <div key={summary.id} className="p-6 hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`${severityColors[summary.severity_level]} border font-medium`}>
                        {summary.severity_level}
                      </Badge>
                      <Badge variant="secondary" className={categoryColors[summary.category]}>
                        {summary.category?.replace(/_/g, ' ')}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {format(new Date(summary.processed_date), "MMM d")}
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-700 transition-colors">
                      {summary.title}
                    </h3>
                    
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {summary.executive_summary}
                    </p>
                  </div>
                  
                  <a
                    href={summary.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}