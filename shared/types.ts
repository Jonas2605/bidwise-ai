export const DOCUMENT_CATEGORIES = [
  "past_performance",
  "resume",
  "capability_statement",
  "technical_approach",
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export type DocumentSource = "seed" | "custom";

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: DocumentCategory;
  content: string;
  source: DocumentSource;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentSummary {
  id: string;
  title: string;
  category: DocumentCategory;
  source: DocumentSource;
  createdAt: string;
  excerpt: string;
}

export interface CreateDocumentPayload {
  title: string;
  category: DocumentCategory;
  content: string;
}

export interface Citation {
  documentId: string;
  title: string;
  category: DocumentCategory;
  excerpt: string;
}

export interface AskRequest {
  question: string;
  category?: DocumentCategory | "all";
}

export interface AskResponse {
  answer: string;
  snippet: string;
  citations: Citation[];
  grounded: boolean;
  usedLlm: boolean;
}

export const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  past_performance: "Past Performance",
  resume: "Resume",
  capability_statement: "Capability Statement",
  technical_approach: "Technical Approach",
};
