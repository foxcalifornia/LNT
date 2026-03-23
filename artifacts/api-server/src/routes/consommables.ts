import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { consommablesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/consommables", async (req, res) => {
  try {
    const rows = await db.select().from(consommablesTable).orderBy(consommablesTable.id);
    res.json(rows);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur récupération consommables" });
  }
});

router.put("/consommables/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { quantite, stockMinimum } = req.body as { quantite?: number; stockMinimum?: number };

    const updateData: { quantite?: number; stockMinimum?: number } = {};
    if (quantite !== undefined && quantite >= 0) updateData.quantite = quantite;
    if (stockMinimum !== undefined && stockMinimum >= 0) updateData.stockMinimum = stockMinimum;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: "Aucune donnée à mettre à jour" });
      return;
    }

    const [updated] = await db
      .update(consommablesTable)
      .set(updateData)
      .where(eq(consommablesTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Consommable introuvable" });
      return;
    }

    res.json(updated);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur mise à jour consommable" });
  }
});

export default router;
