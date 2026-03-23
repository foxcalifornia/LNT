import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const consommablesTable = pgTable("consommables", {
  id: serial("id").primaryKey(),
  nom: text("nom").notNull(),
  quantite: integer("quantite").notNull().default(0),
  stockMinimum: integer("stock_minimum").notNull().default(10),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Consommable = typeof consommablesTable.$inferSelect;
