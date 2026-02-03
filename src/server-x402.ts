/**
 * x402-Enabled Content Generation Skills - Full x402 Implementation
 * 
 * This version includes full x402 payment middleware integration.
 * Use this when deploying to production with real payments.
 * 
 * Requires: @x402/express, @x402/evm, @x402/core, @x402/extensions
 */

import express, { Request, Response, NextFunction } from 'express';
import { config } from 'dotenv';

// x402 imports (uncomment when packages are installed)
// import { paymentMiddleware, x402ResourceServer } from '@x402/express';
// import { ExactEvmScheme } from '@x402/evm/exact/server';
// import { HTTPFacilitatorClient } from '@x402/core/server';
// import { bazaarResourceServerExtension, declareDiscoveryExtension } from '@x402/extensions/bazaar';

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

config();

const PORT = parseInt(process.env.PORT || '4021', 10);
const PAY_TO = process.env.PAY_TO_ADDRESS || '0xede1a30a8b04cca77ecc8d690c552ac7b0d63817';
const NETWORK = process.env.X402_NETWORK || 'eip155:8453';
const FACILITATOR_URL = process.env.X402_FACILITATOR_URL || 'https://api.cdp.coinbase.com/platform/v2/x402';

const PRICING = {
  tweet: '$0.02',
  thread: '$0.05', 
  summary: '$0.03',
};

const app = express();
app.use(express.json({ limit: '1mb' }));

// ============================================================
// x402 MIDDLEWARE SETUP
// Uncomment this block when x402 packages are properly installed
// ============================================================

/*
// Create facilitator client
const facilitatorClient = new HTTPFacilitatorClient({
  url: FACILITATOR_URL,
});

// Create resource server and register schemes
const server = new x402ResourceServer(facilitatorClient)
  .register(NETWORK, new ExactEvmScheme());

// Register Bazaar extension for discovery
server.registerExtension(bazaarResourceServerExtension);

// Apply payment middleware with route configuration
app.use(
  paymentMiddleware(
    {
      'POST /generate/tweet': {
        accepts: [
          {
            scheme: 'exact',
            price: PRICING.tweet,
            network: NETWORK,
            payTo: PAY_TO,
          },
        ],
        description: 'Generate engaging tweets on any topic',
        mimeType: 'application/json',
        extensions: {
          ...declareDiscoveryExtension({
            input: { topic: 'AI agents', tone: 'professional' },
            inputSchema: tweetInputJsonSchema,
            bodyType: 'json',
            output: {
              example: {
                tweet: '🎯 Insight: AI agents are reshaping how we think about automation...',
                characterCount: 156,
                hashtags: ['#AI', '#Agents'],
                suggestedPostTime: '12:00 PM (local time)',
              },
              schema: tweetOutputJsonSchema,
            },
          }),
        },
      },
      'POST /generate/thread': {
        accepts: [
          {
            scheme: 'exact',
            price: PRICING.thread,
            network: NETWORK,
            payTo: PAY_TO,
          },
        ],
        description: 'Create Twitter thread content from a topic/outline',
        mimeType: 'application/json',
        extensions: {
          ...declareDiscoveryExtension({
            input: { topic: 'Building with x402', threadLength: 5 },
            inputSchema: threadInputJsonSchema,
            bodyType: 'json',
            output: {
              example: {
                thread: [
                  { position: 1, content: '🧵 Thread: Building with x402...', characterCount: 45 },
                ],
                totalTweets: 5,
                topic: 'Building with x402',
                estimatedReadTime: '2 min',
                hashtags: ['#x402', '#Web3'],
              },
              schema: threadOutputJsonSchema,
            },
          }),
        },
      },
      'POST /generate/summary': {
        accepts: [
          {
            scheme: 'exact',
            price: PRICING.summary,
            network: NETWORK,
            payTo: PAY_TO,
          },
        ],
        description: 'Summarize articles/content into digestible formats',
        mimeType: 'application/json',
        extensions: {
          ...declareDiscoveryExtension({
            input: { content: 'Long article text...', format: 'bullets' },
            inputSchema: summaryInputJsonSchema,
            bodyType: 'json',
            output: {
              example: {
                summary: '• Key point 1\n• Key point 2',
                format: 'bullets',
                keyPoints: ['Point 1', 'Point 2'],
                wordCount: 50,
                originalWordCount: 500,
                compressionRatio: '90% reduction',
                readingTime: '1 min read',
              },
              schema: summaryOutputJsonSchema,
            },
          }),
        },
      },
    },
    server,
  ),
);
*/

