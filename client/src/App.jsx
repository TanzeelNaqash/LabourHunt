import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import AboutPage from "./pages/AboutPage";
import HowItWorksPage from "./pages/HowitWorksPage";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import FAQ from "./pages/FAQ";
import HelpCenter from "./pages/HelpCenter";
import WorkersPage from "./pages/WorkersPage";
import WorkerProfilePage from "./pages/WorkerProfilePage";
import ClientDashboardPage from "./pages/ClientDashboardPage";
import WorkerDashboardPage from "./pages/WorkerDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import NotFound from "./pages/NotFound";
import ServerError from "./pages/ServerError";
import useAuthStore from './store/authStore';
import RegisterForm from './components/RegisterForm';
import LoginPage from "./pages/LoginPage";
import PhoneEmailAuth from './components/PhoneEmailAuth';
import ProtectedRoute from './components/ProtectedRoute';

import ForgotPassword from "./pages/ForgotPassword";
import AdminLoginPage from './pages/AdminLoginPage';
import AdminRegisterPage from './pages/AdminRegisterPage';
import AdminForgotPassword from './pages/AdminForgotPassword';
import { useEffect } from "react";

// Protected RegisterForm Route Component
const ProtectedRegisterForm = () => {
  const { verifiedPhone } = useAuthStore();
  if (typeof verifiedPhone !== 'string' || verifiedPhone.length < 8) {
    return <PhoneEmailAuth />;
  }
  return <RegisterForm />;
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/how-it-works" component={HowItWorksPage} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/contact" component={Contact} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/faq" component={FAQ} />
      <Route path="/help-center" component={HelpCenter} />
      <Route path="/workers" component={WorkersPage} />
      <Route path="/worker/:id" children={<ProtectedRoute role="client"><WorkerProfilePage /></ProtectedRoute>} />
      <Route
        path="/client-dashboard"
        children={
          <ProtectedRoute>
            <ClientDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="/worker-dashboard" component={WorkerDashboardPage} />
      <Route
        path="/admin-dashboard"
        component={AdminDashboardPage}
      />
      <Route path="/register" component={ProtectedRegisterForm} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/admin-forgot-password" component={AdminForgotPassword} />
      <Route path="/admin-register" component={AdminRegisterPage} />
      <Route path="/admin-login" component={AdminLoginPage} />
      <Route path="/500" component={ServerError} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  
useEffect(()=>{
  console.log('Gateway URL:', import.meta.env.VITE_GATEWAY_URL);
},[])

  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
