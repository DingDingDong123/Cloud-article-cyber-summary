import React from "react";
import { Button } from "../../Components/ui/button";       // ✅ correct
import { Badge } from "../../Components/ui/badge";       // ✅ correct
import { Card, CardContent } from "../../Components/ui/card";  // ✅ correct
import { ArrowRight, Play, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection({ isVisible }) {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="secondary" className="mb-6 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200">
              <Sparkles className="w-4 h-4 mr-2" />
              From MVP to Enterprise SaaS
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-8 leading-tight"
          >
            <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Transform PDFs with
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Intelligent Summaries
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            Elevate your document workflow with customizable PDF summaries, 
            branded outputs, and seamless integrations. Perfect for enterprises 
            scaling beyond basic solutions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6 border-2 hover:bg-gray-50"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-4 mb-16"
          >
            {[
              "Custom Branding",
              "Source Integrations", 
              "Enterprise Security",
              "API Access"
            ].map((feature, index) => (
              <div 
                key={feature}
                className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-full px-6 py-3 text-gray-700 font-medium shadow-sm"
              >
                {feature}
              </div>
            ))}
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
            transition={{ duration: 1, delay: 1 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8 min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Zap className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Intelligent Document Processing
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Advanced AI-powered PDF analysis with customizable summaries 
                    and branded outputs for professional workflows.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-6 -left-6 w-12 h-12 bg-blue-500 rounded-xl shadow-lg opacity-80"></div>
            <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-indigo-500 rounded-xl shadow-lg opacity-80"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}