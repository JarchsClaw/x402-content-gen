# Integration Guide — x402 Content Generation

This guide walks you through integrating the x402 Content Generation API into your application or AI agent.

## Table of Contents

1. [Understanding x402](#understanding-x402)
2. [Quick Start (Testing)](#quick-start-testing)
3. [Production Integration](#production-integration)
4. [Language Examples](#language-examples)
5. [AI Agent Integration](#ai-agent-integration)
6. [Use Case Examples](#use-case-examples)
7. [Common Issues & Solutions](#common-issues--solutions)
8. [Best Practices](#best-practices)

---

## Understanding x402

x402 is a payment protocol that uses HTTP status code 402 (Payment Required) to enable machine-to-machine micropayments.

### Payment Flow

```
┌─────────┐         ┌─────────┐         ┌─────────────┐
│ Client  │         │  API    │         │ Facilitator │
└────┬────┘         └────┬────┘         └──────┬──────┘
     │                   │                      │
     │  1. POST /generate/tweet                │
     │ ────────────────► │                      │
     │                   │                      │
     │  2. 402 Payment Required ($0.02)        │
     │ ◄──────────────── │                      │
     │                   │                      │
     │  3. Sign USDC payment                   │
     │ ─ ─ ─ ─ ─ ─ ─ ─ ─►│                      │
     │                   │                      │
     │  4. POST /generate/tweet + signature    │
     │ ────────────────► │                      │
     │                   │  5. Verify payment   │
     │                   │ ────────────────────►│
     │                   │                      │
     │                   │  6. Payment valid    │
     │                   │ ◄────────────────────│
     │                   │                      │
     │  7. 200 OK + generated tweet            │
     │ ◄──────────────── │                      │
```

---

## Quick Start (Testing)

For development and testing, you can bypass real payments:

```bash
# Add any value as Payment-Signature header
curl -X POST "http://localhost:4021/generate/tweet" \
  -H "Content-Type: application/json" \
  -H "Payment-Signature: test" \
  -d '{"topic": "Hello world", "tone": "casual"}'
```

---

## Production Integration

### Prerequisites

1. **Wallet with USDC on Base**
   - Get USDC on Base mainnet
   - Have your private key or wallet signer ready

2. **x402 SDK**
   ```bash
   npm install @x402/fetch @x402/evm @x402/core viem
   ```

### Complete Setup

```typescript
import { x402Client, wrapFetchWithPayment } from '@x402/fetch';
import { registerExactEvmScheme } from '@x402/evm/exact/client';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

const API_URL = 'https://your-deployment.com';

// Step 1: Set up wallet
const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http()
});

// Step 2: Initialize x402 client
const client = new x402Client();
registerExactEvmScheme(client, { signer: walletClient });
const fetchWithPayment = wrapFetchWithPayment(fetch, client);

// Step 3: Create helper functions
async function generateTweet(topic: string, options = {}) {
  const response = await fetchWithPayment(`${API_URL}/generate/tweet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, ...options })
  });
  return response.json();
}

async function generateThread(topic: string, options = {}) {
  const response = await fetchWithPayment(`${API_URL}/generate/thread`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, ...options })
  });
  return response.json();
}

