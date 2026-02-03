/**
 * Summary Generator
 * Summarizes articles/content into digestible formats
 */

import { z } from 'zod';

export const SummaryInputSchema = z.object({
  content: z.string().min(100).max(50000).describe('The content to summarize'),
  format: z.enum(['bullets', 'paragraph', 'tldr', 'keypoints', 'executive'])
    .optional()
    .default('bullets')
    .describe('Output format for the summary'),
  maxLength: z.number().min(50).max(2000).optional().default(500).describe('Maximum length of summary'),
  targetAudience: z.enum(['general', 'technical', 'executive', 'beginner'])
    .optional()
    .default('general')
    .describe('Target audience for the summary'),
  preserveQuotes: z.boolean().optional().default(false).describe('Include key quotes from original'),
});

export type SummaryInput = z.infer<typeof SummaryInputSchema>;

export interface SummaryOutput {
  summary: string;
  format: string;
  keyPoints: string[];
  wordCount: number;
  originalWordCount: number;
  compressionRatio: string;
  readingTime: string;
  quotes?: string[];
}

export async function generateSummary(input: SummaryInput): Promise<SummaryOutput> {
  const validated = SummaryInputSchema.parse(input);
  const { content, format, maxLength, targetAudience, preserveQuotes } = validated;
  
  // Analyze content
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const words = content.split(/\s+/);
  const originalWordCount = words.length;
  
  // Extract key sentences (simplified extraction - in production would use NLP)
  const keysentences = extractKeySentences(sentences, 5);
  
  // Extract potential quotes
  const quoteMatches = content.match(/"[^"]+"/g) || [];
  const quotes = preserveQuotes ? quoteMatches.slice(0, 3) : undefined;
  
  // Generate key points
  const keyPoints = keysentences.map(s => s.trim().replace(/^[^a-zA-Z]+/, ''));
  
  // Generate summary based on format
  let summary = '';
  
  switch (format) {
    case 'tldr':
      summary = generateTLDR(keyPoints, targetAudience);
      break;
    case 'bullets':
      summary = generateBullets(keyPoints, targetAudience);
      break;
    case 'paragraph':
      summary = generateParagraph(keyPoints, targetAudience);
      break;
    case 'keypoints':
      summary = generateKeyPoints(keyPoints, targetAudience);
      break;
    case 'executive':
      summary = generateExecutive(keyPoints, targetAudience, originalWordCount);
      break;
  }
  
  // Truncate if needed
  if (summary.length > maxLength) {
    summary = truncateSummary(summary, maxLength, format);
  }
  
  const summaryWordCount = summary.split(/\s+/).length;
  const compressionRatio = ((1 - summaryWordCount / originalWordCount) * 100).toFixed(1);
  const readingTime = Math.max(1, Math.ceil(summaryWordCount / 200));
  
  return {
    summary,
    format,
    keyPoints,
    wordCount: summaryWordCount,
    originalWordCount,
    compressionRatio: `${compressionRatio}% reduction`,
    readingTime: `${readingTime} min read`,
    quotes,
  };
}

function extractKeySentences(sentences: string[], count: number): string[] {
  // Simple extraction: prioritize sentences with important indicators
  const importanceIndicators = [
    'important', 'key', 'main', 'significant', 'critical',
    'essential', 'fundamental', 'primary', 'central', 'crucial',
    'notably', 'specifically', 'particularly', 'especially',
    'first', 'second', 'finally', 'conclusion', 'result',
  ];
  
  const scored = sentences.map(sentence => {
    const lower = sentence.toLowerCase();
    let score = 0;
    
    // Score based on importance indicators
    for (const indicator of importanceIndicators) {
      if (lower.includes(indicator)) score += 2;
    }
    
    // Score based on position (first and last sentences often important)
    const index = sentences.indexOf(sentence);
    if (index === 0) score += 3;
    if (index === sentences.length - 1) score += 2;
    if (index < 3) score += 1;
    
    // Prefer medium-length sentences
    const words = sentence.split(/\s+/).length;
    if (words >= 10 && words <= 30) score += 1;
    
    return { sentence, score };
  });
  
  // Sort by score and take top N
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .sort((a, b) => sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence))
    .map(s => s.sentence);
}

