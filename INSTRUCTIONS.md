# Firebase Migration Guide

This document outlines the steps required to finalize the migration from Supabase to Firebase.

## 1. Firebase Project Setup

1.  **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Enable Authentication**:
    *   Go to **Authentication** > **Get Started**.
    *   Enable **Email/Password** and **Google** sign-in providers.
3.  **Create Firestore Database**:
    *   Go to **Firestore Database** > **Create database**.
    *   Start in **Production mode** and choose a region close to your users.
4.  **Enable Cloud Storage**:
    *   Go to **Storage** > **Get Started**.
    *   Choose a region and review the default bucket rules.

## 2. Environment Configuration

1.  Update `lib/firebase.ts` with your project's configuration (ApiKey, AuthDomain, ProjectId, etc.). You can find these in **Project Settings** > **General** > **Your apps**.

## 3. Data Migration

You will need to manually migrate or re-create data in Firestore. The application expects the following collections:

*   **`profiles`**: User profiles with fields:
    *   `id` (Document ID)
    *   `email`
    *   `full_name`
    *   `role` ('admin', 'member', 'owner')
    *   `preferences` (Branding preferences object)
*   **`content_items`**: Main archive entries.
*   **`materials`**: Educational resources.
*   **`blog_posts`**: Blog stories.
*   **`newsletter_subscribers`**: Newsletter subscription list.
*   **`newsletter_history`**: History of sent broadcasts.

## 4. Security Rules (FireStore)

Apply these rules in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAdmin() {
      return get(/databases/$(database)/documents/profiles/$(request.auth.uid)).data.role in ['admin', 'owner'];
    }

    match /profiles/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || isAdmin();
    }
    
    match /content_items/{itemId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /materials/{materialId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /blog_posts/{postId} {
      allow read: if resource.data.status == 'approved' || isAdmin();
      allow create: if request.auth != null;
      allow update, delete: if isAdmin() || (request.auth.uid == resource.data.author_id);
    }
    
    match /newsletter_subscribers/{subId} {
      allow read: if isAdmin();
      allow create: if true;
      allow update: if true; // For unsubscription
    }
  }
}
```

## 5. Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/(default)/documents/profiles/$(request.auth.uid)).data.role in ['admin', 'owner'];
    }
  }
}
```

## 6. Cloud Functions

The newsletter "Send" feature expects a Firebase Cloud Function at the endpoint defined in `NewsletterManager.tsx`. You will need to implement this function to handle email distribution via a service like SendGrid or Postmark.

---
**Migration Status**: All frontend components have been updated to use the Firebase SDK.
