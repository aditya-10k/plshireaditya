import { ProjectManifest } from '../../types/projects';

export const larpDetectorManifest: ProjectManifest = {
  id: 'larp-detector',
  name: 'Larp Detector',
  subtitle: 'On-Chain & Social Verification Engine',
  description:
    'An automated fact-checking and reputation analyzer that verifies crypto/tech claims against on-chain transaction history and public GitHub commits to distinguish authentic builders from hype artists.',
  links: {
    github: 'https://github.com/aditya-10k/doyoularp',
    live: 'https://doyoularp.vercel.app',
  },
  technologies: ['TypeScript', 'Solidity', 'Ethers.js', 'EVM Indexer', 'FastAPI', 'Twitter API'],
  demos: [
    {
      id: 'verify',
      name: 'Live On-Chain Scanner',
      description: 'Analyze claimed deployment volume against verifiable on-chain state.',
    },
  ],
  metrics: [
    { label: 'Detection Accuracy', value: '96.4%' },
    { label: 'Wallets Audited', value: '8,200+' },
  ],
  highlights: [
    'Cross-references GitHub PR signatures with on-chain deployer addresses',
    'Heuristic social sentiment & credibility scoring',
  ],
};
