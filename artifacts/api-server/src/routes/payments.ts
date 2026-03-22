import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { cardPaymentsTable, ventesTable, produitsTable } from "@workspace/db/schema";
import { createCheckout, getCheckoutStatus, pushToTerminal } from "../lib/sumup";

const router: IRouter = Router();

type PaymentItem = {
  produitId: number;
  quantite: number;
  montantCentimes: number;
};

function sumupStatusToLocal(sumupStatus: string): "pending" | "paid" | "failed" | "cancelled" {
  const s = sumupStatus.toUpperCase();
  if (s === "PAID") return "paid";
  if (s === "FAILED") return "failed";
  if (s === "CANCELLED" || s === "EXPIRED") return "cancelled";
  return "pending";
}

router.post("/sumup/create", async (req, res) => {
  try {
    const { amountCentimes, items, description } = req.body as {
      amountCentimes: number;
      items: PaymentItem[];
      description?: string;
    };

    if (!amountCentimes || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "amountCentimes et items (non vides) requis" });
      return;
    }

    const saleReference = `LNT-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;

    const checkout = await createCheckout({
      amountCentimes,
      reference: saleReference,
      description: description ?? `Vente LNT Paris — ${items.length} article(s)`,
    });

    await pushToTerminal(checkout.id).catch(() => {});

    const [payment] = await db
      .insert(cardPaymentsTable)
      .values({
        saleReference,
        sumupCheckoutId: checkout.id,
        amountCentimes,
        status: "pending",
        itemsJson: items,
        responseJson: checkout,
      })
      .returning();

    res.status(201).json({
      saleReference,
      checkoutId: checkout.id,
      paymentId: payment.id,
      status: "pending",
    });
  } catch (error: unknown) {
    req.log.error(error);
    const msg = error instanceof Error ? error.message : "Erreur lors de la création du paiement SumUp";
    res.status(502).json({ error: msg });
  }
});

router.get("/sumup/status/:ref", async (req, res) => {
  try {
    const { ref } = req.params;

    const [payment] = await db
      .select()
      .from(cardPaymentsTable)
      .where(eq(cardPaymentsTable.saleReference, ref));

    if (!payment) {
      res.status(404).json({ error: "Paiement non trouvé" });
      return;
    }

    if (payment.status === "paid" || payment.status === "failed" || payment.status === "cancelled") {
      res.json({
        status: payment.status,
        saleReference: ref,
        sumupTransactionId: payment.sumupTransactionId,
      });
      return;
    }

    if (!payment.sumupCheckoutId) {
      res.json({ status: payment.status, saleReference: ref });
      return;
    }

    const checkout = await getCheckoutStatus(payment.sumupCheckoutId);
    const localStatus = sumupStatusToLocal(checkout.status ?? "");
    const transactionId = checkout.transaction_id ?? checkout.transactions?.[0]?.id ?? null;

    if (localStatus !== payment.status) {
      await db
        .update(cardPaymentsTable)
        .set({
          status: localStatus,
          sumupTransactionId: transactionId,
          responseJson: checkout,
          ...(localStatus === "paid" ? { paidAt: new Date() } : {}),
        })
        .where(eq(cardPaymentsTable.saleReference, ref));
    }

    res.json({
      status: localStatus,
      saleReference: ref,
      sumupStatus: checkout.status,
      sumupTransactionId: transactionId,
    });
  } catch (error: unknown) {
    req.log.error(error);
    const msg = error instanceof Error ? error.message : "Erreur lors de la vérification du statut";
    res.status(502).json({ error: msg });
  }
});

router.post("/sumup/confirm", async (req, res) => {
  try {
    const { saleReference, sessionId } = req.body as {
      saleReference: string;
      sessionId?: number | null;
    };

    if (!saleReference) {
      res.status(400).json({ error: "saleReference requis" });
      return;
    }

    const [payment] = await db
      .select()
      .from(cardPaymentsTable)
      .where(eq(cardPaymentsTable.saleReference, saleReference));

    if (!payment) {
      res.status(404).json({ error: "Paiement non trouvé" });
      return;
    }

    if (payment.status !== "paid") {
      if (!payment.sumupCheckoutId) {
        res.status(400).json({ error: "Paiement non validé" });
        return;
      }
      const checkout = await getCheckoutStatus(payment.sumupCheckoutId);
      if (checkout.status?.toUpperCase() !== "PAID") {
        res.status(400).json({ error: `Paiement SumUp non validé (statut: ${checkout.status})` });
        return;
      }
      await db
        .update(cardPaymentsTable)
        .set({
          status: "paid",
          sumupTransactionId: checkout.transaction_id ?? null,
          responseJson: checkout,
          paidAt: new Date(),
        })
        .where(eq(cardPaymentsTable.saleReference, saleReference));
    }

    const items = payment.itemsJson as PaymentItem[];
    const venteIds: number[] = [];

    for (const item of items) {
      const [produit] = await db
        .select({ quantite: produitsTable.quantite })
        .from(produitsTable)
        .where(eq(produitsTable.id, item.produitId));

      if (!produit) continue;

      await db
        .update(produitsTable)
        .set({ quantite: Math.max(0, produit.quantite - item.quantite) })
        .where(eq(produitsTable.id, item.produitId));

      const [vente] = await db
        .insert(ventesTable)
        .values({
          produitId: item.produitId,
          quantiteVendue: item.quantite,
          typePaiement: "CARTE",
          montantCentimes: item.montantCentimes,
          sessionId: sessionId ?? null,
        })
        .returning();

      venteIds.push(vente.id);
    }

    res.json({ success: true, venteIds, saleReference });
  } catch (error: unknown) {
    req.log.error(error);
    const msg = error instanceof Error ? error.message : "Erreur lors de la confirmation de la vente";
    res.status(500).json({ error: msg });
  }
});

router.post("/sumup/cancel", async (req, res) => {
  try {
    const { saleReference } = req.body as { saleReference: string };

    if (!saleReference) {
      res.status(400).json({ error: "saleReference requis" });
      return;
    }

    await db
      .update(cardPaymentsTable)
      .set({ status: "cancelled" })
      .where(eq(cardPaymentsTable.saleReference, saleReference));

    res.json({ success: true });
  } catch (error: unknown) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur lors de l'annulation" });
  }
});

export default router;
