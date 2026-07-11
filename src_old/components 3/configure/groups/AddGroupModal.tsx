import { useState } from 'react';
import { X, Users, Building, Tag, Plus, Check } from 'lucide-react';
import { Group, GroupAddress, GroupContact } from '../../../types/group';
import { Connection, User } from '../../../types';
import { Button } from '../../common/Button';

interface AddGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: Omit<Group, 'id' | 'createdAt'>) => void;
  users: User[];
  connections: Connection[];
}

export function AddGroupModal({ isOpen, onClose, onSave, users, connections }: AddGroupModalProps) {
  const [step, setStep] = useState(0);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupType, setGroupType] = useState<Group['type']>('business');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedConnections, setSelectedConnections] = useState<string[]>([]);
  const [address, setAddress] = useState<GroupAddress>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    isPrimary: true
  });
  const [contact, setContact] = useState<GroupContact>({
    name: '',
    email: '',
    phone: '',
    role: '',
    isPrimary: true
  });
  const [tags, setTags] = useState<Record<string, string>>({});
  const [tagKey, setTagKey] = useState('');
  const [tagValue, setTagValue] = useState('');

  const steps = [
    { title: 'Basic Info', description: 'Name and type' },
    { title: 'Members', description: 'Add users' },
    { title: 'Connections', description: 'Add connections' },
    { title: 'Details', description: 'Address and contact' },
    { title: 'Review', description: 'Confirm details' }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleAddTag = () => {
    if (tagKey && tagValue) {
      setTags(prev => ({
        ...prev,
        [tagKey]: tagValue
      }));
      setTagKey('');
      setTagValue('');
    }
  };

  const handleRemoveTag = (key: string) => {
    const newTags = { ...tags };
    delete newTags[key];
    setTags(newTags);
  };

  const handleSave = () => {
    const newGroup: Omit<Group, 'id' | 'createdAt'> = {
      name: groupName,
      description: groupDescription,
      type: groupType,
      status: 'active',
      addresses: address.street ? [address] : [],
      contacts: contact.name ? [contact] : [],
      connectionIds: selectedConnections,
      userIds: selectedUsers,
      ownerId: selectedUsers[0] || '',
      permissions: {
        read: selectedUsers,
        write: selectedUsers,
        admin: selectedUsers.slice(0, 1)
      },
      tags: Object.keys(tags).length > 0 ? tags : undefined
    };

    onSave(newGroup);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Users className="h-5 w-5 text-brand-blue mr-2" />
            Create New Pool
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex justify-between">
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full mb-2
                  ${step === i 
                    ? 'bg-brand-blue text-white' 
                    : step > i 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {step > i ? <Check className="h-5 w-5" /> : (i + 1)}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">{s.title}</p>
                  <p className="text-xs text-gray-500">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="group-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Pool Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="group-name"
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                  placeholder="Enter pool name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="group-description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="group-description"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                  placeholder="Enter pool description"
                />
              </div>
              
              <div>
                <label htmlFor="group-type" className="block text-sm font-medium text-gray-700 mb-2">
                  Pool Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="group-type"
                  value={groupType}
                  onChange={(e) => setGroupType(e.target.value as Group['type'])}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                  required
                >
                  <option value="business">Business</option>
                  <option value="department">Department</option>
                  <option value="project">Project</option>
                  <option value="team">Team</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Users
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="max-h-60 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-brand-blue focus:ring-brand-blue border-gray-300 rounded"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUsers(users.map(user => user.id));
                                } else {
                                  setSelectedUsers([]);
                                }
                              }}
                              checked={selectedUsers.length === users.length && users.length > 0}
                            />
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-brand-blue focus:ring-brand-blue border-gray-300 rounded"
                                onChange={() => {
                                  if (selectedUsers.includes(user.id)) {
                                    setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                  } else {
                                    setSelectedUsers([...selectedUsers, user.id]);
                                  }
                                }}
                                checked={selectedUsers.includes(user.id)}
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{user.role}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {selectedUsers.length} users selected
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Connections
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="max-h-60 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-brand-blue focus:ring-brand-blue border-gray-300 rounded"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedConnections(connections.map(conn => conn.id.toString()));
                                } else {
                                  setSelectedConnections([]);
                                }
                              }}
                              checked={selectedConnections.length === connections.length && connections.length > 0}
                            />
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {connections.map((connection) => (
                          <tr key={connection.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-brand-blue focus:ring-brand-blue border-gray-300 rounded"
                                onChange={() => {
                                  const connId = connection.id.toString();
                                  if (selectedConnections.includes(connId)) {
                                    setSelectedConnections(selectedConnections.filter(id => id !== connId));
                                  } else {
                                    setSelectedConnections([...selectedConnections, connId]);
                                  }
                                }}
                                checked={selectedConnections.includes(connection.id.toString())}
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{connection.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{connection.type}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                connection.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {connection.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {selectedConnections.length} connections selected
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                  <Building className="h-5 w-5 text-gray-400 mr-2" />
                  Address Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      id="street"
                      type="text"
                      value={address.street}
                      onChange={(e) => setAddress({...address, street: e.target.value})}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                      placeholder="123 Main St"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({...address, city: e.target.value})}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                      placeholder="Anytown"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province
                    </label>
                    <input
                      id="state"
                      type="text"
                      value={address.state}
                      onChange={(e) => setAddress({...address, state: e.target.value})}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                      placeholder="CA"
                    />
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                      Zip/Postal Code
                    </label>
                    <input
                      id="zipCode"
                      type="text"
                      value={address.zipCode}
                      onChange={(e) => setAddress({...address, zipCode: e.target.value})}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                      placeholder="12345"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      id="country"
                      type="text"
                      value={address.country}
                      onChange={(e) => setAddress({...address, country: e.target.value})}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                      placeholder="United States"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-2" />
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Name
                    </label>
                    <input
                      id="contactName"
                      type="text"
                      value={contact.name}
                      onChange={(e) => setContact({...contact, name: e.target.value})}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      id="contactEmail"
                      type="email"
                      value={contact.email}
                      onChange={(e) => setContact({...contact, email: e.target.value})}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      id="contactPhone"
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => setContact({...contact, phone: e.target.value})}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                      placeholder="(123) 456-7890"
                    />
                  </div>
                  <div>
                    <label htmlFor="contactRole" className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <input
                      id="contactRole"
                      type="text"
                      value={contact.role}
                      onChange={(e) => setContact({...contact, role: e.target.value})}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                      placeholder="IT Manager"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                  <Tag className="h-5 w-5 text-gray-400 mr-2" />
                  Tags
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="tagKey" className="block text-sm font-medium text-gray-700 mb-2">
                      Tag Key
                    </label>
                    <input
                      id="tagKey"
                      type="text"
                      value={tagKey}
                      onChange={(e) => setTagKey(e.target.value)}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                      placeholder="e.g., department"
                    />
                  </div>
                  <div>
                    <label htmlFor="tagValue" className="block text-sm font-medium text-gray-700 mb-2">
                      Tag Value
                    </label>
                    <div className="flex">
                      <input
                        id="tagValue"
                        type="text"
                        value={tagValue}
                        onChange={(e) => setTagValue(e.target.value)}
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-l-lg focus:ring-brand-blue focus:border-brand-blue"
                        placeholder="e.g., IT"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        disabled={!tagKey || !tagValue}
                        className="px-4 bg-brand-blue text-white rounded-r-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Tags Display */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {Object.entries(tags).map(([key, value]) => (
                    <div key={key} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                      <span className="text-sm text-gray-800">
                        <span className="font-medium">{key}:</span> {value}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(key)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-base font-medium text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-base font-medium text-gray-900">{groupName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="text-base font-medium text-gray-900 capitalize">{groupType}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-base text-gray-900">{groupDescription || 'No description provided'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-base font-medium text-gray-900 mb-4">Members</h4>
                <p className="text-base text-gray-900">
                  {selectedUsers.length} users selected
                </p>
                {selectedUsers.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedUsers.map((userId) => {
                      const user = users.find(u => u.id === userId);
                      return user ? (
                        <div key={userId} className="bg-brand-lightBlue text-brand-blue px-3 py-1 rounded-full text-sm">
                          {user.name}
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-base font-medium text-gray-900 mb-4">Connections</h4>
                <p className="text-base text-gray-900">
                  {selectedConnections.length} connections selected
                </p>
                {selectedConnections.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedConnections.map((connId) => {
                      const connection = connections.find(c => c.id.toString() === connId);
                      return connection ? (
                        <div key={connId} className="bg-brand-lightBlue text-brand-blue px-3 py-1 rounded-full text-sm">
                          {connection.name}
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {(address.street || contact.name || Object.keys(tags).length > 0) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-base font-medium text-gray-900 mb-4">Additional Details</h4>
                  
                  {address.street && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700">Address</p>
                      <p className="text-sm text-gray-900">
                        {address.street}, {address.city}, {address.state} {address.zipCode}, {address.country}
                      </p>
                    </div>
                  )}
                  
                  {contact.name && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700">Contact</p>
                      <p className="text-sm text-gray-900">
                        {contact.name} ({contact.role}) - {contact.email} - {contact.phone}
                      </p>
                    </div>
                  )}
                  
                  {Object.keys(tags).length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(tags).map(([key, value]) => (
                          <div key={key} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-800">
                            <span className="font-medium">{key}:</span> {value}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
          {step > 0 ? (
            <Button
              variant="outline"
              onClick={handleBack}
            >
              Back
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
          )}
          
          {step < steps.length - 1 ? (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={step === 0 && !groupName}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!groupName}
            >
              Create Pool
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}