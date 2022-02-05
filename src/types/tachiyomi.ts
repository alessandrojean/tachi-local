export interface TachiyomiEntry {
  artist: string;
  author: string;
  description: string;
  genre: string;
  title: string;
  status: TachiyomiStatus;
}

export type TachiyomiStatus = '0' | '1' | '2' | '3' | '4' | '5' | '6'
