// ============================================================
// SENERGY360 HDS — TypeScript Types
// ============================================================

// -- Enums --

export type UserRole = 'admin' | 'client' | 'professional';

export type ProjectStatus = 'draft' | 'in_progress' | 'completed';

export type ProjectType =
  | 'new_construction'
  | 'renovation'
  | 'addition'
  | 'remodel'
  | 'commercial'
  | 'residential'
  | 'multi_family'
  | 'custom_home'
  | 'other';

// -- Value Objects --

export interface Address {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Contact {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email?: string;
}

// -- Meta Objects --

export interface PrivateNote {
  id: string;
  tenantId: string;
  note: string;
  createdAt: string;
  materialId?: string;
  professionalId?: string;
  clientId?: string;
  projectId?: string;
  createdBy?: string;
}

export interface MainCategory {
  id: string;
  tenantId: string;
  numeral: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  subCategories?: SubCategory[];
}

export interface SubCategory {
  id: string;
  tenantId: string;
  mainCategoryId: string;
  parentSubCategoryId?: string;
  sortOrder: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  mainCategory?: MainCategory;
  parentSubCategory?: SubCategory;
  childSubCategories?: SubCategory[];
  materials?: Material[];
}

export interface Material {
  id: string;
  tenantId: string;
  name: string;
  manufacturer?: string;
  primaryUse?: string;
  keyBenefits?: string;
  url?: string;
  createdAt: string;
  updatedAt: string;
  subCategories?: SubCategory[];
  privateNotes?: PrivateNote[];
}

// -- Project Objects --

export interface Client {
  id: string;
  tenantId: string;
  primaryFirstName: string;
  primaryLastName: string;
  primaryPhone?: string;
  primaryEmail?: string;
  secondaryFirstName?: string;
  secondaryLastName?: string;
  secondaryPhone?: string;
  secondaryEmail?: string;
  billingAddressLine1?: string;
  billingAddressLine2?: string;
  billingCity?: string;
  billingState?: string;
  billingPostalCode?: string;
  billingCountry?: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  projects?: Project[];
  privateNotes?: PrivateNote[];
}

export interface Professional {
  id: string;
  tenantId: string;
  businessName: string;
  primarySpecialty: string;
  primaryFirstName: string;
  primaryLastName: string;
  primaryPhone?: string;
  primaryEmail?: string;
  secondaryFirstName?: string;
  secondaryLastName?: string;
  secondaryPhone?: string;
  secondaryEmail?: string;
  businessAddressLine1?: string;
  businessAddressLine2?: string;
  businessCity?: string;
  businessState?: string;
  businessPostalCode?: string;
  businessCountry?: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  privateNotes?: PrivateNote[];
}

export interface Project {
  id: string;
  tenantId: string;
  name: string;
  status: ProjectStatus;
  projectType: ProjectType;
  projectTypeOtherDescription?: string;
  clientId: string;
  description?: string;
  buildingPlanSummary?: string;
  siteAddressLine1: string;
  siteAddressLine2?: string;
  siteCity: string;
  siteState: string;
  sitePostalCode: string;
  siteCountry: string;
  createdOn: string;
  startedOn?: string;
  completedOn?: string;
  updatedAt: string;
  client?: Client;
  professionals?: ProjectProfessional[];
  clientDirectedMaterials?: ProjectClientMaterial[];
  privateNotes?: PrivateNote[];
}

export interface ProjectProfessional {
  id: string;
  projectId: string;
  professionalId: string;
  professional?: Professional;
  materials?: ProjectProfessionalMaterial[];
}

export interface ProjectProfessionalMaterial {
  id: string;
  projectProfessionalId: string;
  materialId: string;
  notes?: string;
  material?: Material;
}

export interface ProjectClientMaterial {
  id: string;
  projectId: string;
  materialId: string;
  notes?: string;
  material?: Material;
}

// -- Profile --

export interface Profile {
  id: string;
  tenantId: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

// -- Tenant --

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  primaryColor?: string;
  createdAt: string;
}
