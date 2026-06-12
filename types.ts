export enum Country {
  FINLAND = 'Finland',
  SWEDEN = 'Sweden'
}

export type LanguageCode = 'sv' | 'fi' | 'en' | 'ar' | 'uk';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LanguageContent {
  name: string;
  description: string;
  etiquette: string;
}

export interface Content {
  sv: LanguageContent;
  fi: LanguageContent;
  en: LanguageContent;
  ar?: LanguageContent;
  uk?: LanguageContent;
}

export interface AudioTrack {
  title: string;
  url: string;
  speaker?: string;
  duration?: string;
  description?: string;
}

export interface VideoClip {
  title: string;
  url: string;
  description?: string;
  thumbnail?: string;
}

export interface Media {
  featured_image?: string;
  images: string[];
  audio_interviews: AudioTrack[];
  video_clips: VideoClip[];
}

export interface Contact {
  website: string;
  phone?: string;
  address?: string;
  email?: string;
}

export type UserRole = 'user' | 'admin' | 'super_admin';
export type UserStatus = 'pending' | 'approved' | 'banned';

export interface BrandingPreferences {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  logoUrl?: string;
  logoSize?: number; // Size in pixels
  siteName?: string;
  siteTagline?: string;
  fundingLogoUrl?: string;
  fundingText?: string;
  fundingUrl?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroBgType?: 'image' | 'video';
  heroBgUrl?: string;
  theme?: 'light' | 'dark';
  language?: LanguageCode;
}


export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  full_name?: string;
  preferences?: BrandingPreferences;
  metadata?: any;
}

export interface ContentItem {
  id?: string;
  category: string;
  metadata: {
    region?: string;
    type?: string;
    tags?: string[];
  };
  content: Content;
  media: Media;
  contact: Contact;
  status: 'pending_approval' | 'approved' | 'rejected';
  created_by?: string;
  created_at?: string;
  views?: number;
}


export type MaterialType = 'pdf' | 'presentation' | 'video' | 'twee';

export interface LearningMaterial {
  id: string;
  title: string | {
    en: string;
    fi?: string;
    sv?: string;
    ar?: string;
    uk?: string;
  };
  description: string | {
    en: string;
    fi?: string;
    sv?: string;
    ar?: string;
    uk?: string;
  };
  type: MaterialType;
  category?: string;
  url?: string;
  embed_code?: string;
  file_path?: string;
  thumbnail?: string;
  created_at: string;
  created_by: string;
}

export type PostStatus = 'pending_approval' | 'approved' | 'rejected';

export interface BlogPost {
  id: string;
  author_id: string;
  title: string;
  content: string;
  media_urls: string[];
  category?: string;
  views?: number;
  status: PostStatus;
  created_at: string;
  updated_at: string;
  author_name?: string;
}

export interface Workshop {
  id?: string;
  title: {
    en: string;
    fi: string;
    sv: string;
    ar?: string;
    uk?: string;
  };
  description?: {
    en: string;
    fi?: string;
    sv?: string;
    ar?: string;
    uk?: string;
  };
  date: string;
  image: string;
  label: string;
  linkUrl?: string;
  created_at?: any;
}

export type TranslatedStrings = Record<string, string>;

export interface SiteTranslations {
  en: TranslatedStrings;
  fi: TranslatedStrings;
  sv: TranslatedStrings;
  ar: TranslatedStrings;
  uk: TranslatedStrings;
}