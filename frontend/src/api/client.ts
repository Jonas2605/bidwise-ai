import type {
  AskResponse,
  CreateDocumentPayload,
  DocumentCategory,
  DocumentSummary,
  KnowledgeDocument,
} from "@shared/types";

export type {
  AskResponse,
  CreateDocumentPayload,
  DocumentCategory,
  DocumentSummary,
  KnowledgeDocument,
};

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error || `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

export async function fetchDocuments(params: {
  category: DocumentCategory | "all";
  q: string;
}): Promise<DocumentSummary[]> {
  const query = new URLSearchParams();
  if (params.category !== "all") query.set("category", params.category);
  if (params.q.trim()) query.set("q", params.q.trim());
  const response = await fetch(`/api/documents?${query.toString()}`);
  if (!response.ok) throw new Error(await parseError(response));
  const body = (await response.json()) as { documents: DocumentSummary[] };
  return body.documents;
}

export async function fetchDocument(id: string): Promise<KnowledgeDocument> {
  const response = await fetch(`/api/documents/${id}`);
  if (!response.ok) throw new Error(await parseError(response));
  const body = (await response.json()) as { document: KnowledgeDocument };
  return body.document;
}

export async function createDocument(
  payload: CreateDocumentPayload
): Promise<KnowledgeDocument> {
  const response = await fetch("/api/documents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await parseError(response));
  const body = (await response.json()) as { document: KnowledgeDocument };
  return body.document;
}

export async function askQuestion(payload: {
  question: string;
  category: DocumentCategory | "all";
}): Promise<AskResponse> {
  const response = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return (await response.json()) as AskResponse;
}

export async function fetchHealth(): Promise<{ llmConfigured: boolean }> {
  const response = await fetch("/api/health");
  if (!response.ok) throw new Error(await parseError(response));
  return (await response.json()) as { llmConfigured: boolean };
}