async function summarize(content: string, options = {}) {
  const response = await fetchWithPayment(`${API_URL}/generate/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, ...options })
  });
  return response.json();
}

// Step 4: Use the functions
const tweet = await generateTweet('Web3 and AI', { tone: 'professional' });
console.log(tweet.tweet);

const thread = await generateThread('Understanding x402', { threadLength: 7 });
console.log(thread.thread);

const summary = await summarize(longArticle, { format: 'bullets' });
console.log(summary.summary);
```

---

## Language Examples

### JavaScript/TypeScript

```typescript
// Full working example
import { x402Client, wrapFetchWithPayment } from '@x402/fetch';
import { registerExactEvmScheme } from '@x402/evm/exact/client';

const API_URL = 'https://your-deployment.com';

async function main() {
  // Set up (as shown above)
  const fetchWithPayment = /* ... */;

  // Generate professional tweet about AI
  const tweetResult = await fetchWithPayment(`${API_URL}/generate/tweet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: 'The future of autonomous AI agents',
      tone: 'professional',
      includeHashtags: true,
      includeEmoji: true
    })
  }).then(r => r.json());

  console.log('Generated Tweet:');
  console.log(tweetResult.tweet);
  console.log(`Characters: ${tweetResult.characterCount}/280`);

  // Generate educational thread
  const threadResult = await fetchWithPayment(`${API_URL}/generate/thread`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: 'How to build your first AI agent',
      threadLength: 7,
      tone: 'howto',
      includeHook: true,
      includeCTA: true
    })
  }).then(r => r.json());

  console.log('\nGenerated Thread:');
  threadResult.thread.forEach((t: any) => {
    console.log(`\n[${t.position}/${threadResult.totalTweets}]`);
    console.log(t.content);
  });

  // Summarize an article
  const article = `
    Artificial intelligence has transformed how businesses operate...
    [Long article content here, 100+ chars required]
  `;

  const summaryResult = await fetchWithPayment(`${API_URL}/generate/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: article,
      format: 'keypoints',
      targetAudience: 'executive',
      maxLength: 300
    })
  }).then(r => r.json());

  console.log('\nSummary:');
  console.log(summaryResult.summary);
  console.log(`Compression: ${summaryResult.compressionRatio}`);
}

main();
```

### Python

```python
import requests
import os

API_URL = "https://your-deployment.com"
HEADERS = {
    "Content-Type": "application/json",
    "Payment-Signature": "test"  # Use real signature in production
}

def generate_tweet(topic: str, tone: str = "casual", **kwargs) -> dict:
    """Generate a tweet. Costs $0.02"""
    payload = {"topic": topic, "tone": tone, **kwargs}
    response = requests.post(
        f"{API_URL}/generate/tweet",
        json=payload,
        headers=HEADERS
    )
    response.raise_for_status()
    return response.json()

def generate_thread(topic: str, length: int = 5, tone: str = "educational", **kwargs) -> dict:
    """Generate a Twitter thread. Costs $0.05"""
    payload = {"topic": topic, "threadLength": length, "tone": tone, **kwargs}
    response = requests.post(
        f"{API_URL}/generate/thread",
        json=payload,
        headers=HEADERS
    )
    response.raise_for_status()
    return response.json()

def summarize(content: str, format: str = "bullets", **kwargs) -> dict:
    """Summarize content. Costs $0.03"""
    payload = {"content": content, "format": format, **kwargs}
    response = requests.post(
        f"{API_URL}/generate/summary",
        json=payload,
        headers=HEADERS
    )
    response.raise_for_status()
    return response.json()

# Usage
if __name__ == "__main__":
    # Generate a tweet
    tweet = generate_tweet(
        "The intersection of AI and blockchain",
        tone="professional",
        includeHashtags=True
    )
    print(f"Tweet: {tweet['tweet']}")
    print(f"Characters: {tweet['characterCount']}")

    # Generate a thread
    thread = generate_thread(
        "Why micropayments matter for AI agents",
        length=5,
        tone="educational"
    )
    for t in thread["thread"]:
        print(f"\n[{t['position']}] {t['content']}")

    # Summarize content
    article = """
    [Your long article content here...]
    """ * 10  # Ensure 100+ chars
    
    summary = summarize(article, format="tldr", targetAudience="general")
    print(f"\nTL;DR: {summary['summary']}")
```

### Go

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
)

const apiURL = "https://your-deployment.com"

type TweetRequest struct {
    Topic           string `json:"topic"`
    Tone            string `json:"tone,omitempty"`
    IncludeHashtags bool   `json:"includeHashtags,omitempty"`
    IncludeEmoji    bool   `json:"includeEmoji,omitempty"`
}

type TweetResponse struct {
    Tweet             string   `json:"tweet"`
    CharacterCount    int      `json:"characterCount"`
    Hashtags          []string `json:"hashtags"`
    SuggestedPostTime string   `json:"suggestedPostTime"`
}

func generateTweet(req TweetRequest) (*TweetResponse, error) {
    body, _ := json.Marshal(req)
    
    httpReq, _ := http.NewRequest("POST", apiURL+"/generate/tweet", bytes.NewBuffer(body))
    httpReq.Header.Set("Content-Type", "application/json")
    httpReq.Header.Set("Payment-Signature", "test") // Use real signature in production
    
    client := &http.Client{}
    resp, err := client.Do(httpReq)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    respBody, _ := io.ReadAll(resp.Body)
    
    var result TweetResponse
    json.Unmarshal(respBody, &result)
    
    return &result, nil
}

func main() {
    tweet, err := generateTweet(TweetRequest{
        Topic:           "Golang and AI",
        Tone:            "professional",
        IncludeHashtags: true,
        IncludeEmoji:    true,
    })
    
    if err != nil {
        panic(err)
    }
    
    fmt.Printf("Tweet: %s\n", tweet.Tweet)
    fmt.Printf("Characters: %d\n", tweet.CharacterCount)
}
```

---

## AI Agent Integration

### LangChain Tools

```typescript
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

// Assume fetchWithPayment is set up
const fetchWithPayment = /* ... */;

