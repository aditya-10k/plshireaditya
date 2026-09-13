export interface DemoManifest {
  id: string;
  name: string;
  description: string;
  component?: string;
}

export interface ProjectManifest {
  id: string;
  name: string;
  subtitle?: string;
  description: string;
  links: {
    github?: string;
    live?: string;
    appStore?: string;
    playStore?: string;
  };
  technologies: string[];
  demos?: DemoManifest[];
  metrics?: { label: string; value: string }[];
  highlights?: string[];
}
