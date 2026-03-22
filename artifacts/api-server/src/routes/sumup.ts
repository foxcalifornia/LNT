import { Router, type IRouter } from "express";

const router: IRouter = Router();

const SUMUP_BASE = "https://api.sumup.com";

function getApiKey(): string {
  const key = process.env.SUMUP_API_KEY;
  if (!key) throw new Error("SUMUP_API_KEY non configurée");
  return key;
}

router.post("/checkout", async (req, res) => {
  try {
    const { amountCentimes, description } = req.body;
    if (!amountCentimes || amountCentimes <= 0) {
      res.status(400).json({ error: "Montant invalide" });
      return;
    }

    const amount = (amountCentimes / 100).toFixed(2);
    const reference = `LNTPARIS-${Date.now()}`;

    const response = await fetch(`${SUMUP_BASE}/v0.1/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checkout_reference: reference,
        amount: parseFloat(amount),
        currency: "EUR",
        description: description ?? "Vente LNT Paris",
        merchant_code: process.env.SUMUP_MERCHANT_CODE ?? "MC4VDM6U",
      }),
    });

    const data = await response.json() as Record<string, unknown>;

    if (!response.ok) {
      req.log.error({ status: response.status, data }, "SumUp checkout error");
      res.status(502).json({ error: "Erreur SumUp", detail: data });
      return;
    }

    const checkoutId = data.id as string;
    const checkoutUrl = `https://pay.sumup.com/b2c/${checkoutId}`;

    res.json({ checkoutId, checkoutUrl, reference });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur lors de la création du paiement" });
  }
});

router.get("/checkout/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const response = await fetch(`${SUMUP_BASE}/v0.1/checkouts/${id}`, {
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
      },
    });

    const data = await response.json() as Record<string, unknown>;

    if (!response.ok) {
      req.log.error({ status: response.status, data }, "SumUp status error");
      res.status(502).json({ error: "Erreur SumUp", detail: data });
      return;
    }

    const transactions = (data.transactions as { id?: string }[] | undefined) ?? [];
    const transactionId = transactions.length > 0 ? transactions[0].id : undefined;

    res.json({
      status: data.status,
      checkoutId: id,
      transactionId,
    });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Erreur lors de la vérification du paiement" });
  }
});

export default router;
