
import React from 'react';
import { Container } from '@/components/ui/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckIcon } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      title: 'Post a Job',
      description: 'Describe what you need help with. Be specific about the task, location, and your budget.'
    },
    {
      title: 'Receive Bids',
      description: 'Service providers in your area will send bids. Compare prices, reviews, and availability.'
    },
    {
      title: 'Choose a Provider',
      description: 'Select the best service provider for your job. Message them to clarify any details.'
    },
    {
      title: 'Pay Securely',
      description: 'Your payment is held securely in escrow until the job is completed to your satisfaction.'
    },
    {
      title: 'Job Completed',
      description: 'After the job is done, release payment and leave a review for the service provider.'
    }
  ];

  const benefits = [
    'Verified service providers',
    'Secure payment system',
    'Quality guarantees',
    'Transparent pricing',
    'No hidden fees',
    'Real-time tracking',
    'In-app messaging',
    'Photo documentation'
  ];

  return (
    <Container className="py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">How It Works</h1>
          <p className="text-xl text-gray-600">
            Donezo connects customers with skilled service providers in just a few simple steps.
          </p>
        </div>

        <div className="space-y-8">
          <h2 className="text-2xl font-semibold">Simple 5-Step Process</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, index) => (
              <Card key={index} className="relative overflow-hidden border-t-4 border-donezo-blue">
                <div className="absolute -right-3 -top-3 bg-donezo-blue/10 rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold text-donezo-blue">
                  {index + 1}
                </div>
                <CardHeader>
                  <CardTitle>{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center pt-8">
          <div>
            <h2 className="text-2xl font-semibold mb-6">Why Choose Donezo</h2>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center">
                  <div className="bg-donezo-teal/20 rounded-full p-1 mr-3">
                    <CheckIcon className="h-5 w-5 text-donezo-teal" />
                  </div>
                  <p>{benefit}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Satisfaction Guaranteed</h2>
            <p className="mb-4">
              At Donezo, we're committed to ensuring quality service. If you're not 100% satisfied, we'll work with you to make it right.
            </p>
            <p className="text-sm text-gray-500">
              Our platform includes a dispute resolution process and a customer satisfaction guarantee for all services booked through Donezo.
            </p>
          </div>
        </div>

        <div className="bg-donezo-blue text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Ready to get started?</h2>
          <p className="mb-6">Post your first job or sign up as a service provider today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/dashboard" className="bg-white text-donezo-blue py-2 px-6 rounded-md font-medium hover:bg-gray-100 transition-colors">
              Post a Job
            </a>
            <a href="/onboarding" className="bg-transparent border border-white text-white py-2 px-6 rounded-md font-medium hover:bg-white/10 transition-colors">
              Become a Provider
            </a>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default HowItWorks;
