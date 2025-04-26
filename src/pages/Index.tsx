
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeatureSection from '@/components/FeatureSection';
import HowItWorks from '@/components/HowItWorks';
import Footer from '@/components/Footer';
import AuthModal from '@/components/auth/AuthModal';

const Index = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <FeatureSection />
        <HowItWorks />
        
        {/* Service Categories Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base text-donezo-teal font-semibold tracking-wide uppercase">Services</h2>
              <p className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight">
                Popular service categories
              </p>
              <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
                Browse our most requested service categories or post a custom job.
              </p>
            </div>
            
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[
                { name: 'Home Cleaning', icon: '🧹', color: 'bg-blue-100' },
                { name: 'Lawn Care', icon: '🌱', color: 'bg-green-100' },
                { name: 'Plumbing', icon: '🔧', color: 'bg-yellow-100' },
                { name: 'Electrical', icon: '⚡', color: 'bg-red-100' },
                { name: 'Painting', icon: '🖌️', color: 'bg-purple-100' },
                { name: 'Moving', icon: '📦', color: 'bg-indigo-100' },
                { name: 'Furniture Assembly', icon: '🪑', color: 'bg-pink-100' },
                { name: 'Handyman', icon: '🔨', color: 'bg-orange-100' },
              ].map((service, index) => (
                <div 
                  key={index} 
                  className="job-card flex flex-col items-center p-6 bg-white rounded-lg border border-gray-200 cursor-pointer"
                >
                  <div className={`${service.color} p-3 rounded-full text-2xl`}>
                    {service.icon}
                  </div>
                  <h3 className="mt-4 font-medium text-gray-900">{service.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base text-donezo-blue font-semibold tracking-wide uppercase">Testimonials</h2>
              <p className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight">
                What our users say
              </p>
            </div>
            
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  name: 'Sarah J.',
                  role: 'Homeowner',
                  image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
                  content: 'I found a fantastic landscaper for my yard renovation project. The bidding process saved me over $400 compared to quotes I received elsewhere!',
                },
                {
                  name: 'Michael T.',
                  role: 'Service Provider',
                  image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
                  content: 'As a plumber, Donezo has helped me grow my business by connecting me with clients in my area. The platform is intuitive and easy to use.',
                },
                {
                  name: 'Lisa R.',
                  role: 'Homeowner',
                  image: 'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
                  content: 'When my AC broke during a heatwave, I used the "Fix Now" option and had a technician at my door within 2 hours. Donezo is a lifesaver!',
                },
              ].map((testimonial, index) => (
                <div key={index} className="job-card bg-white rounded-lg shadow-md p-6">
                  <p className="text-gray-600 italic">"{testimonial.content}"</p>
                  <div className="mt-6 flex items-center">
                    <img 
                      className="h-12 w-12 rounded-full object-cover" 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                    />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="bg-donezo-blue py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Ready to get started?
              </h2>
              <p className="mt-4 text-lg leading-6 text-indigo-100">
                Join thousands of satisfied customers and service providers on Donezo today.
              </p>
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => {
                    setAuthType('signup');
                    setAuthModalOpen(true);
                  }}
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-donezo-blue bg-white hover:bg-gray-50"
                >
                  Sign up for free
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialView={authType} 
      />
    </div>
  );
};

export default Index;
