export interface AnilistResponse<ResponseType> {
  data: ResponseType;
}

export interface AnilistPaginated<KeyValue extends string, Type> {
  Page: {
    [key in KeyValue]: Type[];
  };
}

export type AnilistPaginatedMedia = AnilistResponse<AnilistPaginated<'media', AnilistMedia>>

export type AnilistStatus = 'FINISHED' | 'RELEASING' | 
  'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS'

export type AnilistFormat = 'MANGA' | 'ONE_SHOT'

export interface AnilistMedia {
  coverImage: {
    extraLarge: string;
  };
  description?: string;
  format: AnilistFormat;
  genres: string[];
  id: number;
  staff: AnilistStaff;
  status: AnilistStatus;
  title: {
    english?: string;
    romaji: string;
  };
}

export interface AnilistStaff {
  edges: AnilistPersonRole[];
}

export interface AnilistPersonRole {
  node: AnilistPerson;
  role: string;
}

export interface AnilistPerson {
  id: number;
  name: {
    full: string;
  };
}
