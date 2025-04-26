
import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Post a Job',
      description: 'Describe what you need done, add photos if needed, set your budget, and choose a preferred completion date.',
      color: 'donezo-blue',
    },
    {
      number: '02',
      title: 'Get Competing Bids',
      description: 'Qualified service providers in your area will submit competitive bids for your job.',
      color: 'donezo-teal',
    },
    {
      number: '03',
      title: 'Choose Your Provider',
      description: 'Review bids, provider profiles, and ratings. AI recommendations help you find the best match.',
      color: 'donezo-blue',
    },
    {
      number: '04',
      title: 'Get it Done',
      description: 'Your selected provider completes the job. Payment is only released when you're satisfied.',
      color: 'donezo-teal',
    },
  ];

  return (
    <div id="how-it-works" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-donezo-blue font-semibold tracking-wide uppercase">How it Works</h2>
          <p className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight">
            Simple, transparent, effective
          </p>
          <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
            Our platform makes it easy to get the services you need in just a few simple steps.
          </p>
        </div>

        <div className="mt-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className={`bg-${step.color} h-2`}></div>
                <div className="p-6">
                  <p className={`text-${step.color} text-2xl font-bold`}>{step.number}</p>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">{step.title}</h3>
                  <p className="mt-3 text-base text-gray-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
