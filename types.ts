
export type ExamLevel = 'SSC' | 'HSC' | 'Engineering' | 'Medical' | 'General';
export type AcademicGroup = 'Science' | 'Commerce' | 'Humanities';

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
  score?: number;
  lastTested?: string;
}

// Fixed: Added 'completed' property to Chapter interface to support progress tracking fallback when topics are not yet defined.
export interface Chapter {
  id: string;
  title: string;
  topics: Topic[];
  completed?: boolean;
}

export interface Syllabus {
  id: string;
  subject: string;
  chapters: Chapter[];
  color: string;
}

export interface Notebook {
  id: string;
  name: string;
  description: string;
  sourceIds: string[]; // IDs of notes or resource files
  dateCreated: string;
}

export interface AppSettings {
  darkMode: boolean;
  primaryColor: string;
  gdriveKey?: string;
  gdriveClientId?: string;
  examLevel: ExamLevel;
  academicGroup?: AcademicGroup;
  language: 'EN' | 'BN';
  focusDurations: {
    work: number;
    short: number;
    long: number;
  };
}

export interface Concept {
  id: string;
  title: string;
  content: string;
  category: 'formula' | 'definition' | 'theorem' | 'other';
  subjectId: string;
  imageUrl?: string;
}

export interface FocusLog {
  id: string;
  subjectId: string;
  minutes: number;
  date: string;
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
  tags?: string[];
}

export interface Resource {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'folder' | 'nctb';
  modified: string;
  url?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  category: string;
  time: string;
}
