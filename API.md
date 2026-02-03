# API Reference — x402 Content Generation

Complete API documentation for all endpoints.

## Base URL

```
Production: https://your-deployment.com
Local:      http://localhost:4021
```

## Authentication

All paid endpoints require x402 payment. Include one of these headers:
- `Payment-Signature: <signature>` 
- `X-Payment-Signature: <signature>`

For testing, use `Payment-Signature: test` (only works in mock mode).

---

## Free Endpoints

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "@upskill/content-gen",
  "version": "1.0.0",
  "mode": "mock-x402",
  "x402": {
    "network": "eip155:8453",
    "facilitator": "https://api.cdp.coinbase.com/platform/v2/x402",
    "payTo": "0xede1a30a8b04cca77ecc8d690c552ac7b0d63817"
  }
}
```

### Service Discovery

```http
GET /discover
```

Returns service metadata and all endpoint schemas for Bazaar integration.

**Response:**
```json
{
  "name": "UPSKILL Content Generation",
  "description": "AI-powered content generation skills for tweets, threads, and summaries",
  "version": "1.0.0",
  "x402": {
    "version": 2,
    "network": "eip155:8453",
    "payTo": "0xede1a30a8b04cca77ecc8d690c552ac7b0d63817",
    "facilitator": "https://api.cdp.coinbase.com/platform/v2/x402"
  },
  "bazaar": {
    "discoverable": true,
    "category": "content-generation",
    "tags": ["content", "twitter", "social-media", "ai", "generation"]
  },
  "endpoints": [
    {
      "path": "/generate/tweet",
      "method": "POST",
      "description": "Generate engaging tweets on any topic",
      "price": "$0.02",
      "input": { /* JSON Schema */ },
      "output": { /* JSON Schema */ }
    }
  ]
}
```

---

## Paid Endpoints

### Tweet Generator

Generate engaging tweets on any topic with customizable tone and style.

```http
POST /generate/tweet
```

**Price:** $0.02 USDC

#### Request Body

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `topic` | string | **Yes** | — | Topic or subject for the tweet (1-500 chars) |
| `tone` | string | No | `casual` | Desired tone of the tweet |
| `includeHashtags` | boolean | No | `true` | Whether to include relevant hashtags |
| `includeEmoji` | boolean | No | `true` | Whether to include emoji |
| `maxLength` | number | No | `280` | Maximum character length (50-280) |

**Tone Options:**
- `professional` — Business-appropriate, data-driven
- `casual` — Friendly, conversational
- `humorous` — Witty, entertaining
- `inspirational` — Motivational, uplifting
- `informative` — Educational, fact-focused

#### Request Example

```bash
curl -X POST "http://localhost:4021/generate/tweet" \
  -H "Content-Type: application/json" \
  -H "Payment-Signature: test" \
  -d '{
    "topic": "AI agents and the future of work",
    "tone": "professional",
    "includeHashtags": true,
    "includeEmoji": true,
    "maxLength": 280
  }'
