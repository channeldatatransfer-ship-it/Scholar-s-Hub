
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  nextReview: number; // timestamp
  interval: number; // days
  easeFactor: number;
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  cardCount: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

export interface Resource {
  id: string;
  name: string;
  type: 'pdf' | 'folder' | 'doc';
  url: string;
  parentId: string | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
}

export interface UserStats {
  streak: number;
  lastActive: string;
  focusMinutes: number;
}

export interface AppSettings {
  darkMode: boolean;
  primaryColor: string;
  geminiKey?: string;
  gdriveKey?: string;
  gdriveClientId?: string;
}
