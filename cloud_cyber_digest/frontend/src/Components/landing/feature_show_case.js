import React from "react";
import { Button } from "../../Components/ui/button";       // ✅ correct
import { Badge } from "../../Components/ui/badge";       // ✅ correct
import { Card, CardContent } from "../../Components/ui/card";  // ✅ correct
import { 
  FileText, 
  Palette, 
  Settings, 
  Target, 
  Layers, 
  Zap,
  Download,
  Users,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: FileText,
    title: "Customizable PDF Summaries",
    description: "Generate intelligent, tailored summaries with adjustable length, focus areas, and formatting options.",
    badge: "AI-Powered",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: Palette,
    title: "Brand Customization",
    description: "Add your logo, colors, and styling to all PDF outputs. White-label ready for client deliverables.",
    badge: "Professional",
    color: "from-purple-500 to-purple-600"
  },
  {
    icon: Globe,
    title: "Source Integrations", 
    description: "Connect with Google Drive, Dropbox, SharePoint, and 50+ platforms for seamless document workflows.",
    badge: "Enterprise",
    color: "from-green-500 to-green-600"
  },
  {
    icon: Target,
    title: "Smart Templates",
    description: "Pre-built templates for different industries and use cases. Create custom templates for recurring needs.",
    badge: "Efficient",
    color: "from-orange-500 to-orange-600"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share summaries, collaborate on templates, and manage team access with role-based permissions.",
    badge: "Collaborative",
    color: "from-indigo-500 to-indigo-600"
  },
  {
    icon: Zap,
    title: "API & Automation",
    description: "Robust API for custom integrations and automated workflows. Webhook support for real-time processing.",
    badge: "Developer-First",
    color: "from-red-500 to-red-600"
  }
];

export default function FeatureShowcase() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-700">
            Platform Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Everything you need to scale
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From basic PDF processing to enterprise-grade document intelligence. 
            Built for teams that demand more than simple solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                      {feature.badge}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Evolution Story */}
        <div className="mt-24">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                  Evolution Story
                </Badge>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  From MVP to Enterprise Platform
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  What started as a simple PDF summarization tool has evolved into 
                  a comprehensive document intelligence platform. We've listened to 
                  our users and built the features they actually need.
                </p>
                <div className="space-y-3">
                  {[
                    "Started with basic PDF summaries",
                    "Added custom branding by user request", 
                    "Integrated with popular platforms",
                    "Built enterprise-grade security"
                  ].map((step, index) => (
                    <div key={step} className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <span className="text-gray-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-blue-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-medium">Custom Branded Output</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}