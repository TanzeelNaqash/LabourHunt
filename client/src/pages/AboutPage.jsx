import { Helmet } from "react-helmet";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CheckCircle, ShieldX, Handshake, Star } from "lucide-react";
import ChatboxMobile from "@/components/layout/ChatboxMobile";

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About LabourHunt - Our Mission and Values</title>
        <meta name="description" content="Learn about LabourHunt - our mission to connect skilled workers with clients seeking quality services in a trusted, verified environment." />
        <meta property="og:title" content="About LabourHunt - Our Mission and Values" />
        <meta property="og:description" content="Learn about LabourHunt - our mission to connect skilled workers with clients seeking quality services." />
      </Helmet>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-12 bg-[#F3F2EF]">
          <div className="container mx-auto px-4">
            {/* Hero Section */}
            <div className="mb-16 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">About <span className="text-primary">LabourHunt</span></h1>
              <p className="text-lg text-neutral-700 max-w-3xl mx-auto">
                Our mission is to bridge the gap between skilled workers and clients seeking quality services, creating opportunities for professionals while ensuring trust and reliability.
              </p>
            </div>

            {/* About Content */}
            <div className="flex flex-col md:flex-row items-center mb-16">
              <div className="md:w-1/2 md:pr-12 mb-8 md:mb-0">
                <img 
                  src="https://media.istockphoto.com/id/1434742171/photo/laptop-ppt-presentation-business-meeting-and-team-working-on-review-for-new-digital-website.webp?a=1&b=1&s=612x612&w=0&k=20&c=QGR4lIXS1P30qiZnhfq5cKMKLba1N3QGjWT1e012cYU=" 
                  alt="About LabourHunt" 
                  className="rounded-xl shadow-lg w-full h-auto"
                />
              </div>
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold mb-4">Our Story</h2>
                <p className="text-neutral-700 mb-6">
                  LabourHunt was founded with a passion for creating a platform where skilled workers can showcase their expertise and connect with clients who need quality services. We recognized the challenges faced by both workers seeking opportunities and clients struggling to find reliable professionals.
                </p>
                <p className="text-neutral-700 mb-6">
                  What started as a simple idea has grown into a comprehensive platform that verifies workers, facilitates connections, and helps build lasting professional relationships. We're committed to supporting the trades community and elevating the standard of service across industries.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start">
                    <div className="mt-1 mr-3 text-primary">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Verified Workers</h3>
                      <p className="text-sm text-neutral-600">All workers undergo thorough verification</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="mt-1 mr-3 text-primary">
                      <ShieldX className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Secure Platform</h3>
                      <p className="text-sm text-neutral-600">Your information is always protected</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="mt-1 mr-3 text-primary">
                      <Handshake className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Direct Connections</h3>
                      <p className="text-sm text-neutral-600">No middlemen or extra fees</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="mt-1 mr-3 text-primary">
                      <Star className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Trusted Reviews</h3>
                      <p className="text-sm text-neutral-600">Authentic feedback from real clients</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mission and Values */}
            <div className="bg-white rounded-xl shadow-md p-8 mb-16">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-4">Our Mission & Values</h2>
                <p className="text-neutral-700 max-w-3xl mx-auto">
                  We're guided by a set of core values that shape everything we do at LabourHunt.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center p-6 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Community</h3>
                  <p className="text-neutral-600">
                    Building a supportive community of skilled professionals and clients who value quality work and fair opportunities.
                  </p>
                </div>

                <div className="text-center p-6 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Trust</h3>
                  <p className="text-neutral-600">
                    Fostering trust through verification, transparency, and by maintaining the highest standards of integrity.
                  </p>
                </div>

                <div className="text-center p-6 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Empowerment</h3>
                  <p className="text-neutral-600">
                    Empowering skilled workers to grow their business and clients to find the right talent for their projects.
                  </p>
                </div>
              </div>
            </div>

            {/* Team Section */}
            <div className="mb-16">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-4">Our Team</h2>
                <p className="text-neutral-700 max-w-3xl mx-auto">
                  Meet the dedicated team behind LabourHunt, working to create the best experience for our users.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <img 
                    src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80" 
                    alt="Team Member" 
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="font-semibold text-lg">Tanzeel Naqash</h3>
                    <p className="text-primary text-sm mb-2">Founder & CEO</p>
                    <p className="text-neutral-600 text-sm">
                      With a background in construction and technology, Tanzeel founded LabourHunt to bridge the gap between skilled workers and clients.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <img 
                    src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80" 
                    alt="Team Member" 
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="font-semibold text-lg">Saqib Mushtaq</h3>
                    <p className="text-primary text-sm mb-2">Head of Operations</p>
                    <p className="text-neutral-600 text-sm">
                      Saqib ensures smooth platform operations and leads our verification process, ensuring quality and trust for all users.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <img 
                    src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80" 
                    alt="Team Member" 
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="font-semibold text-lg">Tanzeel Naqash</h3>
                    <p className="text-primary text-sm mb-2">Tech Lead</p>
                    <p className="text-neutral-600 text-sm">
                      Tanzeel leads our technical development, ensuring a seamless and secure experience for all platform users.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="bg-primary text-white rounded-xl shadow-md p-8" >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
                <p className="max-w-2xl mx-auto">
                  Have questions or feedback? We'd love to hear from you! Contact our team for assistance.
                </p>
              </div>

              <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-8">
                <div className="text-center">
                  <svg className="h-8 w-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <h3 className="font-semibold mb-1">Email Us</h3>
                  <p>support@labourhunt.com</p>
                </div>

                <div className="text-center">
                  <svg className="h-8 w-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <h3 className="font-semibold mb-1">Call Us</h3>
                  <p>(+91) 123-4567-890</p>
                </div>

                <div className="text-center">
                  <svg className="h-8 w-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <h3 className="font-semibold mb-1">Office</h3>
                  <p>Tengpora, Srinagar, Jammu and Kashmir, India</p>
                </div>
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
