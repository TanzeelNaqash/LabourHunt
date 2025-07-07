import { Helmet } from "react-helmet";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { 
  UserPlus, 
  Search, 
  CheckCircle, 
  MessageSquare, 
  Star, 
  ShieldCheck,
  Award,
  ArrowRight,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import useAuthStore from '@/store/authStore';
import ChatboxMobile from "@/components/layout/ChatboxMobile";

export default function HowItWorksPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const worker = useAuthStore((state) => state.worker);

  let dashboardLink = null;
  if (isAuthenticated) {
    if (worker) {
      dashboardLink = (
        <Link href="/worker-dashboard">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            Go to Worker Dashboard
          </Button>
        </Link>
      );
    } else if (user) {
      if (user.role === 'client') {
        dashboardLink = (
          <Link href="/client-dashboard">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Go to Client Dashboard
            </Button>
          </Link>
        );
      } else if (user.role === 'admin') {
        dashboardLink = (
          <Link href="/admin-dashboard">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Go to Admin Dashboard
            </Button>
          </Link>
        );
      }
    }
  }

  return (
    <>
      <Helmet>
        <title>How LabourHunt Works - Connect with Skilled Workers</title>
        <meta name="description" content="Learn how LabourHunt connects skilled workers with clients, from verification to project completion. Find out how to get started today." />
        <meta property="og:title" content="How LabourHunt Works - Connect with Skilled Workers" />
        <meta property="og:description" content="Learn how LabourHunt connects skilled workers with clients, from verification to project completion." />
      </Helmet>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-12 bg-[#F3F2EF]">
          <div className="container mx-auto px-4">
            {/* Hero Section */}
            <div className="mb-16 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">How <span className="text-primary">LabourHunt</span> Works</h1>
              <p className="text-lg text-neutral-700 max-w-3xl mx-auto">
                Our platform makes it easy to connect verified skilled workers with clients looking for quality services. Here's how it works.
              </p>
            </div>

            {/* Process Steps */}
            <div className="max-w-5xl mx-auto mb-20">
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">1</div>
                  <h3 className="text-xl font-semibold mb-3">Create Your Account</h3>
                  <p className="text-neutral-700">Sign up as a worker or client. Workers undergo verification for quality assurance.</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">2</div>
                  <h3 className="text-xl font-semibold mb-3">Browse Profiles</h3>
                  <p className="text-neutral-700">Explore verified worker profiles, view their skills, experience, and ratings from other clients.</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">3</div>
                  <h3 className="text-xl font-semibold mb-3">Connect & Collaborate</h3>
                  <p className="text-neutral-700">Contact workers directly, discuss your project needs, and get the job done professionally.</p>
                </div>
              </div>

              <div className="flex justify-center">
                {dashboardLink ? (
                  dashboardLink
                ) : (
                  <Link href="/auth">
                    <Button size="lg" className="bg-primary hover:bg-primary/90">
                      Get Started Today <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* For Clients Section */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center mb-10">For Clients</h2>
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/2">
                    <img 
                      src="https://media.istockphoto.com/id/1847645097/photo/customer-with-bank-manager-in-office-stock-photo.webp?a=1&b=1&s=612x612&w=0&k=20&c=1PzMudV7yem3yB4uXB8s4l41fqH9TFkFYvujKZz-n_g=" 
                      alt="Client browsing worker profiles" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="md:w-1/2 p-8">
                    <h3 className="text-2xl font-semibold mb-6">How to Find Quality Workers</h3>
                    
                    <div className="space-y-6">
                      <div className="flex">
                        <div className="flex-shrink-0 mr-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <UserPlus className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Create a Client Account</h4>
                          <p className="text-neutral-600 text-sm">Register as a client and complete your profile with your location and service needs.</p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="flex-shrink-0 mr-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Search className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Search Verified Workers</h4>
                          <p className="text-neutral-600 text-sm">Browse verified worker profiles based on skills, location, and ratings.</p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="flex-shrink-0 mr-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <MessageSquare className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Contact and Discuss</h4>
                          <p className="text-neutral-600 text-sm">Reach out to workers directly to discuss your project requirements, timeline, and budget.</p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="flex-shrink-0 mr-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Star className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Leave Feedback</h4>
                          <p className="text-neutral-600 text-sm">After project completion, rate and review the worker to help others in the community.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* For Workers Section */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center mb-10">For Workers</h2>
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/2 p-8 order-2 md:order-1">
                    <h3 className="text-2xl font-semibold mb-6">How to Showcase Your Skills</h3>
                    
                    <div className="space-y-6">
                      <div className="flex">
                        <div className="flex-shrink-0 mr-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <UserPlus className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Create a Worker Account</h4>
                          <p className="text-neutral-600 text-sm">Register as a worker and start building your professional profile.</p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="flex-shrink-0 mr-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Complete Verification</h4>
                          <p className="text-neutral-600 text-sm">Submit required ID proof and credentials to get verified by our admin team.</p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="flex-shrink-0 mr-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Highlight Your Expertise</h4>
                          <p className="text-neutral-600 text-sm">Showcase your skills, experience, and work portfolio to attract potential clients.</p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="flex-shrink-0 mr-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Award className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Build Your Reputation</h4>
                          <p className="text-neutral-600 text-sm">Deliver quality work to earn positive reviews and build your reputation on the platform.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="md:w-1/2 order-1 md:order-2">
                    <img 
                      src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8N3w0MzcxNzQwfHxlbnwwfHx8fHw%3D" 
                      alt="Worker showcasing skills" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Process */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center mb-4">Our Verification Process</h2>
              <p className="text-center text-neutral-700 max-w-3xl mx-auto mb-10">
                We take trust seriously. Every worker on our platform undergoes verification to ensure quality and reliability.
              </p>
              
              <div className="bg-white rounded-xl shadow-md p-8">
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center p-4 border border-gray-100 rounded-lg">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-secondary font-bold">1</span>
                    </div>
                    <h4 className="font-medium mb-2">Document Submission</h4>
                    <p className="text-sm text-neutral-600">Workers submit ID proof, credentials, and qualification documents.</p>
                  </div>
                  
                  <div className="text-center p-4 border border-gray-100 rounded-lg">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-secondary font-bold">2</span>
                    </div>
                    <h4 className="font-medium mb-2">Background Check</h4>
                    <p className="text-sm text-neutral-600">Our team verifies the authenticity of all submitted documents.</p>
                  </div>
                  
                  <div className="text-center p-4 border border-gray-100 rounded-lg">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-secondary font-bold">3</span>
                    </div>
                    <h4 className="font-medium mb-2">Skill Assessment</h4>
                    <p className="text-sm text-neutral-600">Review of work portfolio and professional experience.</p>
                  </div>
                  
                  <div className="text-center p-4 border border-gray-100 rounded-lg">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-secondary font-bold">4</span>
                    </div>
                    <h4 className="font-medium mb-2">Verification Badge</h4>
                    <p className="text-sm text-neutral-600">Approved workers receive a verification badge on their profile.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
              
              <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-xl font-semibold mb-2">Is it free to join LabourHunt?</h3>
                    <p className="text-neutral-700">
                      Yes, it's completely free to create an account and browse worker profiles. There are no hidden fees or commissions.
                    </p>
                  </div>
                  
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-xl font-semibold mb-2">How long does the verification process take?</h3>
                    <p className="text-neutral-700">
                      Typically, the verification process takes 1-3 business days. Once approved, workers will receive a verification badge on their profile.
                    </p>
                  </div>
                  
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-xl font-semibold mb-2">How do I contact a worker?</h3>
                    <p className="text-neutral-700">
                      Once you're logged in, you can contact workers directly through our platform's messaging system or use their provided contact information.
                    </p>
                  </div>
                  
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-xl font-semibold mb-2">What happens if I'm not satisfied with a worker's service?</h3>
                    <p className="text-neutral-700">
                      We encourage you to first communicate directly with the worker. If issues persist, you can leave an honest review and contact our support team.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Can I work in multiple skill categories?</h3>
                    <p className="text-neutral-700">
                      Yes, workers can list multiple skills and service categories on their profile, as long as they can provide verification for each area of expertise.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-primary text-white rounded-xl shadow-md p-10 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="max-w-2xl mx-auto mb-8">
                Join our community of professionals and clients to find the perfect match for your projects.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                {dashboardLink ? (
                  dashboardLink
                ) : (
                  <>
                    <Link href="/auth">
                      <Button variant="secondary" size="lg">
                        <Users className="mr-2 h-5 w-5" />
                        Sign Up as Client
                      </Button>
                    </Link>
                    <Link href="/auth">
                      <Button variant="outline" size="lg" className="bg-transparent border border-white text-white hover:bg-white/10">
                        <UserPlus className="mr-2 h-5 w-5" />
                        Register as Worker
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
        <ChatboxMobile/>
        <Footer />
      </div>
    </>
  );
}
