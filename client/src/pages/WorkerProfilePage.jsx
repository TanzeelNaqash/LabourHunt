import { useParams } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import React, { useState, useEffect } from 'react';
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Star, 
  CheckCircle,
  Award,
  Briefcase,
  File,
  Image,
  MessageSquare,
  Loader2
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import useAuthStore from '@/store/authStore';
import { Star as StarIcon } from 'lucide-react';
import { toast } from '@/hooks/UseToast';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

// Helper to open WhatsApp directly if available
function openWhatsApp(mobile) {
  const waAppUrl = `whatsapp://send?phone=${mobile}`;
  const waWebUrl = `https://wa.me/${mobile}`;
  // Try to open WhatsApp app
  window.location.href = waAppUrl;
  // Fallback to web after short delay
  setTimeout(() => {
    window.open(waWebUrl, '_blank', 'noopener,noreferrer');
  }, 500);
}

export default function WorkerProfilePage() {
  const params = useParams();
  const id = params.id;

  const { data: worker, isLoading, error } = useQuery({
    queryKey: [`/api/workers/${id}`],
  });

  const { user, addReview, reviewsNeedRefresh, setReviewsNeedRefresh } = useAuthStore();

  const { data: reviews, isLoading: loadingReviews, refetch: refetchReviews } = useQuery({
    queryKey: worker?._id ? [`/api/v1/reviews?targetId=${worker._id}`] : [],
    queryFn: async () => {
      if (!worker?._id) return [];
      const res = await fetch(`/api/v1/reviews?targetId=${worker._id}`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      return res.json();
    },
    enabled: !!worker?._id,
  });

  // Refresh reviews when reviewsNeedRefresh is true
  useEffect(() => {
    if (reviewsNeedRefresh && worker?._id) {
      refetchReviews();
      setReviewsNeedRefresh(false);
    }
  }, [reviewsNeedRefresh, worker?._id, refetchReviews, setReviewsNeedRefresh]);

  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  console.log('user', user);
  console.log('reviews', reviews);
  if (reviews && user) {
    reviews.forEach((r, i) => {
      console.log(
        `review[${i}] reviewerId:`, r.reviewerId,
        'user._id:', user._id,
        'match:', r.reviewerId?.toString() === user._id?.toString()
      );
    });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Worker not found</h1>
          <p className="text-gray-600 mb-6">The worker profile you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const [firstName] = (worker.username || "").split(" ");
  const displayName = worker.username || "";

  const getInitials = (username) => {
    const parts = (username || "").split(" ");
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
  };

  // Find the logged-in user's review (if any)
  const userReview = user && user.role === 'client' && reviews
    ? reviews.find(r => r.reviewerId?.toString() === user._id?.toString())
    : null;
  // Other reviews (exclude user's own)
  const otherReviews = reviews ? reviews.filter(r => !userReview || (r._id !== userReview._id)) : [];

  return (
    <>
      <Helmet>
        <title>{`${displayName} - Skilled ${worker.category || 'Worker'} | LabourHunt`}</title>
        <meta 
          name="description" 
          content={`View ${displayName}'s professional profile. ${worker.bio?.substring(0, 100) || `Skilled ${worker.category || 'professional'} available for hire.`}`} 
        />
        <meta property="og:title" content={`${displayName} - LabourHunt`} />
        <meta property="og:description" content={`Professional ${worker.category || 'worker'} profile on LabourHunt.`} />
      </Helmet>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-12 bg-[#F3F2EF]">
          <div className="container mx-auto px-4">
            {/* Profile Header */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <Avatar className="h-32 w-32 rounded-full bg-accent flex items-center justify-center border-4 border-primary">
                      <AvatarImage src={worker.profileImage || worker.photo} alt={displayName} className="object-cover rounded-full" />
                      <AvatarFallback className="text-4xl bg-accent text-white rounded-full flex items-center justify-center">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                      <div>
                        <h1 className="text-3xl font-bold">{displayName}</h1>
                        {worker.category && <p className="text-primary text-lg">{worker.category}</p>}
                      </div>
                      <div className="flex space-x-2 mt-2 md:mt-0">
                        {worker.mobile && (
                          <Button className="bg-primary text-white hover:bg-primary/90" onClick={() => openWhatsApp(worker.mobile)}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Contact
                          </Button>
                        )}
                        {worker.mobile && (
                          <Button variant="outline" asChild>
                            <a href={`tel:${worker.mobile}`}>
                              <Phone className="mr-2 h-4 w-4" />
                              Call
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 text-sm text-neutral-700 mb-4">
                      {worker.area && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{worker.area}</span>
                        </div>
                      )}
                      {worker.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          <span>{worker.email}</span>
                        </div>
                      )}
                      {worker.joinedDate && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Member since {new Date(worker.joinedDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    {worker.isVerified && (
                      <Badge variant="secondary" className="bg-secondary text-white flex items-center gap-1 w-fit">
                        <CheckCircle className="h-3 w-3" />
                        Verified Professional
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2">
                <Tabs defaultValue="about">
                  <TabsList className="mb-6">
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="services">Services</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="about">
                    <Card>
                      <CardContent className="p-6">
                        <h2 className="text-xl font-semibold mb-4">About {firstName}</h2>
                        <div className="mb-6">
                          <span className="text-neutral-700">
                            {/* Enhanced About dummy description */}
                            {firstName} is a highly skilled and dedicated {worker.category ? worker.category.toLowerCase() : 'professional'} with a proven track record of delivering outstanding results. With a strong commitment to quality and client satisfaction, {firstName} approaches every project with attention to detail, reliability, and a passion for excellence. Whether working independently or as part of a team, {firstName} ensures that every task is completed efficiently and to the highest standards. Clients appreciate {firstName}'s professionalism, clear communication, and ability to adapt to a variety of needs and challenges.
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="services">
                    <Card>
                      <CardContent className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Services Offered</h2>
                        {worker.category ? (
                          <div className="space-y-6">
                            <div className="border-b pb-4 last:border-0 last:pb-0">
                              <h3 className="font-medium mb-2">{worker.category}</h3>
                              <p className="text-neutral-700 mb-2">
                                {/* Dummy description */}
                                Highly skilled and experienced {worker.category?.toLowerCase() || 'professional'} offering top-notch services tailored to your needs. Reliable, efficient, and customer-focused.
                              </p>
                              <div className="flex items-center text-primary font-medium">
                                {/* Dummy pricing */}
                                <span>Starting at $12 - $120 (price may vary based on requirements)</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-neutral-700">No services have been specified.</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="reviews">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-xl font-semibold">Client Reviews</h2>
                        </div>
                        {loadingReviews ? (
                          <div className="flex items-center">
                            <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                            <span>Loading reviews...</span>
                          </div>
                        ) : (
                          <>
                            {/* User's own review at the top, if exists */}
                            {userReview && (
                              <>
                                <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm">
                                  You have already reviewed this worker. You can edit or delete your review below.
                                </div>
                                <div className="border-b pb-6 mb-6">
                                  <div className="flex items-start mb-2">
                                    <Avatar className="h-10 w-10 mr-2">
                                      <AvatarImage src={userReview.reviewerId?.photo || userReview.reviewerPhoto} alt={userReview.reviewerId?.username || userReview.reviewer} />
                                      <AvatarFallback>{(userReview.reviewerId?.username || userReview.reviewer || '').substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{userReview.reviewerId?.username || userReview.reviewer} <span className="text-xs text-gray-400 ml-2">(You)</span></div>
                                      <div className="flex items-center gap-1 text-yellow-500">
                                        {[...Array(5)].map((_, i) => (
                                          <StarIcon key={i} className={`h-4 w-4 ${i < userReview.rating ? 'fill-yellow-400' : 'fill-none'}`} fill={i < userReview.rating ? '#facc15' : 'none'} />
                                        ))}
                                      </div>
                                      <div className="text-xs text-gray-400">
                                        {userReview.edited ? 'Edited • ' : ''}
                                        {userReview.updatedAt ? new Date(userReview.updatedAt).toLocaleDateString() : new Date(userReview.date).toLocaleDateString()}
                                      </div>
                                    </div>
                                    <div className="ml-auto flex gap-2">
                                      <Button size="sm" variant="outline" onClick={() => {
                                        setEditingReviewId(userReview._id);
                                        setEditText(userReview.text);
                                        setEditRating(userReview.rating);
                                      }}>Edit</Button>
                                      <Button size="sm" variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                  {editingReviewId === userReview._id ? (
                                    <form
                                      className="mb-2"
                                      onSubmit={async e => {
                                        e.preventDefault();
                                        setSubmittingReview(true);
                                        try {
                                          await fetch(`/api/v1/reviews/${userReview._id}`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ text: editText, rating: editRating }),
                                            credentials: 'include',
                                          });
                                          setEditingReviewId(null);
                                          await refetchReviews();
                                          toast({ title: 'Review updated successfully' });
                                        } catch (err) {
                                          toast({ title: 'Error', description: 'Error updating review: ' + err.message });
                                        } finally {
                                          setSubmittingReview(false);
                                        }
                                      }}
                                    >
                                      <div className="mb-2">
                                        <label htmlFor="editRating" className="block mb-1 font-medium">Rating</label>
                                        <select
                                          id="editRating"
                                          value={editRating}
                                          onChange={e => setEditRating(Number(e.target.value))}
                                          className="border rounded p-2 w-24"
                                          required
                                        >
                                          {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
                                        </select>
                                      </div>
                                      <textarea
                                        value={editText}
                                        onChange={e => setEditText(e.target.value)}
                                        className="w-full border rounded p-2 mb-2"
                                        rows={3}
                                        required
                                        disabled={submittingReview}
                                      />
                                      <div className="flex gap-2">
                                        <Button type="submit" className="bg-primary text-white" disabled={submittingReview}>
                                          {submittingReview ? 'Saving...' : 'Save'}
                                        </Button>
                                        <Button type="button" variant="outline" onClick={() => setEditingReviewId(null)} disabled={submittingReview}>
                                          Cancel
                                        </Button>
                                      </div>
                                    </form>
                                  ) : (
                                    <p className="text-neutral-700">{userReview.text}</p>
                                  )}
                                </div>
                              </>
                            )}
                            {/* Other reviews */}
                            {otherReviews.length > 0 ? (
                              <div className="space-y-6">
                                {otherReviews.map((review, index) => (
                                  <div key={review._id || index} className="border-b last:border-0 pb-6 last:pb-0">
                                    <div className="flex items-start mb-2">
                                      <Avatar className="h-10 w-10 mr-2">
                                        <AvatarImage src={review.reviewerId?.photo || review.reviewerPhoto} alt={review.reviewerId?.username || review.reviewer} />
                                        <AvatarFallback>{(review.reviewerId?.username || review.reviewer || '').substring(0, 2).toUpperCase()}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div className="font-medium">{review.reviewerId?.username || review.reviewer}</div>
                                        <div className="flex items-center gap-1 text-yellow-500">
                                          {[...Array(5)].map((_, i) => (
                                            <StarIcon key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400' : 'fill-none'}`} fill={i < review.rating ? '#facc15' : 'none'} />
                                          ))}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                          {review.edited ? 'Edited • ' : ''}
                                          {review.updatedAt ? new Date(review.updatedAt).toLocaleDateString() : new Date(review.date).toLocaleDateString()}
                                        </div>
                                      </div>
                                    </div>
                                    <p className="text-neutral-700">{review.text}</p>
                                  </div>
                                ))}
                              </div>
                            ) : !userReview ? (
                              <div className="text-center py-10 border rounded-md">
                                <MessageSquare className="h-12 w-12 mx-auto text-neutral-400" />
                                <p className="mt-4 text-neutral-700">No reviews yet</p>
                              </div>
                            ) : null}
                            {/* Add Review Form (only if user hasn't reviewed yet) */}
                            {user && user.role === 'client' && !userReview && (
                              <div className="mt-8 border-t pt-6">
                                <h3 className="text-lg font-semibold mb-2">Add a Review</h3>
                                <form
                                  onSubmit={async e => {
                                    e.preventDefault();
                                    const form = e.target;
                                    const text = form.reviewMessage.value.trim();
                                    const rating = Number(form.reviewRating.value);
                                    if (!text || !rating) return;
                                    setSubmittingReview(true);
                                    try {
                                      await addReview({
                                        text,
                                        rating,
                                        targetId: worker._id,
                                      });
                                      form.reset();
                                      await refetchReviews();
                                      toast({ title: 'Review submitted successfully' });
                                    } catch (err) {
                                      toast({ title: 'Error', description: 'Error submitting review: ' + err.message });
                                    } finally {
                                      setSubmittingReview(false);
                                    }
                                  }}
                                >
                                  <div className="mb-2">
                                    <label htmlFor="reviewRating" className="block mb-1 font-medium">Rating</label>
                                    <select name="reviewRating" id="reviewRating" className="border rounded p-2 w-24" required defaultValue="5">
                                      <option value="">Select</option>
                                      {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
                                    </select>
                                  </div>
                                  <textarea
                                    name="reviewMessage"
                                    className="w-full border rounded p-2 mb-2"
                                    rows={3}
                                    placeholder="Write your review here..."
                                    required
                                    disabled={submittingReview}
                                  />
                                  <button
                                    type="submit"
                                    className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
                                    disabled={submittingReview}
                                  >
                                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                                  </button>
                                </form>
                              </div>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Right Column - Sidebar */}
              <div>
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
                    
                    <div className="space-y-4">
                      {worker.mobile && (
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 mr-3 text-primary" />
                          <span>{worker.mobile}</span>
                        </div>
                      )}
                      
                      {worker.email && (
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 mr-3 text-primary" />
                          <span>{worker.email}</span>
                        </div>
                      )}
                      
                      {worker.area && (
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 mr-3 text-primary" />
                          <span>{worker.area}</span>
                        </div>
                      )}
                    </div>
                    
                    <Separator className="my-6" />
                    
                    {worker.mobile && (
                      <Button className="w-full mb-3 bg-primary text-white hover:bg-primary/90" onClick={() => openWhatsApp(worker.mobile)}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Contact
                      </Button>
                    )}
                    {worker.mobile && (
                      <Button variant="outline" className="w-full" asChild>
                        <a href={`tel:${worker.mobile}`}>
                          <Phone className="mr-2 h-4 w-4" />
                          Call Now
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Verification Status</h3>
                    
                    <div className="bg-secondary/10 p-4 rounded-md border border-secondary/20 flex items-center mb-4">
                      <CheckCircle className="h-6 w-6 text-secondary mr-3" />
                      <div>
                        <p className="font-medium">Identity Verified</p>
                        <p className="text-sm text-neutral-600">ID has been verified by LabourHunt</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-secondary mr-2" />
                        <span className="text-sm">Phone Number Verified</span>
                      </div>
                     
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-secondary mr-2" />
                        <span className="text-sm">Background Check Passed</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Documents & Licenses</h3>
                    
                    {worker.documents && worker.documents.length > 0 ? (
                      <div className="space-y-3">
                        {worker.documents.map((doc, index) => (
                          <div key={index} className="flex items-center p-2 border rounded hover:bg-gray-50">
                            <File className="h-5 w-5 text-primary mr-2" />
                            <span className="text-sm">{doc.name}</span>
                            <Badge variant="outline" className="ml-auto">Verified</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-neutral-600 text-sm">All necessary documents have been verified by our LabourHunt team.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={async () => {
                  setSubmittingReview(true);
                  try {
                    await fetch(`/api/v1/reviews/${userReview._id}`, {
                      method: 'DELETE',
                      credentials: 'include',
                    });
                    await refetchReviews();
                    toast({ title: 'Review deleted successfully' });
                  } catch (err) {
                    toast({ title: 'Error', description: 'Error deleting review: ' + err.message });
                  } finally {
                    setSubmittingReview(false);
                    setShowDeleteDialog(false);
                  }
                }}
              >
                Yes, Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}