import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatboxMobile from "@/components/layout/ChatboxMobile";
const Terms = () => {
  const sections = [
    {
      title: "1. Introduction",
      content: `Welcome to LabourHunt. By accessing our website and using our services, you agree to these terms and conditions. Please read them carefully before proceeding.`
    },
    {
      title: "2. Definitions",
      content: `"Service" refers to the LabourHunt platform and all related services.
"User" refers to any individual or entity using our Service.
"Worker" refers to skilled professionals registered on our platform.
"Client" refers to individuals or businesses seeking services through our platform.`
    },
    {
      title: "3. Account Registration",
      content: `To use our Service, you must register for an account. You agree to provide accurate and complete information during registration and to keep your account information updated. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.`
    },
    {
      title: "4. User Responsibilities",
      content: `Users agree to:
- Provide accurate and truthful information
- Maintain the security of their account
- Not engage in fraudulent or illegal activities
- Respect the privacy and rights of other users
- Comply with all applicable laws and regulations`
    },
    {
      title: "5. Service Usage",
      content: `Our Service is provided "as is" and "as available." We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time. We do not guarantee that the Service will be uninterrupted or error-free.`
    },
    {
      title: "6. Payment Terms",
      content: `Payment processing is handled through our secure payment system. All fees are non-refundable unless otherwise specified. We reserve the right to modify our pricing structure with notice to users.`
    },
    {
      title: "7. Intellectual Property",
      content: `All content, features, and functionality of the Service are owned by LabourHunt and are protected by international copyright, trademark, and other intellectual property laws.`
    },
    {
      title: "8. Limitation of Liability",
      content: `LabourHunt shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.`
    },
    {
      title: "9. Dispute Resolution",
      content: `Any disputes arising from these terms shall be resolved through arbitration in accordance with the rules of the American Arbitration Association.`
    },
    {
      title: "10. Changes to Terms",
      content: `We reserve the right to modify these terms at any time. Users will be notified of significant changes. Continued use of the Service after changes constitutes acceptance of the new terms.`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8">Terms and Conditions</h1>
            
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="prose max-w-none">
                <p className="text-gray-600 mb-8">
                  Last updated: {new Date().toLocaleDateString()}
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
                  <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
                  <p className="text-gray-600">
                    If you have any questions about these Terms and Conditions, please contact us at:
                    <br />
                    Email: legal@labourhunt.com
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

export default Terms; 