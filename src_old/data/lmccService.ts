import { LMCCSite, LMCCConfiguration } from '../types/lmcc';

// Mock LMCC sites data (will be replaced with Supabase queries)
export const mockLMCCSites: LMCCSite[] = [
  {
    id: 'site-sf',
    name: 'San Francisco Metro',
    address: '123 Market Street',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
    country: 'US',
    region: 'US-West',
    latitude: 37.7749,
    longitude: -122.4194,
    availability: 'available'
  },
  {
    id: 'site-ny',
    name: 'New York Metro',
    address: '350 Fifth Avenue',
    city: 'New York',
    state: 'NY',
    zip: '10118',
    country: 'US',
    region: 'US-East',
    latitude: 40.7128,
    longitude: -74.0060,
    availability: 'available'
  },
  {
    id: 'site-chi',
    name: 'Chicago Metro',
    address: '233 S Wacker Drive',
    city: 'Chicago',
    state: 'IL',
    zip: '60606',
    country: 'US',
    region: 'US-Central',
    latitude: 41.8781,
    longitude: -87.6298,
    availability: 'available'
  },
  {
    id: 'site-dal',
    name: 'Dallas Metro',
    address: '2200 Ross Avenue',
    city: 'Dallas',
    state: 'TX',
    zip: '75201',
    country: 'US',
    region: 'US-South',
    latitude: 32.7767,
    longitude: -96.7970,
    availability: 'available'
  },
  {
    id: 'site-la',
    name: 'Los Angeles Metro',
    address: '633 West Fifth Street',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90071',
    country: 'US',
    region: 'US-West',
    latitude: 34.0522,
    longitude: -118.2437,
    availability: 'available'
  },
  {
    id: 'site-sea',
    name: 'Seattle Metro',
    address: '1918 Eighth Avenue',
    city: 'Seattle',
    state: 'WA',
    zip: '98101',
    country: 'US',
    region: 'US-West',
    latitude: 47.6062,
    longitude: -122.3321,
    availability: 'available'
  },
  {
    id: 'site-bos',
    name: 'Boston Metro',
    address: '185 Franklin Street',
    city: 'Boston',
    state: 'MA',
    zip: '02110',
    country: 'US',
    region: 'US-East',
    latitude: 42.3601,
    longitude: -71.0589,
    availability: 'available'
  },
  {
    id: 'site-atl',
    name: 'Atlanta Metro',
    address: '191 Peachtree Street',
    city: 'Atlanta',
    state: 'GA',
    zip: '30303',
    country: 'US',
    region: 'US-South',
    latitude: 33.7490,
    longitude: -84.3880,
    availability: 'available'
  },
  {
    id: 'site-den',
    name: 'Denver Metro',
    address: '1801 California Street',
    city: 'Denver',
    state: 'CO',
    zip: '80202',
    country: 'US',
    region: 'US-Central',
    latitude: 39.7392,
    longitude: -104.9903,
    availability: 'available'
  },
  {
    id: 'site-mia',
    name: 'Miami Metro',
    address: '701 Brickell Avenue',
    city: 'Miami',
    state: 'FL',
    zip: '33131',
    country: 'US',
    region: 'US-South',
    latitude: 25.7617,
    longitude: -80.1918,
    availability: 'available'
  },
  {
    id: 'site-phx',
    name: 'Phoenix Metro',
    address: '100 N Central Avenue',
    city: 'Phoenix',
    state: 'AZ',
    zip: '85004',
    country: 'US',
    region: 'US-West',
    latitude: 33.4484,
    longitude: -112.0740,
    availability: 'available'
  },
  {
    id: 'site-pdx',
    name: 'Portland Metro',
    address: '121 SW Salmon Street',
    city: 'Portland',
    state: 'OR',
    zip: '97204',
    country: 'US',
    region: 'US-West',
    latitude: 45.5152,
    longitude: -122.6784,
    availability: 'available'
  },
  {
    id: 'site-aus',
    name: 'Austin Metro',
    address: '300 W 6th Street',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    country: 'US',
    region: 'US-South',
    latitude: 30.2672,
    longitude: -97.7431,
    availability: 'available'
  },
  {
    id: 'site-clt',
    name: 'Charlotte Metro',
    address: '214 North Tryon Street',
    city: 'Charlotte',
    state: 'NC',
    zip: '28202',
    country: 'US',
    region: 'US-East',
    latitude: 35.2271,
    longitude: -80.8431,
    availability: 'available'
  },
  {
    id: 'site-msp',
    name: 'Minneapolis Metro',
    address: '80 South 8th Street',
    city: 'Minneapolis',
    state: 'MN',
    zip: '55402',
    country: 'US',
    region: 'US-Central',
    latitude: 44.9778,
    longitude: -93.2650,
    availability: 'available'
  }
];

// Mock storage for LMCC configurations (will be replaced with Supabase)
const mockConfigurations: Map<string, LMCCConfiguration> = new Map();

export const lmccService = {
  // Get all available LMCC sites
  async getSites(): Promise<LMCCSite[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockLMCCSites;
  },

  // Get LMCC configuration for a specific VNF
  async getConfiguration(vnfId: string): Promise<LMCCConfiguration | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockConfigurations.get(vnfId) || null;
  },

  // Save LMCC configuration
  async saveConfiguration(config: LMCCConfiguration): Promise<LMCCConfiguration> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const savedConfig: LMCCConfiguration = {
      ...config,
      id: config.id || `lmcc-${Date.now()}`,
      updatedAt: new Date().toISOString(),
      createdAt: config.createdAt || new Date().toISOString()
    };

    mockConfigurations.set(config.vnfId, savedConfig);
    return savedConfig;
  },

  // Delete LMCC configuration
  async deleteConfiguration(vnfId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    mockConfigurations.delete(vnfId);
  }
};
