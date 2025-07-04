import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "wouter";
import { Helmet } from "react-helmet";

export default function NotFound() {
  return (
 <>
    <Helmet>
        <title>NOT FOUND - LabourHunt - Our Mission and Values</title>
        <meta name="description" content="NOT FOUND LabourHunt - our mission to connect skilled workers with clients seeking quality services in a trusted, verified environment." />
        <meta property="og:title" content="NOT FOUND LabourHunt - Our Mission and Values" />
        <meta property="og:description" content="NOT FOUND LabourHunt - our mission to connect skilled workers with clients seeking quality services." />
      </Helmet>
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-2xl mx-4">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <img 
              src="/404.jpg"
              alt="Brown cat illustration" 
              className="w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] h-auto object-contain rounded-lg mb-6"
            />
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-3xl font-bold text-gray-900">Page Not Found</h1>
            </div>

            <p className="text-gray-600 mb-8 max-w-md">
              Oops! The page you're looking for doesn't exist or has been moved. 
              Let's get you back on track.
            </p>

            <Link href="/">
              <Button size="lg" className="gap-2">
                <Home className="h-5 w-5" />
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
