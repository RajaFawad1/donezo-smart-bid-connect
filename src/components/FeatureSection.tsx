
import { CheckCircle, MessageSquare, Clock, Award } from 'lucide-react';

const FeatureSection = () => {
  const features = [
    {
      name: 'Competitive Bidding',
      description: 'Service providers compete for your business, giving you the best value for your money.',
      icon: <CheckCircle className="h-6 w-6 text-donezo-blue" />,
    },
    {
      name: 'AI-Powered Recommendations',
      description: 'Our smart algorithm finds the perfect match based on your needs and provider history.',
      icon: <Award className="h-6 w-6 text-donezo-teal" />,
    },
    {
      name: 'Real-Time Chat',
      description: 'Communicate directly with service providers to discuss job details and expectations.',
      icon: <MessageSquare className="h-6 w-6 text-donezo-blue" />,
    },
    {
      name: 'Fast Service',
      description: 'Need something done ASAP? Our "Fix Now" option connects you with available providers immediately.',
      icon: <Clock className="h-6 w-6 text-donezo-teal" />,
    },
  ];

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-donezo-teal font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            A better way to find local services
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Donezo makes finding and hiring local service providers easy, efficient, and transparent.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature, index) => (
              <div key={index} className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-white border-2 border-donezo-lightBlue">
                    {feature.icon}
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default FeatureSection;
