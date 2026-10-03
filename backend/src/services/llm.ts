import type { AskResponse, Citation } from "../../../shared/types.ts";
import type { RetrievedChunk } from "./retrieval.ts";

const SYSTEM_PROMPT = `You are BidWise AI, a proposal knowledge assistant for government contractors.
Answer ONLY from the provided document excerpts. If the excerpts do not contain the answer, say you cannot find that information in the knowledge hub.
Do not invent contract numbers, past performance, personnel, or metrics.
Write in a professional proposal tone. Prefer concise paragraphs that a capture manager could paste into a volume.
When you use a source, mention the document title naturally.`;

function toCitations(chunks: RetrievedChunk[]): Citation[] {
  const seen = new Set<string>();
  const citations: Citation[] = [];
  for (const chunk of chunks) {
    if (seen.has(chunk.documentId)) continue;
    seen.add(chunk.documentId);
    citations.push({
      documentId: chunk.documentId,
      title: chunk.title,
      category: chunk.category,
      excerpt: chunk.text.replace(/\s+/g, " ").trim().slice(0, 360),
    });
  }
  return citations;
}

function extractiveAnswer(question: string, chunks: RetrievedChunk[]): string {
  if (!chunks.length) {
    return "I could not find that information in the BidWise knowledge hub. Add a relevant past performance, resume, capability statement, or technical approach and ask again.";
  }
  const top = chunks.slice(0, 3);
  const lines = top.map((chunk, index) => {
    const snippet = chunk.text.replace(/\s+/g, " ").trim().slice(0, 420);
    return `(${index + 1}) From ${chunk.title}: ${snippet}`;
  });
  return `Based on documents in the knowledge hub, here is grounded material for: “${question.trim()}”.\n\n${lines.join("\n\n")}\n\nThese excerpts are taken only from stored documents. Refine the question or add source material if you need a tighter proposal paragraph.`;
}

function proposalSnippet(answer: string): string {
  const withoutIntro = answer.replace(/^Based on documents in the knowledge hub[\s\S]*?:\s*/i, "");
  return withoutIntro.trim().slice(0, 1200);
}

export async function answerQuestion(
  question: string,
  chunks: RetrievedChunk[]
): Promise<AskResponse> {
  const citations = toCitations(chunks);
  const grounded = chunks.length > 0;

  if (!grounded) {
    const answer = extractiveAnswer(question, chunks);
    return {
      answer,
      snippet: answer,
      citations,
      grounded: false,
      usedLlm: false,
    };
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    const answer = extractiveAnswer(question, chunks);
    return {
      answer,
      snippet: proposalSnippet(answer),
      citations,
      grounded: true,
      usedLlm: false,
    };
  }

  const context = chunks
    .map(
      (chunk, index) =>
        `[Source ${index + 1} | ${chunk.title} | ${chunk.category}]\n${chunk.text}`
    )
    .join("\n\n---\n\n");

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Question:\n${question}\n\nDocument excerpts:\n${context}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${detail.slice(0, 240)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const answer =
    payload.choices?.[0]?.message?.content?.trim() || extractiveAnswer(question, chunks);

  return {
    answer,
    snippet: proposalSnippet(answer),
    citations,
    grounded: true,
    usedLlm: true,
  };
}
