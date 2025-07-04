import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import WorkerCard from "@/components/worker/worker-card";
import { Loader2, ArrowRight } from "lucide-react";

export default function WorkerProfiles() {
  const { data: workers, isLoading } = useQuery({
    queryKey: ["/api/v1/workers"],
    queryFn: async () => {
      const res = await fetch("/api/v1/workers");
      if (!res.ok) throw new Error("Failed to fetch workers");
      return res.json();
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
    cacheTime: 5 * 60 * 1000,
  });

  // Get only verified workers and limit to 3 for display
  const verifiedWorkers = workers?.filter(worker => worker.isVerified || worker.status === 'approved').slice(0, 3) || [];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Professionals</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Connect with our top-rated, verified professionals ready to help with your projects.
            All professionals go through our thorough verification process.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading professionals...</span>
          </div>
        ) : verifiedWorkers.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {verifiedWorkers.map((worker, idx) => (
                <WorkerCard key={worker._id || worker.id || worker.email || idx} worker={worker} />
              ))}
            </div>
            <div className="text-center">
              <Link href="/workers">
                <Button variant="outline" size="lg" className="group">
                  View All Professionals
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <Card className="max-w-2xl mx-auto bg-neutral-50">
            <CardContent className="text-center py-12">
              <p className="text-neutral-600">
                We're currently onboarding verified professionals to our platform.
                Check back soon or sign up as a worker to get featured here!
              </p>
              <div className="mt-6">
                <Link href="/auth">
                  <Button>Get Started</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}