import { AvatarExpression } from './avatar';

export type EmotionState = AvatarExpression;

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  action?: 'show_project' | 'open_link' | 'none';
  projectTarget?: string;
  link?: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  tags: string[];
  demoUrl?: string;
  githubUrl?: string;
  matchScore?: string;
  highlights?: string[];
  metrics?: { label: string; value: string }[];
  featured?: boolean;
}

export type NavTab = 'home' | 'projects' | 'about' | 'chat';
