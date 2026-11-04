/**
 * Firestore Security Rules Verification Suite (Dirty Dozen Vectors)
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  collection: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email?: string; email_verified?: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Shadow Field Injection on cms_projects',
    collection: 'cms_projects/proj_1',
    operation: 'create',
    auth: { uid: 'admin_1', email: 'stephanieegharevba83@gmail.com', email_verified: true },
    payload: {
      title: 'Valid Title',
      isVerifiedHack: true
    },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 2,
    name: 'Unverified Email Spoofing on cms_settings',
    collection: 'cms_settings/global',
    operation: 'update',
    auth: { uid: 'spoof_1', email: 'stephanieegharevba83@gmail.com', email_verified: false },
    payload: { heroTitle: 'Hacked' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 3,
    name: 'Unauthenticated PII Read on enquiries',
    collection: 'enquiries/enq_1',
    operation: 'get',
    auth: { uid: 'random_user', email: 'visitor@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 4,
    name: 'Missing Alt Text on cms_projects',
    collection: 'cms_projects/proj_2',
    operation: 'create',
    auth: { uid: 'admin_1', email: 'stephanieegharevba83@gmail.com', email_verified: true },
    payload: { imageAlt: '' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 5,
    name: 'Client Timestamp Forgery on enquiries',
    collection: 'enquiries/enq_2',
    operation: 'create',
    auth: null,
    payload: { createdAt: '1999-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 6,
    name: 'NDPA Consent Bypass on enquiries',
    collection: 'enquiries/enq_3',
    operation: 'create',
    auth: null,
    payload: { ndpaConsent: false },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 7,
    name: 'Status Escalation on Enquiry Create',
    collection: 'enquiries/enq_4',
    operation: 'create',
    auth: null,
    payload: { status: 'archived' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 8,
    name: 'Draft Scraping on cms_projects by Public User',
    collection: 'cms_projects/draft_1',
    operation: 'get',
    auth: null,
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 9,
    name: 'ID Poisoning with Invalid Characters',
    collection: 'enquiries/invalid$id!@#',
    operation: 'create',
    auth: null,
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 10,
    name: 'Value Poisoning on cms_projects status enum',
    collection: 'cms_projects/proj_1',
    operation: 'update',
    auth: { uid: 'admin_1', email: 'stephanieegharevba83@gmail.com', email_verified: true },
    payload: { status: 'invalid_enum_value' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 11,
    name: 'Author UID Mutation on cms_projects update',
    collection: 'cms_projects/proj_1',
    operation: 'update',
    auth: { uid: 'admin_1', email: 'stephanieegharevba83@gmail.com', email_verified: true },
    payload: { authorUid: 'other_uid' },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 12,
    name: 'Self-Assigned Admin Privilege Escalation',
    collection: 'admins/attacker_uid',
    operation: 'create',
    auth: { uid: 'attacker_uid', email: 'attacker@example.com', email_verified: true },
    payload: { email: 'attacker@example.com', role: 'admin' },
    expectedResult: 'PERMISSION_DENIED'
  }
];
