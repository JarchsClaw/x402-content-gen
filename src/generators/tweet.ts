/**
 * Tweet Generator
 * Generates engaging tweets on any topic
 */

import { z } from 'zod';

export const TweetInputSchema = z.object({
  topic: z.string().min(1).max(500).describe('Topic or subject for the tweet'),
  tone: z.enum(['professional', 'casual', 'humorous', 'inspirational', 'informative'])
    .optional()
    .default('casual')
    .describe('Desired tone of the tweet'),
  includeHashtags: z.boolean().optional().default(true).describe('Whether to include relevant hashtags'),
  includeEmoji: z.boolean().optional().default(true).describe('Whether to include emoji'),
  maxLength: z.number().min(50).max(280).optional().default(280).describe('Maximum character length'),
});

export type TweetInput = z.infer<typeof TweetInputSchema>;

export interface TweetOutput {
  tweet: string;
  characterCount: number;
  hashtags: string[];
  suggestedPostTime?: string;
}

// Tone-specific prefixes and styles for mock generation
const toneStyles: Record<string, { openings: string[]; emojis: string[] }> = {
  professional: {
    openings: ['Insight:', 'Key takeaway:', 'Important update:', 'Industry perspective:'],
    emojis: ['📊', '💼', '🎯', '📈', '✅'],
  },
  casual: {
    openings: ['Just thinking about', 'You know what\'s cool?', 'Hot take:', 'Real talk:'],
    emojis: ['😊', '🙌', '💭', '✨', '🔥'],
  },
  humorous: {
    openings: ['Plot twist:', 'Nobody:', 'Me:', 'The thing about', 'Breaking:'],
    emojis: ['😂', '🤣', '💀', '🙃', '😅'],
  },
  inspirational: {
    openings: ['Remember:', 'The truth is,', 'Don\'t forget:', 'Here\'s the secret:'],
    emojis: ['💪', '🌟', '🚀', '💫', '🌈'],
  },
  informative: {
    openings: ['Did you know?', 'Fun fact:', 'TIL:', 'Here\'s something interesting:'],
    emojis: ['🧵', '📚', '💡', '🔍', '📝'],
  },
};

export async function generateTweet(input: TweetInput): Promise<TweetOutput> {
  const validated = TweetInputSchema.parse(input);
  const { topic, tone, includeHashtags, includeEmoji, maxLength } = validated;
  
  const style = toneStyles[tone];
  const opening = style.openings[Math.floor(Math.random() * style.openings.length)];
  const emoji = includeEmoji ? style.emojis[Math.floor(Math.random() * style.emojis.length)] : '';
  
  // Generate hashtags from topic words
  const topicWords = topic.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const hashtags = includeHashtags 
    ? topicWords.slice(0, 3).map(w => `#${w.charAt(0).toUpperCase() + w.slice(1)}`)
    : [];
  
  // Build the tweet
  let tweetBody = '';
  switch (tone) {
    case 'professional':
      tweetBody = `${opening} ${topic} is reshaping how we think about success in this space. The data speaks for itself.`;
      break;
    case 'casual':
      tweetBody = `${opening} ${topic} - honestly, this is the kind of thing I wish more people talked about`;
      break;
    case 'humorous':
      tweetBody = `${opening} ${topic} walks into a bar. The bartender says "we don't serve your kind here." ${topic} says "that's fine, I brought my own disruption"`;
      break;
    case 'inspirational':
      tweetBody = `${opening} ${topic} isn't just a concept - it's a journey. Every step you take brings you closer to mastery.`;
      break;
    case 'informative':
      tweetBody = `${opening} ${topic} has been gaining attention lately. Here's what you need to know and why it matters for your future.`;
      break;
  }
  
  // Construct final tweet
  let tweet = includeEmoji ? `${emoji} ${tweetBody}` : tweetBody;
  
  if (includeHashtags && hashtags.length > 0) {
    const hashtagStr = '\n\n' + hashtags.join(' ');
    if (tweet.length + hashtagStr.length <= maxLength) {
      tweet += hashtagStr;
    }
  }
  
  // Truncate if needed
  if (tweet.length > maxLength) {
    tweet = tweet.slice(0, maxLength - 3) + '...';
  }
  
  return {
    tweet,
    characterCount: tweet.length,
    hashtags,
    suggestedPostTime: getSuggestedPostTime(),
  };
}

function getSuggestedPostTime(): string {
  // Best times to post on Twitter
  const times = ['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM'];
  return times[Math.floor(Math.random() * times.length)] + ' (local time)';
}

// JSON Schema for Bazaar discovery
export const tweetInputJsonSchema = {
  type: 'object',
  properties: {
    topic: { type: 'string', description: 'Topic or subject for the tweet', minLength: 1, maxLength: 500 },
    tone: { 
      type: 'string', 
      enum: ['professional', 'casual', 'humorous', 'inspirational', 'informative'],
      description: 'Desired tone of the tweet',
      default: 'casual'
    },
    includeHashtags: { type: 'boolean', description: 'Whether to include relevant hashtags', default: true },
    includeEmoji: { type: 'boolean', description: 'Whether to include emoji', default: true },
    maxLength: { type: 'number', description: 'Maximum character length', minimum: 50, maximum: 280, default: 280 },
  },
  required: ['topic'],
};

export const tweetOutputJsonSchema = {
  type: 'object',
  properties: {
    tweet: { type: 'string', description: 'The generated tweet text' },
    characterCount: { type: 'number', description: 'Character count of the tweet' },
    hashtags: { type: 'array', items: { type: 'string' }, description: 'Hashtags included in the tweet' },
    suggestedPostTime: { type: 'string', description: 'Suggested optimal posting time' },
  },
  required: ['tweet', 'characterCount', 'hashtags'],
};
