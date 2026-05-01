import React from "react";
import { View, Text, ScrollView, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export default function AboutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : 0;

  const features = [
    { icon: "mic" as const, title: "Voice Input", desc: "Record and transcribe patient speech using AI" },
    { icon: "edit-3" as const, title: "Text Input", desc: "Manual entry of symptoms and medical history" },
    { icon: "cpu" as const, title: "AI Diagnosis", desc: "Differential diagnosis with confidence levels via GPT-5" },
    { icon: "droplet" as const, title: "Test Recommendations", desc: "Evidence-based lab and imaging suggestions" },
    { icon: "package" as const, title: "Treatment Guidance", desc: "Guideline-based treatment options with dosing" },
    { icon: "help-circle" as const, title: "Smart Follow-up", desc: "AI-generated follow-up questions to refine diagnosis" },
    { icon: "alert-circle" as const, title: "Emergency Alerts", desc: "Automatic detection of critical symptoms" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
          <Feather name="activity" size={40} color="#fff" />
          <Text style={styles.heroTitle}>CDSS</Text>
          <Text style={styles.heroSub}>Clinical Decision Support System</Text>
          <Text style={styles.heroVersion}>AI-Powered · v1.0</Text>
        </View>

        <View style={[styles.disclaimerCard, { backgroundColor: colors.emergency + "12", borderColor: colors.emergency }]}>
          <Feather name="alert-triangle" size={18} color={colors.emergency} />
          <View style={styles.flex}>
            <Text style={[styles.disclaimerTitle, { color: colors.emergency }]}>Important Disclaimer</Text>
            <Text style={[styles.disclaimerText, { color: colors.emergency + "CC" }]}>
              This system is for assistance only and does not replace professional medical judgment. Always verify AI-generated suggestions with clinical expertise. Do not use for prescribing or final diagnosis without physician review.
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>FEATURES</Text>
        {features.map((f, i) => (
          <View key={i} style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.featureIcon, { backgroundColor: colors.accent + "15" }]}>
              <Feather name={f.icon} size={18} color={colors.accent} />
            </View>
            <View style={styles.flex}>
              <Text style={[styles.featureTitle, { color: colors.foreground }]}>{f.title}</Text>
              <Text style={[styles.featureDesc, { color: colors.mutedForeground }]}>{f.desc}</Text>
            </View>
          </View>
        ))}

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.foreground }]}>Technology Stack</Text>
          {[
            ["AI Model", "OpenAI GPT-5.4"],
            ["Speech-to-Text", "OpenAI Whisper"],
            ["Backend", "Express.js + PostgreSQL"],
            ["Mobile", "React Native (Expo)"],
            ["Database", "PostgreSQL + Drizzle ORM"],
          ].map(([label, value]) => (
            <View key={label} style={[styles.infoRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  flex: { flex: 1 },
  heroCard: {
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  heroTitle: { color: "#fff", fontSize: 28, fontWeight: "800", letterSpacing: 1 },
  heroSub: { color: "#ffffffCC", fontSize: 14 },
  heroVersion: { color: "#ffffff88", fontSize: 12, marginTop: 4 },
  disclaimerCard: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 24,
    alignItems: "flex-start",
  },
  disclaimerTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  disclaimerText: { fontSize: 13, lineHeight: 18 },
  sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, marginBottom: 10 },
  featureCard: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    alignItems: "center",
  },
  featureIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  featureTitle: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  featureDesc: { fontSize: 13, lineHeight: 17 },
  infoCard: { borderRadius: 14, overflow: "hidden", borderWidth: 1, marginTop: 16 },
  infoTitle: { fontSize: 14, fontWeight: "700", padding: 14 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", padding: 12, borderTopWidth: 1 },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 13, fontWeight: "500" },
});
