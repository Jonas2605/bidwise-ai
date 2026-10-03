import type { DocumentCategory, KnowledgeDocument } from "../../../shared/types.ts";

export interface RetrievedChunk {
  documentId: string;
  title: string;
  category: DocumentCategory;
  text: string;
  score: number;
}

const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "of",
  "to",
  "in",
  "for",
  "on",
  "with",
  "is",
  "are",
  "was",
  "were",
  "be",
  "by",
  "at",
  "as",
  "that",
  "this",
  "from",
  "it",
  "we",
  "our",
  "their",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

function chunkDocument(content: string, size = 900): string[] {
  const paragraphs = content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const paragraph of paragraphs) {
    if ((current + "\n\n" + paragraph).length > size && current) {
      chunks.push(current);
      current = paragraph;
    } else {
      current = current ? `${current}\n\n${paragraph}` : paragraph;
    }
  }
  if (current) chunks.push(current);
  return chunks.length ? chunks : [content];
}

function score(queryTokens: string[], chunk: string, title: string): number {
  const haystack = tokenize(`${title} ${chunk}`);
  if (!haystack.length || !queryTokens.length) return 0;
  const counts = new Map<string, number>();
  for (const token of haystack) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  let raw = 0;
  for (const token of queryTokens) {
    const tf = counts.get(token) ?? 0;
    if (tf > 0) raw += 1 + Math.log(tf);
  }
  const titleBoost = tokenize(title).some((t) => queryTokens.includes(t)) ? 1.4 : 1;
  return raw * titleBoost;
}

export function retrieveChunks(
  documents: KnowledgeDocument[],
  question: string,
  category?: DocumentCategory | "all",
  limit = 5
): RetrievedChunk[] {
  const scoped =
    category && category !== "all"
      ? documents.filter((doc) => doc.category === category)
      : documents;
  const queryTokens = tokenize(question);
  const scored: RetrievedChunk[] = [];

  for (const doc of scoped) {
    for (const text of chunkDocument(doc.content)) {
      const chunkScore = score(queryTokens, text, doc.title);
      if (chunkScore > 0) {
        scored.push({
          documentId: doc.id,
          title: doc.title,
          category: doc.category,
          text,
          score: chunkScore,
        });
      }
    }
  }

  scored.sort((a, b) => b.score - a.score);
  const unique: RetrievedChunk[] = [];
  const seen = new Set<string>();
  for (const chunk of scored) {
    const key = chunk.documentId;
    if (unique.length >= limit) break;
    if (seen.has(key) && unique.length >= 3) continue;
    seen.add(key);
    unique.push(chunk);
  }
  return unique;
}
