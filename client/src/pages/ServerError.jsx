import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Link } from "wouter";
import { Helmet } from "react-helmet";

export default function ServerError() {
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <>
      <Helmet>
        <title>Server Error - Something went wrong | LabourHunt</title>
        <meta name="description" content="We're experiencing technical difficulties. Please try refreshing the page or contact our support team if the problem persists." />
        <meta name="keywords" content="server error, technical difficulties, labour hunt, support" />
        <meta property="og:title" content="Server Error - Something went wrong | LabourHunt" />
        <meta property="og:description" content="We're experiencing technical difficulties. Please try refreshing the page or contact our support team if the problem persists." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Server Error - Something went wrong | LabourHunt" />
        <meta name="twitter:description" content="We're experiencing technical difficulties. Please try refreshing the page or contact our support team if the problem persists." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-2xl mx-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Server Error</h1>
              
              <p className="text-gray-600 mb-6 max-w-md">
                Oops! Something went wrong on our end. We're working to fix this issue as quickly as possible.
              </p>

              <div className="space-y-4 w-full max-w-sm">
                <Button 
                  onClick={handleRefresh}
                  size="lg" 
                  className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="h-5 w-5" />
                  Refresh Page
                </Button>
                
                <Button 
                  onClick={handleGoHome}
                  variant="outline"
                  size="lg" 
                  className="w-full gap-2"
                >
                  <Home className="h-5 w-5" />
                  Go to Homepage
                </Button>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">
                  Still having issues?
                </p>
                <Link href="/contact" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Contact Support
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 