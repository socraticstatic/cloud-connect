export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastActive: string;
  avatar?: string;
  connectionAccess: Array<{
    connectionId: string;
    name: string;
    permissions: string[];
  }>;
}

interface UserType {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastActive: string;
  connectionAccess: Array<{
    connectionId: string;
    name: string;
    permissions: string[];
  }>;
}