const tweetGeneratorTool = new DynamicStructuredTool({
  name: "generate_tweet",
  description: "Generate an engaging tweet about a topic. Costs $0.02 per call.",
  schema: z.object({
    topic: z.string().describe("The topic to tweet about"),
    tone: z.enum(["professional", "casual", "humorous", "inspirational", "informative"])
      .optional()
      .describe("The tone of the tweet"),
  }),
  func: async ({ topic, tone }) => {
    const response = await fetchWithPayment(
      'https://api.example.com/generate/tweet',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, tone: tone || 'casual' })
      }
    );
    const data = await response.json();
    return data.tweet;
  },
});

const threadWriterTool = new DynamicStructuredTool({
  name: "write_twitter_thread",
  description: "Create a Twitter thread about a topic. Costs $0.05 per call.",
  schema: z.object({
    topic: z.string().describe("The main topic for the thread"),
    length: z.number().min(3).max(15).optional().describe("Number of tweets in thread"),
  }),
  func: async ({ topic, length }) => {
    const response = await fetchWithPayment(
      'https://api.example.com/generate/thread',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, threadLength: length || 5 })
      }
    );
    const data = await response.json();
    return data.thread.map((t: any) => t.content).join('\n\n---\n\n');
  },
});

const summarizerTool = new DynamicStructuredTool({
  name: "summarize_content",
  description: "Summarize long content into a digestible format. Costs $0.03 per call.",
  schema: z.object({
    content: z.string().describe("The content to summarize (100+ chars)"),
    format: z.enum(["bullets", "paragraph", "tldr"]).optional()
      .describe("Output format for the summary"),
  }),
  func: async ({ content, format }) => {
    const response = await fetchWithPayment(
      'https://api.example.com/generate/summary',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, format: format || 'bullets' })
      }
    );
    const data = await response.json();
    return data.summary;
  },
});

// Add to your agent
const tools = [tweetGeneratorTool, threadWriterTool, summarizerTool];
```

### AutoGPT Plugin

```python
from typing import Optional

class ContentGenerationPlugin:
    """Plugin for generating social media content via x402 API."""
    
    def __init__(self, api_url: str, payment_client):
        self.api_url = api_url
        self.client = payment_client
    
    async def generate_tweet(
        self, 
        topic: str, 
        tone: str = "casual",
        include_hashtags: bool = True
    ) -> str:
        """Generate a tweet. Costs $0.02."""
        response = await self.client.post(
            f"{self.api_url}/generate/tweet",
            json={
                "topic": topic,
                "tone": tone,
                "includeHashtags": include_hashtags
            }
        )
        data = response.json()
        return data["tweet"]
    
    async def create_thread(
        self,
        topic: str,
        length: int = 5,
        tone: str = "educational"
    ) -> list[str]:
        """Create a Twitter thread. Costs $0.05."""
        response = await self.client.post(
            f"{self.api_url}/generate/thread",
            json={
                "topic": topic,
                "threadLength": length,
                "tone": tone
            }
        )
        data = response.json()
        return [t["content"] for t in data["thread"]]
    
    async def summarize(
        self,
        content: str,
        format: str = "bullets"
    ) -> str:
        """Summarize content. Costs $0.03."""
        response = await self.client.post(
            f"{self.api_url}/generate/summary",
            json={
                "content": content,
                "format": format
            }
        )
        data = response.json()
        return data["summary"]
