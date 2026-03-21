import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sessionsTable, insertSessionSchema } from "@workspace/db/schema";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/sessions", async (req, res) => {
  try {
    const sessions = await db.select().from(sessionsTable).orderBy(desc(sessionsTable.createdAt));
    res.json(sessions);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des sessions" });
  }
});

router.post("/sessions", async (req, res) => {
  try {
    const parsed = insertSessionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Données invalides", details: parsed.error });
      return;
    }

    const [session] = await db.insert(sessionsTable).values(parsed.data).returning();
    res.status(201).json(session);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur lors de la création de la session" });
  }
});

export default router;
