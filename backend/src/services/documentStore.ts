import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import type {
  CreateDocumentPayload,
  DocumentCategory,
  DocumentSummary,
  KnowledgeDocument,
} from "../../../shared/types.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "../../data");
const storePath = path.join(dataDir, "documents.json");
const seedDir = path.resolve(__dirname, "../../seed");

const SEED_MANIFEST: Array<{
  file: string;
  title: string;
  category: DocumentCategory;
}> = [
  {
    file: "pp-dhs-cdm.md",
    title: "DHS CDM Security Operations",
    category: "past_performance",
  },
  {
    file: "pp-va-ehr.md",
    title: "VA EHR Interface Support",
    category: "past_performance",
  },
  {
    file: "resume-maya-chen.md",
    title: "Resume — Maya Chen, SOC Lead",
    category: "resume",
  },
  {
    file: "resume-luis-ortega.md",
    title: "Resume — Luis Ortega, Proposal Manager",
    category: "resume",
  },
  {
    file: "capability-statement.md",
    title: "Aether Federal Capability Statement",
    category: "capability_statement",
  },
  {
    file: "ta-continuous-monitoring.md",
    title: "Technical Approach — Continuous Monitoring SOC",
    category: "technical_approach",
  },
  {
    file: "ta-fhir-test-factory.md",
    title: "Technical Approach — FHIR Test Factory",
    category: "technical_approach",
  },
];

async function ensureStore(): Promise<KnowledgeDocument[]> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    const raw = await fs.readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as KnowledgeDocument[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // first run
  }
  const seeded = await buildSeedDocuments();
  await persist(seeded);
  return seeded;
}

async function buildSeedDocuments(): Promise<KnowledgeDocument[]> {
  const now = new Date().toISOString();
  const docs: KnowledgeDocument[] = [];
  for (const item of SEED_MANIFEST) {
    const content = await fs.readFile(path.join(seedDir, item.file), "utf8");
    docs.push({
      id: randomUUID(),
      title: item.title,
      category: item.category,
      content,
      source: "seed",
      createdAt: now,
      updatedAt: now,
    });
  }
  return docs;
}

async function persist(docs: KnowledgeDocument[]): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(storePath, JSON.stringify(docs, null, 2), "utf8");
}

function toSummary(doc: KnowledgeDocument): DocumentSummary {
  const plain = doc.content.replace(/\s+/g, " ").trim();
  return {
    id: doc.id,
    title: doc.title,
    category: doc.category,
    source: doc.source,
    createdAt: doc.createdAt,
    excerpt: plain.slice(0, 220) + (plain.length > 220 ? "…" : ""),
  };
}

export async function listDocuments(options?: {
  category?: DocumentCategory | "all";
  q?: string;
}): Promise<DocumentSummary[]> {
  const docs = await ensureStore();
  const q = options?.q?.trim().toLowerCase() ?? "";
  return docs
    .filter((doc) => {
      if (options?.category && options.category !== "all" && doc.category !== options.category) {
        return false;
      }
      if (!q) return true;
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.content.toLowerCase().includes(q) ||
        doc.category.replaceAll("_", " ").includes(q)
      );
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(toSummary);
}

export async function getDocument(id: string): Promise<KnowledgeDocument | undefined> {
  const docs = await ensureStore();
  return docs.find((doc) => doc.id === id);
}

export async function getAllDocuments(): Promise<KnowledgeDocument[]> {
  return ensureStore();
}

export async function createDocument(
  payload: CreateDocumentPayload
): Promise<KnowledgeDocument> {
  const docs = await ensureStore();
  const now = new Date().toISOString();
  const doc: KnowledgeDocument = {
    id: randomUUID(),
    title: payload.title.trim(),
    category: payload.category,
    content: payload.content.trim(),
    source: "custom",
    createdAt: now,
    updatedAt: now,
  };
  docs.push(doc);
  await persist(docs);
  return doc;
}
