import { Router } from "express";
import {
  DOCUMENT_CATEGORIES,
  type DocumentCategory,
} from "../../../shared/types.ts";
import { getAllDocuments } from "../services/documentStore.ts";
import { retrieveChunks } from "../services/retrieval.ts";
import { answerQuestion } from "../services/llm.ts";

export const askRouter = Router();

function isCategory(value: unknown): value is DocumentCategory {
  return typeof value === "string" && (DOCUMENT_CATEGORIES as readonly string[]).includes(value);
}

askRouter.post("/", async (req, res, next) => {
  try {
    const question = typeof req.body?.question === "string" ? req.body.question.trim() : "";
    const categoryRaw = req.body?.category;

    if (!question) {
      res.status(400).json({ error: "Enter a question before asking BidWise AI." });
      return;
    }

    const category =
      categoryRaw === "all" || isCategory(categoryRaw) ? categoryRaw : "all";

    const documents = await getAllDocuments();
    const chunks = retrieveChunks(documents, question, category);
    const result = await answerQuestion(question, chunks);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
