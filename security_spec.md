# Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Global Default-Deny**: All paths not explicitly matched in `firestore.rules` deny all reads and writes (`allow read, write: if false;`).
2. **Verified Admin & Editor Gate**: Only authenticated users with `request.auth.token.email_verified == true` and either the bootstrapped admin email (`stephanieegharevba83@gmail.com`) or a document in `/admins/$(request.auth.uid)` may create, update, or delete CMS collections (`cms_settings`, `cms_projects`, `cms_articles`).
3. **Mandatory Alt Text Invariant**: Every `cms_projects` and `cms_articles` document write must contain a non-empty `imageAlt` string (`size() >= 3 && size() <= 300`).
4. **Public Read Filtering on CMS Content**: Public visitors may only read `cms_projects` and `cms_articles` where `resource.data.status == 'published'` (or if the requester is an authenticated admin/editor).
5. **PII Isolation on Enquiries & Newsletter**: `enquiries` and `newsletter_subscribers` contain PII (`email`, `name`, `message`). Public visitors can `create` enquiries/subscriptions with strict field & size validation and `ndpaConsent == true`, but **ONLY** verified admins (`isAdmin()`) can `get`, `list`, `update`, or `delete` from `/enquiries` or `/newsletter_subscribers`.
6. **Temporal Integrity**: All `createdAt` and `updatedAt` fields must equal `request.time`, and `createdAt` / `authorUid` are immutable on `update`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Shadow Field Injection (`cms_projects`)**: Adding `{ isFeaturedHack: true }` alongside valid fields -> Rejected by `hasOnly()`.
2. **Email Spoofing (`cms_settings`)**: User with `email == 'stephanieegharevba83@gmail.com'` but `email_verified == false` attempting update -> Rejected by `email_verified == true` gate.
3. **Unauthenticated PII Read (`enquiries`)**: Anonymous or non-admin user attempting `get` or `list` on `/enquiries/{id}` -> Rejected by `isAdmin()`.
4. **Missing Alt Text (`cms_projects`)**: Admin attempting to create a project with `imageAlt: ""` -> Rejected by `data.imageAlt.size() >= 3`.
5. **Client Timestamp Forgery (`enquiries`)**: Submitting an enquiry with a backdated `createdAt` timestamp -> Rejected by `incoming().createdAt == request.time`.
6. **NDPA Consent Bypass (`enquiries`)**: Submitting an enquiry with `ndpaConsent: false` -> Rejected by `data.ndpaConsent == true`.
7. **Status Escalation on Enquiry Create (`enquiries`)**: Public user attempting to create an enquiry with `status: 'archived'` -> Rejected by `incoming().status == 'new'`.
8. **Draft Scraping (`cms_projects`)**: Unauthenticated client querying `cms_projects` where `status == 'draft'` -> Rejected by `resource.data.status == 'published' || isEditorOrAdmin()`.
9. **ID Poisoning (`enquiries`)**: Creating a document with a 500-char or regex-invalid ID -> Rejected by `isValidId()`.
10. **Value Poisoning (`cms_projects` update)**: Updating `status` to `'hacked_state'` -> Rejected by `isValidCmsProject(incoming())` enum check.
11. **Author UID Mutation (`cms_projects` update)**: Changing `authorUid` during an update -> Rejected by `incoming().authorUid == existing().authorUid`.
12. **Self-Assigned Admin Privilege (`/admins/{uid}`)**: Non-admin user attempting to create their own document in `/admins/{uid}` -> Rejected by `isAdmin()`.

## 3. Test Runner Reference
See `/firestore.rules.test.ts` for the complete test suite verifying `PERMISSION_DENIED` across all 12 adversarial vectors.
