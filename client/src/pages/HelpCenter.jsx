import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronRight, Book, User, CreditCard, Shield, MessageSquare, FileText, Settings, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Link } from "wouter";
import ChatboxMobile from "@/components/layout/ChatboxMobile";

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allArticles = [
    {
      id: 1,
      category: "Getting Started",
      title: "How to create an account",
      content: `Creating an account on LabourHunt is simple and quick:

1. Click the "Get Started" button in the top right corner
2. Enter your mobile number
3. Enter your name and upload your ID proof
4. Receive an OTP on your mobile and enter it to verify
5. Registration is complete! You can now log in and use the platform.`,
      tags: ["account", "registration", "signup", "mobile", "otp"]
    },
    {
      id: 2,
      category: "Getting Started",
      title: "Profile setup guide",
      content: `After registration, your profile is ready to use. You can update your name or ID proof in your account settings if needed. No portfolio or bio is required to get started on LabourHunt.`,
      tags: ["profile", "setup", "id proof"]
    },
    {
      id: 3,
      category: "Account & Security",
      title: "Password reset (OTP)",
      content: `If you've forgotten your password:

1. Click "Forgot Password" on the login page
2. Enter your registered mobile number
3. Receive an OTP on your mobile
4. Enter the OTP and set a new password
5. Log in with your new password

For your security, OTPs expire after a few minutes.`,
      tags: ["password", "security", "reset", "login", "otp"]
    },
    {
      id: 4,
      category: "Payments & Billing",
      title: "Payment methods",
      content: `LabourHunt supports various payment methods:

1. Credit/Debit Cards
2. UPI
3. Net Banking
4. Digital Wallets

To add a payment method:
1. Go to Payment Settings
2. Click "Add Payment Method"
3. Select your preferred method
4. Follow the verification steps

All payments are processed securely through our payment partners.`,
      tags: ["payment", "billing", "cards", "upi"]
    },
    {
      id: 5,
      category: "Payments & Billing",
      title: "Understanding service fees",
      content: `LabourHunt charges the following fees:

1. Platform Fee: 10% of the total project value
2. Payment Processing Fee: 2.5% + applicable taxes
3. Withdrawal Fee: Free for bank transfers, 1% for other methods

Fees are automatically calculated and displayed before you confirm any transaction.`,
      tags: ["fees", "payment", "charges", "billing"]
    },
    {
      id: 6,
      category: "Finding Workers",
      title: "How to find the right worker",
      content: `Finding the perfect worker for your project:

1. Use the search bar to find workers by skill or location
2. Filter results by:
   - Rating
   - Experience
   - Price range
   - Availability
3. Review worker profiles
4. Contact potential workers
5. Compare quotes and proposals

Take your time to find the right match for your needs.`,
      tags: ["workers", "search", "hiring", "filter"]
    },
    {
      id: 7,
      category: "Projects",
      title: "Setting up your first project",
      content: `Create your first project on LabourHunt:

1. Click "Post a Project"
2. Fill in project details:
   - Title
   - Description
   - Budget
   - Timeline
   - Required skills
3. Add any relevant attachments
4. Set project visibility
5. Review and post

Once posted, workers can view and submit proposals.`,
      tags: ["project", "post", "setup", "proposal"]
    }
  ];

  const categories = [
    {
      title: "Getting Started",
      icon: <Book className="w-6 h-6" />,
      description: "Learn the basics of using LabourHunt"
    },
    {
      title: "Account & Security",
      icon: <Shield className="w-6 h-6" />,
      description: "Manage your account and security settings"
    },
    {
      title: "Payments & Billing",
      icon: <CreditCard className="w-6 h-6" />,
      description: "Everything about payments and fees"
    },
    {
      title: "Finding Workers",
      icon: <User className="w-6 h-6" />,
      description: "How to find and hire workers"
    },
    {
      title: "Projects",
      icon: <FileText className="w-6 h-6" />,
      description: "Managing your projects"
    }
  ];

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    return allArticles.filter(article => {
      const searchLower = searchQuery.toLowerCase();
      return (
        article.title.toLowerCase().includes(searchLower) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    });
  }, [searchQuery]);

  const filteredArticles = useMemo(() => {
    return allArticles.filter(article => {
      const matchesCategory = !selectedCategory || article.category === selectedCategory;
      return matchesCategory;
    });
  }, [selectedCategory]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setShowSearchResults(true);
    setSelectedArticle(null);
  };

  const handleSearchResultClick = (article) => {
    setSelectedArticle(article);
    setShowSearchResults(false);
    setSearchQuery("");
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category === selectedCategory ? null : category);
    setSelectedArticle(null);
    setShowSearchResults(false);
  };

  const handleArticleSelect = (article) => {
    setSelectedArticle(article);
    setShowSearchResults(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions and learn how to make the most of LabourHunt
            </p>
          </div>

          {/* Search Bar with Dropdown */}
          <div className="max-w-2xl mx-auto mb-12" ref={searchRef}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={handleSearch}
                onFocus={() => setShowSearchResults(true)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchQuery && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((article) => (
                        <button
                          key={article.id}
                          onClick={() => handleSearchResultClick(article)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start space-x-3"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{article.title}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              {article.category}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {article.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No matching articles found</h3>
                      <p className="text-gray-600">
                        Try searching by article title or browse categories
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Categories</h2>
                <div className="space-y-2">
                  {categories.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => handleCategorySelect(category.title)}
                      className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                        selectedCategory === category.title
                          ? "bg-blue-50 text-blue-600"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {category.icon}
                      <div>
                        <div className="font-medium">{category.title}</div>
                        <div className="text-sm text-gray-500">{category.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Articles List and Content */}
            <div className="lg:col-span-2">
              {selectedArticle ? (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
                  >
                    <ChevronRight className="w-4 h-4 transform rotate-180 mr-1" />
                    Back to articles
                  </button>
                  <h2 className="text-2xl font-semibold mb-4">{selectedArticle.title}</h2>
                  <div className="prose max-w-none">
                    {selectedArticle.content.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredArticles.map((article) => (
                    <div
                      key={article.id}
                      className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleArticleSelect(article)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {article.title}
                          </h3>
                          <p className="text-gray-600 line-clamp-2">
                            {article.content.split('\n')[0]}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {article.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contact Support */}
          <div className="mt-12 bg-blue-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Still Need Help?</h2>
            <p className="text-gray-600 mb-6">
              Our support team is here to help you with any questions or issues you may have.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/contact" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Contact Support
              </Link>
              <Link href="/contact" className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                Schedule a Call
              </Link>
            </div>
          </div>
        </div>
      </div>
      <ChatboxMobile/>
      <Footer />
    </div>
  );
};

export default HelpCenter; 