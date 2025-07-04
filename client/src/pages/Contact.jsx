import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock, Copy, Check, Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useAuthStore from '@/store/authStore';
import ChatboxMobile from "@/components/layout/ChatboxMobile";
import { queryClient } from '@/lib/queryClient';
import { Helmet } from 'react-helmet';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [copiedItem, setCopiedItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [currentCoords, setCurrentCoords] = useState({ lat: 0, lng: 0 });
  const [emailValid, setEmailValid] = useState(true);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const submitFeedback = useAuthStore(s => s.submitFeedback);

  // Location coordinates for the map
  const location = {
    lat:  34.1231, 
    lng: 74.7991, 
    address: "Zoonimar, Srinagar, Jammu and Kashmir, India"
  };

  useEffect(() => {
    // Initialize map
    const map = L.map('map').setView([location.lat, location.lng], 15);
    setCurrentCoords({ lat: location.lat, lng: location.lng });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add marker
    const marker = L.marker([location.lat, location.lng]).addTo(map);
    marker.bindPopup(location.address).openPopup();

    // Update coordinates on map move
    map.on('moveend', () => {
      const center = map.getCenter();
      setCurrentCoords({
        lat: center.lat.toFixed(4),
        lng: center.lng.toFixed(4)
      });
    });

    // Cleanup
    return () => {
      map.remove();
    };
  }, []);

  const checkEmailRegistered = async (email) => {
    setCheckingEmail(true);
    try {
      const res = await fetch(`/api/v1/admin/check-email?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setEmailValid(data.registered);
      return data.registered;
    } catch {
      setEmailValid(false);
      return false;
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });
    const isRegistered = await checkEmailRegistered(formData.email);
    if (!isRegistered) {
      setSubmitStatus({ type: 'error', message: 'Only registered users can send feedback.' });
      setIsSubmitting(false);
      return;
    }
    try {
      await submitFeedback(formData);
      setSubmitStatus({
        type: 'success',
        message: 'Thank you for your message! We will get back to you soon.'
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
      queryClient.invalidateQueries(['/api/v1/admin/feedback']);
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error.message || 'Sorry, there was an error sending your message. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCopy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(type);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleEmailBlur = async (e) => {
    setEmailTouched(true);
    await checkEmailRegistered(e.target.value);
  };

  const contactInfo = {
    email: "support@labourhunt.com",
    phone: "+911234567890",
    address: "Tengpora\nZoonimar, Srinagar, Jammu and Kashmir\nIndia",
    hours: "Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: Closed"
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | LabourHunt</title>
        <meta name="description" content="Contact LabourHunt for support, feedback, or business inquiries. We're here to help you connect with the right workers and services in your area." />
      </Helmet>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-center mb-8">Contact Us</h1>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Contact Information */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 group">
                      <Mail className="w-6 h-6 text-primary mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium">Email</h3>
                        <div className="flex items-center space-x-2">
                          <a 
                            href={`mailto:${contactInfo.email}`}
                            className="text-gray-600 hover:text-primary transition-colors"
                          >
                            {contactInfo.email}
                          </a>
                          <div className="relative">
                            <button
                              onClick={() => handleCopy(contactInfo.email, 'email')}
                              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                              title="Copy email"
                            >
                              {copiedItem === 'email' ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                              )}
                            </button>
                            {copiedItem === 'email' && (
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                                Copied!
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4 group">
                      <Phone className="w-6 h-6 text-primary mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium">Phone</h3>
                        <div className="flex items-center space-x-2">
                          <a 
                            href={`tel:${contactInfo.phone}`}
                            className="text-gray-600 hover:text-primary transition-colors"
                          >
                            {contactInfo.phone}
                          </a>
                          <div className="relative">
                            <button
                              onClick={() => handleCopy(contactInfo.phone, 'phone')}
                              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                              title="Copy phone number"
                            >
                              {copiedItem === 'phone' ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                              )}
                            </button>
                            {copiedItem === 'phone' && (
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                                Copied!
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <MapPin className="w-6 h-6 text-primary mt-1" />
                      <div>
                        <h3 className="font-medium">Address</h3>
                        <p className="text-gray-600 whitespace-pre-line">
                          {contactInfo.address}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <Clock className="w-6 h-6 text-primary mt-1" />
                      <div>
                        <h3 className="font-medium">Business Hours</h3>
                        <p className="text-gray-600 whitespace-pre-line">
                          {contactInfo.hours}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
                  
                  {submitStatus.message && (
                    <div className={`mb-4 p-4 rounded-lg ${
                      submitStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {submitStatus.message}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleEmailBlur}
                        required
                        className="w-full"
                        disabled={isSubmitting}
                      />
                      {!emailValid && emailTouched && (
                        <div className="text-red-600 text-xs mt-1">Only registered users can send feedback.</div>
                      )}
                      {checkingEmail && (
                        <div className="text-blue-600 text-xs mt-1 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />Checking email...</div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="w-full min-h-[150px]"
                        disabled={isSubmitting}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </Button>
                  </form>
                </div>
              </div>

              {/* Map */}
              <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-2xl font-semibold mb-2">Our Location</h2>
                  <p className="text-gray-600 mb-4">
                    Current Coordinates: {currentCoords.lat}, {currentCoords.lng}
                  </p>
                  <div className="h-[450px] rounded-lg overflow-hidden mt-4 md:mt-0 relative">
                    <div id="map" className="w-full h-full" style={{ position: "relative", zIndex: 0 }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ChatboxMobile/>
      </div>
      <Footer />
    </>
  );
};

export default Contact; 