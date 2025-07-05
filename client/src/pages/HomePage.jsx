import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import HowItWorks from "@/components/home/HowitWorks";
import WorkerProfiles from "@/components/home/WorkerProfiles";
import Testimonials from "@/components/home/Testimonials";
import CallToAction from "@/components/home/CalltoAction";
import AboutSection from "@/components/home/AboutSection";
import { Helmet } from "react-helmet";
import ChatboxMobile from "@/components/layout/ChatboxMobile";
import PrivacyBanner from '@/components/PrivacyBanner';

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>LabourHunt - Connect with Skilled Workers</title>
        <meta name="description" content="Find verified skilled workers for your projects or offer your services on our trusted platform. Connect with carpenters, plumbers, electricians, and more." />
        <meta property="og:title" content="LabourHunt - Connect with Skilled Workers" />
        <meta property="og:description" content="Find verified skilled workers for your projects or offer your services on our trusted platform." />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <HeroSection />
          <FeaturedCategories />
          <HowItWorks />
          <WorkerProfiles />
          <Testimonials />
          <AboutSection />
          <CallToAction />
        </main>
        <ChatboxMobile/>
        <PrivacyBanner />
        <Footer />
      </div>
    </>
  );
}
