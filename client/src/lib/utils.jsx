import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Error handling utilities
export const handleServerError = (error, navigate) => {
  console.error('Server Error:', error);
  
  // Check if it's a 500 error
  if (error?.response?.status === 500 || error?.status === 500) {
    navigate('/500');
    return;
  }
  
  // For other errors, you can handle them differently
  // For example, show a toast notification
  return error;
};

export const isServerError = (error) => {
  return error?.response?.status === 500 || error?.status === 500;
};