```

---

## Use Case Examples

### 1. Social Media Automation

```typescript
// Daily content generation for a Twitter account
async function generateDailyContent() {
  const topics = [
    "AI developments",
    "Web3 innovations", 
    "Developer productivity tips"
  ];
  
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  
  // Morning tweet
  const morningTweet = await generateTweet(randomTopic, {
    tone: 'inspirational',
    includeEmoji: true
  });
  
  // Schedule it
  await scheduleTwitterPost(morningTweet.tweet, '09:00');
  
  // Afternoon educational thread
  const thread = await generateThread(`Understanding ${randomTopic}`, {
    threadLength: 5,
    tone: 'educational'
  });
  
  await scheduleTwitterThread(thread.thread, '14:00');
}
```

### 2. Content Repurposing Pipeline

```typescript
// Turn a blog post into social content
async function repurposeBlogPost(blogUrl: string) {
  // Fetch the blog post
  const article = await fetch(blogUrl).then(r => r.text());
  
  // Create a summary
  const summary = await summarize(article, {
    format: 'keypoints',
    maxLength: 500
  });
  
  // Generate a thread from the key points
  const thread = await generateThread(summary.keyPoints.join('. '), {
    threadLength: 7,
    tone: 'educational'
  });
  
  // Generate a teaser tweet
  const teaser = await generateTweet(
    `New blog post: ${summary.keyPoints[0]}`,
    { tone: 'professional' }
  );
  
  return {
    teaserTweet: teaser.tweet,
    thread: thread.thread,
    summary: summary.summary
  };
}
```

### 3. News Digest Bot

```typescript
// Summarize daily news for followers
async function createNewsSummary(newsItems: string[]) {
  const combined = newsItems.join('\n\n');
  
  // Create executive summary
  const summary = await summarize(combined, {
    format: 'executive',
    targetAudience: 'general',
    maxLength: 1000
  });
  
  // Generate shareable thread
  const thread = await generateThread(
    'Today\'s key developments: ' + summary.keyPoints.slice(0, 3).join(', '),
    {
      threadLength: 5,
      tone: 'informative'
    }
  );
  
  return { summary, thread };
}
```

---

## Common Issues & Solutions

### 1. "Content too short" for summarization

**Problem:** Summary endpoint requires at least 100 characters.

**Solution:**
```javascript
if (content.length < 100) {
  throw new Error('Content must be at least 100 characters for summarization');
}
```

### 2. Thread tweets are too long

**Problem:** Individual tweets exceed 280 characters.

**Solution:** The API automatically truncates, but you can also:
```javascript
const thread = await generateThread(topic, {
  threadLength: 5,
  // Shorter outline points = shorter tweets
  outline: [
    "Brief point one",
    "Brief point two"
  ]
});
```

### 3. Hashtags not relevant

**Problem:** Auto-generated hashtags don't fit your brand.

**Solution:**
```javascript
const tweet = await generateTweet(topic, { includeHashtags: false });
// Add your own hashtags
tweet.tweet += '\n\n#YourBrand #YourHashtag';
```

### 4. Wrong tone for your audience

**Problem:** Generated content doesn't match your voice.

**Solution:**
- Use the `tone` parameter carefully
- Post-process the output to match your style
- Provide more specific topics that guide the tone

```javascript
// Be specific in your topic
const tweet = await generateTweet(
  "Why developers should learn Rust - a pragmatic take",  // More specific
  { tone: 'informative' }
);
```

### 5. Payment failures

**Problem:** 402 errors even with payment signature.

**Solution:**
- Ensure sufficient USDC balance on Base
- Check wallet signer is properly configured
- Verify you're using the correct network (mainnet vs testnet)

---

## Best Practices

### 1. Review Before Publishing

```typescript
async function generateAndReview(topic: string) {
  const tweet = await generateTweet(topic);
  
  // Always review generated content
  console.log('Generated:', tweet.tweet);
  console.log('Publish? (y/n)');
  
  const approved = await getUserApproval();
  if (approved) {
    await publishTweet(tweet.tweet);
  }
}
```

### 2. Track Your Costs

```typescript
const costs = { tweet: 0.02, thread: 0.05, summary: 0.03 };
let totalSpent = 0;

async function generateTweetTracked(topic: string) {
  const result = await generateTweet(topic);
  totalSpent += costs.tweet;
  console.log(`Total spent: $${totalSpent.toFixed(2)}`);
  return result;
}
```

### 3. Cache Common Requests

```typescript
const cache = new Map();

async function generateTweetCached(topic: string) {
  const key = `tweet:${topic}`;
  
  if (cache.has(key)) {
    console.log('Using cached tweet');
    return cache.get(key);
  }
  
  const result = await generateTweet(topic);
  cache.set(key, result);
  return result;
}
```

### 4. Handle Errors Gracefully

```typescript
async function safeGenerate(topic: string) {
  try {
    return await generateTweet(topic);
  } catch (error) {
    if (error.status === 402) {
      console.error('Payment required - check your USDC balance');
    } else if (error.status === 400) {
      console.error('Invalid input:', error.message);
    } else {
      console.error('Generation failed:', error.message);
    }
    return null;
  }
}
```

### 5. Batch for Efficiency

```typescript
// Generate week's content in one session
async function generateWeeklyContent() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const topics = getWeeklyTopics();
  
  const content = await Promise.all(
    days.map((day, i) => generateTweet(topics[i], {
      tone: i < 2 ? 'professional' : 'casual'  // Vary tone
    }))
  );
  
  return content.map((c, i) => ({
    day: days[i],
    tweet: c.tweet
  }));
}
```

---

## Support

- **Documentation**: See [API.md](./API.md) for full endpoint reference
- **x402 Protocol**: [docs.cdp.coinbase.com/x402](https://docs.cdp.coinbase.com/x402)
- **Issues**: GitHub Issues on this repo
