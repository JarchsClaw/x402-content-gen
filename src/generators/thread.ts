/**
 * Thread Writer
 * Creates Twitter thread content from a topic or outline
 */

import { z } from 'zod';

export const ThreadInputSchema = z.object({
  topic: z.string().min(1).max(1000).describe('Main topic or thesis for the thread'),
  outline: z.array(z.string()).optional().describe('Optional outline points to cover'),
  threadLength: z.number().min(3).max(15).optional().default(5).describe('Number of tweets in the thread'),
  tone: z.enum(['educational', 'storytelling', 'listicle', 'argumentative', 'howto'])
    .optional()
    .default('educational')
    .describe('Style/format of the thread'),
  includeHook: z.boolean().optional().default(true).describe('Include attention-grabbing opening'),
  includeCTA: z.boolean().optional().default(true).describe('Include call-to-action at the end'),
});

export type ThreadInput = z.infer<typeof ThreadInputSchema>;

export interface ThreadTweet {
  position: number;
  content: string;
  characterCount: number;
}

export interface ThreadOutput {
  thread: ThreadTweet[];
  totalTweets: number;
  topic: string;
  estimatedReadTime: string;
  hashtags: string[];
}

const threadStyles = {
  educational: {
    hooks: [
      '🧵 Thread: Everything you need to know about',
      '📚 Let me break down',
      '🎓 A comprehensive guide to',
    ],
    transitions: ['First,', 'Next,', 'Additionally,', 'Furthermore,', 'Moreover,', 'Also important:'],
    ctas: ['Follow for more insights like this!', 'Retweet if you found this helpful 🙏', 'Bookmark this for later reference 📌'],
  },
  storytelling: {
    hooks: [
      '🧵 Story time:',
      '📖 Let me tell you about',
      '✨ This is the story of',
    ],
    transitions: ['It all started when', 'Then something changed:', 'The turning point came when', 'What happened next', 'And then'],
    ctas: ['What story would you like to hear next?', 'Drop a 🔥 if this resonated', 'Share your own story below 👇'],
  },
  listicle: {
    hooks: [
      '🔥 X things about',
      '💡 Top insights on',
      '📋 The ultimate list:',
    ],
    transitions: ['1/', '2/', '3/', '4/', '5/', '6/', '7/', '8/', '9/', '10/'],
    ctas: ['Which one surprised you most?', 'Save this list for later! 📌', 'Add your favorites in the replies 👇'],
  },
  argumentative: {
    hooks: [
      '🎯 Unpopular opinion:',
      '💭 Here\'s why',
      '⚡ Hot take:',
    ],
    transitions: ['Here\'s the thing:', 'Consider this:', 'The evidence shows:', 'Critics might say, but:', 'The reality is:'],
    ctas: ['Agree or disagree? Let me know 👇', 'Change my mind in the replies', 'RT if you see it too'],
  },
  howto: {
    hooks: [
      '🛠️ How to',
      '📝 Step-by-step guide:',
      '🎯 Master this:',
    ],
    transitions: ['Step 1:', 'Step 2:', 'Step 3:', 'Step 4:', 'Pro tip:', 'Bonus:'],
    ctas: ['Try this and let me know how it goes!', 'Tag someone who needs this', 'Follow for more tutorials 🔔'],
  },
};

export async function generateThread(input: ThreadInput): Promise<ThreadOutput> {
  const validated = ThreadInputSchema.parse(input);
  const { topic, outline, threadLength, tone, includeHook, includeCTA } = validated;
  
  const style = threadStyles[tone];
  const thread: ThreadTweet[] = [];
  
  // Generate hashtags from topic
  const topicWords = topic.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const hashtags = topicWords.slice(0, 2).map(w => `#${w.charAt(0).toUpperCase() + w.slice(1)}`);
  
  // Hook tweet
  if (includeHook) {
    const hook = style.hooks[Math.floor(Math.random() * style.hooks.length)];
    const hookTweet = `${hook} ${topic}\n\nA thread 🧵👇`;
    thread.push({
      position: 1,
      content: hookTweet,
      characterCount: hookTweet.length,
    });
  }
  
  // Content tweets
  const contentCount = threadLength - (includeHook ? 1 : 0) - (includeCTA ? 1 : 0);
  const points = outline || generateOutlinePoints(topic, contentCount, tone);
  
  for (let i = 0; i < Math.min(contentCount, points.length); i++) {
    const transition = tone === 'listicle' 
      ? `${i + 1}/${contentCount}`
      : style.transitions[i % style.transitions.length];
    
    let content = '';
    if (tone === 'listicle') {
      content = `${transition} ${points[i]}`;
    } else if (tone === 'howto') {
      content = `${style.transitions[i] || `Step ${i + 1}:`} ${points[i]}`;
    } else {
      content = `${transition} ${points[i]}`;
    }
    
    // Ensure each tweet is within limits
    if (content.length > 280) {
      content = content.slice(0, 277) + '...';
    }
    
    thread.push({
      position: thread.length + 1,
      content,
      characterCount: content.length,
    });
  }
  
  // CTA tweet
  if (includeCTA) {
    const cta = style.ctas[Math.floor(Math.random() * style.ctas.length)];
    const ctaTweet = `${cta}\n\n${hashtags.join(' ')}`;
    thread.push({
      position: thread.length + 1,
      content: ctaTweet,
      characterCount: ctaTweet.length,
    });
  }
  
  const totalWords = thread.reduce((acc, t) => acc + t.content.split(/\s+/).length, 0);
  const readTimeMinutes = Math.max(1, Math.ceil(totalWords / 200));
  
  return {
    thread,
    totalTweets: thread.length,
    topic,
    estimatedReadTime: `${readTimeMinutes} min`,
    hashtags,
  };
}

