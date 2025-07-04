import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import useAuthStore from '@/store/authStore';

export default function HeroSection() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const worker = useAuthStore((state) => state.worker);

  let dashboardLink = null;
  if (isAuthenticated) {
    if (worker) {
      dashboardLink = (
        <Link href="/worker-dashboard">
          <Button size="lg">Go to Worker Dashboard</Button>
        </Link>
      );
    } else if (user) {
      if (user.role === 'client') {
        dashboardLink = (
          <Link href="/client-dashboard">
            <Button size="lg">Go to Client Dashboard</Button>
          </Link>
        );
      } else if (user.role === 'admin') {
        dashboardLink = (
          <Link href="/admin-dashboard">
            <Button size="lg">Go to Admin Dashboard</Button>
          </Link>
        );
      }
    }
  }

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-dark mb-4">
              Connect with Skilled <span className="text-primary">Professionals</span>
            </h1>
            <p className="text-lg text-neutral-700 mb-8">
              Find verified skilled workers for your projects or offer your services on our trusted platform.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {dashboardLink ? (
                dashboardLink
              ) : (
                <>
                  <Link href="/login">
                    <Button size="lg">Find Workers</Button>
                  </Link>
                  <Link href="/auth">
                    <Button variant="outline" size="lg">
                      Register as Worker
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="md:w-1/2 mt-10 md:mt-0">
            <img 
              src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="Skilled worker in action" 
              className="rounded-xl shadow-lg w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
