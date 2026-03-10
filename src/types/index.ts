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

// ============================================================
// NEW TYPES — Document Portal, Feed, Invoicing, Checklist, Owner's Manual
// ============================================================

// -- Document Enums --

export type DocumentType =
  | 'proposal_contract'
  | 'core_principles'
  | 'core_systems_field_guide'
  | 'contract_recommendations'
  | 'building_science'
  | 'environmental_testing'
  | 'owners_manual_intro'
  | 'hds_checklist'
  | 'hds_trade_section'
  | 'custom';

export type DocumentVisibility =
  | 'admin_only'
  | 'client'
  | 'professional'
  | 'all_participants';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export type InvoiceLineType = 'hds' | 'inspection' | 'hourly' | 'custom';

// -- Documents --

export interface Document {
  id: string;
  tenantId: string;
  projectId?: string;
  clientId?: string;
  documentType: DocumentType;
  title: string;
  description?: string;
  storagePath?: string;
  fileName?: string;
  fileSizeBytes?: number;
  mimeType?: string;
  contentJson?: Record<string, unknown>;
  visibility: DocumentVisibility;
  sharedAt?: string;
  sharedBy?: string;
  sharedToEmails?: string[];
  signatureRequired: boolean;
  signedAt?: string;
  signedByName?: string;
  signatureData?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  access?: DocumentAccess[];
}

export interface DocumentAccess {
  id: string;
  documentId: string;
  userId?: string;
  professionalId?: string;
  clientId?: string;
  grantedAt: string;
  grantedBy?: string;
}

// -- Feed --

export type FeedEventType = 'document_shared' | 'hds_sent' | 'invoice_sent' | 'manual_post';

export interface FeedPost {
  id: string;
  tenantId: string;
  projectId: string;
  authorId: string;
  content: string;
  visibleTo: string[];
  documentId?: string;
  imagePaths: string[];
  eventType?: FeedEventType;
  eventMetadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  author?: Profile;
  comments?: FeedComment[];
  document?: Document;
}

export interface FeedComment {
  id: string;
  feedPostId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  author?: Profile;
}

// -- Invoices --

export interface Invoice {
  id: string;
  tenantId: string;
  clientId: string;
  projectId?: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  dueDate?: string;
  paidAt?: string;
  stripeInvoiceId?: string;
  stripePaymentIntentId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lineItems?: InvoiceLineItem[];
  client?: Client;
  project?: Project;
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  lineType: InvoiceLineType;
  sortOrder: number;
}

// -- Owner's Manual --

export interface OwnersManualEntry {
  id: string;
  tenantId: string;
  projectId: string;
  category: string;
  materialId?: string;
  professionalId?: string;
  warrantyInfo?: string;
  warrantyExpiry?: string;
  contactInfo?: string;
  notes?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  material?: Material;
  professional?: Professional;
}

// -- Checklists --

export interface ProjectChecklist {
  id: string;
  tenantId: string;
  projectId: string;
  title: string;
  createdAt: string;
  items?: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  checklistId: string;
  mainCategoryId?: string;
  subCategoryId?: string;
  label: string;
  isChecked: boolean;
  checkedBy?: string;
  checkedAt?: string;
  notes?: string;
  sortOrder: number;
  mainCategory?: MainCategory;
  subCategory?: SubCategory;
}

// -- Leads (marketing site) --

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  sourcePage?: string;
  createdAt: string;
}
