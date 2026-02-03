# ✍️ x402 Content Generation API

AI-powered content generation with x402 micropayments. Generate tweets, Twitter threads, and content summaries — all via simple HTTP requests with automatic USDC payments.

[![x402 Protocol](https://img.shields.io/badge/x402-enabled-blue)](https://docs.cdp.coinbase.com/x402)
[![Network](https://img.shields.io/badge/network-Base-0052FF)](https://base.org)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🎯 What This Does

This service provides three content generation capabilities that AI agents (or any HTTP client) can pay to use:

| Endpoint | Price | Description |
|----------|-------|-------------|
| `POST /generate/tweet` | **$0.02** | Generate engaging tweets with customizable tone |
| `POST /generate/thread` | **$0.05** | Create Twitter threads (3-15 tweets) |
| `POST /generate/summary` | **$0.03** | Summarize long content into digestible formats |

**Live Deployment:** `https://x402-content-gen.up.railway.app` *(update with your URL)*

---

## 🚀 Quick Start

### Using curl

```bash
# Generate a tweet
curl -X POST "https://your-deployment.com/generate/tweet" \
  -H "Content-Type: application/json" \
  -H "Payment-Signature: test" \
  -d '{
    "topic": "The future of AI agents",
    "tone": "professional",
    "includeHashtags": true
  }'

# Generate a thread
curl -X POST "https://your-deployment.com/generate/thread" \
  -H "Content-Type: application/json" \
  -H "Payment-Signature: test" \
  -d '{
    "topic": "How x402 enables agent-to-agent payments",
    "threadLength": 5,
    "tone": "educational"
  }'

# Summarize content
curl -X POST "https://your-deployment.com/generate/summary" \
  -H "Content-Type: application/json" \
  -H "Payment-Signature: test" \
  -d '{
    "content": "Your long article text goes here...",
    "format": "bullets",
    "maxLength": 500
  }'
```

### Using JavaScript

```javascript
import { x402Client, wrapFetchWithPayment } from '@x402/fetch';
import { registerExactEvmScheme } from '@x402/evm/exact/client';

// Initialize x402 client with your wallet
const client = new x402Client();
registerExactEvmScheme(client, { signer: yourWalletSigner });

const fetchWithPayment = wrapFetchWithPayment(fetch, client);

// Generate a tweet - payment happens automatically!
const response = await fetchWithPayment(
  'https://your-deployment.com/generate/tweet',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: 'Decentralized AI',
      tone: 'casual',
      includeEmoji: true
    })
  }
);

const result = await response.json();
console.log(result.tweet);
// "🔥 Just thinking about Decentralized AI - honestly, this is the kind of thing..."
```

### Using Python

```python
import requests

url = "https://your-deployment.com/generate/tweet"
headers = {
    "Content-Type": "application/json",
    "Payment-Signature": "test"  # For testing only
}
payload = {
    "topic": "Web3 and AI convergence",
    "tone": "professional",
    "includeHashtags": True
}

response = requests.post(url, json=payload, headers=headers)
result = response.json()
print(result["tweet"])
```

---

## 💰 Pricing Table

| Endpoint | Price (USDC) | Use Case |
|----------|-------------|----------|
| Tweet Generator | $0.02 | Quick social media content |
| Thread Writer | $0.05 | Multi-part storytelling, education |
| Summary Generator | $0.03 | Article digests, TL;DRs |

All payments are in **USDC on Base** (mainnet: `eip155:8453`).

---

## 📡 Endpoints

### 1. Tweet Generator — `POST /generate/tweet`

Generate engaging tweets on any topic.

**Request Body:**
```json
{
  "topic": "AI agents and the future of work",
  "tone": "professional",
  "includeHashtags": true,
  "includeEmoji": true,
  "maxLength": 280
}
```

**Parameters:**
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `topic` | string | Yes | — | Topic for the tweet (1-500 chars) |
| `tone` | string | No | `casual` | `professional`, `casual`, `humorous`, `inspirational`, `informative` |
| `includeHashtags` | boolean | No | `true` | Include relevant hashtags |
| `includeEmoji` | boolean | No | `true` | Include emoji |
| `maxLength` | number | No | `280` | Max characters (50-280) |

**Response:**
```json
{
  "tweet": "🎯 Insight: AI agents and the future of work is reshaping how we think about success in this space. The data speaks for itself.\n\n#Agents #Future #Work",
  "characterCount": 156,
  "hashtags": ["#Agents", "#Future", "#Work"],
  "suggestedPostTime": "12:00 PM (local time)"
}
```

---

### 2. Thread Writer — `POST /generate/thread`

Create Twitter threads from a topic or outline.

**Request Body:**
```json
{
  "topic": "How x402 enables agent-to-agent payments",
  "threadLength": 5,
  "tone": "educational",
  "includeHook": true,
  "includeCTA": true
}
```

**Parameters:**
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `topic` | string | Yes | — | Main topic (1-1000 chars) |
| `outline` | string[] | No | — | Optional outline points |
| `threadLength` | number | No | `5` | Number of tweets (3-15) |
| `tone` | string | No | `educational` | `educational`, `storytelling`, `listicle`, `argumentative`, `howto` |
| `includeHook` | boolean | No | `true` | Attention-grabbing opener |
| `includeCTA` | boolean | No | `true` | Call-to-action ending |

**Response:**
```json
{
  "thread": [
    {
      "position": 1,
      "content": "🧵 Thread: Everything you need to know about How x402 enables agent-to-agent payments\n\nA thread 🧵👇",
      "characterCount": 98
    },
    {
      "position": 2,
      "content": "First, Understanding the fundamentals of x402 is crucial for anyone starting out.",
      "characterCount": 85
    },
    {
      "position": 3,
      "content": "Next, The key components include several interconnected elements that work together.",
      "characterCount": 89
    }
  ],
  "totalTweets": 5,
  "topic": "How x402 enables agent-to-agent payments",
  "estimatedReadTime": "2 min",
  "hashtags": ["#X402", "#Enables"]
}
```

---

### 3. Summary Generator — `POST /generate/summary`

Summarize long content into digestible formats.

**Request Body:**
```json
{
  "content": "Your long article or content goes here. It should be at least 100 characters...",
  "format": "bullets",
  "maxLength": 500,
  "targetAudience": "general",
  "preserveQuotes": false
}
```

**Parameters:**
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `content` | string | Yes | — | Content to summarize (100-50000 chars) |
| `format` | string | No | `bullets` | `bullets`, `paragraph`, `tldr`, `keypoints`, `executive` |
| `maxLength` | number | No | `500` | Max summary length (50-2000) |
| `targetAudience` | string | No | `general` | `general`, `technical`, `executive`, `beginner` |
| `preserveQuotes` | boolean | No | `false` | Include notable quotes |

**Response:**
```json
{
  "summary": "• Key point extracted from the content\n• Another important insight\n• Third major takeaway",
  "format": "bullets",
  "keyPoints": [
    "Key point extracted from the content",
    "Another important insight",
    "Third major takeaway"
  ],
  "wordCount": 45,
  "originalWordCount": 500,
  "compressionRatio": "91.0% reduction",
  "readingTime": "1 min read",
  "quotes": []
}
```

---

## 🔐 x402 Payment Integration

### How It Works

1. **Request without payment** → Server returns `402 Payment Required`
2. **Client signs USDC payment** → Using x402 SDK with their wallet
3. **Retry with signature** → Include `Payment-Signature` header
4. **Server verifies & responds** → Returns generated content

### 402 Response Format

When you call a paid endpoint without payment:

```json
{
  "error": "Payment Required",
  "message": "This endpoint requires payment via x402 protocol",
  "x402Version": 2,
  "accepts": [
    {
      "scheme": "exact",
      "price": "$0.02",
      "network": "eip155:8453",
      "payTo": "0xede1a30a8b04cca77ecc8d690c552ac7b0d63817"
    }
  ],
  "facilitator": "https://api.cdp.coinbase.com/platform/v2/x402"
}
```

### JavaScript Integration

```javascript
import { x402Client, wrapFetchWithPayment } from '@x402/fetch';
import { registerExactEvmScheme } from '@x402/evm/exact/client';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

// Create wallet client
const account = privateKeyToAccount(process.env.PRIVATE_KEY);
const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http()
});

// Set up x402 client
const client = new x402Client();
registerExactEvmScheme(client, { signer: walletClient });

// Wrap fetch with automatic payments
const fetchWithPayment = wrapFetchWithPayment(fetch, client);

// Generate content
async function generateTweet(topic, tone = 'casual') {
  const response = await fetchWithPayment(
    'https://your-deployment.com/generate/tweet',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, tone })
    }
  );
  return response.json();
}

async function generateThread(topic, length = 5) {
  const response = await fetchWithPayment(
    'https://your-deployment.com/generate/thread',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        topic, 
        threadLength: length,
        tone: 'educational'
      })
    }
  );
  return response.json();
}

async function summarize(content, format = 'bullets') {
  const response = await fetchWithPayment(
    'https://your-deployment.com/generate/summary',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, format })
    }
  );
  return response.json();
}
```

---

## 🛠️ Self-Hosting

### 1. Clone & Install

```bash
git clone https://github.com/JarchsClaw/x402-content-gen.git
cd x402-content-gen
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
# Your wallet to receive payments
PAY_TO_ADDRESS=0xYourWalletAddress

# Network
X402_NETWORK=eip155:8453    # Base mainnet

# Facilitator
X402_FACILITATOR_URL=https://api.cdp.coinbase.com/platform/v2/x402

# Port
PORT=4021
```

### 3. Run

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### 4. Deploy

**Railway:**
```bash
railway init
railway up
```

**Docker:**
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
ENV NODE_ENV=production
EXPOSE 4021
CMD ["node", "dist/index.js"]
```

```bash
docker build -t x402-content-gen .
docker run -p 4021:4021 -e PAY_TO_ADDRESS=0x... x402-content-gen
```

---

## 🔍 Service Discovery

For AI agents and the x402 Bazaar:

```bash
# Health check
curl https://your-deployment.com/health

# Service discovery with schemas
curl https://your-deployment.com/discover
```

**Discovery Response:**
```json
{
  "name": "UPSKILL Content Generation",
  "description": "AI-powered content generation skills for tweets, threads, and summaries",
  "version": "1.0.0",
  "x402": {
    "version": 2,
    "network": "eip155:8453",
    "payTo": "0x...",
    "facilitator": "https://api.cdp.coinbase.com/platform/v2/x402"
  },
  "endpoints": [...]
}
```

---

## 💡 Use Cases

### Social Media Automation
```javascript
// Generate and post daily content
const tweet = await generateTweet("Today's crypto market insights", "professional");
await twitterClient.tweet(tweet.tweet);
```

### Content Repurposing
```javascript
// Turn article into Twitter thread
const article = await fetch('https://example.com/article').then(r => r.text());
const summary = await summarize(article, 'keypoints');
const thread = await generateThread(summary.summary, 7);
```

### AI Agent Content
```javascript
// AI agent creates its own social presence
const topic = await agent.getCurrentInterest();
const tweet = await generateTweet(topic, "casual");
await agent.postToTwitter(tweet.tweet);
```

---

## 📚 Related Documentation

- [API Reference](./API.md) — Complete endpoint documentation
- [Integration Guide](./INTEGRATION.md) — Step-by-step integration tutorial
- [x402 Protocol Docs](https://docs.cdp.coinbase.com/x402/welcome)
- [x402 Bazaar](https://docs.cdp.coinbase.com/x402/bazaar)

---

## 🤝 Part of UPSKILL Ecosystem

This service is designed for the **agent economy** where AI agents can:
- 🔍 Discover services via the Bazaar
- 💸 Pay for capabilities with USDC
- ✍️ Generate content autonomously

---

## 📄 License

MIT — built for the open agent economy.
