import { Router } from "express";
import {
  DOCUMENT_CATEGORIES,
  type CreateDocumentPayload,
  type DocumentCategory,
} from "../../../shared/types.ts";
import { createDocument, getDocument, listDocuments } from "../services/documentStore.ts";

export const documentsRouter = Router();

function isCategory(value: unknown): value is DocumentCategory {
  return typeof value === "string" && (DOCUMENT_CATEGORIES as readonly string[]).includes(value);
}

documentsRouter.get("/", async (req, res, next) => {
  try {
    const categoryRaw = typeof req.query.category === "string" ? req.query.category : "all";
    const category =
      categoryRaw === "all" || isCategory(categoryRaw) ? categoryRaw : undefined;
    const q = typeof req.query.q === "string" ? req.query.q : "";
    const documents = await listDocuments({ category, q });
    res.json({ documents });
  } catch (error) {
    next(error);
  }
});

documentsRouter.get("/:id", async (req, res, next) => {
  try {
    const doc = await getDocument(req.params.id);
    if (!doc) {
      res.status(404).json({ error: "Document not found." });
      return;
    }
    res.json({ document: doc });
  } catch (error) {
    next(error);
  }
});

documentsRouter.post("/", async (req, res, next) => {
  try {
    const body = req.body as Partial<CreateDocumentPayload>;
    const title = body.title?.trim();
    const content = body.content?.trim();
    const category = body.category;

    if (!title) {
      res.status(400).json({ error: "Title is required." });
      return;
    }
    if (!content) {
      res.status(400).json({ error: "Document content is required." });
      return;
    }
    if (!isCategory(category)) {
      res.status(400).json({ error: "Choose a valid document category." });
      return;
    }

    const document = await createDocument({ title, category, content });
    res.status(201).json({ document });
  } catch (error) {
    next(error);
  }
});
