
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface Topic {
  id: string;
  title: string;
  completed: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  topics: Topic[];
}

export interface Syllabus {
  id: string;
  subject: string;
  chapters: Chapter[];
  color: string;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  nextReview: number;
  interval: number;
  easeFactor: number;
  reps: number;
  lapses: number;
  state: 'new' | 'learning' | 'review';
}

export interface Deck {
  id: string;
  name: string;
  description: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

export interface Resource {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'folder';
  modified: string;
  url?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO format
  category: string;
  time: string;
}

export interface UserStats {
  streak: number;
  lastActive: string;
  focusMinutes: number;
}

export interface AppSettings {
  darkMode: boolean;
  primaryColor: string;
  gdriveKey?: string;
  gdriveClientId?: string;
}
