import { createContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "../hooks/UseToast";

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  register: () => {},
  loading: true,
  error: null
});

export function AuthProvider({ children }) {
  const { toast } = useToast();
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.firstName}!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData) => {
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: "Your account has been created. Please verify your email and phone.",
      });
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: (error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: async ({ code }) => {
      await apiRequest("POST", "/api/verify-email", { code });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Email verified",
        description: "Your email has been successfully verified",
      });
    },
    onError: (error) => {
      toast({
        title: "Email verification failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verifyPhoneMutation = useMutation({
    mutationFn: async ({ code }) => {
      await apiRequest("POST", "/api/verify-phone", { code });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Phone verified",
        description: "Your phone number has been successfully verified",
      });
    },
    onError: (error) => {
      toast({
        title: "Phone verification failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const requestEmailVerification = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/request-email-verification", {});
    },
    onSuccess: () => {
      toast({
        title: "Verification email sent",
        description: "Please check your email for the verification code",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to send verification email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const requestPhoneVerification = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/request-phone-verification", {});
    },
    onSuccess: () => {
      toast({
        title: "Verification code sent",
        description: "Please check your phone for the verification code",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to send verification code",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        verifyEmailMutation,
        verifyPhoneMutation,
        requestEmailVerification,
        requestPhoneVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
} 