```

#### Success Response (200)

```json
{
  "tweet": "🎯 Insight: AI agents and the future of work is reshaping how we think about success in this space. The data speaks for itself.\n\n#Agents #Future #Work",
  "characterCount": 156,
  "hashtags": ["#Agents", "#Future", "#Work"],
  "suggestedPostTime": "12:00 PM (local time)"
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `tweet` | string | The generated tweet text |
| `characterCount` | number | Length of the tweet |
| `hashtags` | string[] | Hashtags included in the tweet |
| `suggestedPostTime` | string | Optimal time to post |

---

### Thread Writer

Create Twitter threads with hook, content, and call-to-action.

```http
POST /generate/thread
```

**Price:** $0.05 USDC

#### Request Body

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `topic` | string | **Yes** | — | Main topic or thesis (1-1000 chars) |
| `outline` | string[] | No | — | Optional array of points to cover |
| `threadLength` | number | No | `5` | Number of tweets (3-15) |
| `tone` | string | No | `educational` | Style/format of the thread |
| `includeHook` | boolean | No | `true` | Include attention-grabbing opener |
| `includeCTA` | boolean | No | `true` | Include call-to-action ending |

**Tone Options:**
- `educational` — Teaching, explaining concepts
- `storytelling` — Narrative arc, personal journey
- `listicle` — Numbered list format
- `argumentative` — Making a case, debate-style
- `howto` — Step-by-step tutorial

#### Request Example

```bash
curl -X POST "http://localhost:4021/generate/thread" \
  -H "Content-Type: application/json" \
  -H "Payment-Signature: test" \
  -d '{
    "topic": "How x402 enables agent-to-agent payments",
    "threadLength": 5,
    "tone": "educational",
    "includeHook": true,
    "includeCTA": true
  }'
```

#### Success Response (200)

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
    },
    {
      "position": 4,
      "content": "Additionally, Common misconceptions often lead people astray - here's the truth.",
      "characterCount": 84
    },
    {
      "position": 5,
      "content": "Follow for more insights like this!\n\n#X402 #Enables",
      "characterCount": 52
    }
  ],
  "totalTweets": 5,
  "topic": "How x402 enables agent-to-agent payments",
  "estimatedReadTime": "2 min",
  "hashtags": ["#X402", "#Enables"]
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `thread` | array | Array of tweet objects |
| `thread[].position` | number | Position in thread (1-indexed) |
| `thread[].content` | string | Tweet content |
| `thread[].characterCount` | number | Length of tweet |
| `totalTweets` | number | Total number of tweets |
| `topic` | string | The original topic |
| `estimatedReadTime` | string | Time to read the thread |
| `hashtags` | string[] | Suggested hashtags |

---

### Summary Generator

Summarize long content into various digestible formats.

```http
POST /generate/summary
```

**Price:** $0.03 USDC

#### Request Body

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `content` | string | **Yes** | — | Content to summarize (100-50000 chars) |
| `format` | string | No | `bullets` | Output format for the summary |
| `maxLength` | number | No | `500` | Maximum length of summary (50-2000) |
| `targetAudience` | string | No | `general` | Target audience for the summary |
| `preserveQuotes` | boolean | No | `false` | Include key quotes from original |

**Format Options:**
- `bullets` — Bullet point list
- `paragraph` — Flowing paragraph
- `tldr` — One-line summary
- `keypoints` — Numbered key points
- `executive` — Formal executive summary

**Target Audience Options:**
- `general` — General public
- `technical` — Technical professionals
- `executive` — Business executives
- `beginner` — Newcomers to the topic

#### Request Example

```bash
curl -X POST "http://localhost:4021/generate/summary" \
  -H "Content-Type: application/json" \
  -H "Payment-Signature: test" \
  -d '{
    "content": "Artificial intelligence has transformed numerous industries in recent years. The technology, which enables machines to learn from data and make decisions, has applications ranging from healthcare diagnostics to autonomous vehicles. In the healthcare sector, AI algorithms can analyze medical images with accuracy that rivals or exceeds human radiologists. Financial institutions use AI for fraud detection and algorithmic trading. The technology continues to evolve rapidly, with new breakthroughs in natural language processing and computer vision announced regularly.",
    "format": "bullets",
    "maxLength": 500,
    "targetAudience": "general"
  }'
```

#### Success Response (200)

