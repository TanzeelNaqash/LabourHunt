import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, ShieldX, Handshake, Star } from "lucide-react";

export default function AboutSection() {
  return (
    <section className="py-12 bg-[#F3F2EF]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-12 mb-8 md:mb-0">
            <img 
              src="https://media.istockphoto.com/id/1434742171/photo/laptop-ppt-presentation-business-meeting-and-team-working-on-review-for-new-digital-website.webp?a=1&b=1&s=612x612&w=0&k=20&c=QGR4lIXS1P30qiZnhfq5cKMKLba1N3QGjWT1e012cYU=&auto=format&fit=crop&w=1350&h=900&q=80" 
              alt="About LabourHunt" 
              className="rounded-xl shadow-lg w-full h-auto"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-4">About LabourHunt</h2>
            <p className="text-neutral-700 mb-6">
              LabourHunt was founded with a mission to bridge the gap between skilled workers and clients seeking quality services. We believe in creating opportunities for talented professionals while providing clients with access to verified experts.
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
            <Link href="/about">
              <Button>Learn More</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
