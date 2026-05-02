import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAudioRecorder, AudioModule, RecordingPresets } from "expo-audio";
import * as FileSystem from "expo-file-system";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetChatMessages,
  useSendChatMessage,
  useTranscribeChatAudio,
  getGetChatMessagesQueryKey,
  type ChatMessage,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { AnalysisCard } from "@/components/AnalysisCard";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = parseInt(id ?? "0");
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const { data: messages, isLoading } = useGetChatMessages(sessionId);
  const sendMessage = useSendChatMessage();
  const transcribeAudio = useTranscribeChatAudio();

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isSending) return;
    setInput("");
    setIsSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await sendMessage.mutateAsync({ id: sessionId, data: { content: text } });
      await queryClient.invalidateQueries({ queryKey: getGetChatMessagesQueryKey(sessionId) });
    } catch {
      Alert.alert("خطأ", "تعذّر إرسال الرسالة. حاول مجدداً.");
      setInput(text);
    } finally {
      setIsSending(false);
    }
  }, [input, isSending, sessionId, sendMessage, queryClient]);

  const startRecording = useCallback(async () => {
    try {
      if (Platform.OS === "web") {
        Alert.alert("غير متاح", "تسجيل الصوت غير متاح على الويب. يرجى الكتابة.");
        return;
      }
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert("إذن مرفوض", "يلزم الوصول للميكروفون لتسجيل الصوت.");
        return;
      }
      await AudioModule.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      audioRecorder.record();
      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      Alert.alert("خطأ في التسجيل", "تعذّر بدء التسجيل.");
    }
  }, [audioRecorder]);

  const stopRecording = useCallback(async () => {
    try {
      setIsRecording(false);
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (!uri) return;
      setIsTranscribing(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const result = await transcribeAudio.mutateAsync({
        data: { audioBase64: base64, mimeType: "audio/m4a" },
      });

      if (result?.text) {
        setInput((prev) => (prev ? `${prev} ${result.text}` : result.text));
      }
    } catch {
      Alert.alert("خطأ", "تعذّر تحويل الصوت إلى نص.");
    } finally {
      setIsTranscribing(false);
    }
  }, [audioRecorder, transcribeAudio]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => {
    const isUser = item.role === "user";
    const analysisData = item.analysisData as Record<string, unknown> | null;
    const isAnalysis = analysisData?.type === "analysis";
    const isEmergency = !!(analysisData?.isEmergency);

    if (!isUser && isAnalysis && analysisData) {
      return (
        <View style={styles.aiBubbleWrap}>
          <View style={[styles.aiBubble, { backgroundColor: colors.card, borderColor: isEmergency ? colors.emergency : colors.border }]}>
            {isEmergency && (
              <View style={[styles.emergencyBanner, { backgroundColor: colors.emergency }]}>
                <Feather name="alert-triangle" size={14} color="#fff" />
                <Text style={styles.emergencyText}>حالة طارئة</Text>
                <Text style={styles.emergencyReason} numberOfLines={2}>
                  {analysisData.emergencyReason as string}
                </Text>
              </View>
            )}
            <Text style={[styles.summaryText, { color: colors.foreground }]}>
              {item.content}
            </Text>
            <AnalysisCard data={analysisData} colors={colors} />
            <Text style={[styles.timestamp, { color: colors.mutedForeground }]}>
              {new Date(item.createdAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
        </View>
      );
    }

    if (!isUser && analysisData?.type === "question") {
      const followUp = analysisData.followUp as string[] | undefined;
      return (
        <View style={styles.aiBubbleWrap}>
          <View style={[styles.aiBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.aiText, { color: colors.foreground }]}>{item.content}</Text>
            {followUp && followUp.length > 0 && (
              <View style={styles.questionsWrap}>
                {followUp.map((q, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.questionChip, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}
                    onPress={() => setInput(q)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.questionText, { color: colors.primary }]}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <Text style={[styles.timestamp, { color: colors.mutedForeground }]}>
              {new Date(item.createdAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
        </View>
      );
    }

    if (isUser) {
      return (
        <View style={styles.userBubbleWrap}>
          <View style={[styles.userBubble, { backgroundColor: colors.primary }]}>
            <Text style={styles.userText}>{item.content}</Text>
            <Text style={[styles.timestamp, { color: "rgba(255,255,255,0.6)" }]}>
              {new Date(item.createdAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
        </View>
      );
    }

    // Generic AI message
    return (
      <View style={styles.aiBubbleWrap}>
        <View style={[styles.aiBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.aiText, { color: colors.foreground }]}>{item.content}</Text>
          <Text style={[styles.timestamp, { color: colors.mutedForeground }]}>
            {new Date(item.createdAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
      </View>
    );
  }, [colors]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-right" size={22} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={[styles.headerDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>المساعد الطبي</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Messages */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages ?? []}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMessage}
          contentContainerStyle={[
            styles.messagesList,
            { paddingBottom: insets.bottom + 90 },
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={[styles.welcomeBanner, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "20" }]}>
              <Text style={[styles.welcomeTitle, { color: colors.primary }]}>مرحباً بك في المساعد الطبي</Text>
              <Text style={[styles.welcomeText, { color: colors.mutedForeground }]}>
                صِف الأعراض وسيقدم لك تشخيصات محتملة، فحوصات مقترحة، وخيارات علاجية.
              </Text>
              <View style={[styles.warningRow, { borderTopColor: colors.border }]}>
                <Feather name="shield" size={12} color={colors.warning} />
                <Text style={[styles.warningText, { color: colors.warning }]}>
                  هذا النظام للمساعدة فقط وليس بديلاً عن الطبيب
                </Text>
              </View>
            </View>
          }
          ListFooterComponent={
            isSending ? (
              <View style={styles.typingWrap}>
                <View style={[styles.typingBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <ActivityIndicator color={colors.accent} size="small" />
                  <Text style={[styles.typingText, { color: colors.mutedForeground }]}>يحلل المساعد...</Text>
                </View>
              </View>
            ) : null
          }
        />
      )}

      {/* Input Bar */}
      <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity
          style={[
            styles.micBtn,
            {
              backgroundColor: isRecording ? colors.emergency : isTranscribing ? colors.mutedForeground : colors.secondary,
              borderColor: isRecording ? colors.emergency : colors.border,
            },
          ]}
          onPress={isRecording ? stopRecording : startRecording}
          disabled={isTranscribing || isSending}
        >
          {isTranscribing ? (
            <ActivityIndicator color={colors.foreground} size="small" />
          ) : (
            <Feather
              name={isRecording ? "square" : "mic"}
              size={18}
              color={isRecording ? "#fff" : colors.foreground}
            />
          )}
        </TouchableOpacity>

        <TextInput
          style={[styles.textInput, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
          placeholder="صِف الأعراض..."
          placeholderTextColor={colors.mutedForeground}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={2000}
          textAlign="right"
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />

        <TouchableOpacity
          style={[
            styles.sendBtn,
            { backgroundColor: input.trim() && !isSending ? colors.accent : colors.muted },
          ]}
          onPress={handleSend}
          disabled={!input.trim() || isSending}
        >
          <Feather name="send" size={18} color={input.trim() && !isSending ? "#fff" : colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  headerDot: { width: 8, height: 8, borderRadius: 4 },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  messagesList: { padding: 16, gap: 12 },
  welcomeBanner: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 8,
    gap: 6,
  },
  welcomeTitle: { fontSize: 15, fontWeight: "700" },
  welcomeText: { fontSize: 13, lineHeight: 20 },
  warningRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingTop: 10, borderTopWidth: 1, marginTop: 4 },
  warningText: { fontSize: 11, fontWeight: "500", flex: 1 },

  // User bubble
  userBubbleWrap: { alignItems: "flex-end" },
  userBubble: { maxWidth: "80%", padding: 12, borderRadius: 18, borderBottomRightRadius: 4, gap: 4 },
  userText: { color: "#fff", fontSize: 15, lineHeight: 22 },

  // AI bubble
  aiBubbleWrap: { alignItems: "flex-start" },
  aiBubble: { maxWidth: "92%", padding: 14, borderRadius: 18, borderBottomLeftRadius: 4, borderWidth: 1, gap: 8 },
  aiText: { fontSize: 15, lineHeight: 23 },
  summaryText: { fontSize: 14, lineHeight: 22, fontWeight: "500" },

  // Emergency
  emergencyBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 10,
    borderRadius: 10,
    flexWrap: "wrap",
  },
  emergencyText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  emergencyReason: { color: "#fff", fontSize: 12, flex: 1 },

  // Questions
  questionsWrap: { gap: 6 },
  questionChip: { padding: 10, borderRadius: 10, borderWidth: 1 },
  questionText: { fontSize: 13, fontWeight: "500" },

  timestamp: { fontSize: 11, alignSelf: "flex-end" },

  // Typing indicator
  typingWrap: { alignItems: "flex-start", paddingHorizontal: 4 },
  typingBubble: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 14, borderWidth: 1 },
  typingText: { fontSize: 13 },

  // Input bar
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  micBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  textInput: {
    flex: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 120,
    borderWidth: 1,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
