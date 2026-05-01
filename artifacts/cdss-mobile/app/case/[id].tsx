import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetCase,
  useDeleteCase,
  useAnalyzeCase,
  getListCasesQueryKey,
  getGetCaseQueryKey,
} from "@workspace/api-client-react";
import { DiagnosisCard } from "@/components/DiagnosisCard";
import { TestCard } from "@/components/TestCard";
import { TreatmentCard } from "@/components/TreatmentCard";
import { useColors } from "@/hooks/useColors";

type TabKey = "diagnoses" | "tests" | "treatments" | "followup";

export default function CaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const caseId = parseInt(id ?? "0");
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>("diagnoses");

  const { data: caseData, isLoading, refetch } = useGetCase(caseId, {
    query: { queryKey: getGetCaseQueryKey(caseId), enabled: !!caseId },
  });

  const deleteCase = useDeleteCase();
  const analyzeCase = useAnalyzeCase();

  const handleDelete = () => {
    Alert.alert("Delete Case", "Are you sure you want to delete this case?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteCase.mutateAsync({ id: caseId });
          await queryClient.invalidateQueries({ queryKey: getListCasesQueryKey() });
          router.back();
        },
      },
    ]);
  };

  const handleReanalyze = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await analyzeCase.mutateAsync({ id: caseId });
      await queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(caseId) });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert("Error", "Failed to re-analyze the case.");
    }
  };

  const topPad = Platform.OS === "web" ? 67 : 0;

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!caseData) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.mutedForeground }}>Case not found</Text>
      </View>
    );
  }

  const analysis = caseData.latestAnalysis;
  const tabs: Array<{ key: TabKey; label: string; icon: React.ComponentProps<typeof Feather>["name"] }> = [
    { key: "diagnoses", label: "Diagnoses", icon: "list" },
    { key: "tests", label: "Tests", icon: "droplet" },
    { key: "treatments", label: "Treatment", icon: "package" },
    { key: "followup", label: "Follow-up", icon: "help-circle" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 16, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Emergency Banner */}
        {caseData.isEmergency && (
          <View style={[styles.emergencyBanner, { backgroundColor: colors.emergency }]}>
            <Feather name="alert-triangle" size={18} color="#fff" />
            <View style={styles.emergencyText}>
              <Text style={styles.emergencyTitle}>EMERGENCY ALERT</Text>
              {analysis?.emergencyReason && (
                <Text style={styles.emergencyReason}>{analysis.emergencyReason}</Text>
              )}
            </View>
          </View>
        )}

        {/* Patient Header */}
        <View style={[styles.patientCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.patientRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + "18" }]}>
              <Feather name="user" size={22} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={[styles.patientName, { color: colors.foreground }]}>{caseData.patientName}</Text>
              <Text style={[styles.patientMeta, { color: colors.mutedForeground }]}>
                {[caseData.age ? `${caseData.age}y` : null, caseData.gender].filter(Boolean).join(" · ") || "Details not specified"}
              </Text>
            </View>
            <TouchableOpacity onPress={handleDelete} disabled={deleteCase.isPending}>
              <Feather name="trash-2" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <View style={[styles.complaintBox, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.complaintLabel, { color: colors.mutedForeground }]}>CHIEF COMPLAINT</Text>
            <Text style={[styles.complaintText, { color: colors.foreground }]}>{caseData.chiefComplaint}</Text>
          </View>

          {caseData.symptoms && (
            <View>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>SYMPTOMS</Text>
              <Text style={[styles.fieldText, { color: colors.foreground }]}>{caseData.symptoms}</Text>
            </View>
          )}
        </View>

        {/* Analysis */}
        {!analysis ? (
          <View style={[styles.noAnalysis, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="cpu" size={32} color={colors.mutedForeground} />
            <Text style={[styles.noAnalysisText, { color: colors.mutedForeground }]}>No analysis yet</Text>
            <TouchableOpacity
              style={[styles.analyzeBtn, { backgroundColor: colors.primary }]}
              onPress={handleReanalyze}
              disabled={analyzeCase.isPending}
            >
              {analyzeCase.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.analyzeBtnText}>Run AI Analysis</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Summary */}
            <View style={[styles.summaryCard, { backgroundColor: colors.primary + "0F", borderColor: colors.primary + "30" }]}>
              <Text style={[styles.summaryLabel, { color: colors.primary }]}>CLINICAL SUMMARY</Text>
              <Text style={[styles.summaryText, { color: colors.foreground }]}>{analysis.summary}</Text>
              <TouchableOpacity
                style={styles.reanalyzeRow}
                onPress={handleReanalyze}
                disabled={analyzeCase.isPending}
              >
                {analyzeCase.isPending ? (
                  <ActivityIndicator color={colors.primary} size="small" />
                ) : (
                  <>
                    <Feather name="refresh-cw" size={13} color={colors.primary} />
                    <Text style={[styles.reanalyzeText, { color: colors.primary }]}>Re-analyze</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={styles.tabsContent}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.tab,
                    {
                      backgroundColor: activeTab === tab.key ? colors.primary : colors.card,
                      borderColor: activeTab === tab.key ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setActiveTab(tab.key)}
                >
                  <Feather name={tab.icon} size={13} color={activeTab === tab.key ? "#fff" : colors.mutedForeground} />
                  <Text style={[styles.tabText, { color: activeTab === tab.key ? "#fff" : colors.mutedForeground }]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {activeTab === "diagnoses" && (
              <View>
                {analysis.differentialDiagnoses?.map((dx, i) => (
                  <DiagnosisCard key={i} diagnosis={dx} rank={i + 1} />
                ))}
              </View>
            )}

            {activeTab === "tests" && (
              <View>
                {analysis.suggestedTests?.map((test, i) => (
                  <TestCard key={i} test={test} />
                ))}
              </View>
            )}

            {activeTab === "treatments" && (
              <>
                <View style={[styles.disclaimerBox, { backgroundColor: colors.warning + "18", borderColor: colors.warning }]}>
                  <Feather name="info" size={13} color={colors.warning} />
                  <Text style={[styles.disclaimerText, { color: colors.warning }]}>
                    This system is for assistance only and does not replace professional medical judgment.
                  </Text>
                </View>
                {analysis.treatments?.map((tx, i) => (
                  <TreatmentCard key={i} treatment={tx} />
                ))}
              </>
            )}

            {activeTab === "followup" && (
              <View>
                {analysis.followUpQuestions?.map((q, i) => (
                  <View key={i} style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.questionNum, { backgroundColor: colors.accent }]}>
                      <Text style={styles.questionNumText}>{i + 1}</Text>
                    </View>
                    <Text style={[styles.questionText, { color: colors.foreground }]}>{q}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { paddingHorizontal: 16 },
  flex: { flex: 1 },
  emergencyBanner: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "flex-start",
  },
  emergencyText: { flex: 1 },
  emergencyTitle: { color: "#fff", fontWeight: "700", fontSize: 14, letterSpacing: 0.5 },
  emergencyReason: { color: "#ffffffcc", fontSize: 13, marginTop: 2, lineHeight: 18 },
  patientCard: { borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, gap: 12 },
  patientRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  patientName: { fontSize: 18, fontWeight: "700" },
  patientMeta: { fontSize: 13, marginTop: 2 },
  complaintBox: { borderRadius: 8, padding: 10 },
  complaintLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.8, marginBottom: 4 },
  complaintText: { fontSize: 15, fontWeight: "500" },
  fieldLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.8, marginBottom: 4 },
  fieldText: { fontSize: 14, lineHeight: 20 },
  noAnalysis: { borderRadius: 14, padding: 32, borderWidth: 1, alignItems: "center", gap: 12, marginBottom: 12 },
  noAnalysisText: { fontSize: 16, fontWeight: "500" },
  analyzeBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  analyzeBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  summaryCard: { borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1 },
  summaryLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.8, marginBottom: 6 },
  summaryText: { fontSize: 14, lineHeight: 21 },
  reanalyzeRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 10 },
  reanalyzeText: { fontSize: 13, fontWeight: "600" },
  tabs: { marginBottom: 12 },
  tabsContent: { gap: 8, paddingHorizontal: 0 },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  tabText: { fontSize: 13, fontWeight: "600" },
  disclaimerBox: { flexDirection: "row", gap: 8, padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 10, alignItems: "flex-start" },
  disclaimerText: { flex: 1, fontSize: 12, lineHeight: 17 },
  questionCard: { flexDirection: "row", gap: 12, alignItems: "flex-start", padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  questionNum: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  questionNumText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  questionText: { flex: 1, fontSize: 14, lineHeight: 20 },
});
