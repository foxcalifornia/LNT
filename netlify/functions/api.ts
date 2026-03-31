import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import serverless from "serverless-http";
import router from "../../artifacts/api-server/src/routes/index.js";

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SumUp OAuth routes
const handleAuthSumup = (req: Request, res: Response) => {
  const CLIENT_ID = process.env.SUMUP_CLIENT_ID ?? "";
  const REDIRECT_URI = process.env.SUMUP_REDIRECT_URI ?? "";
  const scope = "payments transactions.history readers.read readers.write";
  const url = new URL("https://api.sumup.com/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set("redirect_uri", REDIRECT_URI);
  url.searchParams.set("scope", scope);
  res.redirect(url.toString());
};

app.get("/auth/sumup", handleAuthSumup);
app.get("/api/auth/sumup", handleAuthSumup);

// API routes
app.use("/api", router);

// Health check at root
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "LNT Paris API" });
});

// Export as Netlify Function
export const handler = serverless(app);
