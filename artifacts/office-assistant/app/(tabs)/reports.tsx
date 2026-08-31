import { Feather } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionTitle } from '@/components/SectionTitle';
import { useAppData } from '@/context/AppDataContext';
import { useColors } from '@/hooks/useColors';

export default function ReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { entries, profile } = useAppData();
  const done = entries.filter((entry) => entry.done).length;
  const categories = useMemo(() => ['मीटिंग', 'फॉलो-अप', 'अकाउंट्स', 'सामान्य'].map((name) => ({ name, count: entries.filter((entry) => entry.category === name).length })), [entries]);
  const maxCount = Math.max(...categories.map((item) => item.count), 1);
  const completion = entries.length ? Math.round((done / entries.length) * 100) : 0;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 118 : insets.bottom + 100 }}>
        <ScreenHeader eyebrow="मासिक सारांश" title="रिपोर्ट" subtitle="तुमच्या ऑफिसच्या प्रगतीचा साधा आणि स्पष्ट आढावा." />
        <View style={styles.body}>
          <View style={[styles.summary, { backgroundColor: colors.foreground }]}>
            <View style={styles.summaryTop}><Text style={styles.summaryEyebrow}>ऑगस्ट २०२६</Text><Feather name="trending-up" size={20} color="#86A8FF" /></View>
            <Text style={styles.summaryValue}>{completion}%</Text>
            <Text style={styles.summaryLabel}>काम पूर्ण होण्याचा दर</Text>
            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.max(completion, 4)}%` }]} /></View>
            <View style={styles.summaryMeta}><Text style={styles.summaryMetaText}>{done} पूर्ण</Text><Text style={styles.summaryMetaText}>{entries.length - done} बाकी</Text></View>
          </View>
          <SectionTitle title="या महिन्याची आकडेवारी" />
          <View style={styles.statsRow}>
            <MiniStat icon="book-open" value={`${entries.length}`} label="डायरी नोंदी" colors={colors} />
            <MiniStat icon="user" value={profile.name ? '1' : '0'} label="प्रोफाइल" colors={colors} />
          </View>
          <SectionTitle title="कामाचं विभाजन" />
          <View style={[styles.breakdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {categories.map((item, index) => (
              <View key={item.name} style={styles.breakdownRow}>
                <View style={styles.breakdownLabel}><View style={[styles.legend, { backgroundColor: ['#2F6BFF', '#FFB547', '#20A875', '#8D6BE8'][index] }]} /><Text style={[styles.categoryText, { color: colors.foreground }]}>{item.name}</Text></View>
                <View style={styles.barArea}><View style={[styles.barTrack, { backgroundColor: colors.muted }]}><View style={[styles.barFill, { width: `${(item.count / maxCount) * 100}%`, backgroundColor: ['#2F6BFF', '#FFB547', '#20A875', '#8D6BE8'][index] }]} /></View><Text style={[styles.count, { color: colors.mutedForeground }]}>{item.count}</Text></View>
              </View>
            ))}
          </View>
          <View style={[styles.note, { backgroundColor: colors.secondary }]}>
            <Feather name="download" size={18} color={colors.primary} />
            <View style={{ flex: 1 }}><Text style={[styles.noteTitle, { color: colors.foreground }]}>रिपोर्ट एक्सपोर्ट</Text><Text style={[styles.noteText, { color: colors.mutedForeground }]}>लवकरच ही माहिती शेअर किंवा PDF मध्ये सेव्ह करता येईल.</Text></View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function MiniStat({ icon, value, label, colors }: { icon: keyof typeof Feather.glyphMap; value: string; label: string; colors: ReturnType<typeof useColors> }) {
  return <View style={[styles.miniStat, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.miniIcon, { backgroundColor: colors.secondary }]}><Feather name={icon} size={17} color={colors.primary} /></View><Text style={[styles.miniValue, { color: colors.foreground }]}>{value}</Text><Text style={[styles.miniLabel, { color: colors.mutedForeground }]}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { paddingHorizontal: 20 },
  summary: { borderRadius: 22, padding: 19, marginBottom: 25 },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryEyebrow: { color: '#B7C6EB', fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 0.8 },
  summaryValue: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 43, marginTop: 14, letterSpacing: -1 },
  summaryLabel: { color: '#CBD6EF', fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: -2 },
  progressTrack: { height: 7, borderRadius: 5, backgroundColor: '#3A4761', marginTop: 17, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5, backgroundColor: '#78A0FF' },
  summaryMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  summaryMetaText: { color: '#CBD6EF', fontFamily: 'Inter_500Medium', fontSize: 11 },
  statsRow: { flexDirection: 'row', gap: 11, marginBottom: 25 },
  miniStat: { flex: 1, borderRadius: 18, borderWidth: 1, padding: 14 },
  miniIcon: { width: 33, height: 33, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  miniValue: { fontFamily: 'Inter_700Bold', fontSize: 25, marginTop: 12 },
  miniLabel: { fontFamily: 'Inter_500Medium', fontSize: 11, marginTop: 3 },
  breakdown: { borderRadius: 19, borderWidth: 1, padding: 16, marginBottom: 16 },
  breakdownRow: { marginBottom: 16 },
  breakdownLabel: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  legend: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  categoryText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  barArea: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barTrack: { height: 8, flex: 1, borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6 },
  count: { fontFamily: 'Inter_600SemiBold', fontSize: 11, width: 14, textAlign: 'right' },
  note: { borderRadius: 17, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 11 },
  noteTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  noteText: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16, marginTop: 3 },
});