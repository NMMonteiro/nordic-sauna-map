# ☁️ Google Cloud Platform: Data Architecture Plan

This document outlines the migration from Supabase to Google Cloud Platform (GCP) for the white-label **Educational Template**.

---

## 🏗️ 1. Google Firestore (NoSQL Database)

Firestore will store all relational and configuration data. Unlike Postgres, it uses a flexible JSON-like structure.

### 📁 Collection: `configs`
Stores site-wide settings managed via the **Design Studio**.
*   **Document ID**: `branding`
    *   `site_name`: `string`
    *   `logo_url`: `string` (GCS URL)
    *   `colors`: `map`
        *   `primary`: `string`
        *   `secondary`: `string`
        *   `accent`: `string`
    *   `typography`: `map`
        *   `heading`: `string`
        *   `body`: `string`
    *   `footer`: `map`
        *   `text`: `string`
        *   `socials`: `map { fb, ig, yt, li }`
    *   `updated_at`: `timestamp`
    *   `updated_by`: `string (uid)`

### 📁 Collection: `materials`
Primary storage for educational resources.
*   `title`: `string`
*   `description`: `string`
*   `type`: `enum ['pdf', 'video', 'presentation', 'link']`
*   `access_level`: `enum ['public', 'members_only']`
*   `media_url`: `string` (GCS URL)
*   `file_path`: `string` (Path in Google Cloud Storage)
*   `thumbnail_url`: `string`
*   `created_at`: `timestamp`
*   `created_by`: `string (admin_id)`
*   `tags`: `array<string>`

### 📁 Collection: `profiles`
User management mirroring the previous authentication logic.
*   `id`: `string` (Matches Firebase Auth UID)
*   `email`: `string`
*   `full_name`: `string`
*   `role`: `enum ['admin', 'user']`
*   `status`: `enum ['pending', 'approved', 'banned']`
*   `created_at`: `timestamp`

---

## 📂 2. Google Cloud Storage (GCS)

Files will be organized in a bucket structure for high performance and security.

*   `gs://your-project-id.appspot.com/`
    *   `/assets/` - Logos, favicons, branding assets.
    *   `/materials/` - PDFs, PPTs, and Video files.
    *   `/blog/` - Images for stories/articles.
    *   `/users/` - User profile pictures.

---

## 🔐 3. Security Rules (Firestore)

We will implement strict security rules to ensure only admins can modify site branding and materials.

```js
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper to check if user is Admin
    function isAdmin() {
      return get(/databases/$(database)/documents/profiles/$(request.auth.uid)).data.role == 'admin';
    }

    // Configs: Public can read, only Admins can write
    match /configs/{document} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Materials: Public/Authenticated can read, only Admins can write
    match /materials/{material} {
      allow read: if resource.data.access_level == 'public' || request.auth != null;
      allow write: if isAdmin();
    }
  }
}
```

---

## 🛠️ 4. API Integration Strategy (React SDK)

In the codebase, we will replace `supabaseClient.ts` with a `firebase.ts` provider:

```typescript
// firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  // Your GCP project keys here
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
```
