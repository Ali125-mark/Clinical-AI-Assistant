import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAudioRecorder, AudioModule, RecordingPresets } from "expo-audio";
import * as FileSystem from "expo-file-system";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateCase,
  useAnalyzeCase,
  useTranscribeAudioStandalone,
  getListCasesQueryKey,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

export default function NewCaseScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other" | "">("");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [medications, setMedications] = useState("");
  const [allergies, setAllergies] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTarget, setRecordingTarget] = useState<"symptoms" | "history" | null>(null);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const createCase = useCreateCase();
  const analyzeCase = useAnalyzeCase();
  const transcribeAudio = useTranscribeAudioStandalone();

  const isLoading = createCase.isPending || analyzeCase.isPending;

  const startRecording = async (target: "symptoms" | "history") => {
    try {
      if (Platform.OS === "web") {
        Alert.alert("Not available", "Voice recording is not supported on web. Please type your input.");
        return;
      }
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert("Permission denied", "Microphone access is needed for voice input.");
        return;
      }
      await AudioModule.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      audioRecorder.record();
      setIsRecording(true);
      setRecordingTarget(target);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      Alert.alert("Recording error", "Could not start recording. Please try again.");
    }
  };

  const stopRecording = async () => {
    if (!recordingTarget) return;
    try {
      setIsRecording(false);
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      setIsTranscribing(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (!uri) return;

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const result = await transcribeAudio.mutateAsync({
        data: { audioBase64: base64, mimeType: "audio/m4a" },
      });

      if (result?.text) {
        if (recordingTarget === "symptoms") {
          setSymptoms((prev) => (prev ? `${prev} ${result.text}` : result.text));
        } else {
          setMedicalHistory((prev) => (prev ? `${prev} ${result.text}` : result.text));
        }
      }
    } catch {
      Alert.alert("Transcription failed", "Could not transcribe audio. Please type your input.");
    } finally {
      setIsTranscribing(false);
      setRecordingTarget(null);
    }
  };

  const handleSubmit = async () => {
    if (!patientName.trim() || !chiefComplaint.trim() || !symptoms.trim()) {
      Alert.alert("Missing fields", "Patient name, chief complaint, and symptoms are required.");
      return;
    }
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newCase = await createCase.mutateAsync({
        data: {
          patientName: patientName.trim(),
          age: age ? parseInt(age) : undefined,
          gender: gender || undefined,
          chiefComplaint: chiefComplaint.trim(),
          symptoms: symptoms.trim(),
          medicalHistory: medicalHistory.trim() || undefined,
          medications: medications.trim() || undefined,
          allergies: allergies.trim() || undefined,
        },
      });

      await analyzeCase.mutateAsync({ id: newCase.id });
      await queryClient.invalidateQueries({ queryKey: getListCasesQueryKey() });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace(`/case/${newCase.id}`);
    } catch {
      Alert.alert("Error", "Failed to create and analyze case. Please try again.");
    }
  };

  const genders: Array<"Male" | "Female" | "Other"> = ["Male", "Female", "Other"];
  const topPad = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 16, paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Patient Information</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground }]}
            placeholder="Full name *"
            placeholderTextColor={colors.mutedForeground}
            value={patientName}
            onChangeText={setPatientName}
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.flex, { backgroundColor: colors.secondary, color: colors.foreground }]}
              placeholder="Age"
              placeholderTextColor={colors.mutedForeground}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
            />
            <View style={styles.genderRow}>
              {genders.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genderBtn,
                    {
                      backgroundColor: gender === g ? colors.primary : colors.secondary,
                      borderColor: gender === g ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setGender(gender === g ? "" : g)}
                >
                  <Text style={[styles.genderText, { color: gender === g ? "#fff" : colors.mutedForeground }]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Clinical Presentation</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground }]}
            placeholder="Chief complaint *"
            placeholderTextColor={colors.mutedForeground}
            value={chiefComplaint}
            onChangeText={setChiefComplaint}
          />

          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
            Symptoms & Presentation *
          </Text>
          <View style={[styles.voiceBox, { backgroundColor: colors.secondary, borderColor: recordingTarget === "symptoms" ? colors.accent : colors.border }]}>
            <TextInput
              style={[styles.textArea, { color: colors.foreground }]}
              placeholder="Describe symptoms, onset, duration, severity..."
              placeholderTextColor={colors.mutedForeground}
              value={symptoms}
              onChangeText={setSymptoms}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[
                styles.voiceBtn,
                { backgroundColor: isRecording && recordingTarget === "symptoms" ? colors.emergency : colors.accent },
              ]}
              onPress={isRecording && recordingTarget === "symptoms" ? stopRecording : () => startRecording("symptoms")}
              disabled={isTranscribing || (isRecording && recordingTarget !== "symptoms")}
            >
              {isTranscribing && recordingTarget === "symptoms" ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Feather
                  name={isRecording && recordingTarget === "symptoms" ? "square" : "mic"}
                  size={16}
                  color="#fff"
                />
              )}
            </TouchableOpacity>
          </View>

          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Medical History</Text>
          <View style={[styles.voiceBox, { backgroundColor: colors.secondary, borderColor: recordingTarget === "history" ? colors.accent : colors.border }]}>
            <TextInput
              style={[styles.textArea, { color: colors.foreground }]}
              placeholder="Past diagnoses, surgeries, chronic conditions..."
              placeholderTextColor={colors.mutedForeground}
              value={medicalHistory}
              onChangeText={setMedicalHistory}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[
                styles.voiceBtn,
                { backgroundColor: isRecording && recordingTarget === "history" ? colors.emergency : colors.accent },
              ]}
              onPress={isRecording && recordingTarget === "history" ? stopRecording : () => startRecording("history")}
              disabled={isTranscribing || (isRecording && recordingTarget !== "history")}
            >
              {isTranscribing && recordingTarget === "history" ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Feather
                  name={isRecording && recordingTarget === "history" ? "square" : "mic"}
                  size={16}
                  color="#fff"
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Medications & Allergies</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground }]}
            placeholder="Current medications (comma-separated)"
            placeholderTextColor={colors.mutedForeground}
            value={medications}
            onChangeText={setMedications}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground }]}
            placeholder="Known allergies"
            placeholderTextColor={colors.mutedForeground}
            value={allergies}
            onChangeText={setAllergies}
          />
        </View>

        <View style={[styles.disclaimerBox, { backgroundColor: colors.warning + "18", borderColor: colors.warning }]}>
          <Feather name="info" size={14} color={colors.warning} />
          <Text style={[styles.disclaimer, { color: colors.warning }]}>
            This system is for assistance only and does not replace professional medical judgment.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: isLoading ? colors.mutedForeground : colors.primary }]}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.submitText}>
                {createCase.isPending ? "Creating case..." : "Analyzing..."}
              </Text>
            </View>
          ) : (
            <View style={styles.loadingRow}>
              <Feather name="cpu" size={18} color="#fff" />
              <Text style={styles.submitText}>Analyze Case</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  section: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  flex: { flex: 1 },
  row: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  genderRow: { flexDirection: "row", gap: 6, flexWrap: "wrap", paddingTop: 2 },
  genderBtn: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  genderText: { fontSize: 13, fontWeight: "500" },
  fieldLabel: { fontSize: 14, fontWeight: "500" },
  voiceBox: {
    borderRadius: 10,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 10,
    gap: 8,
  },
  textArea: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 70,
  },
  voiceBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  disclaimerBox: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  disclaimer: { flex: 1, fontSize: 12, lineHeight: 18 },
  submitBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
