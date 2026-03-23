import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";

import Colors from "@/constants/colors";
import { api, formatPrix, type CollectionWithProduits, type Produit, type Consommable } from "@/lib/api";

const COLORS = Colors.light;

export default function InventaireScreen() {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data: collections = [], isLoading, refetch } = useQuery({
    queryKey: ["collections"],
    queryFn: api.inventory.getCollections,
  });

  const { data: consommables = [] } = useQuery({
    queryKey: ["consommables"],
    queryFn: api.inventory.getConsommables,
  });

  const toggle = (id: number) => setExpanded((prev) => (prev === id ? null : id));

  const totalPaires = collections.reduce(
    (s, c) => s + c.produits.reduce((ss, p) => ss + p.quantite, 0),
    0
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Inventaire</Text>
        <Pressable style={styles.refreshBtn} onPress={() => refetch()}>
          <Feather name="refresh-cw" size={18} color={COLORS.textSecondary} />
        </Pressable>
      </View>

      {/* Stats bar */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{collections.length}</Text>
          <Text style={styles.statLabel}>Collections</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {collections.reduce((s, c) => s + c.produits.length, 0)}
          </Text>
          <Text style={styles.statLabel}>Modèles</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.cash }]}>{totalPaires}</Text>
          <Text style={styles.statLabel}>Paires dispo</Text>
        </View>
      </View>

      <FlatList
        data={collections}
        keyExtractor={(c) => String(c.id)}
        renderItem={({ item: col }) => {
          const isOpen = expanded === col.id;
          const totalCol = col.produits.reduce((s, p) => s + p.quantite, 0);
          const hasAlerts = col.produits.some(
            (p) => p.stockMinimum > 0 && p.quantite < p.stockMinimum
          );
          return (
            <View style={styles.colCard}>
              <Pressable style={styles.colHeader} onPress={() => toggle(col.id)}>
                <View style={styles.colHeaderLeft}>
                  <View style={[styles.colIcon, { backgroundColor: COLORS.accent + "15" }]}>
                    <Feather name="layers" size={16} color={COLORS.accent} />
                  </View>
                  <View>
                    <View style={styles.colTitleRow}>
                      <Text style={styles.colName}>{col.nom}</Text>
                      {hasAlerts && <View style={styles.alertDot} />}
                    </View>
                    <Text style={styles.colSub}>
                      {col.produits.length} modèle{col.produits.length !== 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>
                <View style={styles.colHeaderRight}>
                  <View style={[styles.stockBadge, totalCol === 0 && styles.stockBadgeEmpty]}>
                    <Text
                      style={[
                        styles.stockBadgeText,
                        totalCol === 0 && { color: COLORS.danger },
                      ]}
                    >
                      {totalCol} paires
                    </Text>
                  </View>
                  <Feather
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={COLORS.textSecondary}
                  />
                </View>
              </Pressable>

              {isOpen && (
                <View style={styles.produitsList}>
                  {col.produits.length === 0 ? (
                    <Text style={styles.emptyText}>Aucun produit</Text>
                  ) : (
                    col.produits.map((p) => <ProduitRow key={p.id} produit={p} />)
                  )}
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          isLoading ? null : (
            <View style={styles.emptyState}>
              <Feather name="package" size={40} color={COLORS.border} />
              <Text style={styles.emptyStateText}>Aucune collection</Text>
            </View>
          )
        }
        ListFooterComponent={
          <ConsommablesReadonlySection consommables={consommables} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, 24) },
        ]}
      />
    </View>
  );
}

function ConsommablesReadonlySection({ consommables }: { consommables: Consommable[] }) {
  if (consommables.length === 0) return null;
  return (
    <View style={styles.consomSection}>
      <View style={styles.consomHeader}>
        <Feather name="shopping-bag" size={14} color={COLORS.accent} />
        <Text style={styles.consomTitle}>Sacs & Pochettes</Text>
      </View>
      {consommables.map((c) => {
        const isLow = c.stockMinimum > 0 && c.quantite < c.stockMinimum;
        const isEmpty = c.quantite === 0;
        return (
          <View key={c.id} style={styles.consomRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.consomNom}>{c.nom}</Text>
              <Text style={styles.consomHint}>
                {c.nom === "Sac" ? "-1 par vente" : "-1 par article"}
              </Text>
            </View>
            <View style={styles.consomRight}>
              {isLow && !isEmpty && (
                <Feather name="alert-triangle" size={13} color="#F59E0B" style={{ marginRight: 4 }} />
              )}
              <Text
                style={[
                  styles.consomQty,
                  isEmpty
                    ? { color: COLORS.danger }
                    : isLow
                    ? { color: "#F59E0B" }
                    : { color: COLORS.cash },
                ]}
              >
                {c.quantite}
              </Text>
              <Text style={styles.consomUnit}>
                {" "}{c.nom === "Sac" ? "sac" : "pochette"}{c.quantite !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function ProduitRow({ produit: p }: { produit: Produit }) {
  const isLow = p.stockMinimum > 0 && p.quantite < p.stockMinimum;
  const isEmpty = p.quantite === 0;

  return (
    <View style={[styles.produitRow, isEmpty && { opacity: 0.5 }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.produitNom}>{p.couleur}</Text>
        {p.prixCentimes > 0 && (
          <Text style={styles.produitPrix}>{formatPrix(p.prixCentimes)}</Text>
        )}
      </View>
      <View style={styles.stockInfo}>
        {isLow && !isEmpty && (
          <Feather name="alert-triangle" size={13} color="#F59E0B" style={{ marginRight: 4 }} />
        )}
        <Text
          style={[
            styles.stockQty,
            isEmpty
              ? { color: COLORS.danger }
              : isLow
              ? { color: "#F59E0B" }
              : { color: COLORS.cash },
          ]}
        >
          {p.quantite}
        </Text>
        <Text style={styles.stockUnit}> paire{p.quantite !== 1 ? "s" : ""}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
    gap: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: COLORS.text,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 64,
    gap: 14,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: COLORS.textSecondary,
  },
  colCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: 10,
    overflow: "hidden",
  },
  colHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  colHeaderLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  colIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  colTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  colName: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  alertDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#F59E0B",
  },
  colSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  colHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stockBadge: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stockBadgeEmpty: {
    borderColor: COLORS.danger + "40",
    backgroundColor: COLORS.danger + "10",
  },
  stockBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.text,
  },
  produitsList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
  },
  produitRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + "60",
  },
  produitNom: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: COLORS.text,
    textTransform: "capitalize",
  },
  produitPrix: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  stockInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  stockQty: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  stockUnit: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: COLORS.textSecondary,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
    paddingVertical: 12,
  },
  consomSection: {
    marginHorizontal: 0, marginTop: 8, marginBottom: 8,
    backgroundColor: COLORS.card,
    borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.border,
    overflow: "hidden",
  },
  consomHeader: {
    flexDirection: "row", alignItems: "center", gap: 8,
    padding: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  consomTitle: {
    fontSize: 13, fontFamily: "Inter_700Bold", color: COLORS.text,
    textTransform: "uppercase", letterSpacing: 0.8,
  },
  consomRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 12, paddingHorizontal: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border + "60",
  },
  consomNom: {
    fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.text,
  },
  consomHint: {
    fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textSecondary, marginTop: 2,
  },
  consomRight: {
    flexDirection: "row", alignItems: "center",
  },
  consomQty: {
    fontSize: 16, fontFamily: "Inter_700Bold",
  },
  consomUnit: {
    fontSize: 12, fontFamily: "Inter_400Regular", color: COLORS.textSecondary,
  },
});
