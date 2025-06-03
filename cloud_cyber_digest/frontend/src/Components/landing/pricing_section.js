import React from "react";
import { Button } from "../../Components/ui/button";       // ✅ correct
import { Badge } from "../../Components/ui/badge";       // ✅ correct
import { Card, CardContent, CardHeader } from "../../Components/ui/card";  // ✅ correct
import { Check, Zap, Building2, Crown } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Starter",
    icon: Zap,
    price: "$29",
    period: "/month",
    description: "Perfect for individuals and small teams",
    features: [
      "50 PDF summaries/month",
      "Basic templates",
      "Email support",
      "Standard processing speed",
      "Basic branding options"
    ],
    cta: "Start Free Trial",
    popular: false,
    color: "from-blue-500 to-blue-600"
  },
  {
    name: "Professional", 
    icon: Building2,
    price: "$89",
    period: "/month",
    description: "Advanced features for growing businesses",
    features: [
      "500 PDF summaries/month",
      "Custom templates",
      "Priority support",
      "Fast processing speed", 
      "Full branding customization",
      "Team collaboration",
      "Basic integrations",
      "API access"
    ],
    cta: "Upgrade Now",
    popular: true,
    color: "from-indigo-500 to-indigo-600"
  },
  {
    name: "Enterprise",
    icon: Crown,
    price: "Custom",
    period: "",
    description: "Unlimited power for large organizations",
    features: [
      "Unlimited PDF summaries",
      "Custom integrations",
      "Dedicated support",
      "Priority processing",
      "White-label solution",
      "Advanced analytics",
      "Custom deployments",
      "SLA guarantees"
    ],
    cta: "Contact Sales",
    popular: false,
    color: "from-purple-500 to-purple-600"
  }
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-purple-100 text-purple-700">
            Pricing Plans
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Scale at your own pace
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start with our MVP features and upgrade as your needs grow. 
            All plans include our core PDF intelligence capabilities.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className={`relative h-full transition-all duration-300 border-0 shadow-lg hover:shadow-2xl ${
                plan.popular 
                  ? "ring-2 ring-indigo-500 scale-105 hover:scale-110" 
                  : "hover:-translate-y-2"
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8 pt-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-lg`}>
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-6">
                    {plan.description}
                  </p>
                  
                  <div className="flex items-end justify-center mb-6">
                    <span className="text-5xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 ml-2">
                      {plan.period}
                    </span>
                  </div>
                  
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800" 
                        : "bg-gray-900 hover:bg-gray-800"
                    }`}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start space-x-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Migration Path */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Seamless Migration Path
            </h3>
            <p className="text-gray-600 mb-8 max-w-3xl mx-auto">
              We understand you're evolving from an MVP. Our migration team will help 
              you transition smoothly, preserving your existing workflows while unlocking 
              new capabilities.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                "Data Migration Assistance",
                "Custom Onboarding",
                "Training & Support"
              ].map((benefit, index) => (
                <div key={benefit} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">{benefit}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}