import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useListCases } from "@workspace/api-client-react";
import { CaseCard } from "@/components/CaseCard";
import { useColors } from "@/hooks/useColors";

export default function CasesScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: cases, isLoading, refetch, isRefetching } = useListCases();

  const topPad = Platform.OS === "web" ? 67 : 0;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const sortedCases = [...(cases ?? [])].sort((a, b) => {
    if (a.isEmergency && !b.isEmergency) return -1;
    if (!a.isEmergency && b.isEmergency) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={sortedCases}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <CaseCard
            id={item.id}
            patientName={item.patientName}
            age={item.age}
            gender={item.gender}
            chiefComplaint={item.chiefComplaint}
            status={item.status}
            isEmergency={item.isEmergency}
            createdAt={item.createdAt}
            onPress={() => router.push(`/case/${item.id}`)}
          />
        )}
        contentContainerStyle={[
          styles.list,
          { paddingTop: topPad + 16, paddingBottom: insets.bottom + bottomPad + 100 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No cases yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Tap the new case tab to start your first clinical analysis
            </Text>
          </View>
        }
        scrollEnabled={!!sortedCases.length}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    paddingHorizontal: 16,
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
