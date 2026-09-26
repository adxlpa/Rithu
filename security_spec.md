# Phase 0: Payload-First Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Default-Deny Catch-All**: Any path not explicitly defined in `firebase-blueprint.json` is strictly denied for both read and write operations.
2. **Verified Admin Gate (`isAdmin()`)**: Only authenticated users with a verified email (`request.auth.token.email_verified == true`) matching the bootstrapped admin (`adhilpa004@gmail.com`) or existing in `/admins/{uid}` may create, update, or delete records in `/admins/{adminId}`, `/audio_tracks/{trackId}`, `/video_items/{videoId}`, `/magazine_edition/{editionId}`, and `/magazine_pages/{pageId}`.
3. **No Self-Assigned Roles**: No regular user can create or update their own `/admins/{adminId}` document unless they already satisfy `isAdmin()`.
4. **Public Read Query Enforcement**: `list` and `get` queries on `/audio_tracks`, `/video_items`, `/magazine_edition`, and `/magazine_pages` are strictly bounded by `resource.data.isPublic == true`.
5. **Relational Parent Invariant**: Every `/magazine_pages/{pageId}` document must reference an `editionId` that exists in `/magazine_edition/{editionId}` (via `exists()` or `existsAfter()` for atomic batch uploads).
6. **Temporal & Identity Immutability**: `createdAt` and `updatedAt` must equal `request.time` on creation; `updatedAt` must equal `request.time` on update; `id`, `createdByUid`, and `createdAt` are strictly immutable on update.
7. **Strict Schema & Volumetric Bounds**: All fields are checked via `hasAll` and `hasOnly` on creation, and `affectedKeys().hasOnly(...)` + full entity validation on update, with strict `.size()` bounds and regex ID validation (`^[a-zA-Z0-9_\-]+$`).

---

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Payload 1 (Unverified Email Spoof Attack)**: Authenticated user with `email: 'adhilpa004@gmail.com'` but `email_verified: false` attempting to create `/audio_tracks/track-1`.
2. **Payload 2 (Self-Assigned Admin Privilege Escalation)**: Regular verified user (`uid: 'attacker-1'`) attempting to create `/admins/attacker-1` with `{ uid: 'attacker-1', role: 'super_admin', createdByUid: 'attacker-1', ... }`.
3. **Payload 3 (Shadow Field Injection on Create)**: Admin creating `/audio_tracks/track-1` with an undeclared field `isFeaturedHack: true`.
4. **Payload 4 (Shadow Field Injection on Update)**: Admin updating `/video_items/vid-1` with an undeclared field `untrustedFlag: 'pwned'`.
5. **Payload 5 (Identity Spoofing on Create)**: Admin (`uid: 'admin-1'`) creating `/audio_tracks/track-1` with `createdByUid: 'someone-else'`.
6. **Payload 6 (Immutable Field Mutation on Update)**: Admin updating `/audio_tracks/track-1` by mutating `createdByUid` or `createdAt`.
7. **Payload 7 (Orphaned Magazine Page Creation)**: Admin creating `/magazine_pages/page-1` referencing `editionId: 'non-existent-edition'` where `/magazine_edition/non-existent-edition` does not exist.
8. **Payload 8 (Denial-of-Wallet Oversized String)**: Admin creating `/video_items/vid-1` with a `title` exceeding 200 characters (e.g., 5,000 characters).
9. **Payload 9 (ID Poisoning / Malicious Path Variable)**: Admin creating `/audio_tracks/bad$id!@#` with invalid characters outside `^[a-zA-Z0-9_\-]+$`.
10. **Payload 10 (Forged Client Timestamp)**: Admin creating `/magazine_edition/current` with a past/future `createdAt` timestamp not equal to `request.time`.
11. **Payload 11 (Unfiltered List Scraping of Non-Public Docs)**: Unauthenticated or authenticated user listing `/audio_tracks` without filtering `where('isPublic', '==', true)` when non-public drafts exist.
12. **Payload 12 (Value Poisoning on Whitelisted Update Key)**: Admin updating `/video_items/vid-1` `category` to an invalid enum value `'HackedCategory'` or integer `12345`.