function generateTLDR(keyPoints: string[], audience: string): string {
  const point = keyPoints[0] || 'The content covers important topics.';
  const simplified = audience === 'beginner' 
    ? `In simple terms: ${point}`
    : `TL;DR: ${point}`;
  return simplified;
}

function generateBullets(keyPoints: string[], audience: string): string {
  const prefix = audience === 'executive' ? '→' : '•';
  return keyPoints.map(p => `${prefix} ${p}`).join('\n');
}

function generateParagraph(keyPoints: string[], audience: string): string {
  let intro = '';
  
  switch (audience) {
    case 'technical':
      intro = 'Technical summary: ';
      break;
    case 'executive':
      intro = 'Executive overview: ';
      break;
    case 'beginner':
      intro = 'Here\'s what you need to know: ';
      break;
    default:
      intro = '';
  }
  
  const connected = keyPoints.join('. ');
  return intro + connected + '.';
}

function generateKeyPoints(keyPoints: string[], audience: string): string {
  const header = audience === 'executive' ? '📊 Key Takeaways:\n\n' : '🔑 Key Points:\n\n';
  const numbered = keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n');
  return header + numbered;
}

function generateExecutive(keyPoints: string[], audience: string, originalWords: number): string {
  const sections = [
    '## Executive Summary\n',
    `**Document Length:** ~${originalWords} words\n`,
    '\n### Key Findings:\n',
    keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n'),
    '\n\n### Recommendation:\n',
    'Review the full document for detailed analysis and supporting data.',
  ];
  
  return sections.join('');
}

function truncateSummary(summary: string, maxLength: number, format: string): string {
  if (format === 'bullets' || format === 'keypoints') {
    // Truncate by removing bullet points from the end
    const lines = summary.split('\n');
    while (summary.length > maxLength && lines.length > 1) {
      lines.pop();
      summary = lines.join('\n');
    }
    return summary;
  }
  
  // For other formats, truncate at sentence boundary
  if (summary.length <= maxLength) return summary;
  
  const truncated = summary.slice(0, maxLength);
  const lastSentence = truncated.lastIndexOf('.');
  
  if (lastSentence > maxLength * 0.5) {
    return truncated.slice(0, lastSentence + 1);
  }
  
  return truncated.trim() + '...';
}

// JSON Schema for Bazaar discovery
export const summaryInputJsonSchema = {
  type: 'object',
  properties: {
    content: { 
      type: 'string', 
      description: 'The content to summarize',
      minLength: 100,
      maxLength: 50000
    },
    format: { 
      type: 'string', 
      enum: ['bullets', 'paragraph', 'tldr', 'keypoints', 'executive'],
      description: 'Output format for the summary',
      default: 'bullets'
    },
    maxLength: { 
      type: 'number', 
      description: 'Maximum length of summary',
      minimum: 50,
      maximum: 2000,
      default: 500
    },
    targetAudience: { 
      type: 'string', 
      enum: ['general', 'technical', 'executive', 'beginner'],
      description: 'Target audience for the summary',
      default: 'general'
    },
    preserveQuotes: { 
      type: 'boolean', 
      description: 'Include key quotes from original',
      default: false
    },
  },
  required: ['content'],
};

export const summaryOutputJsonSchema = {
  type: 'object',
  properties: {
    summary: { type: 'string', description: 'The generated summary' },
    format: { type: 'string', description: 'Format used for the summary' },
    keyPoints: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Extracted key points'
    },
    wordCount: { type: 'number', description: 'Word count of summary' },
    originalWordCount: { type: 'number', description: 'Word count of original' },
    compressionRatio: { type: 'string', description: 'Compression achieved' },
    readingTime: { type: 'string', description: 'Estimated reading time' },
    quotes: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Notable quotes from original (if requested)'
    },
  },
  required: ['summary', 'format', 'keyPoints', 'wordCount', 'originalWordCount', 'compressionRatio', 'readingTime'],
};
