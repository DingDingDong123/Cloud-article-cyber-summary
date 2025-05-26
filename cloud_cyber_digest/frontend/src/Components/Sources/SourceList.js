import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Rss, 
  Globe, 
  ExternalLink, 
  Edit, 
  Trash2, 
  PlayCircle, 
  PauseCircle,
  Tag,
  Clock
} from "lucide-react";
import { format } from "date-fns";

const typeIcons = {
  rss: Rss,
  news_url: Globe,
  api: ExternalLink,
  twitter: ExternalLink,
  recorded_future: ExternalLink,
  cisa: ExternalLink
};

const industryColors = {
  cybersecurity: "bg-red-100 text-red-700",
  marketing: "bg-blue-100 text-blue-700",
  supply_chain: "bg-green-100 text-green-700",
  legislative: "bg-purple-100 text-purple-700",
  finance: "bg-yellow-100 text-yellow-700",
  technology: "bg-indigo-100 text-indigo-700"
};

export default function SourceList({ sources, loading, onEdit, onDelete, onToggleActive }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i} className="bg-white/80 backdrop-blur-sm border-slate-200/60">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 premium-shadow-lg">
        <CardContent className="p-12 text-center">
          <Rss className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No sources configured</h3>
          <p className="text-slate-500">Add your first source to start collecting and summarizing news</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sources.map((source) => {
        const TypeIcon = typeIcons[source.type] || Globe;
        
        return (
          <Card key={source.id} className="bg-white/80 backdrop-blur-sm border-slate-200/60 premium-shadow hover:premium-shadow-lg transition-all group">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <TypeIcon className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900 line-clamp-1">
                      {source.name}
                    </CardTitle>
                    <p className="text-sm text-slate-500 capitalize">
                      {source.type.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleActive(source)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    {source.active ? (
                      <PauseCircle className="w-4 h-4" />
                    ) : (
                      <PlayCircle className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(source)}
                    className="text-slate-400 hover:text-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(source.id)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={source.active ? "default" : "secondary"}
                    className={source.active ? "bg-green-100 text-green-700" : ""}
                  >
                    {source.active ? "Active" : "Paused"}
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className={industryColors[source.industry]}
                  >
                    {source.industry}
                  </Badge>
                </div>

                <div className="text-sm text-slate-600 break-all">
                  {source.url}
                </div>

                {source.keywords && source.keywords.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Tag className="w-3 h-3" />
                      Keywords
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {source.keywords.slice(0, 3).map((keyword) => (
                        <Badge key={keyword} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {source.keywords.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{source.keywords.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {source.last_processed && (
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    Last processed: {format(new Date(source.last_processed), "MMM d, HH:mm")}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}