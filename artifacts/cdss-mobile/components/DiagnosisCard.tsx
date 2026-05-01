import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Diagnosis {
  name: string;
  confidence: number;
  description: string;
  icdCode?: string | null;
}

export function DiagnosisCard({ diagnosis, rank }: { diagnosis: Diagnosis; rank: number }) {
  const colors = useColors();
  const pct = Math.round(diagnosis.confidence * 100);

  const barColor =
    pct >= 70 ? colors.success : pct >= 40 ? colors.warning : colors.mutedForeground;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.rank, { backgroundColor: colors.primary }]}>
          <Text style={styles.rankText}>{rank}</Text>
        </View>
        <View style={styles.titleBlock}>
          <Text style={[styles.name, { color: colors.foreground }]}>{diagnosis.name}</Text>
          {diagnosis.icdCode && (
            <Text style={[styles.icd, { color: colors.mutedForeground }]}>ICD: {diagnosis.icdCode}</Text>
          )}
        </View>
        <Text style={[styles.pct, { color: barColor }]}>{pct}%</Text>
      </View>

      <View style={[styles.track, { backgroundColor: colors.secondary }]}>
        <View style={[styles.bar, { width: `${pct}%` as any, backgroundColor: barColor }]} />
      </View>

      <Text style={[styles.desc, { color: colors.mutedForeground }]}>{diagnosis.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  rank: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  titleBlock: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
  },
  icd: {
    fontSize: 12,
    marginTop: 2,
  },
  pct: {
    fontSize: 16,
    fontWeight: "700",
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 10,
  },
  bar: {
    height: "100%",
    borderRadius: 3,
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
  },
});
