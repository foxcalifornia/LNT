import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { formatPrix, type CollectionWithProduits, type Produit } from "@/lib/api";
import {
  cartTotalCentimes,
  cartTotalItems,
  computePromo,
  type CartItem,
} from "@/lib/cart";

const COLORS = Colors.light;

type Props = {
  visible: boolean;
  cart: CartItem[];
  collections: CollectionWithProduits[];
  onCartChange: (cart: CartItem[]) => void;
  onClose: () => void;
  onOpenVente: (mode: "cash" | "carte") => void;
};

export function PanierModal({ visible, cart, collections, onCartChange, onClose, onOpenVente }: Props) {
  const insets = useSafeAreaInsets();
  const [editingProduitId, setEditingProduitId] = useState<number | null>(null);

  const promo = computePromo(cart);
  const totalItems = cartTotalItems(cart);
  const totalCentimes = cartTotalCentimes(cart);
  const totalFinal = totalCentimes - promo.discountCentimes;
  const hasPromo = promo.nbFree > 0;

  const updateQty = (produitId: number, delta: number) => {
    Haptics.selectionAsync();
    const item = cart.find((i) => i.produit.id === produitId);
    if (!item) return;
    const next = item.quantite + delta;
    if (next <= 0) {
      confirmDelete(produitId);
      return;
    }
    const maxStock = item.produit.quantite;
    const capped = Math.min(next, maxStock);
    onCartChange(cart.map((i) => i.produit.id === produitId ? { ...i, quantite: capped } : i));
  };

  const confirmDelete = (produitId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Supprimer l'article ?", "Cet article sera retiré du panier.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setEditingProduitId(null);
          onCartChange(cart.filter((i) => i.produit.id !== produitId));
        },
      },
    ]);
  };

  const swapVariant = (oldProduitId: number, newProduit: Produit & { collectionNom: string }) => {
    Haptics.selectionAsync();
    const oldItem = cart.find((i) => i.produit.id === oldProduitId);
    if (!oldItem) return;

    const alreadyInCart = cart.find((i) => i.produit.id === newProduit.id);
    let newCart: CartItem[];

    if (alreadyInCart) {
      const merged = Math.min(alreadyInCart.quantite + oldItem.quantite, newProduit.quantite);
      newCart = cart
        .filter((i) => i.produit.id !== oldProduitId)
        .map((i) => i.produit.id === newProduit.id ? { ...i, quantite: merged } : i);
    } else {
      const qty = Math.min(oldItem.quantite, newProduit.quantite);
      newCart = cart
        .filter((i) => i.produit.id !== oldProduitId)
        .concat([{ produit: newProduit, quantite: qty }]);
    }

    onCartChange(newCart);
    setEditingProduitId(null);
  };

  const toggleEdit = (produitId: number) => {
    Haptics.selectionAsync();
    setEditingProduitId((prev) => (prev === produitId ? null : produitId));
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={{ width: 36 }} />
            <Text style={styles.title}>
              Panier actuel{totalItems > 0 ? ` · ${totalItems} article${totalItems > 1 ? "s" : ""}` : ""}
            </Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={18} color={COLORS.textSecondary} />
            </Pressable>
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="shopping-cart" size={44} color={COLORS.border} />
              <Text style={styles.emptyTitle}>Panier vide</Text>
              <Text style={styles.emptySubtitle}>
                Appuyez sur "Vente Cash" ou "Vente Carte" pour ajouter des articles
              </Text>
            </View>
          ) : (
            <>
              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 }}
                keyboardShouldPersistTaps="handled"
              >
                {cart.map((item) => {
                  const isEditing = editingProduitId === item.produit.id;
                  const freeCount = promo.freeDetails.find((f) => f.produitId === item.produit.id)?.count ?? 0;
                  const collection = collections.find((c) => c.nom === item.produit.collectionNom);
                  const otherVariants = collection
                    ? collection.produits.filter((p) => p.id !== item.produit.id && p.quantite > 0)
                    : [];

                  return (
                    <View key={item.produit.id} style={[styles.itemCard, isEditing && styles.itemCardEditing]}>
                      <View style={styles.itemTop}>
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemCollection}>{item.produit.collectionNom}</Text>
                          <View style={styles.itemNameRow}>
                            <Text style={styles.itemCouleur}>{item.produit.couleur}</Text>
                            {freeCount > 0 && (
                              <View style={styles.freeBadge}>
                                <Feather name="gift" size={10} color="#fff" />
                                <Text style={styles.freeBadgeText}>
                                  {freeCount > 1 ? `${freeCount}× ` : ""}offerte{freeCount > 1 ? "s" : ""}
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.itemPrixUnit}>
                            {formatPrix(item.produit.prixCentimes)} / paire
                          </Text>
                        </View>

                        <View style={styles.itemActions}>
                          <View style={styles.qtyRow}>
                            <Pressable
                              style={styles.qtyBtn}
                              onPress={() => updateQty(item.produit.id, -1)}
                            >
                              <Feather name="minus" size={14} color={COLORS.text} />
                            </Pressable>
                            <Text style={styles.qtyVal}>{item.quantite}</Text>
                            <Pressable
                              style={[styles.qtyBtn, item.quantite >= item.produit.quantite && styles.qtyBtnDisabled]}
                              onPress={() => updateQty(item.produit.id, +1)}
                              disabled={item.quantite >= item.produit.quantite}
                            >
                              <Feather
                                name="plus"
                                size={14}
                                color={item.quantite >= item.produit.quantite ? COLORS.border : COLORS.text}
                              />
                            </Pressable>
                          </View>
                          <Text style={styles.itemTotal}>
                            {formatPrix(item.produit.prixCentimes * item.quantite)}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.itemBtns}>
                        {otherVariants.length > 0 && (
                          <Pressable
                            style={[styles.editBtn, isEditing && styles.editBtnActive]}
                            onPress={() => toggleEdit(item.produit.id)}
                          >
                            <Feather
                              name="edit-2"
                              size={13}
                              color={isEditing ? COLORS.accent : COLORS.textSecondary}
                            />
                            <Text style={[styles.editBtnText, isEditing && { color: COLORS.accent }]}>
                              {isEditing ? "Fermer" : "Changer le modèle"}
                            </Text>
                          </Pressable>
                        )}
                        <Pressable
                          style={styles.deleteBtn}
                          onPress={() => confirmDelete(item.produit.id)}
                        >
                          <Feather name="trash-2" size={13} color={COLORS.danger} />
                          <Text style={styles.deleteBtnText}>Supprimer</Text>
                        </Pressable>
                      </View>

                      {isEditing && otherVariants.length > 0 && (
                        <View style={styles.variantPanel}>
                          <Text style={styles.variantPanelTitle}>Choisir une variante</Text>
                          {otherVariants.map((p) => (
                            <Pressable
                              key={p.id}
                              style={styles.variantRow}
                              onPress={() =>
                                swapVariant(item.produit.id, {
                                  ...p,
                                  collectionNom: item.produit.collectionNom,
                                })
                              }
                            >
                              <View style={[styles.variantColorDot, { backgroundColor: getColorHex(p.couleur) }]} />
                              <View style={{ flex: 1 }}>
                                <Text style={styles.variantCouleur}>{p.couleur}</Text>
                                <Text style={styles.variantStock}>{p.quantite} en stock</Text>
                              </View>
                              <Text style={styles.variantPrix}>{formatPrix(p.prixCentimes)}</Text>
                              <Feather name="chevron-right" size={16} color={COLORS.textSecondary} />
                            </Pressable>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}

                <View style={styles.separator} />

                <View style={styles.totauxBlock}>
                  <View style={styles.totauxRow}>
                    <Text style={styles.totauxLabel}>Sous-total</Text>
                    <Text style={styles.totauxValue}>{formatPrix(totalCentimes)}</Text>
                  </View>

                  {hasPromo && (
                    <>
                      <View style={styles.promoBanner}>
                        <View style={styles.promoBannerLeft}>
                          <Feather name="gift" size={13} color={COLORS.promo} />
                          <Text style={styles.promoBannerText}>
                            Promo 2+1 · {promo.nbFree} paire{promo.nbFree > 1 ? "s" : ""} offerte{promo.nbFree > 1 ? "s" : ""}
                          </Text>
                        </View>
                        <Text style={styles.promoDiscount}>-{formatPrix(promo.discountCentimes)}</Text>
                      </View>

                      {promo.freeDetails.map((fd) => (
                        <View key={fd.produitId} style={styles.promoDetailRow}>
                          <Feather name="check" size={11} color={COLORS.promo} />
                          <Text style={styles.promoDetailText} numberOfLines={1}>
                            {fd.count > 1 ? `${fd.count}× ` : ""}{fd.collectionNom} – {fd.couleur}
                          </Text>
                          <Text style={styles.promoDetailPrice}>
                            {fd.count > 1
                              ? `${formatPrix(fd.prixCentimes)} × ${fd.count}`
                              : formatPrix(fd.prixCentimes)}
                          </Text>
                        </View>
                      ))}
                    </>
                  )}

                  <View style={[styles.totauxRow, styles.totalFinalRow]}>
                    <Text style={styles.totalFinalLabel}>Total à payer</Text>
                    <Text style={styles.totalFinalValue}>{formatPrix(totalFinal)}</Text>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.footer}>
                <Pressable
                  style={[styles.payBtn, { backgroundColor: COLORS.cash }]}
                  onPress={() => { onClose(); onOpenVente("cash"); }}
                >
                  <Feather name="dollar-sign" size={17} color="#fff" />
                  <Text style={styles.payBtnText}>Payer Cash</Text>
                </Pressable>
                <Pressable
                  style={[styles.payBtn, { backgroundColor: COLORS.card_payment }]}
                  onPress={() => { onClose(); onOpenVente("carte"); }}
                >
                  <Feather name="credit-card" size={17} color="#fff" />
                  <Text style={styles.payBtnText}>Payer Carte</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function getColorHex(couleur: string): string {
  const map: Record<string, string> = {
    bleu: "#3B82F6", rouge: "#EF4444", vert: "#10B981",
    noir: "#1F2937", blanc: "#D1D5DB", rose: "#EC4899",
    jaune: "#F59E0B", violet: "#8B5CF6", orange: "#F97316",
    gris: "#6B7280", beige: "#D2B48C", marron: "#92400E",
  };
  return map[couleur.toLowerCase()] ?? Colors.light.accent;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "92%",
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center", marginTop: 12, marginBottom: 4,
  },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 8,
  },
  title: {
    flex: 1, fontSize: 17, fontFamily: "Inter_700Bold",
    color: COLORS.text, textAlign: "center", letterSpacing: -0.3,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: COLORS.background,
    borderWidth: 1, borderColor: COLORS.border,
    justifyContent: "center", alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center", paddingVertical: 56, paddingHorizontal: 32, gap: 12,
  },
  emptyTitle: {
    fontSize: 18, fontFamily: "Inter_700Bold", color: COLORS.text, marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13, fontFamily: "Inter_400Regular",
    color: COLORS.textSecondary, textAlign: "center", lineHeight: 20,
  },
  scrollView: { maxHeight: 480 },

  itemCard: {
    backgroundColor: COLORS.background, borderRadius: 16,
    borderWidth: 1.5, borderColor: COLORS.border,
    marginBottom: 10, overflow: "hidden",
  },
  itemCardEditing: {
    borderColor: COLORS.accent + "60",
  },
  itemTop: {
    flexDirection: "row", padding: 14, gap: 12, alignItems: "flex-start",
  },
  itemInfo: { flex: 1, gap: 3 },
  itemCollection: {
    fontSize: 11, fontFamily: "Inter_500Medium",
    color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.5,
  },
  itemNameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  itemCouleur: {
    fontSize: 15, fontFamily: "Inter_700Bold",
    color: COLORS.text, textTransform: "capitalize",
  },
  freeBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: COLORS.promo, borderRadius: 7,
    paddingHorizontal: 6, paddingVertical: 3,
  },
  freeBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff" },
  itemPrixUnit: {
    fontSize: 12, fontFamily: "Inter_400Regular", color: COLORS.accent,
  },
  itemActions: { alignItems: "flex-end", gap: 8 },
  qtyRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: COLORS.card, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 8, paddingVertical: 6,
  },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1, borderColor: COLORS.border,
    justifyContent: "center", alignItems: "center",
  },
  qtyBtnDisabled: { opacity: 0.35 },
  qtyVal: {
    fontSize: 16, fontFamily: "Inter_700Bold",
    color: COLORS.text, minWidth: 24, textAlign: "center",
  },
  itemTotal: {
    fontSize: 15, fontFamily: "Inter_700Bold",
    color: COLORS.text, textAlign: "right",
  },
  itemBtns: {
    flexDirection: "row",
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  editBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 6,
    paddingVertical: 11,
    borderRightWidth: 1, borderRightColor: COLORS.border,
  },
  editBtnActive: { backgroundColor: COLORS.accent + "08" },
  editBtnText: {
    fontSize: 12, fontFamily: "Inter_600SemiBold", color: COLORS.textSecondary,
  },
  deleteBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 6, paddingVertical: 11,
  },
  deleteBtnText: {
    fontSize: 12, fontFamily: "Inter_600SemiBold", color: COLORS.danger,
  },
  variantPanel: {
    borderTopWidth: 1, borderTopColor: COLORS.accent + "30",
    backgroundColor: COLORS.accent + "05",
    padding: 12, gap: 4,
  },
  variantPanelTitle: {
    fontSize: 10, fontFamily: "Inter_600SemiBold",
    color: COLORS.accent, textTransform: "uppercase",
    letterSpacing: 1, marginBottom: 6,
  },
  variantRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.card, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 12, paddingVertical: 11, gap: 10, marginBottom: 6,
  },
  variantColorDot: {
    width: 14, height: 14, borderRadius: 7,
    borderWidth: 1, borderColor: "rgba(0,0,0,0.12)",
  },
  variantCouleur: {
    fontSize: 14, fontFamily: "Inter_600SemiBold",
    color: COLORS.text, textTransform: "capitalize",
  },
  variantStock: {
    fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textSecondary,
  },
  variantPrix: {
    fontSize: 13, fontFamily: "Inter_700Bold", color: COLORS.accent,
  },

  separator: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  totauxBlock: { gap: 6, marginBottom: 4 },
  totauxRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totauxLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: COLORS.textSecondary },
  totauxValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.text },
  promoBanner: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: COLORS.promo + "12", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 9, marginVertical: 4,
  },
  promoBannerLeft: { flexDirection: "row", alignItems: "center", gap: 7, flex: 1 },
  promoBannerText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: COLORS.promo, flexShrink: 1 },
  promoDiscount: { fontSize: 14, fontFamily: "Inter_700Bold", color: COLORS.promo },
  promoDetailRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 4 },
  promoDetailText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", color: COLORS.promo },
  promoDetailPrice: { fontSize: 11, fontFamily: "Inter_500Medium", color: COLORS.promo + "AA" },
  totalFinalRow: { paddingTop: 8, marginTop: 4, borderTopWidth: 1.5, borderTopColor: COLORS.border },
  totalFinalLabel: { fontSize: 16, fontFamily: "Inter_700Bold", color: COLORS.text },
  totalFinalValue: {
    fontSize: 20, fontFamily: "Inter_700Bold", color: COLORS.accent, letterSpacing: -0.5,
  },
  footer: {
    flexDirection: "row", gap: 10,
    paddingHorizontal: 16, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  payBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8, paddingVertical: 15, borderRadius: 14,
  },
  payBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: -0.2 },
});
