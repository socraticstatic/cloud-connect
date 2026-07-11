import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { UserType } from '../types';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Omit<UserType, 'id' | 'lastActive'>) => void;
}

const ROLES = [
  'Administrator',
  'Network Engineer',
  'Security Analyst',
  'Support Engineer',
  'Read Only'
];

export function AddUserModal({ isOpen, onClose, onSave }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    status: 'active',
    connectionAccess: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        {/* Modal panel */}
        <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-brand-lightBlue rounded-full sm:mx-0 sm:h-10 sm:w-10">
              <UserPlus className="w-6 h-6 text-brand-blue" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Add New User
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Create a new user account with specified permissions
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                } focus:border-brand-blue focus:ring-brand-blue`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } focus:border-brand-blue focus:ring-brand-blue`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.role ? 'border-red-300' : 'border-gray-300'
                } focus:border-brand-blue focus:ring-brand-blue`}
              >
                <option value="">Select a role</option>
                {ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <div className="mt-2 space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={formData.status === 'active'}
                    onChange={() => setFormData({ ...formData, status: 'active' })}
                    className="text-brand-blue border-gray-300 focus:ring-brand-blue"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={formData.status === 'inactive'}
                    onChange={() => setFormData({ ...formData, status: 'inactive' })}
                    className="text-brand-blue border-gray-300 focus:ring-brand-blue"
                  />
                  <span className="ml-2 text-sm text-gray-700">Inactive</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-brand-blue border border-transparent rounded-md shadow-sm hover:bg-brand-darkBlue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue sm:ml-3 sm:w-auto sm:text-sm"
            >
              Add User
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}