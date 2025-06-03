import React from "react";
import { Button } from "../../Components/ui/button";       // ✅ correct
import { Badge } from "../../Components/ui/badge";       // ✅ correct
import { Card, CardContent } from "../../Components/ui/card";  // ✅ correct
import { 
  Cloud, 
  Database, 
  Mail, 
  MessageSquare, 
  FileText, 
  Folder,
  Share2,
  Zap,
  Link2,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

const integrations = [
  {
    name: "Google Drive",
    icon: Cloud,
    description: "Sync PDFs directly from Google Drive",
    category: "Storage",
    color: "from-blue-500 to-blue-600"
  },
  {
    name: "Dropbox",
    icon: Folder,
    description: "Access documents from Dropbox folders",
    category: "Storage", 
    color: "from-indigo-500 to-indigo-600"
  },
  {
    name: "SharePoint",
    icon: Database,
    description: "Enterprise document management",
    category: "Enterprise",
    color: "from-purple-500 to-purple-600"
  },
  {
    name: "Slack",
    icon: MessageSquare,
    description: "Share summaries in Slack channels",
    category: "Communication",
    color: "from-green-500 to-green-600"
  },
  {
    name: "Email",
    icon: Mail,
    description: "Send branded PDFs via email",
    category: "Communication",
    color: "from-orange-500 to-orange-600"
  },
  {
    name: "Zapier",
    icon: Zap,
    description: "Connect with 5000+ apps",
    category: "Automation",
    color: "from-yellow-500 to-yellow-600"
  },
  {
    name: "Webhooks",
    icon: Link2,
    description: "Custom API integrations",
    category: "Developer",
    color: "from-red-500 to-red-600"
  },
  {
    name: "REST API",
    icon: Share2,
    description: "Full programmatic access",
    category: "Developer",
    color: "from-pink-500 to-pink-600"
  }
];

const categories = ["All", "Storage", "Communication", "Enterprise", "Developer", "Automation"];

export default function IntegrationsGrid() {
  const [activeCategory, setActiveCategory] = React.useState("All");

  const filteredIntegrations = activeCategory === "All" 
    ? integrations 
    : integrations.filter(integration => integration.category === activeCategory);

  return (
    <section id="integrations" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-green-100 text-green-700">
            Integrations
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Connect everything
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Seamlessly integrate with your existing tools and workflows. 
            From cloud storage to team communication, we've got you covered.
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeCategory === category
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {filteredIntegrations.map((integration, index) => (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${integration.color} flex items-center justify-center shadow-lg`}>
                    <integration.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {integration.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {integration.description}
                  </p>
                  
                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                    {integration.category}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Integration CTA */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Zap className="w-10 h-10 text-white" />
            </div>
            
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Need a custom integration?
            </h3>
            
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Our API is designed for flexibility. Build custom integrations 
              or request new ones from our team. Enterprise customers get 
              priority integration development.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                View API Docs
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline">
                Request Integration
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}