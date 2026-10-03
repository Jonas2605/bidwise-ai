import { useEffect, useMemo, useState } from "react";
import { AddDocumentModal } from "./components/AddDocumentModal";
import { AnswerPanel } from "./components/AnswerPanel";
import { CategoryChips } from "./components/CategoryChips";
import { DocumentGrid } from "./components/DocumentGrid";
import { SourceDrawer } from "./components/SourceDrawer";
import {
  askQuestion,
  createDocument,
  fetchDocument,
  fetchDocuments,
  fetchHealth,
} from "./api/client";
import type {
  AskResponse,
  CreateDocumentPayload,
  DocumentCategory,
  DocumentSummary,
  KnowledgeDocument,
} from "./types";

export default function App() {
  const [category, setCategory] = useState<DocumentCategory | "all">("all");
  const [keyword, setKeyword] = useState("");
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [hubLoading, setHubLoading] = useState(true);
  const [hubError, setHubError] = useState("");
  const [question, setQuestion] = useState("");
  const [queryError, setQueryError] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [askError, setAskError] = useState("");
  const [result, setResult] = useState<AskResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerDoc, setDrawerDoc] = useState<KnowledgeDocument | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState("");
  const [llmConfigured, setLlmConfigured] = useState(false);

  const keywordDebounced = useDebounced(keyword, 250);

  useEffect(() => {
    fetchHealth()
      .then((health) => setLlmConfigured(health.llmConfigured))
      .catch(() => setLlmConfigured(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setHubLoading(true);
    setHubError("");
    fetchDocuments({ category, q: keywordDebounced })
      .then((rows) => {
        if (!cancelled) setDocuments(rows);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setHubError(error instanceof Error ? error.message : "Could not load documents.");
        }
      })
      .finally(() => {
        if (!cancelled) setHubLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category, keywordDebounced]);

  async function handleAsk() {
    if (!question.trim()) {
      setQueryError("Enter a question before asking BidWise AI.");
      setAskError("");
      return;
    }
    setQueryError("");
    setAskError("");
    setAskLoading(true);
    setCopied(false);
    try {
      const response = await askQuestion({ question, category });
      setResult(response);
    } catch (error) {
      setResult(null);
      setAskError(error instanceof Error ? error.message : "The assistant could not complete that request.");
    } finally {
      setAskLoading(false);
    }
  }

  async function handleAdd(payload: CreateDocumentPayload) {
    await createDocument(payload);
    const rows = await fetchDocuments({ category, q: keywordDebounced });
    setDocuments(rows);
  }

  async function openSource(id: string) {
    setDrawerLoading(true);
    setDrawerError("");
    setDrawerDoc(null);
    try {
      const doc = await fetchDocument(id);
      setDrawerDoc(doc);
    } catch (error) {
      setDrawerError(error instanceof Error ? error.message : "Could not open that source.");
    } finally {
      setDrawerLoading(false);
    }
  }

  async function copySnippet() {
    if (!result?.snippet) return;
    await navigator.clipboard.writeText(result.snippet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const countLabel = useMemo(() => {
    const n = documents.length;
    return `${n} source${n === 1 ? "" : "s"}`;
  }, [documents.length]);

  return (
    <div className="app-shell">
      <header className="masthead">
        <div>
          <div className="brand-mark">
            <div className="crest" aria-hidden="true">
              BW
            </div>
            <div>
              <p className="eyebrow">Government contractor knowledge assistant</p>
              <h1>BidWise AI</h1>
            </div>
          </div>
          <p className="lede">
            Search past performance, resumes, capability statements, and technical approaches with
            natural language. Every answer is grounded in the documents in this hub.
          </p>
        </div>
        <div className="status-pill">
          {llmConfigured ? "OpenAI connected (server-side key)" : "Local grounded mode — add OPENAI_API_KEY to enable LLM drafts"}
        </div>
      </header>

      <div className="layout">
        <section className="panel">
          <div className="panel-header">
            <h2>Document knowledge hub</h2>
            <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
              Add document
            </button>
          </div>
          <div className="panel-body">
            <div className="toolbar">
              <label className="field">
                <span>Keyword search</span>
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Search titles and full text…"
                />
              </label>
              <div className="field">
                <span>Filter</span>
                <CategoryChips value={category} onChange={setCategory} />
              </div>
            </div>
            <p className="muted">{countLabel} in view</p>
            {hubError ? <p className="alert">{hubError}</p> : null}
            <DocumentGrid documents={documents} loading={hubLoading} onOpen={openSource} />
          </div>
        </section>

        <div>
          <section className="panel" style={{ marginBottom: 22 }}>
            <div className="panel-header">
              <h2>Proposal Q&amp;A</h2>
            </div>
            <div className="panel-body ask-box">
              {queryError ? <p className="alert">{queryError}</p> : null}
              <label className="field">
                <span>Natural-language question</span>
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="e.g. Summarize past performance that supports a DHS CDM bid."
                />
              </label>
              <div className="actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAsk}
                  disabled={askLoading}
                >
                  {askLoading ? "Asking…" : "Ask BidWise"}
                </button>
              </div>
            </div>
          </section>
          <AnswerPanel
            result={result}
            loading={askLoading}
            error={askError}
            copied={copied}
            onCopy={copySnippet}
            onOpenCitation={openSource}
          />
        </div>
      </div>

      <AddDocumentModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleAdd} />
      <SourceDrawer
        document={drawerDoc}
        loading={drawerLoading}
        error={drawerError}
        onClose={() => {
          setDrawerDoc(null);
          setDrawerError("");
        }}
      />
    </div>
  );
}

function useDebounced(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(handle);
  }, [value, delay]);
  return debounced;
}
