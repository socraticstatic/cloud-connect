import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface UserMenuProps {
  name: string;
  role: string;
  account: string;
  avatar?: string;
  onClick: () => void;
}

export function UserMenu({ name, onClick }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate('/login');
  };

  return (
    <div className="relative flex items-center" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center h-9 w-9 text-fw-heading hover:text-fw-body transition-colors duration-200"
        aria-label={`Open user menu ${name}`}
      >
        <User className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-fw-neutral py-1 z-50">
          {user?.email && (
            <div className="px-4 py-2 border-b border-fw-neutral">
              <p className="text-figma-sm font-medium text-fw-heading truncate">{name}</p>
              <p className="text-figma-xs text-fw-bodyLight truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={() => { setOpen(false); onClick(); }}
            className="w-full flex items-center px-4 py-2 text-figma-sm text-fw-body hover:bg-fw-wash transition-colors"
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-4 py-2 text-figma-sm text-[#c70032] hover:bg-fw-wash transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
