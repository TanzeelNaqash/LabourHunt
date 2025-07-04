import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import useAuthStore from '@/store/authStore';

export default function CallToAction() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const worker = useAuthStore((state) => state.worker);

  let dashboardLink = null;
  if (isAuthenticated) {
    if (worker) {
      dashboardLink = (
        <Link href="/worker-dashboard">
          <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
            Go to Worker Dashboard
          </Button>
        </Link>
      );
    } else if (user) {
      if (user.role === 'client') {
        dashboardLink = (
          <Link href="/client-dashboard">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
              Go to Client Dashboard
            </Button>
          </Link>
        );
      } else if (user.role === 'admin') {
        dashboardLink = (
          <Link href="/admin-dashboard">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
              Go to Admin Dashboard
            </Button>
          </Link>
        );
      }
    }
  }

  return (
    <section className="py-16 bg-primary text-white">
      <div className="container mx-auto px-4 text-center">
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
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
                  Sign Up as Client
                </Button>
              </Link>
              <Link href="/auth">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-transparent border border-white text-white hover:bg-white/10"
                >
                  Register as Worker
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
