export type Role = 'user' | 'model';

export interface Message {
  role: Role;
  content: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface Step {
  number: number;
  title: string;
  description: string;
}
