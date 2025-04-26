
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900">About Donezo</h1>
            <p className="mt-4 text-xl text-gray-600">
              Connecting you with trusted local service providers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
                <p className="text-gray-600">
                  At Donezo, we're on a mission to revolutionize how people find and hire local service providers. 
                  We believe everyone deserves access to reliable, quality services at fair prices.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
                <ul className="space-y-4 text-gray-600">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Verified service providers with real reviews</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Competitive pricing through our bidding system</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>AI-powered matching for optimal service provider selection</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Secure payment system with satisfaction guarantee</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h2>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    {
                      title: 'Trust',
                      description: 'We build trust through transparency and verification.'
                    },
                    {
                      title: 'Quality',
                      description: 'We ensure high standards in every service provided.'
                    },
                    {
                      title: 'Innovation',
                      description: 'We use technology to improve service delivery.'
                    },
                    {
                      title: 'Community',
                      description: 'We support local service providers and economies.'
                    }
                  ].map((value, index) => (
                    <div key={index} className="p-4 bg-white rounded-lg shadow">
                      <h3 className="font-semibold text-gray-900">{value.title}</h3>
                      <p className="text-gray-600 mt-1">{value.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
