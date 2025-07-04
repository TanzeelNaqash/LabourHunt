import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from './layout/Header';
import Footer from './layout/Footer';
import ClientRegisterForm from './ClientRegisterForm';
import WorkerRegisterForm from './WorkerRegisterForm';
import useAuthStore from '@/store/authStore';


const RegisterForm = ({ defaultRole }) => {
  const [role, setRole] = useState(defaultRole || '');
  const setCurrentRole = useAuthStore(state => state.setCurrentRole);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setCurrentRole(selectedRole);
  };

  if (!role) {
    return (
      <>
        <Helmet>
          <title>Choose Your Role | LabourHunt</title>
          <meta name="description" content="Select your role to get started with LabourHunt" />
        </Helmet>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-2">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10 md:p-16 flex flex-col gap-6 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">Join as a Client or Worker</h1>
            <p className="text-gray-600 mb-6">Please select your role to continue registration.</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={() => handleRoleSelect('client')}
                className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                I'm a Client
              </button>
              <button
                onClick={() => handleRoleSelect('worker')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                I'm a Worker
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (role === 'client') {
    return <ClientRegisterForm />;
  }

  if (role === 'worker') {
    return <WorkerRegisterForm />;
  }

  return null;
};

export default RegisterForm;