```json
{
  "summary": "• Artificial intelligence has transformed numerous industries in recent years\n• The technology, which enables machines to learn from data and make decisions, has applications ranging from healthcare diagnostics to autonomous vehicles\n• In the healthcare sector, AI algorithms can analyze medical images with accuracy that rivals or exceeds human radiologists",
  "format": "bullets",
  "keyPoints": [
    "Artificial intelligence has transformed numerous industries in recent years",
    "The technology enables machines to learn from data and make decisions",
    "AI algorithms can analyze medical images with high accuracy"
  ],
  "wordCount": 48,
  "originalWordCount": 89,
  "compressionRatio": "46.1% reduction",
  "readingTime": "1 min read",
  "quotes": null
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `summary` | string | The generated summary |
| `format` | string | Format used for the summary |
| `keyPoints` | string[] | Extracted key points |
| `wordCount` | number | Word count of summary |
| `originalWordCount` | number | Word count of original |
| `compressionRatio` | string | How much content was compressed |
| `readingTime` | string | Estimated reading time |
| `quotes` | string[] \| null | Notable quotes (if `preserveQuotes: true`) |

---

## Error Responses

### 400 Bad Request — Validation Error

```json
{
  "error": "Invalid input",
  "details": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "String must contain at least 1 character(s)",
      "path": ["topic"]
    }
  ]
}
```

### 402 Payment Required

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

### 500 Internal Server Error

```json
{
  "error": "Internal server error",
  "message": "Detailed error message"
}
```

---

## Error Codes Summary

| Code | Description |
|------|-------------|
| `200` | Success |
| `400` | Invalid request body (validation failed) |
| `402` | Payment required (x402) |
| `500` | Server error |

---

## Rate Limits

No rate limits are currently enforced. Each request costs the specified price.

---

## Content Guidelines

The generator produces generic content based on templates and patterns. For production use:

1. **Review generated content** before posting
2. **Customize** the output to match your voice
3. **Check hashtags** for relevance and appropriateness
4. **Consider** the suggested post times as guidelines only

---

## Input Validation

### Topic (Tweet)
- Minimum: 1 character
- Maximum: 500 characters
- Required: Yes

### Topic (Thread)
- Minimum: 1 character
- Maximum: 1000 characters
- Required: Yes

### Content (Summary)
- Minimum: 100 characters
- Maximum: 50000 characters
- Required: Yes

### Character Limits
- Tweet `maxLength`: 50-280
- Summary `maxLength`: 50-2000
- Thread length: 3-15 tweets

---

## JSON Schemas

### Tweet Input Schema

```json
{
  "type": "object",
  "properties": {
    "topic": {
      "type": "string",
      "description": "Topic or subject for the tweet",
      "minLength": 1,
      "maxLength": 500
    },
    "tone": {
      "type": "string",
      "enum": ["professional", "casual", "humorous", "inspirational", "informative"],
      "default": "casual"
    },
    "includeHashtags": {
      "type": "boolean",
      "default": true
    },
    "includeEmoji": {
      "type": "boolean",
      "default": true
    },
    "maxLength": {
      "type": "number",
      "minimum": 50,
      "maximum": 280,
      "default": 280
    }
  },
  "required": ["topic"]
}
```

### Thread Input Schema

```json
{
  "type": "object",
  "properties": {
    "topic": {
      "type": "string",
      "minLength": 1,
      "maxLength": 1000
    },
    "outline": {
      "type": "array",
      "items": { "type": "string" }
    },
    "threadLength": {
      "type": "number",
      "minimum": 3,
      "maximum": 15,
      "default": 5
    },
    "tone": {
      "type": "string",
      "enum": ["educational", "storytelling", "listicle", "argumentative", "howto"],
      "default": "educational"
    },
    "includeHook": {
      "type": "boolean",
      "default": true
    },
    "includeCTA": {
      "type": "boolean",
      "default": true
    }
  },
  "required": ["topic"]
}
```

### Summary Input Schema

```json
{
  "type": "object",
  "properties": {
    "content": {
      "type": "string",
      "minLength": 100,
      "maxLength": 50000
    },
    "format": {
      "type": "string",
      "enum": ["bullets", "paragraph", "tldr", "keypoints", "executive"],
      "default": "bullets"
    },
    "maxLength": {
      "type": "number",
      "minimum": 50,
      "maximum": 2000,
      "default": 500
    },
    "targetAudience": {
      "type": "string",
      "enum": ["general", "technical", "executive", "beginner"],
      "default": "general"
    },
    "preserveQuotes": {
      "type": "boolean",
      "default": false
    }
  },
  "required": ["content"]
}
```

---

## Versioning

Current API version: **1.0.0**

The API follows semantic versioning. Breaking changes will increment the major version.
