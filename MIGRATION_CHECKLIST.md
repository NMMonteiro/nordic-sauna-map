# 📋 Migration Checklist: Sauna Map ➡️ Educational Template

This checklist outlines the specific modifications and deletions required to transform the current codebase into a white-label educational template using Google Cloud.

## 🗑️ Step 1: Removal of Map-Specific Code
*Why: These files are tightly coupled to the "Sauna" niche and are no longer needed.*

- [ ] **Delete Components**:
    - `components/MapView.tsx`
    - `components/MapPin.tsx`
    - `components/LocationPicker.tsx`
    - `components/SaunaModal.tsx`
    - `components/ContributionForm.tsx` (Will be replaced by a generic Material Uploader)
- [ ] **Delete Data/Constants**:
    - `constants.ts` (Remove `SAUNAS` hardcoded data)
- [ ] **Clean App.tsx**:
    - [x] Remove imports for `MapView`, `SaunaModal`, etc.
    - [ ] Delete `HomePage` sections referring to "Explore the Map", "Interactive Atlas", and "Bathing Traditions".
    - [x] Remove `allVisibleSaunas` and `handleCountryFilter` logic.

## 🔄 Step 2: Core Engine Refactoring
*Why: Transforming niche features into generic template features.*

- [x] **Generalize Types (`types.ts`)**:
    - Rename `Sauna` interface to `EducationalMaterial` or `ContentItem`.
    - Update `Profile` to include `preferences` for the branding settings.
- [ ] **Update Admin Panel (`AdminPanel.tsx`)**:
    - [x] Remove "Sauna Map", "Sauna Submissions", and "Map Moderation" tabs.
    - [x] **Add New Tab**: "Site Design" (Render the new `DesignStudio.tsx`).
    - [x] Rename "Archives" to "Content Manager".
- [x] **Update Header & Layout**:
    - [x] Remove "Map" link from navigation.
    - [x] Ensure logo and site name are pulled from the new `siteSettings` state instead of hardcoded strings.

## ☁️ Step 3: Backend Migration (Supabase ➡️ GCP) [COMPLETED]
*Why: Switching the data layer to Google Cloud.*

- [x] **Environment Setup**:
    - [x] Create `.env.local` entries or update `lib/firebase.ts`.
- [x] **Library Swap**:
    - [x] Run `npm install firebase`.
    - [x] Create `src/lib/firebase.ts`.
- [x] **Service Replacement**:
    - [x] Replace `supabaseClient.ts` calls in all components with Firestore.
- [x] **Auth Switch**:
    - [x] Update `AuthModal.tsx` to use Firebase Auth.

## 🎨 Step 4: The Branding Injection
*Why: Enabling the "Template" to actually change its look.*

- [x] **Theme Integration**:
    - [x] Listen to settings from Firestore in `App.tsx`.
    - [x] Convert `index.css` colors to use variables: `--primary`, `--secondary`, etc.
- [x] **Dynamic Footer**:
    - [x] Update `Footer.tsx` to pull social links and copyright text from branding.

## 🚀 Step 5: Final Cleanup
- [ ] Delete `supabase_schema.sql` (no longer relevant).
- [ ] Delete `RESTART_DEV.md` and old documentation that mentions "Sauna".
- [ ] Update `README.md` to reflect the new "Educational Template" purpose.
