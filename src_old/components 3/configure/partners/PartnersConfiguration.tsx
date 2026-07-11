import { useState } from 'react';
import { Search, Filter, Download, Plus, MoreVertical, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '../../common/Button';
import { BaseTable } from '../../common/BaseTable';
import { OverflowMenu } from '../../common/OverflowMenu';

interface Partner {
  id: string;
  companyName: string;
  region: string;
  countryName: string;
  meetMeLink: string;
}

export function PartnersConfiguration() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  // Sample data
  const [partners] = useState<Partner[]>([
    {
      id: 'PTN-001',
      companyName: 'Global Network Solutions',
      region: 'North America',
      countryName: 'United States',
      meetMeLink: 'https://meet.att.com/gns'
    },
    {
      id: 'PTN-002',
      companyName: 'European Data Systems',
      region: 'Europe',
      countryName: 'Germany',
      meetMeLink: 'https://meet.att.com/eds'
    },
    {
      id: 'PTN-003',
      companyName: 'Asia Pacific Networks',
      region: 'Asia Pacific',
      countryName: 'Singapore',
      meetMeLink: 'https://meet.att.com/apn'
    }
  ]);

  const columns = [
    {
      id: 'companyName',
      label: 'Company Name',
      sortable: true,
      render: (partner: Partner) => (
        <div className="text-sm font-medium text-gray-900">{partner.companyName}</div>
      )
    },
    {
      id: 'region',
      label: 'Region',
      sortable: true,
      render: (partner: Partner) => (
        <div className="text-sm text-gray-500">{partner.region}</div>
      )
    },
    {
      id: 'id',
      label: 'ID',
      sortable: true,
      render: (partner: Partner) => (
        <div className="text-sm text-gray-500">{partner.id}</div>
      )
    },
    {
      id: 'countryName',
      label: 'Country Name',
      sortable: true,
      render: (partner: Partner) => (
        <div className="text-sm text-gray-500">{partner.countryName}</div>
      )
    },
    {
      id: 'meetMeLink',
      label: 'MeetMe Link',
      render: (partner: Partner) => (
        <a
          href={partner.meetMeLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-brand-blue hover:text-brand-darkBlue flex items-center"
        >
          View Link
          <ExternalLink className="h-4 w-4 ml-1" />
        </a>
      )
    }
  ];

  const handleAddPartner = () => {
    window.addToast({
      type: 'info',
      title: 'Add Partner',
      message: 'Partner creation coming soon',
      duration: 3000
    });
  };

  const handleEditPartner = (partner: Partner) => {
    window.addToast({
      type: 'info',
      title: 'Edit Partner',
      message: 'Partner editing coming soon',
      duration: 3000
    });
  };

  const handleDeletePartner = (partner: Partner) => {
    window.addToast({
      type: 'info',
      title: 'Delete Partner',
      message: 'Partner deletion coming soon',
      duration: 3000
    });
  };

  const handleExport = () => {
    window.addToast({
      type: 'success',
      title: 'Export Complete',
      message: 'Partners list has been exported successfully',
      duration: 3000
    });
  };

  return (
    <div className="p-6">
      {/* Search and Controls */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search partners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
            />
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="primary"
              icon={Plus}
              onClick={handleAddPartner}
            >
              Add Partner
            </Button>
            <Button
              variant="outline"
              icon={Filter}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
            <Button
              variant="outline"
              icon={Download}
              onClick={handleExport}
            >
              Export
            </Button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-6">
              {/* Regions */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Regions</h4>
                <div className="space-y-2">
                  {['North America', 'Europe', 'Asia Pacific', 'South America'].map((region) => (
                    <label key={region} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedRegions.includes(region)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRegions([...selectedRegions, region]);
                          } else {
                            setSelectedRegions(selectedRegions.filter(r => r !== region));
                          }
                        }}
                        className="h-4 w-4 text-brand-blue rounded border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">{region}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Countries */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Countries</h4>
                <div className="space-y-2">
                  {['United States', 'Germany', 'Singapore', 'Brazil'].map((country) => (
                    <label key={country} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCountries.includes(country)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCountries([...selectedCountries, country]);
                          } else {
                            setSelectedCountries(selectedCountries.filter(c => c !== country));
                          }
                        }}
                        className="h-4 w-4 text-brand-blue rounded border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">{country}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Partners Table */}
      <div className="card">
        <BaseTable
          columns={columns}
          data={partners}
          keyField="id"
          tableId="partners"
          showColumnManager={true}
          actions={(partner) => (
            <OverflowMenu
              items={[
                {
                  id: 'edit',
                  label: 'Edit Partner',
                  icon: <Edit2 className="h-4 w-4" />,
                  onClick: () => handleEditPartner(partner)
                },
                {
                  id: 'delete',
                  label: 'Delete Partner',
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => handleDeletePartner(partner),
                  variant: 'danger'
                }
              ]}
            />
          )}
          emptyState={
            <div className="text-center py-12">
              <p className="text-gray-500">No partners found</p>
            </div>
          }
        />
      </div>
    </div>
  );
}