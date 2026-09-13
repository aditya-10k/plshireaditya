import { EmotionState } from '../types';

export interface AIResponse {
  text: string;
  emotion: EmotionState;
  action?: 'show_project' | 'open_link' | 'none';
  projectTarget?: string;
  link?: string;
}

/**
 * AI Companion Query Service
 * 
 * TODO: When your NLP project data and custom LLM backend are ready,
 * replace the simulated response engine below with your real API call:
 * 
 * Example:
 * const res = await fetch('https://your-nlp-api.com/chat', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ message: prompt })
 * });
 * return await res.json();
 */
export async function queryAI(prompt: string): Promise<AIResponse> {
  // Simulate natural thinking latency
  await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 500));

  const lower = prompt.toLowerCase().trim();

  // MatchResume Intent
  if (lower.includes('matchresume') || lower.includes('resume') || lower.includes('matcher')) {
    return {
      text: 'Sure! Let me show you. Opening MatchResume...',
      emotion: 'excited',
      action: 'show_project',
      projectTarget: 'matchresume'
    };
  }

  // Projects Intent
  if (lower.includes('project') || lower.includes('work') || lower.includes('portfolio') || lower.includes('built')) {
    return {
      text: "Aditya has built several high-impact projects! Here is MatchResume, an AI-powered resume analyzer, alongside Web3 Sentinel and NeuroFlow.",
      emotion: 'excited',
      action: 'show_project',
      projectTarget: 'matchresume'
    };
  }

  // GitHub Intent
  if (lower.includes('github') || lower.includes('code') || lower.includes('repo')) {
    return {
      text: "You can explore all of Aditya's open-source projects, experiments, and code repositories on GitHub at github.com/aditya-10k!",
      emotion: 'happy',
      action: 'open_link',
      link: 'https://github.com/aditya-10k'
    };
  }

  // Why did you build this?
  if (lower.includes('why') && (lower.includes('build') || lower.includes('this') || lower.includes('create'))) {
    return {
      text: "Aditya wanted to break away from traditional boring resumes and create a living, expressive AI companion interface. Plus, who doesn't love a glowing cloud friend? ☁️✨",
      emotion: 'laughing'
    };
  }

  // What's next?
  if (lower.includes('next') || lower.includes('future') || lower.includes('roadmap')) {
    return {
      text: "Next up: we're connecting the custom NLP brain model! Once that's live, I'll be able to answer deep technical inquiries, live code reviews, and full conversational banter.",
      emotion: 'curious'
    };
  }

  // Greetings
  if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey') || lower.includes('sup')) {
    return {
      text: "Hey! I'm Aditya's AI companion. You can ask me about his projects, skills, background, or explore the tabs above!",
      emotion: 'greeting'
    };
  }

  // Skills / Stack
  if (lower.includes('skill') || lower.includes('stack') || lower.includes('tech') || lower.includes('languages')) {
    return {
      text: "Aditya's core stack includes React, TypeScript, Tailwind CSS, Python, FastAPI, Node.js, and Web3/Solidity systems.",
      emotion: 'focused'
    };
  }

  // Aditya / Bio
  if (lower.includes('aditya') || lower.includes('who are you') || lower.includes('about')) {
    return {
      text: "Aditya is a full-stack & AI engineer passionate about developing intelligent, fluid digital products. You can check the About tab for his full journey!",
      emotion: 'happy'
    };
  }

  // Humor / Easter egg
  if (lower.includes('coffee') || lower.includes('caffeine')) {
    return {
      text: "Fueled by high-grade caffeine and late-night commits! Click the coffee badge in the top right to refill!",
      emotion: 'excited'
    };
  }

  if (lower.includes('joke')) {
    return {
      text: "Why do programmers prefer dark mode? Because light attracts bugs! 🐛💡",
      emotion: 'laughing'
    };
  }

  // Fallback response
  return {
    text: `That's a thoughtful question! While Aditya finishes training the full NLP model, you can check out his projects, GitHub, or use the quick suggestion chips below!`,
    emotion: 'thinking'
  };
}
