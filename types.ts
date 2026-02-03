export enum Country {
  FINLAND = 'Finland',
  SWEDEN = 'Sweden'
}

export type LanguageCode = 'sv' | 'fi' | 'en';

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

export type UserRole = 'user' | 'admin';
export type UserStatus = 'pending' | 'approved' | 'banned';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  full_name?: string;
}

export interface Sauna {
  id?: string;
  sauna_id: string;
  coordinates: Coordinates;
  metadata: {
    country: Country | string;
    region: string;
    type: string;
  };
  content: Content;
  media: Media;
  contact: Contact;
  status: 'pending_approval' | 'approved' | 'rejected';
  created_by?: string;
  pedagogical_link?: string;
  views?: number;
}