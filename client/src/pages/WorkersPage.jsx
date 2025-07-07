import React, { useState, useEffect } from 'react'
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WorkerCard from "@/components/worker/worker-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Briefcase, MapPin, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import useAuthStore from '@/store/authStore';
import { useLocation } from 'wouter';
import ChatboxMobile from '@/components/layout/ChatboxMobile';

const WorkersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all-categories");
  const [selectedLocation, setSelectedLocation] = useState("all-locations");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const worker = useAuthStore((state) => state.worker);
  const [, setLocation] = useLocation();
  
  const { data: workers, isLoading } = useQuery({
    queryKey: ["/api/workers"],
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
    } else if (worker) {
      setLocation('/worker-dashboard');
    }
  }, [isAuthenticated, worker, setLocation]);

  // Filter workers based on search, category, and location
  const filteredWorkers = workers?.filter(worker => {
    const matchesSearch = searchQuery === "" ||
      worker.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all-categories" || selectedCategory === "" || 
      worker.category === selectedCategory;
    
    const matchesLocation = selectedLocation === "all-locations" || selectedLocation === "" || 
      worker.area === selectedLocation;
    
    return (
      matchesSearch &&
      matchesCategory &&
      matchesLocation &&
      (worker.status === 'approved' || worker.isVerified)
    );
  });

  // Extract unique categories and locations for filters
  const categories = workers 
    ? Array.from(new Set(workers.filter(w => w.category).map(w => w.category)))
    : [];
  
  const locations = workers 
    ? Array.from(new Set(workers.filter(w => w.area).map(w => w.area)))
    : [];

  return (
    <>
      <Helmet>
        <title>Find Verified Workers - LabourHunt</title>
        <meta name="description" content="Browse our directory of verified skilled workers including carpenters, plumbers, electricians, and more. Find the right professional for your project." />
        <meta property="og:title" content="Find Verified Workers - LabourHunt" />
        <meta property="og:description" content="Browse our directory of verified skilled workers for your next project." />
      </Helmet>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-12 bg-[#F3F2EF]">
          <div className="container mx-auto px-4">
            <div className="mb-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Find Verified Skilled Workers</h1>
              <p className="text-neutral-700 mb-8">
                Browse our selection of verified professionals ready to help with your projects. All workers undergo thorough verification for your peace of mind.
              </p>
              {/* Search and Filter Section */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input 
                          placeholder="Search by name or skill..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="md:w-1/4">
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all-categories">All Categories</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="md:w-1/4">
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
                        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all-locations">All Locations</SelectItem>
                            {locations.map((location) => (
                              <SelectItem key={location} value={location}>{location}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("all-categories");
                        setSelectedLocation("all-locations");
                      }}
                    >
                      <Filter className="mr-2 h-4 w-4" /> Reset
                    </Button>
                  </div>
                  {/* Active Filters */}
                  {(searchQuery || selectedCategory || selectedLocation) && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {searchQuery && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Search: {searchQuery}
                          <Button 
                            variant="ghost" 
                            className="h-4 w-4 p-0 hover:bg-transparent" 
                            onClick={() => setSearchQuery("")}
                          >
                            ×
                          </Button>
                        </Badge>
                      )}
                      {selectedCategory && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Category: {selectedCategory}
                          <Button 
                            variant="ghost" 
                            className="h-4 w-4 p-0 hover:bg-transparent" 
                            onClick={() => setSelectedCategory("all-categories")}
                          >
                            ×
                          </Button>
                        </Badge>
                      )}
                      {selectedLocation && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Location: {selectedLocation}
                          <Button 
                            variant="ghost" 
                            className="h-4 w-4 p-0 hover:bg-transparent" 
                            onClick={() => setSelectedLocation("all-locations")}
                          >
                            ×
                          </Button>
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              {/* Worker Listings */}
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading workers...</span>
                </div>
              ) : filteredWorkers && filteredWorkers.length > 0 ? (
                <>
                  <div className="mb-4">
                    <p className="text-neutral-700">
                      Showing {filteredWorkers.length} verified workers
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredWorkers.map((worker) => (
                      <WorkerCard key={worker._id} worker={worker} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <div className="mb-4">
                    <Search className="h-12 w-12 mx-auto text-neutral-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No workers found</h3>
                  <p className="text-neutral-600 max-w-md mx-auto">
                    We couldn't find any workers matching your search criteria. Try adjusting your filters or search terms.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
        <ChatboxMobile/>
        <Footer />
      </div>
    </>
  )
}

export default WorkersPage
