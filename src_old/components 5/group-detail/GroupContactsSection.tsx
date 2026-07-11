import { Mail, Phone, User, Building, Edit2 } from 'lucide-react';
import { Group } from '../../types/group';
import { Button } from '../common/Button';
import { formatAddress, getPrimaryContact, getPrimaryAddress } from '../../utils/groups';

interface GroupContactsSectionProps {
  group: Group;
}

export function GroupContactsSection({ group }: GroupContactsSectionProps) {
  const primaryContact = getPrimaryContact(group);
  const primaryAddress = getPrimaryAddress(group);

  if (!primaryContact && !primaryAddress) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Primary Contact */}
      {primaryContact && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Primary Contact</h3>
            <Button
              variant="outline"
              size="sm"
              icon={Edit2}
            >
              Edit
            </Button>
          </div>
          <div className="space-y-4">
            <div className="flex items-start">
              <User className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <div className="text-sm font-medium text-gray-900">{primaryContact.name}</div>
                <div className="text-sm text-gray-500">{primaryContact.role}</div>
              </div>
            </div>
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-3" />
              <a href={`mailto:${primaryContact.email}`} className="text-sm text-brand-blue hover:text-brand-darkBlue">
                {primaryContact.email}
              </a>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-700">{primaryContact.phone}</span>
            </div>
          </div>
        </div>
      )}

      {/* Primary Address */}
      {primaryAddress && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Primary Address</h3>
            <Button
              variant="outline"
              size="sm"
              icon={Edit2}
            >
              Edit
            </Button>
          </div>
          <div className="flex items-start">
            <Building className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
            <div>
              <p className="text-sm text-gray-700">{primaryAddress.street}</p>
              <p className="text-sm text-gray-700">{primaryAddress.city}, {primaryAddress.state} {primaryAddress.zipCode}</p>
              <p className="text-sm text-gray-700">{primaryAddress.country}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}