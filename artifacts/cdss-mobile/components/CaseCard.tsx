import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface CaseCardProps {
  id: number;
  patientName: string;
  age?: number | null;
  gender?: string | null;
  chiefComplaint: string;
  status: string;
  isEmergency: boolean;
  createdAt: string;
  onPress: () => void;
}

export function CaseCard({
  patientName,
  age,
  gender,
  chiefComplaint,
  status,
  isEmergency,
  createdAt,
  onPress,
}: CaseCardProps) {
  const colors = useColors();

  const statusConfig = {
    pending: { color: colors.warning, label: "Pending", icon: "clock" as const },
    analyzed: { color: colors.success, label: "Analyzed", icon: "check-circle" as const },
    emergency: { color: colors.emergency, label: "EMERGENCY", icon: "alert-circle" as const },
  };

  const cfg = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.pending;
  const dateStr = new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isEmergency ? colors.emergency : colors.border,
          borderWidth: isEmergency ? 2 : 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {isEmergency && (
        <View style={[styles.emergencyBanner, { backgroundColor: colors.emergency }]}>
          <Feather name="alert-triangle" size={12} color="#fff" />
          <Text style={styles.emergencyText}>EMERGENCY</Text>
        </View>
      )}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + "15" }]}>
          <Feather name="user" size={18} color={colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {patientName}
          </Text>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {[age ? `${age}y` : null, gender].filter(Boolean).join(" · ") || "Details not specified"}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: cfg.color + "18" }]}>
          <Feather name={cfg.icon} size={12} color={cfg.color} />
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>
      <Text style={[styles.complaint, { color: colors.foreground }]} numberOfLines={2}>
        {chiefComplaint}
      </Text>
      <Text style={[styles.time, { color: colors.mutedForeground }]}>{dateStr}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  emergencyBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  emergencyText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  meta: {
    fontSize: 13,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  complaint: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
  },
});
