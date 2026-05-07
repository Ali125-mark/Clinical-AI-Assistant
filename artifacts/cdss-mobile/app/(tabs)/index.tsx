import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  useListChatSessions,
  useCreateChatSession,
  useDeleteChatSession,
  getListChatSessionsQueryKey,
  type ChatSession,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";

export default function SessionsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);

  const { data: sessions, isLoading, refetch, isRefetching } = useListChatSessions();
  const createSession = useCreateChatSession();
  const deleteSession = useDeleteChatSession();

  const topPad = Platform.OS === "web" ? 67 : 0;

  const handleNew = useCallback(async () => {
    try {
      setCreating(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const session = await createSession.mutateAsync({ data: { title: "محادثة جديدة" } });
      await queryClient.invalidateQueries({ queryKey: getListChatSessionsQueryKey() });
      router.push(`/chat/${session.id}`);
    } catch {
      Alert.alert("خطأ", "تعذّر إنشاء محادثة جديدة.");
    } finally {
      setCreating(false);
    }
  }, [createSession, queryClient, router]);

  const handleDelete = useCallback((session: ChatSession) => {
    Alert.alert(
      "حذف المحادثة",
      `هل تريد حذف "${session.title}"؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              await deleteSession.mutateAsync({ id: session.id });
              await queryClient.invalidateQueries({ queryKey: getListChatSessionsQueryKey() });
            } catch {
              Alert.alert("خطأ", "تعذّر حذف المحادثة.");
            }
          },
        },
      ]
    );
  }, [deleteSession, queryClient]);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "أمس";
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    return d.toLocaleDateString("ar-SA");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: topPad + 16 }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>المساعد الطبي</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>استشارة ذكية للأطباء</Text>
        </View>
        <TouchableOpacity
          style={[styles.newBtn, { backgroundColor: colors.primary }]}
          onPress={handleNew}
          disabled={creating}
        >
          {creating ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Feather name="edit-2" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Disclaimer */}
      <View style={[styles.disclaimerBar, { backgroundColor: colors.warning + "18", borderBottomColor: colors.warning + "40" }]}>
        <Feather name="alert-triangle" size={12} color={colors.warning} />
        <Text style={[styles.disclaimerText, { color: colors.warning }]}>
          للمساعدة فقط — ليس بديلاً عن الحكم الطبي المهني
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={sessions ?? []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 100 },
            !(sessions?.length) && styles.emptyList,
          ]}
          refreshing={isRefetching}
          onRefresh={refetch}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.primary + "15" }]}>
                <Feather name="message-circle" size={40} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>ابدأ محادثة طبية</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                صِف الأعراض وسيحللها المساعد الذكي لتقديم تشخيصات محتملة وفحوصات مقترحة
              </Text>
              <TouchableOpacity
                style={[styles.startBtn, { backgroundColor: colors.primary }]}
                onPress={handleNew}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Feather name="plus" size={18} color="#fff" />
                    <Text style={styles.startBtnText}>محادثة جديدة</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.sessionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(`/chat/${item.id}`)}
              onLongPress={() => handleDelete(item)}
              activeOpacity={0.75}
            >
              <View style={[styles.sessionIcon, { backgroundColor: colors.accent + "15" }]}>
                <Feather name="message-circle" size={20} color={colors.accent} />
              </View>
              <View style={styles.sessionInfo}>
                <Text style={[styles.sessionTitle, { color: colors.foreground }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.sessionTime, { color: colors.mutedForeground }]}>
                  {formatTime(item.updatedAt)}
                </Text>
              </View>
              <Feather name="chevron-left" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontWeight: "800" },
  headerSub: { fontSize: 12, marginTop: 2 },
  newBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  disclaimerBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  disclaimerText: { fontSize: 11, fontWeight: "500", flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 16, gap: 10 },
  emptyList: { flex: 1 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 12 },
  emptyIcon: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 22 },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  startBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  sessionIcon: { widtِheight: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  sessionInfo: { flex: 1 },
  sessionTitle: { fontSize: 15, fontWeight: "600", marginBottom: 3 },
  sessionTime: { fontSize: 12 },
});
