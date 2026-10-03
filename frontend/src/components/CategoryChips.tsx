import type { DocumentCategory } from "../types";
import { CATEGORY_LABELS, DOCUMENT_CATEGORIES } from "../types";

interface Props {
  value: DocumentCategory | "all";
  onChange: (value: DocumentCategory | "all") => void;
  includeAll?: boolean;
}

export function CategoryChips({ value, onChange, includeAll = true }: Props) {
  const options: Array<DocumentCategory | "all"> = includeAll
    ? ["all", ...DOCUMENT_CATEGORIES]
    : [...DOCUMENT_CATEGORIES];

  const label = (option: DocumentCategory | "all") =>
    option === "all" ? "All categories" : CATEGORY_LABELS[option];

  return (
    <div className="chip-row" role="tablist" aria-label="Document categories">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={`chip ${value === option ? "active" : ""}`}
          onClick={() => onChange(option)}
        >
          {label(option)}
        </button>
      ))}
    </div>
  );
}
