import React from "react";
import { View, Text, ScrollView, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export default function AboutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const features = [
    { icon: "message-circle" as const, title: "محادثة ذكية", desc: "واجهة محادثة طبيعية لوصف الأعراض وتحليلها" },
    { icon: "mic" as const, title: "إدخال صوتي", desc: "تحويل الصوت إلى نص عبر الذكاء الاصطناعي" },
    { icon: "cpu" as const, title: "تشخيص ذكي", desc: "تشخيصات تفاضلية مع نسب الثقة" },
    { icon: "droplet" as const, title: "فحوصات مقترحة", desc: "توصيات مختبرية وأشعة مبنية على الأدلة" },
    { icon: "package" as const, title: "خيارات علاجية", desc: "علاجات مقترحة مع الجرعات والتنبيهات" },
    { icon: "help-circle" as const, title: "أسئلة متابعة", desc: "أسئلة ذكية لتحسين دقة التشخيص" },
    { icon: "alert-circle" as const, title: "تنبيهات الطوارئ", desc: "اكتشاف تلقائي للحالات الحرجة" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: (Platform.OS === "web" ? 67 : insets.top) + 16 }]}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>حول التطبيق</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
          <Feather  size={0} color="#fff" />
          <Text style={styles.heroTitle}></Text>
          <Text style={styles.heroSub}></Text>
          <Text style={styles.heroVersion}></Text>
        </View>

        <View style={[styles.disclaimerCard, { backgroundColor: colors.emergency + "12", borderColor: colors.emergency }]}>
          <Feather name="alert-triangle" size={18} color={colors.emergency} />
          <View style={styles.flex}>
            <Text style={[styles.disclaimerTitle, { color: colors.emergency }]}>تنبيه مهم</Text>
            <Text style={[styles.disclaimerText, { color: colors.emergency + "CC" }]}>
              هذا النظام للمساعدة فقط وليس أداة تشخيص طبي نهائي. يجب التحقق من جميع المقترحات مع الخبرة السريرية ولا يجوز استخدامه للوصف الطبي النهائي دون مراجعة الطبيب.
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>الميزات</Text>
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
          <Text style={[styles.infoTitle, { color: colors.foreground }]}></Text>
          {[
        
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
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontWeight: "800" },
  scroll: { padding: 16, gap: 12 },
  flex: { flex: 1 },
  heroCard: {
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    gap: 6,
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
    alignItems: "flex-start",
  },
  disclaimerTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  disclaimerText: { fontSize: 13, lineHeight: 18 },
  sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  featureCard: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  featureIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  featureTitle: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  featureDesc: { fontSize: 13, lineHeight: 17 },
  infoCard: { borderRadius: 14, overflow: "hidden", borderWidth: 1 },
  infoTitle: { fontSize: 14, fontWeight: "700", padding: 14 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", padding: 12, borderTopWidth: 1 },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 13, fontWeight: "500" },
});
