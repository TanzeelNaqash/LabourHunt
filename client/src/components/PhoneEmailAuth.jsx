import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import useAuthStore from '@/store/authStore';

const PhoneEmailSignInButton = ({ redirectTo = '/register', title = 'Phone Verification Required', description = 'Please verify your phone number to continue with registration' }) => {
  const [, setLocation] = useLocation();
  const { 
    verifiedPhone, 
    setVerifiedPhone, 
    isLoading, 
    setLoading, 
    error, 
    setError 
  } = useAuthStore();

  useEffect(() => {
    // If already verified, redirect to the provided path
    if (verifiedPhone) {
      setLocation(redirectTo);
      return;
    }

    // Load the external script
    const script = document.createElement('script');
    script.src = 'https://www.phone.email/sign_in_button_v1.js';
    script.async = true;
    script.onerror = () => {
      setError("Failed to load phone verification script. Please refresh the page.");
    };
    document.body.appendChild(script);

    // Define the global callback function
    window.phoneEmailListener = function (userObj) {
      setLoading(true);
      setError(null);
      
      console.log("Phone.email response:", userObj); // Debug log

      if (!userObj) {
        setError("Invalid response from phone verification. Please try again.");
        setLoading(false);
        return;
      }

      // Extract phone number from the specific format
      const countryCode = userObj.user_country_code || '';
      const phoneNumber = userObj.user_phone_number || '';
      
      if (countryCode && phoneNumber) {
        // Combine country code and phone number
        const fullPhoneNumber = `${countryCode}${phoneNumber}`;
        console.log("Extracted phone number:", fullPhoneNumber); // Debug log
        
        setVerifiedPhone(fullPhoneNumber);
        setError(null);
        setLoading(false);
        // Navigate to provided path after successful verification
        setLocation(redirectTo);
        return;
      }

      // If phone number is not directly available, try to fetch from user_json_url
      if (userObj.user_json_url) {
        fetch(userObj.user_json_url)
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            console.log("User data:", data); // Debug log
            
            // Try to extract phone number from the fetched data
            const countryCode = data.user_country_code || '';
            const phoneNumber = data.user_phone_number || '';
            
            if (countryCode && phoneNumber) {
              const fullPhoneNumber = `${countryCode}${phoneNumber}`;
              setVerifiedPhone(fullPhoneNumber);
              setError(null);
              // Navigate to provided path after successful verification
              setLocation(redirectTo);
            } else {
              setError("Phone number not found in verification response. Please try again.");
            }
          })
          .catch((err) => {
            console.error("Verification error:", err); // Debug log
            setError("Error verifying phone number. Please try again.");
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setError("Invalid verification response. Please try again.");
        setLoading(false);
      }
    };

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
      delete window.phoneEmailListener;
    };
  }, [setVerifiedPhone, setLoading, setError, verifiedPhone, setLocation, redirectTo]);

  if (!verifiedPhone) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-gray-50 p-2">
        <Card className="w-full max-w-md max-w-full md:max-w-md p-4 md:p-8 ">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
            <CardDescription className="text-center">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="pe_signin_button flex items-center justify-center w-full"
              data-client-id="17791915230609958463"
              data-redirect-url={window.location.href}
              data-theme="light"
              data-size="large"
              data-shape="rectangular"
              data-text="Verify Phone Number"
              data-phone-format="international"
              data-phone-required="true"
              data-default-country-code="IN"
            ></div>
            {isLoading && (
              <p className="text-center mt-4">Verifying your phone number...</p>
            )}
            {error && (
              <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
            )}
            <div className="mt-4 text-sm text-gray-500 text-center">
              <p>Having trouble? Try these steps:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Make sure you're using a valid phone number</li>
                <li>Check your internet connection</li>
                <li>Refresh the page and try again</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default PhoneEmailSignInButton;