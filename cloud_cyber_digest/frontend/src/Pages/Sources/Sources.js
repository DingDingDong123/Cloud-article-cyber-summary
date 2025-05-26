import React, { useState, useEffect } from "react";
import { Source } from "@/entities/Source";
import { Button } from "../../Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../Components/ui/card";
import { Badge } from "../../Components/ui/badge";
import { Input } from "../../Components/ui/input";
import { Plus, Search, Rss, Edit, Trash2, PlayCircle, PauseCircle } from "lucide-react";

import SourceForm from "../components/sources/SourceForm";
import SourceList from "../components/sources/SourceList";

export default function Sources() {
  const [sources, setSources] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    setLoading(true);
    const data = await Source.list('-created_date');
    setSources(data);
    setLoading(false);
  };

  const handleSubmit = async (sourceData) => {
    if (editingSource) {
      await Source.update(editingSource.id, sourceData);
    } else {
      await Source.create(sourceData);
    }
    setShowForm(false);
    setEditingSource(null);
    loadSources();
  };

  const handleEdit = (source) => {
    setEditingSource(source);
    setShowForm(true);
  };

  const handleDelete = async (sourceId) => {
    if (confirm("Are you sure you want to delete this source?")) {
      await Source.delete(sourceId);
      loadSources();
    }
  };

  const handleToggleActive = async (source) => {
    await Source.update(source.id, { ...source, active: !source.active });
    loadSources();
  };

  const filteredSources = sources.filter(source =>
    source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    source.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    source.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">News Sources</h1>
            <p className="text-slate-600 mt-1">Manage your RSS feeds, APIs, and news sources</p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 premium-shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add New Source
          </Button>
        </div>

        {/* Search */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 premium-shadow">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search sources by name, URL, or industry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-300 focus:border-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sources List */}
        <SourceList 
          sources={filteredSources}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />

        {/* Source Form Modal */}
        {showForm && (
          <SourceForm
            source={editingSource}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingSource(null);
            }}
          />
        )}
      </div>
    </div>
  );
}