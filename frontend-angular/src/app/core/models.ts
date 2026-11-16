export type ContentType = 'MOVIE' | 'SERIES';
export type AgeRating = 'ATP' | '7+' | '13+' | '16+' | '18+';
export type Role = 'USER' | 'ADMIN';

export interface Content {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  releaseYear: number;
  durationMinutes: number;
  seasons: number;
  genre: string;
  imageUrl: string;
  featured: boolean;
  ageRating: AgeRating;
  trailerUrl: string | null;
}

export interface AdminContent extends Content {
  videoPath: string | null;
}

export type ContentInput = Omit<AdminContent, 'id'>;

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Session {
  accessToken: string | null;
  expiresIn: number;
  message: string;
}

export interface AppConfig {
  demo: boolean;
  name: string;
  halloweenSeason: boolean;
  seasonYear: number;
}

export interface Progress {
  content: Content;
  seconds: number;
  updatedAt?: string;
}

export interface Episode {
  id: string;
  season: number;
  number: number;
  title: string;
  description: string | null;
  durationMinutes: number;
}
export type EpisodeInput = Omit<Episode, 'id'>;

export interface Recommendation {
  content: Content;
  reason: string;
}

export interface MyReview {
  id: string;
  content: Content;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface ProfileStats {
  saved: number;
  watched: number;
  reviews: number;
}

export interface UserAdmin {
  id: string;
  email: string;
  name: string;
  role: Role;
  saved: number;
  watched: number;
  reviews: number;
}

export interface Playback {
  url: string;
  demo: boolean;
  message: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  mine: boolean;
}

export interface ReviewSummary {
  average: number;
  count: number;
  reviews: Review[];
}

export interface Rating {
  contentId: string;
  average: number;
  count: number;
}

export interface AdminReview {
  id: string;
  contentId: string;
  contentTitle: string;
  author: string;
  email: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface AdminStats {
  movies: number;
  series: number;
  genres: number;
  users: number;
  reviews: number;
  savedItems: number;
  byGenre: { genre: string; count: number }[];
  topRated: { contentId: string; title: string; average: number; count: number }[];
}

export const AGE_RATINGS: AgeRating[] = ['ATP', '7+', '13+', '16+', '18+'];
export const PLACEHOLDER = '/assets/poster-placeholder.svg';

/** Portadas incluidas en public/assets/catalogo/ para elegir desde el panel sin subirlas de nuevo. */
export const POSTER_LIBRARY: { label: string; path: string }[] = [
  ['Annabelle', 'annabelle.jpg'], ['Avengers: Doomsday', 'avengers-doomsday.jpg'], ['The Big Bang Theory', 'big-bang-theory.jpg'],
  ['Chucky (serie)', 'chucky-serie.jpg'], ['Dr. House', 'dr-house.jpg'], ['El conjuro 2', 'el-conjuro-2.jpg'],
  ['El culto de Chucky', 'el-culto-de-chucky.jpg'], ['El títere', 'el-titere.jpg'], ['Futurama', 'futurama.jpg'],
  ["Grey's Anatomy", 'greys-anatomy.jpg'], ['It: Capítulo dos', 'it-capitulo-dos.jpg'], ['Joker', 'joker.jpg'],
  ['La La Land', 'la-la-land.jpg'], ['La máscara', 'la-mascara.jpg'], ['La noche del demonio', 'la-noche-del-demonio.jpg'],
  ['Los Simpson', 'los-simpson.jpg'], ['Michael', 'michael-jackson.jpg'], ['Obsesión', 'obsesion.webp'], ['Ouija', 'ouija.jpg'],
  ['Pelé', 'pele-pelicula.jpg'], ['Rápidos y furiosos', 'rapidos-y-furiosos.jpg'], ['Rick y Morty', 'rick-and-morty.jpg'],
  ['Scary Movie 6', 'scary-movie-6.webp'], ['Scream', 'scream.jpg'], ['Spider-Man: Brand New Day', 'spiderman-brand-new-day.webp'],
  ['Ted', 'ted.jpg'], ['Ted (serie)', 'ted-serie.jpg'],
].map(([label, file]) => ({ label, path: `/assets/catalogo/${file}` }));
