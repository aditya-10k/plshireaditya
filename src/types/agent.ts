import { AvatarExpression } from './avatar';

export type AgentAction =
  | {
      type: 'SET_EXPRESSION';
      expression: AvatarExpression;
    }
  | {
      type: 'OPEN_PROJECT';
      projectId: string;
      url?: string;
      title?: string;
    }
  | {
      type: 'OPEN_LINK';
      url: string;
      platform?: string;
      title?: string;
    }
  | {
      type: 'DOWNLOAD_RESUME';
      url?: string;
      filename?: string;
      email?: string;
      title?: string;
    }
  | {
      type: 'CLOSE_PROJECT';
    }
  | {
      type: 'NAVIGATE';
      target: string;
    }
  | {
      type: 'SCROLL';
      target: string;
    }
  | {
      type: 'HIGHLIGHT';
      target: string;
    }
  | {
      type: 'RUN_DEMO';
      projectId: string;
      demoId: string;
    }
  | {
      type: 'PLAY_DEMO';
      projectId: string;
      demoId: string;
    };

export interface AgentResponse {
  protocolVersion: string;
  text: string;
  emotion?: AvatarExpression;
  speech?: {
    enabled: boolean;
  };
  actions?: AgentAction[];
}
