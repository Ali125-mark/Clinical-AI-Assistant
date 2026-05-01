import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface Treatment {
  name: string;
  type: string;
  description: string;
  dosageRange?: string | null;
  contraindications?: string | null;
  interactions?: string | null;
}

const typeConfig = {
  medication: { icon: "package" as const, label: "Medication" },
  procedure: { icon: "tool" as const, label: "Procedure" },
  lifestyle: { icon: "heart" as const, label: "Lifestyle" },
  referral: { icon: "external-link" as const, label: "Referral" },
};

export function TreatmentCard({ treatment }: { treatment: Treatment }) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);
  const cfg = typeConfig[treatment.type as keyof typeof typeConfig] ?? typeConfig.medication;

  const hasDetails = treatment.dosageRange || treatment.contraindications || treatment.interactions;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => hasDetails && setExpanded(!expanded)}
        activeOpacity={hasDetails ? 0.7 : 1}
      >
        <View style={[styles.iconBox, { backgroundColor: colors.primary + "12" }]}>
          <Feather name={cfg.icon} size={15} color={colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.foreground }]}>{treatment.name}</Text>
          <Text style={[styles.type, { color: colors.mutedForeground }]}>{cfg.label}</Text>
        </View>
        {hasDetails && (
          <Feather name={expanded ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
        )}
      </TouchableOpacity>

      <Text style={[styles.desc, { color: colors.mutedForeground }]}>{treatment.description}</Text>

      {expanded && (
        <View style={styles.details}>
          {treatment.dosageRange && (
            <View style={styles.detail}>
              <Text style={[styles.detailLabel, { color: colors.foreground }]}>Dosage Range</Text>
              <Text style={[styles.detailText, { color: colors.mutedForeground }]}>{treatment.dosageRange}</Text>
            </View>
          )}
          {treatment.contraindications && (
            <View style={styles.detail}>
              <Text style={[styles.detailLabel, { color: colors.emergency }]}>Contraindications</Text>
              <Text style={[styles.detailText, { color: colors.mutedForeground }]}>{treatment.contraindications}</Text>
            </View>
          )}
          {treatment.interactions && (
            <View style={styles.detail}>
              <Text style={[styles.detailLabel, { color: colors.warning }]}>Drug Interactions</Text>
              <Text style={[styles.detailText, { color: colors.mutedForeground }]}>{treatment.interactions}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
  },
  type: {
    fontSize: 12,
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  details: {
    marginTop: 8,
    gap: 8,
  },
  detail: {
    gap: 2,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
