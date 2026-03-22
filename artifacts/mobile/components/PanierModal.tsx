import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { formatPrix } from "@/lib/api";
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
  onClose: () => void;
  onOpenVente: (mode: "cash" | "carte") => void;
};

export function PanierModal({ visible, cart, onClose, onOpenVente }: Props) {
  const insets = useSafeAreaInsets();
  const promo = computePromo(cart);
  const totalItems = cartTotalItems(cart);
  const totalCentimes = cartTotalCentimes(cart);
  const totalFinal = totalCentimes - promo.discountCentimes;
  const hasPromo = promo.nbFree > 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={{ width: 36 }} />
            <Text style={styles.title}>Panier actuel</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={18} color={COLORS.textSecondary} />
            </Pressable>
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="shopping-cart" size={44} color={COLORS.border} />
              <Text style={styles.emptyTitle}>Panier vide</Text>
              <Text style={styles.emptySubtitle}>
                Appuyez sur "Vente Cash" ou "Vente Carte" pour commencer
              </Text>
            </View>
          ) : (
            <>
              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 }}
              >
                <Text style={styles.sectionLabel}>Articles ({totalItems})</Text>

                {cart.map((item) => (
                  <View key={item.produit.id} style={styles.itemRow}>
                    <View style={styles.itemLeft}>
                      <Text style={styles.itemCollection} numberOfLines={1}>
                        {item.produit.collectionNom}
                      </Text>
                      <Text style={styles.itemCouleur} numberOfLines={1}>
                        {item.produit.couleur}
                      </Text>
                    </View>
                    <View style={styles.itemRight}>
                      <Text style={styles.itemQty}>× {item.quantite}</Text>
                      <Text style={styles.itemPrix}>
                        {formatPrix(item.produit.prixCentimes * item.quantite)}
                      </Text>
                    </View>
                  </View>
                ))}

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
    maxHeight: "90%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: COLORS.text,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 56,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: COLORS.text,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  scrollView: {
    maxHeight: 420,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 10,
    marginTop: 4,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemLeft: {
    flex: 1,
    gap: 2,
  },
  itemCollection: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.text,
  },
  itemCouleur: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: COLORS.textSecondary,
    textTransform: "capitalize",
  },
  itemRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  itemQty: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: COLORS.textSecondary,
  },
  itemPrix: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: COLORS.text,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  totauxBlock: {
    gap: 6,
    marginBottom: 8,
  },
  totauxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totauxLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: COLORS.textSecondary,
  },
  totauxValue: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.text,
  },
  promoBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.promo + "12",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginVertical: 4,
  },
  promoBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flex: 1,
  },
  promoBannerText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.promo,
    flexShrink: 1,
  },
  promoDiscount: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: COLORS.promo,
  },
  promoDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 4,
  },
  promoDetailText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: COLORS.promo,
  },
  promoDetailPrice: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: COLORS.promo + "AA",
  },
  totalFinalRow: {
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.border,
  },
  totalFinalLabel: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: COLORS.text,
  },
  totalFinalValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: COLORS.accent,
    letterSpacing: -0.5,
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  payBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
  },
  payBtnText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: -0.2,
  },
});
