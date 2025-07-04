import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/UseToast";
import { Loader2, CheckCircle, X, AlertTriangle, Eye, Verified } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import useAuthStore from '@/store/authStore';
import { Checkbox } from "@/components/ui/checkbox";

export default function VerificationPanel() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const adminFetchVerificationRequests = useAuthStore(s => s.adminFetchVerificationRequests);
  const adminUpdateVerificationRequest = useAuthStore(s => s.adminUpdateVerificationRequest);
  const adminDeleteVerificationRequest = useAuthStore(s => s.adminDeleteVerificationRequest);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleting, setDeleting] = useState(false);

  const { data: requests, isLoading } = useQuery({
    queryKey: ["/api/admin/verification-requests", activeTab],
    queryFn: () => adminFetchVerificationRequests(activeTab),
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status, notes }) => {
      await adminUpdateVerificationRequest(id, { status, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/verification-requests"] });
      toast({
        title: actionType === "approve" ? "Worker verified" : "Request rejected",
        description: actionType === "approve"
          ? "The worker has been verified successfully"
          : "The verification request has been rejected",
        variant: actionType === "approve" ? "default" : "destructive",
      });
      setActionDialogOpen(false);
      setSelectedRequest(null);
      setReviewNotes("");
      setActionType(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const handleAction = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setReviewNotes("");
    setActionDialogOpen(true);
  };

  const confirmAction = () => {
    if (!selectedRequest || !actionType) return;
    updateRequestMutation.mutate({
      id: selectedRequest.id,
      status: actionType === "approve" ? "verified" : "rejected",
      notes: reviewNotes
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case "verified":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Verified</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return null;
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (!requests) return;
    if (selectedIds.length === requests.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(requests.map((r) => r.id));
    }
  };

  const handleDeleteSelected = async () => {
    setDeleting(true);
    try {
      await Promise.all(selectedIds.map(id => adminDeleteVerificationRequest(id)));
      setSelectedIds([]);
      toast({ title: "Deleted", description: "Selected requests deleted.", variant: "default" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setDeleting(false);
  };

  // Clear selection when tab changes
  React.useEffect(() => {
    setSelectedIds([]);
  }, [activeTab]);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Worker Verification</CardTitle>
        <CardDescription>
          Review and verify worker applications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending" className={activeTab === 'pending' ? 'bg-green-700 text-white transition-colors duration-300' : 'transition-colors duration-300'}>
              {requests?.filter(r => r.status === "pending").length > 0 && (
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
              )}
              Pending
              {requests?.filter(r => r.status === "pending").length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1.5 text-xs">
                  {requests.filter(r => r.status === "pending").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="verified" className={activeTab === 'verified' ? 'bg-green-700 text-white transition-colors duration-300' : 'transition-colors duration-300'}>
              Verified
            </TabsTrigger>
            <TabsTrigger value="rejected" className={activeTab === 'rejected' ? 'bg-green-700 text-white transition-colors duration-300' : 'transition-colors duration-300'}>
              Rejected
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !requests || requests.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-3" />
                <h3 className="text-lg font-medium">No pending verification requests</h3>
                <p className="text-neutral-500 mt-1">When workers apply for verification, they'll appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map(request => (
                  <div key={request.id} className="border rounded-md p-4 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={request.user.profilePicture} alt={`${request.user.firstName} ${request.user.lastName}`} />
                      <AvatarFallback>{getInitials(request.user.firstName, request.user.lastName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                        <h3 className="font-medium">{request.user.firstName} {request.user.lastName}</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-sm text-neutral-500">{request.user.category || "Not specified"}</p>
                      <p className="text-sm text-neutral-500">Requested on {new Date(request.requestDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center w-full sm:w-auto" 
                        onClick={() => handleViewRequest(request)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex items-center bg-green-600 hover:bg-green-700 w-full sm:w-auto" 
                        onClick={() => handleAction(request, "approve")}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="flex items-center w-full sm:w-auto" 
                        onClick={() => handleAction(request, "reject")}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="verified">
            {selectedIds.length > 0 && (
              <div className="mb-2 flex items-center gap-2">
                <Button variant="destructive" size="sm" onClick={handleDeleteSelected} disabled={deleting}>
                  {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Delete Selected
                </Button>
                <span className="text-xs text-neutral-500">{selectedIds.length} selected</span>
              </div>
            )}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !requests || requests.length === 0 ? (
              <div className="text-center py-8">
                <Verified className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium">No verified workers yet</h3>
                <p className="text-neutral-500 mt-1">Approved worker verifications will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center mb-2">
                  <Checkbox checked={selectedIds.length === requests.length && requests.length > 0} onCheckedChange={handleSelectAll} />
                  <span className="ml-2 text-sm">Select All</span>
                </div>
                {requests.map(request => (
                  <div key={request.id} className={`border rounded-md p-4 flex flex-col md:flex-row md:items-center gap-4 relative ${selectedIds.includes(request.id) ? 'bg-blue-50 border-blue-300' : ''}`}>
                    <div className="absolute left-2 top-2">
                      <Checkbox checked={selectedIds.includes(request.id)} onCheckedChange={() => handleSelect(request.id)} />
                    </div>
                    <Avatar className="h-12 w-12 ml-8 md:ml-0">
                      <AvatarImage src={request.user.profilePicture} alt={`${request.user.firstName} ${request.user.lastName}`} />
                      <AvatarFallback>{getInitials(request.user.firstName, request.user.lastName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                        <h3 className="font-medium">{request.user.firstName} {request.user.lastName}</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-sm text-neutral-500">{request.user.category || "Not specified"}</p>
                      <p className="text-sm text-neutral-500">
                        Verified on {request.reviewDate ? new Date(request.reviewDate).toLocaleDateString() : "Unknown"}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center" 
                      onClick={() => handleViewRequest(request)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="rejected">
            {selectedIds.length > 0 && (
              <div className="mb-2 flex items-center gap-2">
                <Button variant="destructive" size="sm" onClick={handleDeleteSelected} disabled={deleting}>
                  {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Delete Selected
                </Button>
                <span className="text-xs text-neutral-500">{selectedIds.length} selected</span>
              </div>
            )}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !requests || requests.length === 0 ? (
              <div className="text-center py-8">
                <X className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium">No rejected verification requests</h3>
                <p className="text-neutral-500 mt-1">Rejected worker verifications will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center mb-2">
                  <Checkbox checked={selectedIds.length === requests.length && requests.length > 0} onCheckedChange={handleSelectAll} />
                  <span className="ml-2 text-sm">Select All</span>
                </div>
                {requests.map(request => (
                  <div key={request.id} className={`border rounded-md p-4 flex flex-col md:flex-row md:items-center gap-4 relative ${selectedIds.includes(request.id) ? 'bg-blue-50 border-blue-300' : ''}`}>
                    <div className="absolute left-2 top-2">
                      <Checkbox checked={selectedIds.includes(request.id)} onCheckedChange={() => handleSelect(request.id)} />
                    </div>
                    <Avatar className="h-12 w-12 ml-8 md:ml-0">
                      <AvatarImage src={request.user.profilePicture} alt={`${request.user.firstName} ${request.user.lastName}`} />
                      <AvatarFallback>{getInitials(request.user.firstName, request.user.lastName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                        <h3 className="font-medium">{request.user.firstName} {request.user.lastName}</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-sm text-neutral-500">{request.user.category || "Not specified"}</p>
                      <p className="text-sm text-neutral-500">
                        Rejected on {request.reviewDate ? new Date(request.reviewDate).toLocaleDateString() : "Unknown"}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center" 
                      onClick={() => handleViewRequest(request)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* View Request Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-8">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle>Verification Request Details</DialogTitle>
                <DialogDescription>
                  Review the information provided by the worker
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={selectedRequest.user.profilePicture} 
                      alt={`${selectedRequest.user.firstName} ${selectedRequest.user.lastName}`} 
                    />
                    <AvatarFallback>
                      {getInitials(selectedRequest.user.firstName, selectedRequest.user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl font-medium">{selectedRequest.user.firstName} {selectedRequest.user.lastName}</h3>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <p className="text-neutral-500">{selectedRequest.user.category || "Category not specified"}</p>
                      {getStatusBadge(selectedRequest.status)}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Contact Information</h4>
                    <div className="space-y-2">
                      <p className="text-sm"><span className="font-medium">Email:</span> {selectedRequest.user.email}</p>
                      <p className="text-sm"><span className="font-medium">Phone:</span> {selectedRequest.user.phone}</p>
                      <p className="text-sm"><span className="font-medium">Location:</span> {selectedRequest.user.location || "Not specified"}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Verification Status</h4>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Request Date:</span> {new Date(selectedRequest.requestDate).toLocaleDateString()}
                      </p>
                      {selectedRequest.reviewDate && (
                        <p className="text-sm">
                          <span className="font-medium">Review Date:</span> {new Date(selectedRequest.reviewDate).toLocaleDateString()}
                        </p>
                      )}
                      <p className="text-sm">
                        <span className="font-medium">Email Verified:</span> {selectedRequest.user.isEmailVerified ? "Yes" : "No"}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Phone Verified:</span> {selectedRequest.user.isPhoneVerified ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Professional Information</h4>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-medium">Bio:</span> {selectedRequest.user.bio || "No bio provided"}</p>
                    <p className="text-sm">
                      <span className="font-medium">Skills:</span> {selectedRequest.user.skills && selectedRequest.user.skills.length > 0 
                        ? selectedRequest.user.skills.join(", ") 
                        : "No skills listed"
                      }
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Experience:</span> {selectedRequest.user.experience || "No experience information provided"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Education:</span> {selectedRequest.user.education || "No education information provided"}
                    </p>
                  </div>
                </div>
                
                {selectedRequest.user.idProofUrl && (
                  <div>
                    <h4 className="font-medium mb-2">ID Verification</h4>
                    <div className="border rounded p-4 flex items-center justify-center bg-gray-50">
                      <div className="text-center">
                        <p className="text-sm mb-2">ID document submitted for verification</p>
                        <Button variant="outline" size="sm" onClick={() => window.open(selectedRequest.user.idProofUrl, "_blank")}>View ID Document</Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedRequest.notes && (
                  <div>
                    <h4 className="font-medium mb-2">Admin Notes</h4>
                    <div className="border rounded p-4 bg-gray-50">
                      <p className="text-sm">{selectedRequest.notes}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter className="flex flex-col sm:flex-row gap-2 w-full">
                {selectedRequest.status === "pending" && (
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <Button
                      variant="default"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setViewDialogOpen(false);
                        handleAction(selectedRequest, "approve");
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => {
                        setViewDialogOpen(false);
                        handleAction(selectedRequest, "reject");
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
                <Button variant="outline" onClick={() => setViewDialogOpen(false)} className="w-full sm:w-auto">
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="max-w-full sm:max-w-lg p-4 sm:p-8">
          {selectedRequest && actionType && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {actionType === "approve" ? "Approve Verification" : "Reject Verification"}
                </DialogTitle>
                <DialogDescription>
                  {actionType === "approve"
                    ? "This worker will be marked as verified and will appear in search results."
                    : "This verification request will be rejected. The worker can reapply later."
                  }
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedRequest.user.profilePicture} alt={`${selectedRequest.user.firstName} ${selectedRequest.user.lastName}`} />
                    <AvatarFallback>{getInitials(selectedRequest.user.firstName, selectedRequest.user.lastName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedRequest.user.firstName} {selectedRequest.user.lastName}</p>
                    <p className="text-sm text-neutral-500">{selectedRequest.user.category || "Category not specified"}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium">
                    {actionType === "approve" ? "Approval Notes (optional)" : "Rejection Reason (required)"}
                  </label>
                  <Textarea
                    id="notes"
                    placeholder={actionType === "approve" 
                      ? "Add any notes about this verification approval (optional)" 
                      : "Provide a reason for rejection (required)"
                    }
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                  />
                </div>
              </div>
              
              <DialogFooter className="flex flex-col sm:flex-row gap-2 w-full">
                <Button variant="outline" onClick={() => setActionDialogOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button
                  variant={actionType === "approve" ? "default" : "destructive"}
                  className={actionType === "approve" ? "bg-green-600 hover:bg-green-700 w-full sm:w-auto" : "w-full sm:w-auto"}
                  onClick={confirmAction}
                  disabled={updateRequestMutation.isPending || (actionType === "reject" && !reviewNotes)}
                >
                  {updateRequestMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {actionType === "approve" ? "Approve Worker" : "Reject Request"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
