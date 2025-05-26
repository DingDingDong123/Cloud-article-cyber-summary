import React, { useState, useEffect } from "react";
import { Source } from "@/entities/Source";
import { Summary } from "@/entities/Summary";
import { Report } from "@/entities/Report";
import { UserPreferences } from "@/entities/UserPreferences";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Rss, 
  Brain, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  Clock,
  Plus,
  Zap,
  BarChart3,
  Activity
} from "lucide-react";
import { format } from "date-fns";

import StatsOverview from "../components/dashboard/StatsOverview";
import RecentSummaries from "../components/dashboard/RecentSummaries";
import QuickActions from "../components/dashboard/QuickActions";
import ActivityFeed from "../components/dashboard/ActivityFeed";

export default function Dashboard() {
  const [stats, setStats] = useState({
    sources: 0,
    summaries: 0,
    reports: 0,
    todaySummaries: 0
  });
  const [recentSummaries, setRecentSummaries] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [
        userData,
        sources,
        summaries,
        reports
      ] = await Promise.all([
        User.me(),
        Source.list(),
        Summary.list('-processed_date', 10),
        Report.list('-created_date', 5)
      ]);

      setUser(userData);
      
      const today = new Date().toISOString().split('T')[0];
      const todaySummaries = summaries.filter(s => s.processed_date === today);

      setStats({
        sources: sources.length,
        summaries: summaries.length,
        reports: reports.length,
        todaySummaries: todaySummaries.length
      });

      setRecentSummaries(summaries.slice(0, 5));
      setRecentReports(reports);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-slate-600 text-lg">
              {format(new Date(), "EEEE, MMMM d, yyyy")} • Your intelligence overview
            </p>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl("Sources")}>
              <Button variant="outline" className="gap-2 premium-shadow hover:premium-shadow-lg transition-all">
                <Plus className="w-4 h-4" />
                Add Source
              </Button>
            </Link>
            <Link to={createPageUrl("Reports")}>
              <Button className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 premium-shadow-lg">
                <FileText className="w-4 h-4" />
                Generate Report
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <StatsOverview stats={stats} loading={loading} />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            <RecentSummaries summaries={recentSummaries} loading={loading} />
            <ActivityFeed reports={recentReports} loading={loading} />
          </div>

          {/* Right Column - Quick Actions & Insights */}
          <div className="space-y-6">
            <QuickActions />
            
            {/* Industry Insights */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 premium-shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Industry Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Cybersecurity</span>
                    <Badge variant="secondary" className="bg-red-100 text-red-700">
                      High Activity
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">AI/ML</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                      Medium Activity
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Finance</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Low Activity
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}