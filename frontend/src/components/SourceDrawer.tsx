import { CATEGORY_LABELS, type KnowledgeDocument } from "../types";

interface Props {
  document: KnowledgeDocument | null;
  loading: boolean;
  error: string;
  onClose: () => void;
}

export function SourceDrawer({ document, loading, error, onClose }: Props) {
  if (!document && !loading && !error) return null;

  return (
    <div className="drawer-backdrop" role="presentation" onClick={onClose}>
      <aside className="drawer" onClick={(event) => event.stopPropagation()} aria-label="Source document">
        <div className="actions" style={{ marginTop: 0 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
        {loading ? (
          <div className="loading">
            <span className="spinner" aria-hidden="true" />
            Opening source…
          </div>
        ) : null}
        {error ? <p className="alert">{error}</p> : null}
        {document ? (
          <>
            <p className="eyebrow">{CATEGORY_LABELS[document.category]}</p>
            <h2 style={{ fontFamily: "Fraunces, serif", marginTop: 0 }}>{document.title}</h2>
            <p className="muted">
              {document.source === "seed" ? "Sample library" : "Custom upload"} · added{" "}
              {new Date(document.createdAt).toLocaleDateString()}
            </p>
            <pre>{document.content}</pre>
          </>
        ) : null}
      </aside>
    </div>
  );
}
