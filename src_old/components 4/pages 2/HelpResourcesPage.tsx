import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Book, FileText, Mail, PlayCircle, Zap, ArrowRight, BookOpen, Compass } from 'lucide-react';
import { Button } from '../common/Button';
import { useTour } from '../../hooks/useTour';

export function HelpResourcesPage() {
  const [showBanner, setShowBanner] = useState(true);
  const navigate = useNavigate();
  const tour = useTour('main-app');

  const helpOptions = [
    {
      icon: BookOpen,
      title: 'Network Glossary',
      description: 'Learn networking terms and concepts',
      link: '/glossary',
      color: 'bg-blue-50 text-blue-600',
      action: () => navigate('/glossary')
    },
    {
      icon: Compass,
      title: 'Interactive Tour',
      description: 'Take a guided tour of the platform',
      link: '#',
      color: 'bg-purple-50 text-purple-600',
      action: () => {
        tour.resetTour();
        tour.startTour();
      }
    },
    {
      icon: Book,
      title: 'Documentation',
      description: 'Read our comprehensive guides',
      link: '/support',
      color: 'bg-green-50 text-green-600'
    },
    {
      icon: PlayCircle,
      title: 'Video Tutorials',
      description: 'Learn through step-by-step videos',
      link: '/support',
      color: 'bg-teal-50 text-teal-600'
    },
    {
      icon: FileText,
      title: 'Knowledge Base',
      description: 'Browse articles and FAQs',
      link: '/support',
      color: 'bg-orange-50 text-orange-600'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help from our support team',
      link: 'mailto:support@example.com',
      color: 'bg-red-50 text-red-600'
    }
  ];

  const handleOptionClick = (option: typeof helpOptions[0]) => {
    setShowBanner(false);
    if (option.action) {
      option.action();
    } else if (option.link.startsWith('mailto:')) {
      window.location.href = option.link;
    } else if (option.link !== '#') {
      navigate(option.link);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {showBanner && (
        <div className="relative overflow-hidden rounded-xl border border-[#003184] bg-[#e6f6fd] mb-8">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex items-center px-3 py-1 rounded-full bg-[#003184] text-white text-sm font-medium">
                    <Zap className="h-4 w-4 mr-1" />
                    New Feature
                  </div>
                  <span className="text-sm text-[#003184]">Limited Time Preview</span>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Meet Niva, Your NetBond Advanced AI Assistant
                </h3>
                
                <p className="text-gray-600 mb-4 max-w-2xl">
                  Experience the future of network support with our AI-powered assistant. Get instant help with configuration, troubleshooting, and best practices.
                </p>

                <Button
                  variant="primary"
                  className="group bg-[#003184] hover:bg-[#002255]"
                  onClick={() => {
                    window.addToast({
                      type: 'info',
                      title: 'Coming Soon',
                      message: 'Niva will be available next month. Stay tuned!',
                      duration: 5000
                    });
                  }}
                >
                  Start Conversation
                  <ArrowRight className="h-4 w-4 ml-2 transform transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              </div>

              {/* Feature List */}
              <div className="hidden lg:block ml-8 pl-8 border-l border-gray-300">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Key Features</h4>
                <ul className="space-y-2">
                  {[
                    'Natural language interactions',
                    'Real-time troubleshooting',
                    'Configuration assistance',
                    'Best practices guidance',
                    'Documentation search'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#003184] mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
            <div
              className="h-full bg-[#003184] transition-all duration-[20000ms] ease-linear"
              style={{ width: '0%' }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {helpOptions.map((option) => {
          const Icon = option.icon;
          return (
            <div key={option.title} className="card hover:shadow-md transition-all duration-200">
              <div className="card-body">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="ml-3 text-lg font-medium text-gray-900">{option.title}</h2>
                </div>
                <p className="text-sm text-gray-500 mb-4">{option.description}</p>
                <ul className="space-y-3">
                  {option.title === 'Network Glossary' && (
                    <>
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-2" />
                        Connection & Cloud Routers
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-2" />
                        Links (VLANs) & VNFs
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-2" />
                        IPE & Infrastructure
                      </li>
                    </>
                  )}

                  {option.title === 'Interactive Tour' && (
                    <>
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-2" />
                        Platform Overview
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-2" />
                        Core Concepts Explained
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-2" />
                        Navigation & Features
                      </li>
                    </>
                  )}

                  {option.title === 'Documentation' && (
                    <>
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-2" />
                        Getting Started Guide
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-2" />
                        API Documentation
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-2" />
                        Best Practices Guide
                      </li>
                    </>
                  )}

                  {option.title === 'Video Tutorials' && (
                    <>
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-2" />
                        Quickstart Videos
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-2" />
                        Advanced Configuration
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-2" />
                        Troubleshooting Series
                      </li>
                    </>
                  )}

                  {option.title === 'Knowledge Base' && (
                    <>
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2" />
                        Common Issues
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2" />
                        FAQ Library
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2" />
                        Use Case Examples
                      </li>
                    </>
                  )}

                  {option.title === 'Email Support' && (
                    <>
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-2" />
                        24/7 Technical Support
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-2" />
                        Billing Assistance
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-2" />
                        Account Management
                      </li>
                    </>
                  )}
                </ul>
              </div>
              <div className="card-footer bg-gray-50">
                <Button
                  variant="secondary"
                  className="w-full justify-center"
                  onClick={() => handleOptionClick(option)}
                >
                  {option.title === 'Interactive Tour' ? 'Start Tour' : option.title === 'Network Glossary' ? 'Open Glossary' : 'Learn More'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}