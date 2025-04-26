
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Services = () => {
  const services = [
    {
      title: 'Home Cleaning',
      description: 'Professional house cleaning services for your home.',
      icon: '🧹',
      color: 'bg-blue-100'
    },
    {
      title: 'Lawn Care',
      description: 'Expert lawn maintenance and landscaping services.',
      icon: '🌱',
      color: 'bg-green-100'
    },
    {
      title: 'Plumbing',
      description: 'Licensed plumbers for repairs and installations.',
      icon: '🔧',
      color: 'bg-yellow-100'
    },
    {
      title: 'Electrical',
      description: 'Certified electricians for all your electrical needs.',
      icon: '⚡',
      color: 'bg-red-100'
    },
    {
      title: 'Painting',
      description: 'Interior and exterior painting services.',
      icon: '🖌️',
      color: 'bg-purple-100'
    },
    {
      title: 'Moving',
      description: 'Professional moving and packing services.',
      icon: '📦',
      color: 'bg-indigo-100'
    },
    {
      title: 'Furniture Assembly',
      description: 'Expert furniture assembly and installation.',
      icon: '🪑',
      color: 'bg-pink-100'
    },
    {
      title: 'Handyman',
      description: 'General repairs and maintenance services.',
      icon: '🔨',
      color: 'bg-orange-100'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900">Our Services</h1>
            <p className="mt-4 text-xl text-gray-600">
              Browse our wide range of professional services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div 
                key={index}
                className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className={`${service.color} w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4`}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Services;