function generateOutlinePoints(topic: string, count: number, tone: string): string[] {
  // Generate mock outline points based on tone
  const points: string[] = [];
  
  const templates = {
    educational: [
      `Understanding the fundamentals of ${topic} is crucial for anyone starting out.`,
      `The key components include several interconnected elements that work together.`,
      `Common misconceptions often lead people astray - here's the truth.`,
      `Real-world applications show us how this works in practice.`,
      `The future of ${topic} looks promising with these emerging trends.`,
      `Experts agree on these core principles that drive success.`,
      `Here's what the research actually tells us about ${topic}.`,
    ],
    storytelling: [
      `The journey began with a simple question about ${topic}.`,
      `Obstacles appeared, but each one taught a valuable lesson.`,
      `A breakthrough moment changed everything.`,
      `The struggles led to unexpected discoveries.`,
      `Looking back, the path becomes clear.`,
      `The lessons learned apply far beyond ${topic}.`,
    ],
    listicle: [
      `This fundamental aspect of ${topic} is often overlooked`,
      `A game-changing insight that transforms your approach`,
      `The most common mistake and how to avoid it`,
      `An underrated strategy that delivers results`,
      `The counterintuitive truth about ${topic}`,
      `A quick win you can implement today`,
      `The long-term perspective that matters most`,
    ],
    argumentative: [
      `The conventional wisdom about ${topic} misses a crucial point.`,
      `Data from recent studies challenges the mainstream narrative.`,
      `Historical precedent supports this alternative view.`,
      `The incentive structures explain why this isn't discussed more.`,
      `Practical experience confirms what theory suggests.`,
      `The implications of accepting this are significant.`,
    ],
    howto: [
      `Start by assessing your current situation with ${topic}.`,
      `Gather the essential resources you'll need for success.`,
      `Execute this specific action to build momentum.`,
      `Troubleshoot common issues that arise at this stage.`,
      `Optimize your approach based on initial results.`,
      `Scale up once you've mastered the fundamentals.`,
    ],
  };
  
  const available = templates[tone as keyof typeof templates] || templates.educational;
  for (let i = 0; i < count && i < available.length; i++) {
    points.push(available[i]);
  }
  
  return points;
}

// JSON Schema for Bazaar discovery
export const threadInputJsonSchema = {
  type: 'object',
  properties: {
    topic: { type: 'string', description: 'Main topic or thesis for the thread', minLength: 1, maxLength: 1000 },
    outline: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Optional outline points to cover'
    },
    threadLength: { 
      type: 'number', 
      description: 'Number of tweets in the thread',
      minimum: 3,
      maximum: 15,
      default: 5
    },
    tone: { 
      type: 'string', 
      enum: ['educational', 'storytelling', 'listicle', 'argumentative', 'howto'],
      description: 'Style/format of the thread',
      default: 'educational'
    },
    includeHook: { type: 'boolean', description: 'Include attention-grabbing opening', default: true },
    includeCTA: { type: 'boolean', description: 'Include call-to-action at the end', default: true },
  },
  required: ['topic'],
};

export const threadOutputJsonSchema = {
  type: 'object',
  properties: {
    thread: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          position: { type: 'number' },
          content: { type: 'string' },
          characterCount: { type: 'number' },
        },
      },
      description: 'Array of tweet objects in order',
    },
    totalTweets: { type: 'number', description: 'Total number of tweets in thread' },
    topic: { type: 'string', description: 'The main topic' },
    estimatedReadTime: { type: 'string', description: 'Estimated read time' },
    hashtags: { type: 'array', items: { type: 'string' }, description: 'Suggested hashtags' },
  },
  required: ['thread', 'totalTweets', 'topic'],
};
