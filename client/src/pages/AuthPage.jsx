import PhoneEmailSignInButton from '@/components/PhoneEmailAuth'
import React from 'react'
import { Helmet } from 'react-helmet'

const AuthPage = () => {
  return (
    <div>
      <Helmet>
        <title>Authentication - LabourHunt</title>
        <meta name="description" content="Sign in or sign up to access LabourHunt - Find skilled workers or get hired for your next project." />
        <meta name="keywords" content="authentication, login, signup, labour hunt, workers, hiring" />
        <meta property="og:title" content="Authentication - LabourHunt" />
        <meta property="og:description" content="Sign in or sign up to access LabourHunt - Find skilled workers or get hired for your next project." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Authentication - LabourHunt" />
        <meta name="twitter:description" content="Sign in or sign up to access LabourHunt - Find skilled workers or get hired for your next project." />
      </Helmet>
      <PhoneEmailSignInButton/>
    </div>
  )
}

export default AuthPage
