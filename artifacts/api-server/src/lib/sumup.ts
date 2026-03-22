interface SumUpTokenCache {
  access_token: string;
  expiresAt: number;
}

let tokenCache: SumUpTokenCache | null = null;

async function getToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt - 30_000) {
    return tokenCache.access_token;
  }

  const clientId = process.env.SUMUP_CLIENT_ID;
  const clientSecret = process.env.SUMUP_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("SUMUP_CLIENT_ID et SUMUP_CLIENT_SECRET doivent être configurés");
  }

  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch("https://api.sumup.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`SumUp auth échouée: ${response.status} — ${text}`);
  }

  const data = await response.json() as { access_token: string; expires_in: number };
  tokenCache = {
    access_token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return tokenCache.access_token;
}

export interface SumUpCheckout {
  id: string;
  checkout_reference: string;
  amount: number;
  currency: string;
  status: string;
  transaction_id?: string;
  transactions?: Array<{ id: string; status: string }>;
  description?: string;
}

export async function createCheckout(params: {
  amountCentimes: number;
  reference: string;
  description: string;
}): Promise<SumUpCheckout> {
  const token = await getToken();

  const body: Record<string, unknown> = {
    checkout_reference: params.reference,
    amount: +(params.amountCentimes / 100).toFixed(2),
    currency: "EUR",
    description: params.description,
  };

  const merchantEmail = process.env.SUMUP_PAY_TO_EMAIL;
  if (merchantEmail) body.pay_to_email = merchantEmail;

  const response = await fetch("https://api.sumup.com/v0.1/checkouts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`SumUp création checkout échouée: ${response.status} — ${text}`);
  }

  return response.json() as Promise<SumUpCheckout>;
}

export async function getCheckoutStatus(checkoutId: string): Promise<SumUpCheckout> {
  const token = await getToken();

  const response = await fetch(`https://api.sumup.com/v0.1/checkouts/${checkoutId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`SumUp vérification statut échouée: ${response.status} — ${text}`);
  }

  return response.json() as Promise<SumUpCheckout>;
}

export async function pushToTerminal(checkoutId: string): Promise<void> {
  const terminalId = process.env.SUMUP_TERMINAL_ID;
  const merchantCode = process.env.SUMUP_MERCHANT_CODE;
  if (!terminalId || !merchantCode) return;

  const token = await getToken();

  const response = await fetch(
    `https://api.sumup.com/v0.1/merchants/${merchantCode}/terminals/${terminalId}/checkouts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ checkout_reference: checkoutId }),
    }
  );

  if (!response.ok) {
    console.warn("Push terminal SumUp échoué (non-fatal):", await response.text());
  }
}
