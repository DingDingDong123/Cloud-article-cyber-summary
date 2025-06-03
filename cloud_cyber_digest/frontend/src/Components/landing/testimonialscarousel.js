import React, { useState } from "react";
import { Button } from "../../Components/ui/button";       // ✅ correct
import { Badge } from "../../Components/ui/badge";       // ✅ correct
import { Card, CardContent } from "../../Components/ui/card";  // ✅ correct
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    name: "Sarah Chen",
    title: "Product Manager",
    company: "TechFlow Inc",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "DocuFlow transformed our document workflow completely. The custom branding feature lets us deliver professional summaries to clients with our logo and styling. Game changer for our consulting business."
  },
  {
    name: "Michael Rodriguez", 
    title: "Operations Director",
    company: "Legal Partners LLC",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "We started with basic PDF processing but needed more. The enterprise features, especially SharePoint integration and team collaboration, have saved us hours every week. Worth every penny."
  },
  {
    name: "Emma Thompson",
    title: "Research Lead", 
    company: "Academic Solutions",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "The API integration capabilities are outstanding. We've built custom workflows that automatically process research papers and generate summaries for our database. Exactly what we needed."
  },
  {
    name: "David Kim",
    title: "CTO",
    company: "StartupX",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face", 
    rating: 5,
    text: "As we scaled from MVP to enterprise, DocuFlow scaled with us. The migration was seamless, and the new features like custom templates and integrations are exactly what we needed for growth."
  }
];

export default function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Loved by growing teams
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how teams like yours have evolved from basic solutions to 
            enterprise-grade document intelligence with DocuFlow.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 md:p-12">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-shrink-0">
                      <img
                        src={testimonials[currentIndex].image}
                        alt={testimonials[currentIndex].name}
                        className="w-24 h-24 rounded-full object-cover shadow-lg"
                      />
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                      <div className="mb-4">
                        <Quote className="w-8 h-8 text-blue-500 mx-auto md:mx-0 mb-4" />
                        <p className="text-lg md:text-xl text-gray-700 leading-relaxed italic">
                          "{testimonials[currentIndex].text}"
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-center md:justify-start gap-1 mb-4">
                        {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      
                      <div>
                        <p className="font-bold text-gray-900 text-lg">
                          {testimonials[currentIndex].name}
                        </p>
                        <p className="text-gray-600">
                          {testimonials[currentIndex].title}
                        </p>
                        <p className="text-blue-600 font-medium">
                          {testimonials[currentIndex].company}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              className="rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? "bg-blue-600 w-8" 
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              className="rounded-full"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
          {[
            { number: "10,000+", label: "Documents Processed" },
            { number: "500+", label: "Happy Customers" },
            { number: "99.9%", label: "Uptime" }
          ].map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}