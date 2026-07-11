import { useState } from 'react';
import { UserPlus, AlertCircle } from 'lucide-react';
import { UserType } from '../types';
import { SideDrawer } from '../../common/SideDrawer';
import { Button } from '../../common/Button';
import { FormField } from '../../form/FormField';

interface AddUserDrawerProps {
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

const DEPARTMENTS = [
  'Engineering',
  'Operations',
  'Security',
  'Marketing',
  'Sales',
  'Support',
  'Finance',
  'IT'
];

export function AddUserDrawer({ isOpen, onClose, onSave }: AddUserDrawerProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    status: 'active',
    connectionAccess: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
      // Reset form
      setFormData({
        name: '',
        email: '',
        role: '',
        department: '',
        status: 'active',
        connectionAccess: []
      });
      setErrors({});
    }
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      name: '',
      email: '',
      role: '',
      department: '',
      status: 'active',
      connectionAccess: []
    });
    setErrors({});
    onClose();
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={handleCancel}
      title="Add New User"
      size="md"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" icon={UserPlus} onClick={handleSubmit}>
            Add User
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="bg-fw-blue-light border border-fw-active rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-fw-link mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-fw-heading mb-1">
                Create User Account
              </h3>
              <p className="text-xs text-fw-body">
                New users will receive an email invitation with instructions to set up their account and access the platform.
              </p>
            </div>
          </div>
        </div>

        {/* User Information Section */}
        <div>
          <h3 className="text-sm font-semibold text-fw-heading mb-4">User Information</h3>
          <div className="space-y-4">
            <FormField
              id="name"
              label="Full Name"
              required
              error={errors.name}
            >
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className={`w-full px-3 py-2 border rounded-lg text-sm text-fw-body bg-fw-base focus:ring-2 focus:ring-fw-active focus:border-fw-active ${
                  errors.name ? 'border-fw-error' : 'border-fw-secondary'
                }`}
              />
            </FormField>

            <FormField
              id="email"
              label="Email Address"
              required
              error={errors.email}
            >
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john.doe@company.com"
                className={`w-full px-3 py-2 border rounded-lg text-sm text-fw-body bg-fw-base focus:ring-2 focus:ring-fw-active focus:border-fw-active ${
                  errors.email ? 'border-fw-error' : 'border-fw-secondary'
                }`}
              />
            </FormField>
          </div>
        </div>

        {/* Role & Access Section */}
        <div>
          <h3 className="text-sm font-semibold text-fw-heading mb-4">Role & Access</h3>
          <div className="space-y-4">
            <FormField
              id="role"
              label="Role"
              required
              error={errors.role}
              helpText="Role determines user permissions and access levels"
            >
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg text-sm text-fw-body bg-fw-base focus:ring-2 focus:ring-fw-active focus:border-fw-active ${
                  errors.role ? 'border-fw-error' : 'border-fw-secondary'
                }`}
              >
                <option value="">Select a role</option>
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              id="department"
              label="Department"
              helpText="Optional - Limits access to department resources"
            >
              <select
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-fw-secondary rounded-lg text-sm text-fw-body bg-fw-base focus:ring-2 focus:ring-fw-active focus:border-fw-active"
              >
                <option value="">No department (all resources)</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </div>

        {/* Status Section */}
        <div>
          <h3 className="text-sm font-semibold text-fw-heading mb-4">Account Status</h3>
          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 border border-fw-secondary rounded-lg cursor-pointer hover:bg-fw-wash transition-colors">
              <input
                type="radio"
                checked={formData.status === 'active'}
                onChange={() => setFormData({ ...formData, status: 'active' })}
                className="mt-0.5 text-fw-link border-fw-secondary focus:ring-fw-active"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-fw-heading">Active</div>
                <div className="text-xs text-fw-bodyLight">User can log in immediately after setup</div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border border-fw-secondary rounded-lg cursor-pointer hover:bg-fw-wash transition-colors">
              <input
                type="radio"
                checked={formData.status === 'inactive'}
                onChange={() => setFormData({ ...formData, status: 'inactive' })}
                className="mt-0.5 text-fw-link border-fw-secondary focus:ring-fw-active"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-fw-heading">Inactive</div>
                <div className="text-xs text-fw-bodyLight">User account created but login disabled</div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </SideDrawer>
  );
}