// ============================================================
// MOCK x402 MIDDLEWARE (for testing without real payments)
// ============================================================

// This simulates x402 behavior for testing
const mockX402Middleware = (req: Request, res: Response, next: NextFunction) => {
  // In production, the x402 middleware handles payment verification
  // This mock just adds headers showing what would be required
  
  const path = req.path;
  const method = req.method;
  
  const priceMap: Record<string, string> = {
    '/generate/tweet': PRICING.tweet,
    '/generate/thread': PRICING.thread,
    '/generate/summary': PRICING.summary,
  };
  
  const price = priceMap[path];
  
  if (price && method === 'POST') {
    // Check for payment header
    const paymentSignature = req.headers['x-payment-signature'] || req.headers['payment-signature'];
    
    if (!paymentSignature) {
      // In real x402, this returns 402 Payment Required
      // For mock, we'll let it through but add a header
      res.setHeader('X-Mock-Payment-Required', JSON.stringify({
        scheme: 'exact',
        price,
        network: NETWORK,
        payTo: PAY_TO,
        note: 'Mock mode - payment not enforced. In production, payment required.',
      }));
    }
  }
  
  next();
};

app.use(mockX402Middleware);

// ============================================================
// FREE ENDPOINTS
// ============================================================

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: '@upskill/content-gen',
    version: '1.0.0',
    mode: 'mock-x402', // Change to 'production' when using real middleware
    x402: {
      network: NETWORK,
      facilitator: FACILITATOR_URL,
      payTo: PAY_TO,
    },
  });
});

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
    bazaar: {
      discoverable: true,
      category: 'content-generation',
      tags: ['content', 'twitter', 'social-media', 'ai', 'generation', 'upskill'],
    },
    endpoints: [
      {
        path: '/generate/tweet',
        method: 'POST',
        description: 'Generate engaging tweets on any topic',
        price: PRICING.tweet,
        accepts: [{
          scheme: 'exact',
          price: PRICING.tweet,
          network: NETWORK,
          payTo: PAY_TO,
        }],
        input: tweetInputJsonSchema,
        output: tweetOutputJsonSchema,
      },
      {
        path: '/generate/thread',
        method: 'POST',
        description: 'Create Twitter thread content from a topic/outline',
        price: PRICING.thread,
        accepts: [{
          scheme: 'exact',
          price: PRICING.thread,
          network: NETWORK,
          payTo: PAY_TO,
        }],
        input: threadInputJsonSchema,
        output: threadOutputJsonSchema,
      },
      {
        path: '/generate/summary',
        method: 'POST',
        description: 'Summarize articles/content into digestible formats',
        price: PRICING.summary,
        accepts: [{
          scheme: 'exact',
          price: PRICING.summary,
          network: NETWORK,
          payTo: PAY_TO,
        }],
        input: summaryInputJsonSchema,
        output: summaryOutputJsonSchema,
      },
    ],
  });
});

// ============================================================
// PAID ENDPOINTS
// ============================================================

app.post('/generate/tweet', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = TweetInputSchema.parse(req.body);
    const result = await generateTweet(input);
    res.json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
    } else {
      next(error);
    }
  }
});

app.post('/generate/thread', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = ThreadInputSchema.parse(req.body);
    const result = await generateThread(input);
    res.json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
    } else {
      next(error);
    }
  }
});

app.post('/generate/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = SummaryInputSchema.parse(req.body);
    const result = await generateSummary(input);
    res.json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
    } else {
      next(error);
    }
  }
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║      🚀 UPSKILL Content Generation x402 API (Full) 🚀         ║
╠════════════════════════════════════════════════════════════════╣
║  Server: http://localhost:${PORT}                               ║
║  Mode: Mock x402 (uncomment middleware for production)         ║
║                                                                ║
║  x402: ${NETWORK} → ${PAY_TO.slice(0, 10)}...   ║
║                                                                ║
║  POST /generate/tweet   ${PRICING.tweet}                               ║
║  POST /generate/thread  ${PRICING.thread}                               ║
║  POST /generate/summary ${PRICING.summary}                               ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

export default app;
