import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

type Colors = {
  primary: string;
  accent: string;
  foreground: string;
  mutedForeground: string;
  border: string;
  success: string;
  warning: string;
  emergency: string;
  secondary: string;
  card: string;
};

type Diagnosis = { name: string; confidence: number; icd?: string; reason: string };
type TestItem = { name: string; type: string; urgency: string; reason: string };
type TreatmentItem = { name: string; type: string; desc: string; dose?: string };

type Props = {
  data: Record<string, unknown>;
  colors: Colors;
};

const TABS = [
  { key: "diagnoses", label: "تشخيصات", icon: "activity" as const },
  { key: "tests", label: "فحوصات", icon: "droplet" as const },
  { key: "treatments", label: "علاجات", icon: "package" as const },
  { key: "followUp", label: "أسئلة", icon: "help-circle" as const },
];

export function AnalysisCard({ data, colors }: Props) {
  const [activeTab, setActiveTab] = useState<"diagnoses" | "tests" | "treatments" | "followUp">("diagnoses");

  const diagnoses = (data.diagnoses ?? []) as Diagnosis[];
  const tests = (data.tests ?? []) as TestItem[];
  const treatments = (data.treatments ?? []) as TreatmentItem[];
  const followUp = (data.followUp ?? []) as string[];

  const confidenceColor = (c: number) => {
    if (c >= 0.8) return colors.emergency;
    if (c >= 0.5) return colors.warning;
    return colors.accent;
  };

  const urgencyColor = (u: string) => {
    if (u === "طارئ" || u === "stat") return colors.emergency;
    if (u === "عاجل" || u === "urgent") return colors.warning;
    return colors.success;
  };

  const urgencyLabel = (u: string) => {
    if (u === "stat") return "طارئ";
    if (u === "urgent") return "عاجل";
    if (u === "routine") return "روتيني";
    return u;
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={[styles.tabs, { borderColor: colors.border }]}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                isActive && { backgroundColor: colors.primary, borderColor: colors.primary },
                !isActive && { borderColor: "transparent" },
              ]}
              onPress={() => setActiveTab(tab.key as typeof activeTab)}
              activeOpacity={0.7}
            >
              <Feather name={tab.icon} size={13} color={isActive ? "#fff" : colors.mutedForeground} />
              <Text style={[styles.tabLabel, { color: isActive ? "#fff" : colors.mutedForeground }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Diagnoses */}
        {activeTab === "diagnoses" && (
          <View style={styles.section}>
            {diagnoses.length === 0 ? (
              <Text style={[styles.empty, { color: colors.mutedForeground }]}>لا توجد تشخيصات</Text>
            ) : (
              diagnoses.map((d, i) => (
                <View key={i} style={[styles.diagnosisItem, { borderColor: colors.border }]}>
                  <View style={styles.diagnosisHeader}>
                    <Text style={[styles.diagnosisName, { color: colors.foreground }]} numberOfLines={2}>
                      {d.name}
                    </Text>
                    <View style={[styles.confidenceBadge, { backgroundColor: confidenceColor(d.confidence) + "18" }]}>
                      <Text style={[styles.confidenceText, { color: confidenceColor(d.confidence) }]}>
                        {Math.round(d.confidence * 100)}%
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.confidenceBar, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.confidenceFill,
                        { width: `${d.confidence * 100}%` as any, backgroundColor: confidenceColor(d.confidence) },
                      ]}
                    />
                  </View>
                  {d.icd && (
                    <Text style={[styles.icdCode, { color: colors.mutedForeground }]}>ICD: {d.icd}</Text>
                  )}
                  <Text style={[styles.reasonText, { color: colors.mutedForeground }]}>{d.reason}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* Tests */}
        {activeTab === "tests" && (
          <View style={styles.section}>
            {tests.length === 0 ? (
              <Text style={[styles.empty, { color: colors.mutedForeground }]}>لا توجد فحوصات</Text>
            ) : (
              tests.map((t, i) => (
                <View key={i} style={[styles.testItem, { borderColor: colors.border }]}>
                  <View style={styles.testHeader}>
                    <Text style={[styles.testName, { color: colors.foreground }]} numberOfLines={2}>{t.name}</Text>
                    <View style={[styles.urgencyBadge, { backgroundColor: urgencyColor(t.urgency) + "18" }]}>
                      <Text style={[styles.urgencyText, { color: urgencyColor(t.urgency) }]}>{urgencyLabel(t.urgency)}</Text>
                    </View>
                  </View>
                  <Text style={[styles.reasonText, { color: colors.mutedForeground }]}>{t.reason}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* Treatments */}
        {activeTab === "treatments" && (
          <View style={styles.section}>
            {treatments.length === 0 ? (
              <Text style={[styles.empty, { color: colors.mutedForeground }]}>لا توجد علاجات</Text>
            ) : (
              treatments.map((t, i) => (
                <View key={i} style={[styles.treatmentItem, { borderColor: colors.border }]}>
                  <Text style={[styles.treatmentName, { color: colors.foreground }]}>{t.name}</Text>
                  {t.dose && (
                    <Text style={[styles.doseText, { color: colors.accent }]}>{t.dose}</Text>
                  )}
                  <Text style={[styles.reasonText, { color: colors.mutedForeground }]}>{t.desc}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* Follow-up questions */}
        {activeTab === "followUp" && (
          <View style={styles.section}>
            {followUp.length === 0 ? (
              <Text style={[styles.empty, { color: colors.mutedForeground }]}>لا توجد أسئلة</Text>
            ) : (
              followUp.map((q, i) => (
                <View key={i} style={[styles.followUpItem, { borderColor: colors.border }]}>
                  <View style={[styles.followUpNum, { backgroundColor: colors.primary }]}>
                    <Text style={styles.followUpNumText}>{i + 1}</Text>
                  </View>
                  <Text style={[styles.followUpText, { color: colors.foreground }]}>{q}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 4 },
  tabs: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  tabLabel: { fontSize: 12, fontWeight: "600" },
  content: {},
  section: { gap: 8 },
  empty: { fontSize: 13, textAlign: "center", padding: 8 },

  // Diagnosis
  diagnosisItem: { gap: 6, paddingBottom: 10, borderBottomWidth: 1 },
  diagnosisHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  diagnosisName: { fontSize: 14, fontWeight: "600", flex: 1 },
  confidenceBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  confidenceText: { fontSize: 12, fontWeight: "700" },
  confidenceBar: { height: 4, borderRadius: 2, overflow: "hidden" },
  confidenceFill: { height: 4, borderRadius: 2 },
  icdCode: { fontSize: 11 },
  reasonText: { fontSize: 12, lineHeight: 18 },

  // Tests
  testItem: { gap: 4, paddingBottom: 10, borderBottomWidth: 1 },
  testHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  testName: { fontSize: 14, fontWeight: "600", flex: 1 },
  urgencyBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  urgencyText: { fontSize: 12, fontWeight: "700" },

  // Treatments
  treatmentItem: { gap: 4, paddingBottom: 10, borderBottomWidth: 1 },
  treatmentName: { fontSize: 14, fontWeight: "600" },
  doseText: { fontSize: 12, fontWeight: "500" },

  // Follow-up
  followUpItem: { flexDirection: "row", gap: 10, alignItems: "flex-start", paddingBottom: 8, borderBottomWidth: 1 },
  followUpNum: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  followUpNumText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  followUpText: { flex: 1, fontSize: 13, lineHeight: 20 },
});
