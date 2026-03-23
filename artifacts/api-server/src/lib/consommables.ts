import { db } from "@workspace/db";
import { consommablesTable } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";

export async function decrementerConsommables(nbArticles: number): Promise<void> {
  const rows = await db.select().from(consommablesTable).orderBy(consommablesTable.id);
  const sac = rows.find((r) => r.nom === "Sac");
  const pochette = rows.find((r) => r.nom === "Pochette");

  if (sac) {
    await db
      .update(consommablesTable)
      .set({ quantite: Math.max(0, sac.quantite - 1) })
      .where(eq(consommablesTable.id, sac.id));
  }

  if (pochette) {
    await db
      .update(consommablesTable)
      .set({ quantite: Math.max(0, pochette.quantite - nbArticles) })
      .where(eq(consommablesTable.id, pochette.id));
  }
}

export async function restaurerConsommables(nbArticles: number): Promise<void> {
  const rows = await db.select().from(consommablesTable).orderBy(consommablesTable.id);
  const sac = rows.find((r) => r.nom === "Sac");
  const pochette = rows.find((r) => r.nom === "Pochette");

  if (sac) {
    await db
      .update(consommablesTable)
      .set({ quantite: sac.quantite + 1 })
      .where(eq(consommablesTable.id, sac.id));
  }

  if (pochette) {
    await db
      .update(consommablesTable)
      .set({ quantite: pochette.quantite + nbArticles })
      .where(eq(consommablesTable.id, pochette.id));
  }
}
