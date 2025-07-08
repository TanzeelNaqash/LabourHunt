import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, CheckCircle } from "lucide-react";

export default function WorkerCard({ worker }) {
  // Generate avatar fallback initials from name
  const getInitials = () => {
    if (worker.firstName && worker.lastName) {
      return `${worker.firstName.charAt(0)}${worker.lastName.charAt(0)}`.toUpperCase();
    }
    if (worker.username) {
      const parts = worker.username.split(' ');
      return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
    }
    return '';
  };

  // Render rating stars
  const renderStars = (rating) => {
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const halfStar = numRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-4 w-4 fill-accent text-accent" />
        ))}
        {halfStar && <Star key="half" className="h-4 w-4 fill-accent text-accent" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
        ))}
      </>
    );
  };

  // Helper to get display category
  const getDisplayCategory = (worker) => worker.category === 'other' && worker.otherCategory ? worker.otherCategory : worker.category;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <div className="relative">
            <Avatar className="h-14 w-14">
              <AvatarImage src={worker.profileImage || worker.photo} alt={worker.username || (worker.firstName + ' ' + worker.lastName)} />
              <AvatarFallback className="bg-primary text-white">{getInitials()}</AvatarFallback>
            </Avatar>
            {(worker.status === 'approved' || worker.isVerified) && (
              <div className="verified-badge">
                <CheckCircle className="h-3 w-3" />
              </div>
            )}
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-lg">{worker.username || (worker.firstName + ' ' + worker.lastName)}</h3>
            <p className="text-neutral-600 text-sm">{getDisplayCategory(worker)}</p>
          </div>
        </div>
        <div className="mb-4">
          <div className="flex items-center mb-1">
            {worker.rating && renderStars(worker.rating)}
            <span className="ml-2 text-sm text-neutral-600">
              {worker.rating !== undefined && worker.rating !== null && worker.rating !== '' ? worker.rating : 0} ({worker.reviewCount !== undefined && worker.reviewCount !== null ? worker.reviewCount : 0} reviews)
            </span>
          </div>
          {worker.location && (
            <div className="flex items-center text-sm text-neutral-600">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{worker.location}</span>
            </div>
          )}
        </div>
        <p className="text-neutral-700 mb-4 text-sm line-clamp-2">
          {worker.bio || `Professional ${getDisplayCategory(worker)} with experience in various projects.`}
        </p>
        {worker.skills && worker.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {worker.skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="secondary" className="bg-[#F3F2EF] text-neutral-700 hover:bg-[#E3E2DF]">
                {skill}
              </Badge>
            ))}
            {worker.skills.length > 3 && (
              <Badge variant="secondary" className="bg-[#F3F2EF] text-neutral-700 hover:bg-[#E3E2DF]">
                +{worker.skills.length - 3} more
              </Badge>
            )}
          </div>
        )}
        <Link href={`/worker/${worker._id}`}>
          <Button className="w-full">View Profile</Button>
        </Link>
      </CardContent>
    </Card>
  );
} 