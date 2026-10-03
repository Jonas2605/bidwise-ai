import { useState, type FormEvent } from "react";
import {
  DOCUMENT_CATEGORIES,
  CATEGORY_LABELS,
  type CreateDocumentPayload,
  type DocumentCategory,
} from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateDocumentPayload) => Promise<void>;
}

const empty = {
  title: "",
  category: "past_performance" as DocumentCategory,
  content: "",
};

export function AddDocumentModal({ open, onClose, onSubmit }: Props) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and markdown/text content are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSubmit({
        title: form.title.trim(),
        category: form.category,
        content: form.content.trim(),
      });
      setForm(empty);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the document.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <form
        className="modal"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2>Add a knowledge source</h2>
        <p className="hint">
          Paste a resume, past performance write-up, capability statement, or technical approach
          in text or markdown. BidWise will search it for grounded answers.
        </p>
        {error ? <p className="alert">{error}</p> : null}
        <label className="field">
          <span>Title</span>
          <input
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="e.g. Past Performance — GSA OASIS task order"
          />
        </label>
        <label className="field" style={{ marginTop: 12 }}>
          <span>Category</span>
          <select
            value={form.category}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                category: event.target.value as DocumentCategory,
              }))
            }
          >
            {DOCUMENT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </label>
        <label className="field" style={{ marginTop: 12 }}>
          <span>Text / Markdown</span>
          <textarea
            value={form.content}
            onChange={(event) =>
              setForm((current) => ({ ...current, content: event.target.value }))
            }
            placeholder="Paste the source document here…"
          />
        </label>
        <div className="actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Add to hub"}
          </button>
        </div>
      </form>
    </div>
  );
}
