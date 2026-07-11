import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Book, FileText, ExternalLink, Mail, PlayCircle } from 'lucide-react';

export function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const helpOptions = [
    {
      icon: Book,
      title: 'Documentation',
      description: 'Read our comprehensive guides',
      link: '/support',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: PlayCircle,
      title: 'Video Tutorials',
      description: 'Learn through step-by-step videos',
      link: '/support',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      icon: FileText,
      title: 'Knowledge Base',
      description: 'Browse articles and FAQs',
      link: '/support',
      color: 'bg-green-50 text-green-600'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help from our support team',
      link: 'mailto:support@example.com',
      color: 'bg-amber-50 text-amber-600'
    }
  ];

  const handleOptionClick = (link: string) => {
    setIsOpen(false);
    if (link.startsWith('mailto:')) {
      window.location.href = link;
    } else {
      navigate(link);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
        aria-label="Help"
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-[#009fdb]/5 to-transparent">
              <h3 className="text-lg font-semibold text-gray-900">Help & Resources</h3>
            </div>

            <div className="p-3">
              {helpOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionClick(option.link)}
                  className="w-full flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors group text-left"
                >
                  <div className={`p-2 rounded-lg ${option.color} transition-colors`}>
                    <option.icon className="h-5 w-5" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{option.title}</p>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                  {option.link.startsWith('http') && (
                    <ExternalLink className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => handleOptionClick('/support')}
                className="block w-full text-center text-sm font-medium text-[#009fdb] hover:text-[#007fb0] transition-colors"
              >
                Visit Help Center
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}