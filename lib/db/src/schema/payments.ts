import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export const cardPaymentsTable = pgTable("card_payments", {
  id: serial("id").primaryKey(),
  saleReference: text("sale_reference").notNull().unique(),
  sumupCheckoutId: text("sumup_checkout_id"),
  sumupTransactionId: text("sumup_transaction_id"),
  amountCentimes: integer("amount_centimes").notNull(),
  status: text("status").notNull().default("pending"),
  itemsJson: jsonb("items_json").notNull(),
  responseJson: jsonb("response_json"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CardPayment = typeof cardPaymentsTable.$inferSelect;
