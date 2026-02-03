/**
 * x402-Enabled Content Generation Skills
 * 
 * Paid API endpoints for AI agents via the x402 protocol
 * Part of the $UPSKILL ecosystem
 */

import express, { Request, Response, NextFunction } from 'express';
import { config } from 'dotenv';
import { paymentMiddleware } from '@x402/express';
import { x402ResourceServer, HTTPFacilitatorClient } from '@x402/core/server';
import { registerExactEvmScheme } from '@x402/evm/exact/server';
import { bazaarResourceServerExtension, declareDiscoveryExtension } from '@x402/extensions/bazaar';

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
type Network = `${string}:${string}`;
const PORT = parseInt(process.env.PORT || '4021', 10);
const PAY_TO = (process.env.PAY_TO_ADDRESS || '0xede1a30a8b04cca77ecc8d690c552ac7b0d63817') as `0x${string}`;
const NETWORK: Network = (process.env.X402_NETWORK || 'eip155:8453') as Network; // Base mainnet
const FACILITATOR_URL = process.env.X402_FACILITATOR_URL || 'https://x402.org/facilitator';

// Pricing (in USDC)
const PRICING = {
  tweet: '$0.02',
  thread: '$0.05',
  summary: '$0.03',
};

const app = express();
app.use(express.json({ limit: '1mb' }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Payment-Signature, X-Payment');
  res.header('Access-Control-Expose-Headers', 'Payment-Required, X-Payment-Response');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// =============================================================================
// x402 Setup with Official SDK
// =============================================================================

const facilitatorClient = new HTTPFacilitatorClient({
  url: FACILITATOR_URL,
});

const server = new x402ResourceServer(facilitatorClient);
registerExactEvmScheme(server);
server.registerExtension(bazaarResourceServerExtension);

// =============================================================================
// Route Configuration with Bazaar Discovery
// =============================================================================

const paymentRoutes = {
  'POST /generate/tweet': {
    accepts: {
      scheme: 'exact' as const,
      price: PRICING.tweet,
      network: NETWORK,
      payTo: PAY_TO,
    },
    extensions: {
      ...declareDiscoveryExtension({
        input: { topic: 'AI agents', tone: 'professional' },
        inputSchema: tweetInputJsonSchema,
        bodyType: 'json',
        output: {
          example: {
            tweet: 'AI agents are revolutionizing how we work...',
            hashtags: ['#AI', '#Automation'],
            characterCount: 180,
          },
          schema: tweetOutputJsonSchema,
        },
      }),
    },
  },
  'POST /generate/thread': {
    accepts: {
      scheme: 'exact' as const,
      price: PRICING.thread,
      network: NETWORK,
      payTo: PAY_TO,
    },
    extensions: {
      ...declareDiscoveryExtension({
        input: { topic: 'Web3 trends', tweetCount: 5 },
        inputSchema: threadInputJsonSchema,
        bodyType: 'json',
        output: {
          example: {
            tweets: ['1/5 Thread on Web3 trends...', '2/5 ...'],
            totalCharacters: 1200,
          },
          schema: threadOutputJsonSchema,
        },
      }),
    },
  },
  'POST /generate/summary': {
    accepts: {
      scheme: 'exact' as const,
      price: PRICING.summary,
      network: NETWORK,
      payTo: PAY_TO,
    },
    extensions: {
      ...declareDiscoveryExtension({
        input: { content: 'Article text...', format: 'bullets' },
        inputSchema: summaryInputJsonSchema,
        bodyType: 'json',
        output: {
          example: {
            summary: '• Key point 1\n• Key point 2',
            keyPoints: ['Point 1', 'Point 2'],
          },
          schema: summaryOutputJsonSchema,
        },
      }),
    },
  },
};

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

// Service discovery endpoint (free)
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

// =============================================================================
// Paid Endpoints with Official x402 Middleware
// =============================================================================

app.use(paymentMiddleware(paymentRoutes, server));

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
║       🚀 UPSKILL Content Generation - x402 Official SDK 🚀     ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Server running at: http://localhost:${PORT}                    ║
║                                                                ║
║  x402 Configuration:                                           ║
║  • Network: ${NETWORK.padEnd(45)}║
║  • Pay To:  ${PAY_TO.slice(0, 10)}...${PAY_TO.slice(-6)}                                   ║
║  • Facilitator: ${FACILITATOR_URL.slice(0, 35)}...           ║
║                                                                ║
║  Endpoints (Bazaar Discoverable):                              ║
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
