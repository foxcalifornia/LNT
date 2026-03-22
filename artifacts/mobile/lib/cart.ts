import type { Produit } from "./api";

export type CartItem = {
  produit: Produit & { collectionNom: string };
  quantite: number;
};

export type FreeDetail = {
  produitId: number;
  couleur: string;
  collectionNom: string;
  prixCentimes: number;
  count: number;
};

export type PromoResult = {
  nbFree: number;
  discountCentimes: number;
  freeDetails: FreeDetail[];
};

export function computePromo(cart: CartItem[]): PromoResult {
  const units: { produitId: number; couleur: string; collectionNom: string; prixCentimes: number }[] = [];
  for (const item of cart) {
    for (let i = 0; i < item.quantite; i++) {
      units.push({
        produitId: item.produit.id,
        couleur: item.produit.couleur,
        collectionNom: item.produit.collectionNom,
        prixCentimes: item.produit.prixCentimes,
      });
    }
  }

  const totalUnits = units.length;
  const nbFree = Math.floor(totalUnits / 3);
  if (nbFree === 0) return { nbFree: 0, discountCentimes: 0, freeDetails: [] };

  units.sort((a, b) => a.prixCentimes - b.prixCentimes);
  const freeUnits = units.slice(0, nbFree);
  const discountCentimes = freeUnits.reduce((s, u) => s + u.prixCentimes, 0);

  const freeMap = new Map<number, FreeDetail>();
  for (const u of freeUnits) {
    const existing = freeMap.get(u.produitId);
    if (existing) {
      existing.count += 1;
    } else {
      freeMap.set(u.produitId, { ...u, count: 1 });
    }
  }

  return { nbFree, discountCentimes, freeDetails: Array.from(freeMap.values()) };
}

export function cartTotalItems(cart: CartItem[]): number {
  return cart.reduce((s, i) => s + i.quantite, 0);
}

export function cartTotalCentimes(cart: CartItem[]): number {
  return cart.reduce((s, i) => s + i.produit.prixCentimes * i.quantite, 0);
}
