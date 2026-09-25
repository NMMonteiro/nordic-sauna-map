/**
 * Centralized utility for resolving media URLs across the application.
 * Normalizes paths and handles migration from legacy Supabase storage to Firebase Storage.
 */

const FIREBASE_STORAGE_BASE = "https://firebasestorage.googleapis.com/v0/b/nordic-saunas.firebasestorage.app/o";
const LEGACY_SUPABASE_BASE = "https://hgpcpontdxjsbqsjiech.supabase.co/storage/v1/object/public";

export type StorageBucket = 'sauna-media' | 'blog-media' | 'education' | 'newsletter';

/**
 * Resolves a media path or URL to a full, accessible URL.
 * 
 * @param path - The file path (relative) or full URL.
 * @param bucket - The logical bucket/folder name (defaults to 'sauna-media').
 * @returns A full URL string.
 */
export const resolveMediaUrl = (path: string | undefined, bucket: StorageBucket = 'sauna-media'): string => {
    if (!path) return '';
    
    // If it's already a full URL or a local blob, return it
    if (path.startsWith('http') || path.startsWith('blob:')) {
        // Check if it's a legacy Supabase URL
        if (path.startsWith(LEGACY_SUPABASE_BASE)) {
            // Extract the path after the base
            // Format: LEGACY_SUPABASE_BASE/bucket/path
            const relativePath = path.replace(LEGACY_SUPABASE_BASE, '');
            const parts = relativePath.split('/').filter(Boolean);
            
            if (parts.length >= 2) {
                // Continue to process as a Firebase path
            } else {
                return path;
            }
        } else {
            return path;
        }
    }
    
    let targetPath = path;
    let targetBucket = bucket;

    // Check if it's a legacy Supabase URL
    if (path.startsWith(LEGACY_SUPABASE_BASE)) {
        // Extract the path after the base
        // Format: LEGACY_SUPABASE_BASE/bucket/path
        const relativePath = path.replace(LEGACY_SUPABASE_BASE, '');
        const parts = relativePath.split('/').filter(Boolean);
        
        if (parts.length >= 2) {
            targetBucket = parts[0] as StorageBucket;
            targetPath = parts.slice(1).join('/');
        }
    } else if (path.startsWith('http')) {
        // If it's a full URL but NOT legacy Supabase, return as is
        return path;
    }

    // Clean the path (remove leading slash)
    let cleanPath = targetPath.startsWith('/') ? targetPath.slice(1) : targetPath;

    // Prevent duplicate bucket prefix if cleanPath already starts with targetBucket or known buckets
    const knownBuckets: StorageBucket[] = ['sauna-media', 'blog-media', 'education', 'newsletter'];
    for (const b of knownBuckets) {
        if (cleanPath.startsWith(`${b}/`)) {
            cleanPath = cleanPath.slice(b.length + 1);
            targetBucket = b;
            break;
        }
    }

    // Map logical buckets to their respective Firebase prefixes
    const firebasePath = `${targetBucket}/${cleanPath}`;
    
    // Construct Firebase Storage Public URL
    const encodedPath = encodeURIComponent(firebasePath);
    
    return `${FIREBASE_STORAGE_BASE}/${encodedPath}?alt=media`;
};

/**
 * Helper to check if a URL is from the legacy Supabase storage.
 */
export const isLegacyUrl = (url: string): boolean => {
    return url.includes('supabase.co/storage');
};
