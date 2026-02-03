/**
 * x402-Enabled Content Generation Skills
 * 
 * Paid API endpoints for AI agents via the x402 protocol
 * Part of the $UPSKILL ecosystem
 */

import express, { Request, Response, NextFunction } from 'express';
import { config } from 'dotenv';

// Load environment variables
config();

// Import generators
import {
  generateTweet,
  TweetInputSchema,
  tweetInputJsonSchema,
  tweetOutputJsonSchema,
  generateThread,
  ThreadInputSchema,
  threadInputJsonSchema,
  threadOutputJsonSchema,
  generateSummary,
  SummaryInputSchema,
  summaryInputJsonSchema,
  summaryOutputJsonSchema,
} from './generators/index.js';

// Configuration
const PORT = parseInt(process.env.PORT || '4021', 10);
const PAY_TO = process.env.PAY_TO_ADDRESS || '0xede1a30a8b04cca77ecc8d690c552ac7b0d63817';
const NETWORK = process.env.X402_NETWORK || 'eip155:8453'; // Base mainnet
const FACILITATOR_URL = process.env.X402_FACILITATOR_URL || 'https://api.cdp.coinbase.com/platform/v2/x402';

// Pricing (in USDC)
const PRICING = {
  tweet: '$0.02',
  thread: '$0.05',
  summary: '$0.03',
};

const app = express();
app.use(express.json({ limit: '1mb' }));

// Health check (free)
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: '@upskill/content-gen',
    version: '1.0.0',
    x402: {
      network: NETWORK,
      facilitator: FACILITATOR_URL,
      payTo: PAY_TO,
    },
  });
});

// Service discovery endpoint (free) - for agents to understand capabilities
app.get('/discover', (req: Request, res: Response) => {
  res.json({
    name: 'UPSKILL Content Generation',
    description: 'AI-powered content generation skills for tweets, threads, and summaries',
    version: '1.0.0',
    x402: {
      version: 2,
      network: NETWORK,
      payTo: PAY_TO,
      facilitator: FACILITATOR_URL,
    },
    endpoints: [
      {
        path: '/generate/tweet',
        method: 'POST',
        description: 'Generate engaging tweets on any topic',
        price: PRICING.tweet,
        input: tweetInputJsonSchema,
        output: tweetOutputJsonSchema,
      },
      {
        path: '/generate/thread',
        method: 'POST',
        description: 'Create Twitter thread content from a topic/outline',
        price: PRICING.thread,
        input: threadInputJsonSchema,
        output: threadOutputJsonSchema,
      },
      {
        path: '/generate/summary',
        method: 'POST',
        description: 'Summarize articles/content into digestible formats',
        price: PRICING.summary,
        input: summaryInputJsonSchema,
        output: summaryOutputJsonSchema,
      },
    ],
    tags: ['content', 'twitter', 'social-media', 'ai', 'generation'],
    category: 'content-generation',
  });
});

// ==== PAID ENDPOINTS ====

// Tweet Generator
app.post('/generate/tweet', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = TweetInputSchema.parse(req.body);
    const result = await generateTweet(input);
    res.json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Invalid input',
        details: error.errors,
      });
    } else {
      next(error);
    }
  }
});

// Thread Writer  
app.post('/generate/thread', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = ThreadInputSchema.parse(req.body);
    const result = await generateThread(input);
    res.json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Invalid input',
        details: error.errors,
      });
    } else {
      next(error);
    }
  }
});

// Summary Generator
app.post('/generate/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = SummaryInputSchema.parse(req.body);
    const result = await generateSummary(input);
    res.json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Invalid input', 
        details: error.errors,
      });
    } else {
      next(error);
    }
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║           🚀 UPSKILL Content Generation x402 API 🚀            ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Server running at: http://localhost:${PORT}                    ║
║                                                                ║
║  x402 Configuration:                                           ║
║  • Network: ${NETWORK.padEnd(45)}║
║  • Pay To:  ${PAY_TO.slice(0, 10)}...${PAY_TO.slice(-6)}                                   ║
║  • Facilitator: CDP Mainnet                                    ║
║                                                                ║
║  Endpoints:                                                    ║
║  • POST /generate/tweet   - ${PRICING.tweet}/request                   ║
║  • POST /generate/thread  - ${PRICING.thread}/request                   ║
║  • POST /generate/summary - ${PRICING.summary}/request                   ║
║                                                                ║
║  Free Endpoints:                                               ║
║  • GET  /health           - Health check                       ║
║  • GET  /discover         - Service discovery                  ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

export default app;
