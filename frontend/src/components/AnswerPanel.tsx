import { CATEGORY_LABELS, type AskResponse } from "../types";

interface Props {
  result: AskResponse | null;
  loading: boolean;
  error: string;
  copied: boolean;
  onCopy: () => void;
  onOpenCitation: (documentId: string) => void;
}

export function AnswerPanel({
  result,
  loading,
  error,
  copied,
  onCopy,
  onOpenCitation,
}: Props) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Grounded answer</h2>
        {result ? (
          <button type="button" className="btn btn-gold" onClick={onCopy}>
            {copied ? "Copied" : "Copy proposal snippet"}
          </button>
        ) : null}
      </div>
      <div className="panel-body">
        {error ? <p className="alert">{error}</p> : null}
        {loading ? (
          <div className="loading">
            <span className="spinner" aria-hidden="true" />
            Searching the knowledge hub and drafting a grounded response…
          </div>
        ) : null}
        {!loading && !result && !error ? (
          <p className="hint">
            Ask a natural-language question such as “Who should we name as SOC Lead?” or “What
            past performance supports a VA FHIR effort?” Answers cite only documents in this hub.
          </p>
        ) : null}
        {result ? (
          <>
            <p className="muted">
              {result.usedLlm ? "Drafted with the server-side language model." : "Drafted with the local grounded extractor."}{" "}
              {result.grounded ? "Sources were found in the hub." : "No matching sources."}
            </p>
            <p className="answer">{result.answer}</p>
            {result.citations.length ? (
              <div className="citations">
                <p className="field-label">Click a citation to open the source</p>
                {result.citations.map((citation) => (
                  <button
                    key={citation.documentId}
                    type="button"
                    className="citation"
                    onClick={() => onOpenCitation(citation.documentId)}
                  >
                    <strong>{citation.title}</strong>
                    <span className="muted">{CATEGORY_LABELS[citation.category]}</span>
                    <p className="excerpt">{citation.excerpt}</p>
                  </button>
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
