import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatboxMobile from "@/components/layout/ChatboxMobile";
import { Helmet } from 'react-helmet';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is LabourHunt?",
      answer: "LabourHunt is a platform that connects skilled workers with clients who need their services. We make it easy to find, hire, and manage skilled professionals for various projects and tasks."
    },
    {
      question: "How do I find a worker?",
      answer: "You can browse through our extensive list of skilled workers, filter by category, location, and ratings. Once you find a suitable worker, you can view their profile, check their reviews, and contact them directly through our platform."
    },
    {
      question: "How do I become a worker on LabourHunt?",
      answer: "To become a worker, sign up for an account, complete your profile with your skills and experience, and submit necessary documentation. Once approved, you can start accepting jobs and building your reputation on the platform."
    },
    {
      question: "How does payment work?",
      answer: "We use a secure payment system where clients pay upfront, and the amount is held in escrow. Once the work is completed and approved, the payment is released to the worker. We charge a small service fee for facilitating the transaction."
    },
    {
      question: "What if I'm not satisfied with the work?",
      answer: "We have a dispute resolution process in place. If you're not satisfied with the work, you can raise a dispute within 48 hours of completion. Our support team will mediate and help resolve the issue fairly."
    },
    {
      question: "Is my information secure?",
      answer: "Yes, we take security seriously. All personal and payment information is encrypted and stored securely. We never share your information with third parties without your consent."
    },
    {
      question: "How do I verify a worker's credentials?",
      answer: "All workers on our platform go through a verification process. You can view their verified badges, certifications, and previous work history. Additionally, you can check reviews from other clients who have worked with them."
    },
    {
      question: "What types of services are available?",
      answer: "We offer a wide range of services including home repairs, cleaning, gardening, electrical work, plumbing, painting, and many more. You can browse our categories to see the full list of available services."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>FAQ - Frequently Asked Questions | LabourHunt</title>
        <meta name="description" content="Find answers to frequently asked questions about LabourHunt. Learn how to find workers, become a worker, payment processes, security, and more." />
        <meta name="keywords" content="FAQ, frequently asked questions, labour hunt, workers, hiring, payment, security, verification" />
        <meta property="og:title" content="FAQ - Frequently Asked Questions | LabourHunt" />
        <meta property="og:description" content="Find answers to frequently asked questions about LabourHunt. Learn how to find workers, become a worker, payment processes, security, and more." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="FAQ - Frequently Asked Questions | LabourHunt" />
        <meta name="twitter:description" content="Find answers to frequently asked questions about LabourHunt. Learn how to find workers, become a worker, payment processes, security, and more." />
      </Helmet>
      <Header />
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8">Frequently Asked Questions</h1>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <button
                    className="w-full px-6 py-4 text-left flex justify-between items-center"
                    onClick={() => toggleFAQ(index)}
                  >
                    <span className="font-medium text-lg">{faq.question}</span>
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 text-gray-500 transition-transform duration-200",
                        openIndex === index && "transform rotate-180"
                      )}
                    />
                  </button>
                  
                  <div
                    className={cn(
                      "px-6 transition-all duration-200",
                      openIndex === index ? "max-h-96 pb-4" : "max-h-0"
                    )}
                  >
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Help Section */}
            <div className="mt-12 bg-white rounded-lg shadow-md p-6 text-center">
              <h2 className="text-2xl font-semibold mb-4">Still have questions?</h2>
              <p className="text-gray-600 mb-6">
                Can't find the answer you're looking for? Please chat with our friendly team.
              </p>
              <a
                href="/contact"
                className="inline-block bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
      <ChatboxMobile/>
      <Footer />
    </div>
  );
};

export default FAQ; 