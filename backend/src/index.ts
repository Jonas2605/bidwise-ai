import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { documentsRouter } from "./routes/documents.ts";
import { askRouter } from "./routes/ask.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "bidwise-ai",
    llmConfigured: Boolean(process.env.OPENAI_API_KEY?.trim()),
  });
});

app.use("/api/documents", documentsRouter);
app.use("/api/ask", askRouter);
const frontendDist = path.resolve(__dirname, "../../frontend/dist");

app.use(express.static(frontendDist));

app.get("*", (_req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    console.error(error);
    res.status(500).json({ error: message });
  }
);

app.listen(port, () => {
  console.log(`BidWise AI API listening on http://localhost:${port}`);
});
