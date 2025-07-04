import { Search, UserCheck, MessageSquare } from "lucide-react";

const steps = [
  {
    icon: <Search className="h-8 w-8" />,
    title: "Find a Professional",
    description: "Browse through our verified professionals and find the perfect match for your project."
  },
  {
    icon: <UserCheck className="h-8 w-8" />,
    title: "Verify Credentials",
    description: "Review their profile, ratings, and past work to ensure they meet your requirements."
  },
  {
    icon: <MessageSquare className="h-8 w-8" />,
    title: "Connect & Collaborate",
    description: "Message directly with the professional and get started on your project."
  }
];

export default function HowItWorks() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Finding the right professional for your project is simple and straightforward with our platform.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-primary">{step.icon}</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-neutral-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
