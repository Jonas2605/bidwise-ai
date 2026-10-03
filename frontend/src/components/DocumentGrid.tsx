import { CATEGORY_LABELS, type DocumentSummary } from "../types";

interface Props {
  documents: DocumentSummary[];
  loading: boolean;
  onOpen: (id: string) => void;
}

export function DocumentGrid({ documents, loading, onOpen }: Props) {
  if (loading) {
    return (
      <div className="loading">
        <span className="spinner" aria-hidden="true" />
        Loading knowledge hub…
      </div>
    );
  }

  if (!documents.length) {
    return (
      <div className="empty">
        No documents match this filter. Try another category, a broader keyword, or add a custom
        source.
      </div>
    );
  }

  return (
    <div className="doc-grid">
      {documents.map((doc) => (
        <button key={doc.id} type="button" className="doc-card" onClick={() => onOpen(doc.id)}>
          <div className="meta">
            <span className="tag">{CATEGORY_LABELS[doc.category]}</span>
            <span className={`tag ${doc.source}`}>{doc.source === "seed" ? "Sample" : "Custom"}</span>
          </div>
          <h3>{doc.title}</h3>
          <p className="excerpt">{doc.excerpt}</p>
        </button>
      ))}
    </div>
  );
}
