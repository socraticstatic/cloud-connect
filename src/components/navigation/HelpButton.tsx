import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, FileText, ExternalLink, Mail, PlayCircle } from 'lucide-react';
import { AttIcon } from '../icons/AttIcon';

export function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const helpOptions = [
    {
      icon: Book,
      title: 'Documentation',
      description: 'Read our comprehensive guides',
      link: '/support',
      color: 'bg-fw-accent text-fw-link'
    },
    {
      icon: PlayCircle,
      title: 'Video Tutorials',
      description: 'Learn through step-by-step videos',
      link: '/support',
      color: 'bg-fw-purpleLight text-fw-purple'
    },
    {
      icon: FileText,
      title: 'Knowledge Base',
      description: 'Browse articles and FAQs',
      link: '/support',
      color: 'bg-fw-successLight text-fw-success'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help from our support team',
      link: 'mailto:support@example.com',
      color: 'bg-fw-warnLight text-fw-warn'
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
        className="flex items-center justify-center h-9 w-9 text-fw-heading hover:text-fw-body transition-colors duration-200"
        aria-label="Help"
      >
        <AttIcon name="question-circle" className="h-5 w-5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-80 bg-fw-base rounded-lg shadow-xl border border-fw-secondary z-50 overflow-hidden">
            <div className="p-4 border-b border-fw-secondary bg-gradient-to-r from-[#009fdb]/5 to-transparent">
              <h3 className="text-lg font-semibold text-fw-heading tracking-[-0.03em]">Help & Resources</h3>
            </div>

            <div className="p-3">
              {helpOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionClick(option.link)}
                  className="w-full flex items-start p-3 rounded-lg hover:bg-fw-wash transition-colors group text-left"
                >
                  <div className={`p-2 rounded-lg ${option.color} transition-colors`}>
                    <option.icon className="h-5 w-5" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-figma-base font-medium text-fw-heading">{option.title}</p>
                    <p className="text-figma-base text-fw-bodyLight">{option.description}</p>
                  </div>
                  {option.link.startsWith('http') && (
                    <ExternalLink className="h-4 w-4 text-fw-bodyLight opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-3 bg-fw-wash border-t border-fw-secondary">
              <button
                onClick={() => handleOptionClick('/support')}
                className="block w-full text-center text-figma-base font-medium text-brand-accent hover:text-fw-linkHover transition-colors"
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
