import { Check, Star, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useState } from "react";
import ChatboxMobile from "@/components/layout/ChatboxMobile";

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState("Gold"); // Default selected plan

  const plans = [
    {
      name: "Free",
      price: "₹0",
      description: "Perfect for trying out our platform",
      features: [
        "Basic profile listing",
        "Up to 3 job applications",
        "Basic search filters",
        "Email support",
        "Standard response time"
      ],
      icon: <Star className="w-6 h-6" />,
      gradient: "from-gray-100 to-gray-200",
      label: "Starter",
      buttonStyle: "bg-gray-200 hover:bg-gray-300 text-gray-900",
      checkColor: "text-gray-400"
    },
    {
      name: "Gold",
      price: "₹499",
      description: "Perfect for small projects and individual workers",
      features: [
        "Enhanced profile listing",
        "Up to 10 job applications",
        "Advanced search filters",
        "Priority support",
        "Faster response time",
        "Featured listing",
        "Basic analytics"
      ],
      icon: <Crown className="w-6 h-6" />,
      gradient: "from-yellow-400 to-yellow-600",
      label: "Popular",
      buttonStyle: "bg-yellow-500 hover:bg-yellow-600 text-white",
      checkColor: "text-yellow-500"
    },
    {
      name: "Platinum",
      price: "₹999",
      description: "Ideal for growing businesses and skilled workers",
      features: [
        "Premium profile listing",
        "Unlimited job applications",
        "Custom search filters",
        "24/7 priority support",
        "Instant response time",
        "Featured listing",
        "Advanced analytics",
        "Custom branding"
      ],
      icon: <Sparkles className="w-6 h-6" />,
      gradient: "from-blue-400 to-blue-600",
      label: "Premium",
      buttonStyle: "bg-blue-500 hover:bg-blue-600 text-white",
      checkColor: "text-blue-500"
    },
    {
      name: "Enterprise",
      price: "₹1999",
      description: "For large organizations and premium services",
      features: [
        "Ultimate profile listing",
        "Unlimited everything",
        "Custom search filters",
        "24/7 priority support",
        "Instant response time",
        "Featured listing",
        "Advanced analytics",
        "Custom branding",
        "API access",
        "Dedicated account manager"
      ],
      icon: <Crown className="w-6 h-6" />,
      gradient: "from-purple-500 to-purple-700",
      label: "Ultimate",
      buttonStyle: "bg-purple-500 hover:bg-purple-600 text-white",
      checkColor: "text-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
              <p className="text-xl text-gray-600">
                Choose the perfect plan for your needs
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedPlan(plan.name)}
                  className={`relative bg-white rounded-xl shadow-lg overflow-hidden flex flex-col cursor-pointer transition-all duration-300 ${
                    selectedPlan === plan.name ? 'ring-2 ring-primary transform scale-105' : ''
                  }`}
                >
                  {/* Label */}
                  <div className="absolute top-0 right-0">
                    <div className={`px-4 py-1 text-sm font-medium ${plan.name === "Free" ? "text-gray-900" : "text-white"} bg-gradient-to-r ${plan.gradient}`}>
                      {plan.label}
                    </div>
                  </div>

                  {/* Header with gradient */}
                  <div className={`p-6 bg-gradient-to-r ${plan.gradient} ${plan.name === "Free" ? "text-gray-900" : "text-white"}`}>
                    <div className="flex items-center justify-between mb-4">
                      {plan.icon}
                      <h2 className="text-2xl font-semibold">{plan.name}</h2>
                    </div>
                    <div className="mb-2">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className={`${plan.name === "Free" ? "text-gray-700" : "text-white/80"}`}>/month</span>
                    </div>
                    <p className={`${plan.name === "Free" ? "text-gray-700" : "text-white/90"}`}>{plan.description}</p>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-grow">
                    <div className="mb-6">
                      <ul className="space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start">
                            <Check className={`w-5 h-5 ${plan.checkColor} mt-0.5 mr-2`} />
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Button at bottom */}
                  <div className="p-6 pt-0">
                    <Button
                      className={`w-full ${plan.buttonStyle} font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02]`}
                    >
                      Get Started
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ Section */}
            <div className="mt-16">
              <h2 className="text-2xl font-semibold text-center mb-8">Frequently Asked Questions</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-medium mb-2">Can I change plans later?</h3>
                  <p className="text-gray-600">
                    Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-medium mb-2">What payment methods do you accept?</h3>
                  <p className="text-gray-600">
                    We accept all major credit cards, UPI, and net banking. All payments are processed securely.
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-medium mb-2">Is there a free trial?</h3>
                  <p className="text-gray-600">
                    Yes, we offer a 7-day free trial on all plans. No credit card required to start.
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-medium mb-2">What happens after my trial ends?</h3>
                  <p className="text-gray-600">
                    After your trial, you'll be prompted to choose a plan. Your account will continue with the features of your selected plan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ChatboxMobile/>
      <Footer />
    </div>
  );
};

export default Pricing;