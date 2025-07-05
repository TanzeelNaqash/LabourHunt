import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatboxMobile from "@/components/layout/ChatboxMobile";
import { Helmet } from 'react-helmet';

const Privacy = () => {
  const sections = [
    {
      title: "1. Information We Collect",
      content: `We collect information that you provide directly to us, including but not limited to:
• Personal information (name, email, phone number)
• Professional information (skills, work history, certifications)
• Payment information
• Communication preferences`
    },
    {
      title: "2. How We Use Your Information",
      content: `We use the information we collect to:
• Provide and maintain our services
• Process transactions
• Send you updates and marketing communications
• Improve our services
• Comply with legal obligations`
    },
    {
      title: "3. Information Sharing",
      content: `We may share your information with:
- Service providers and business partners
- Legal authorities when required
- Other users as part of the service
- Third parties with your consent

We do not sell your personal information to third parties.`
    },
    {
      title: "4. Data Security",
      content: `We implement appropriate security measures to protect your personal information, including:
- Encryption of sensitive data
- Regular security assessments
- Access controls and authentication
- Secure data storage
- Regular backups`
    },
    {
      title: "5. Your Rights",
      content: `You have the right to:
- Access your personal information
- Correct inaccurate data
- Request data deletion
- Opt-out of marketing communications
- Export your data
- Object to data processing`
    },
    {
      title: "6. Cookies and Tracking",
      content: `We use cookies and similar tracking technologies to:
- Improve user experience
- Analyze website usage
- Remember user preferences
- Provide personalized content
- Ensure security`
    },
    {
      title: "7. Children's Privacy",
      content: `Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13. If we learn we have collected such information, we will delete it.`
    },
    {
      title: "8. International Data Transfers",
      content: `Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.`
    },
    {
      title: "9. Changes to Privacy Policy",
      content: `We may update this privacy policy from time to time. We will notify you of any material changes through our website or via email.`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Privacy Policy | LabourHunt</title>
        <meta name="description" content="Learn how LabourHunt collects, uses, and protects your personal information. Our privacy policy covers data security, your rights, cookies, and more." />
        <meta name="keywords" content="privacy policy, data protection, personal information, cookies, data security, GDPR, user rights, labour hunt" />
        <meta property="og:title" content="Privacy Policy | LabourHunt" />
        <meta property="og:description" content="Learn how LabourHunt collects, uses, and protects your personal information. Our privacy policy covers data security, your rights, cookies, and more." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Privacy Policy | LabourHunt" />
        <meta name="twitter:description" content="Learn how LabourHunt collects, uses, and protects your personal information. Our privacy policy covers data security, your rights, cookies, and more." />
      </Helmet>
      <Header />
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8">Privacy Policy</h1>
            
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="prose max-w-none">
                <p className="text-gray-600 mb-8">
                  Last updated: {new Date().toLocaleDateString()}
                </p>

                <p className="text-gray-600 mb-8">
                  At LabourHunt, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                </p>

                {sections.map((section, index) => (
                  <div key={index} className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
                    <div className="text-gray-600 whitespace-pre-line">
                      {section.content}
                    </div>
                  </div>
                ))}

                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                  <p className="text-gray-600">
                    If you have any questions about this Privacy Policy, please contact us at:
                    <br />
                    Email: privacy@labourhunt.com
                    <br />
                    Phone: +1 (555) 123-4567
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ChatboxMobile/>
      <Footer />
    </div>
  );
};

export default Privacy; 