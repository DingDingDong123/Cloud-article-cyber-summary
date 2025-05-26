import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { Activity, FileText, Clock } from "lucide-react";
import { format } from "date-fns";

export default function ActivityFeed({ reports, loading }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 premium-shadow-lg">
      <CardHeader className="border-b border-slate-200/60">
        <div className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Recent Activity
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center">
            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No recent activity</p>
            <p className="text-sm text-slate-400 mt-1">Generate reports to see activity here</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    Report "{report.title}" was {report.status}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-500">
                      {format(new Date(report.created_date), "MMM d, HH:mm")}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {report.industry}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}