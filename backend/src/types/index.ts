export type UUID = string;

export enum UserRole {
  ADMIN = 'admin',
  DEALER = 'dealer',
}

export enum AuditActionType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  PASSWORD_RESET = 'password_reset',
  RESET_PASSWORD = 'reset_password',
  CHANGE_PASSWORD = 'change_password',
  CREATE_DEALER = 'create_dealer',
  UPDATE_DEALER = 'update_dealer',
  DELETE_DEALER = 'delete_dealer',
  SEARCH = 'search',
  CREATE_EMPLOYEE = 'create_employee',
  UPDATE_EMPLOYEE = 'update_employee',
  TERMINATE_EMPLOYEE = 'terminate_employee',
  CREATE_CUSTOMER = 'create_customer',
  UPDATE_CUSTOMER = 'update_customer',
  UPDATE_PROFILE = 'update_profile',
}

export interface User {
  id: UUID;
  role: UserRole;
  name: string;
  username: string;
  email: string;
  password_hash?: string; // Only for internal use, never sent to client
  temp_pass?: boolean;
  dealer_id?: UUID;
  created_at?: Date;
  updated_at?: Date;
  last_login?: Date;
}

export interface Dealer {
  id: UUID;
  user_id: UUID;
  company_name: string;
  primary_contact_name: string;
  primary_contact_phone: string;
  primary_contact_email: string;
  address: string;
  status: 'active' | 'suspended';
  created_at?: Date;
  updated_at?: Date;
}

export interface Employee {
  id: UUID;
  dealer_id: UUID;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  aadhar: string;
  position: string;
  hire_date: string;
  status: 'active' | 'terminated';
  termination_date?: string;
  termination_reason?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Customer {
  id: UUID;
  dealer_id: UUID;
  type: 'private' | 'government';
  name_or_entity: string;
  contact_person?: string;
  phone: string;
  email: string;
  official_id: string;
  address: string;
  status: 'active' | 'inactive';
  created_at?: Date;
  updated_at?: Date;
}

export interface AuditLog {
  id: number;
  who_user_id: UUID;
  who_user_name: string;
  dealer_id?: UUID;
  action_type: AuditActionType;
  details: string;
  timestamp: Date;
}

export interface GlobalSearchResult {
  entityType: 'employee' | 'customer';
  entityRefId: UUID;
  canonicalName: string;
  phoneNorm: string;
  identityNorm?: string;
  ownerDealerId: UUID;
  ownerDealerName: string;
  statusSummary: 'active' | 'terminated' | 'inactive';
  hireDate?: string;
  terminationDate?: string;
  terminationReason?: string;
  customerType?: 'private' | 'government';
}

export interface JWTPayload {
  userId: UUID;
  role: UserRole;
  email: string;
  dealerId?: UUID;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
