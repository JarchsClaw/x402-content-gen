# UPSKILL Content Generation x402 API

AI-powered content generation skills that other agents can pay to use via the [x402 protocol](https://docs.cdp.coinbase.com/x402/welcome).

## Skills

| Endpoint | Description | Price |
|----------|-------------|-------|
| `POST /generate/tweet` | Generate engaging tweets on any topic | $0.02 |
| `POST /generate/thread` | Create Twitter thread content | $0.05 |
| `POST /generate/summary` | Summarize content into digestible formats | $0.03 |

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Run in development
npm run dev

# Build for production
npm run build
npm start
```

## Configuration

Edit `.env`:

```bash
# Your wallet address (Base mainnet)
PAY_TO_ADDRESS=0xede1a30a8b04cca77ecc8d690c552ac7b0d63817

# Network: Base mainnet or Sepolia testnet
X402_NETWORK=eip155:8453        # mainnet
# X402_NETWORK=eip155:84532     # testnet

# Facilitator
X402_FACILITATOR_URL=https://api.cdp.coinbase.com/platform/v2/x402
```

## API Usage

### Service Discovery

```bash
curl http://localhost:4021/discover
```

Returns all endpoints with their x402 payment requirements and JSON schemas.

### Tweet Generator

```bash
curl -X POST http://localhost:4021/generate/tweet \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "AI agents and the future of work",
    "tone": "professional",
    "includeHashtags": true,
    "includeEmoji": true
  }'
```

**Input Schema:**
- `topic` (required): Topic for the tweet (1-500 chars)
- `tone`: `professional` | `casual` | `humorous` | `inspirational` | `informative`
- `includeHashtags`: Include hashtags (default: true)
- `includeEmoji`: Include emoji (default: true)
- `maxLength`: Max characters (50-280, default: 280)

### Thread Writer

```bash
curl -X POST http://localhost:4021/generate/thread \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "How x402 enables agent-to-agent payments",
    "threadLength": 5,
    "tone": "educational",
    "includeHook": true,
    "includeCTA": true
  }'
```

**Input Schema:**
- `topic` (required): Main topic (1-1000 chars)
- `outline`: Optional array of points to cover
- `threadLength`: Number of tweets (3-15, default: 5)
- `tone`: `educational` | `storytelling` | `listicle` | `argumentative` | `howto`
- `includeHook`: Attention-grabbing opener (default: true)
- `includeCTA`: Call-to-action ending (default: true)

### Summary Generator

```bash
curl -X POST http://localhost:4021/generate/summary \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Your long article or content here...",
    "format": "bullets",
    "targetAudience": "general",
    "maxLength": 500
  }'
```

**Input Schema:**
- `content` (required): Content to summarize (100-50000 chars)
- `format`: `bullets` | `paragraph` | `tldr` | `keypoints` | `executive`
- `maxLength`: Max summary length (50-2000, default: 500)
- `targetAudience`: `general` | `technical` | `executive` | `beginner`
- `preserveQuotes`: Include notable quotes (default: false)

## x402 Payment Flow

When an x402-enabled client calls a paid endpoint:

1. **Initial Request** → Server returns `402 Payment Required` with payment instructions
2. **Client Signs Payment** → Creates USDC payment signature for the amount
3. **Retry with Payment** → Includes `X-Payment-Signature` header
4. **Server Verifies** → Validates payment via facilitator
5. **Returns Content** → Sends the generated content

## For AI Agents

Agents can discover this service via the [x402 Bazaar](https://docs.cdp.coinbase.com/x402/bazaar):

```typescript
// Using x402 client SDK
import { HTTPFacilitatorClient } from '@x402/core/http';
import { withBazaar } from '@x402/extensions/bazaar';

const facilitator = withBazaar(
  new HTTPFacilitatorClient({ url: 'https://api.cdp.coinbase.com/platform/v2/x402' })
);

// Discover content generation services
const services = await facilitator.extensions.discovery.listResources({
  type: 'http',
  category: 'content-generation',
});
```

## Deployment

### Docker

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

### Railway / Render / Fly.io

1. Connect your repo
2. Set environment variables from `.env.example`
3. Build command: `npm run build`
4. Start command: `npm start`

### Production Checklist

- [ ] Set `PAY_TO_ADDRESS` to your wallet
- [ ] Configure `X402_NETWORK=eip155:8453` (Base mainnet)
- [ ] Set up CDP API keys for mainnet facilitator
- [ ] Enable real x402 middleware (uncomment in `server-x402.ts`)
- [ ] Add rate limiting and monitoring
- [ ] Set up HTTPS/TLS

## Architecture

```
src/
├── index.ts           # Simple server (mock payments)
├── server-x402.ts     # Full x402 middleware (production)
└── generators/
    ├── tweet.ts       # Tweet generation logic
    ├── thread.ts      # Thread writing logic
    └── summary.ts     # Summarization logic
```

## Pricing Rationale

- **Tweet ($0.02)**: Quick, single output generation
- **Thread ($0.05)**: Multi-part content with structure
- **Summary ($0.03)**: Processing input content + generation

All prices are in USDC on Base network.

## Part of UPSKILL Ecosystem

This service is designed to work with the broader UPSKILL agent economy where AI agents can:
- Discover services via Bazaar
- Pay for capabilities with stablecoins
- Compose skills into complex workflows

---

Built with ❤️ for the agent economy | [x402 Docs](https://docs.cdp.coinbase.com/x402)
