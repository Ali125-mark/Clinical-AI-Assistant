import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface SuggestedTest {
  name: string;
  type: string;
  reason: string;
  urgency: string;
}

const urgencyConfig = {
  stat: { label: "STAT", color: "#DC2626" },
  urgent: { label: "Urgent", color: "#D97706" },
  routine: { label: "Routine", color: "#059669" },
};

const typeIcon = {
  lab: "droplet" as const,
  imaging: "aperture" as const,
  other: "activity" as const,
};

export function TestCard({ test }: { test: SuggestedTest }) {
  const colors = useColors();
  const urgency = urgencyConfig[test.urgency as keyof typeof urgencyConfig] ?? urgencyConfig.routine;
  const icon = typeIcon[test.type as keyof typeof typeIcon] ?? "activity";

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.row}>
        <View style={[styles.iconBox, { backgroundColor: colors.accent + "15" }]}>
          <Feather name={icon} size={16} color={colors.accent} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.foreground }]}>{test.name}</Text>
          <Text style={[styles.reason, { color: colors.mutedForeground }]}>{test.reason}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: urgency.color + "18" }]}>
          <Text style={[styles.badgeText, { color: urgency.color }]}>{urgency.label}</Text>
        </View>
      </View>
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
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  iconBox: {
    width: 34,
    height: 34,
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
    marginBottom: 2,
  },
  reason: {
    fontSize: 13,
    lineHeight: 18,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
