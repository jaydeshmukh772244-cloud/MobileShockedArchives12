import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MetricCard } from '@/components/MetricCard';
import { SectionTitle } from '@/components/SectionTitle';
import { useAppData } from '@/context/AppDataContext';
import { useColors } from '@/hooks/useColors';

const formatDay = (date: string) =>
  new Intl.DateTimeFormat('mr-IN', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`));

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { entries, profile } = useAppData();
  const openItems = entries.filter((entry) => !entry.done).length;
  const completedItems = entries.filter((entry) => entry.done).length;
  const today = new Date();
  const dateLabel = new Intl.DateTimeFormat('mr-IN', { day: 'numeric', month: 'short' }).format(today);
  const weekdayLabel = new Intl.DateTimeFormat('mr-IN', { weekday: 'long' }).format(today);
  const profileLocation = [profile.district, profile.taluka].filter(Boolean).join(' · ');
  const profileInitial = profile.name.trim().slice(0, 1) || 'आ';

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 118 : insets.bottom + 102 }}>
        <View style={[styles.appHeader, { paddingTop: Platform.OS === 'web' ? 67 : insets.top + 14 }]}>
          <View style={styles.brandBlock}>
            <Text style={[styles.brandName, { color: colors.foreground }]}>आरोग्य सेवक <Text style={{ color: colors.primary }}>(MPW)</Text></Text>
            <Text style={[styles.brandCaption, { color: colors.mutedForeground }]}>दैनंदिन कामकाज</Text>
          </View>
          <View style={styles.dateBlock}>
            <Text style={[styles.dateText, { color: colors.foreground }]}>{dateLabel}</Text>
            <Text style={[styles.weekdayText, { color: colors.primary }]}>{weekdayLabel}</Text>
          </View>
          <Pressable accessibilityRole="button" testID="home-notifications" onPress={() => router.push('/notifications')} style={({ pressed }) => [styles.bellButton, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}>
            <Feather name="bell" size={19} color={colors.foreground} />
          </Pressable>
        </View>
        <View style={[styles.profileWelcome, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.homeAvatar, { backgroundColor: colors.secondary }]}>
            {profile.avatarUri ? <Image source={{ uri: profile.avatarUri }} style={styles.homeAvatarImage} accessibilityLabel="प्रोफाइल फोटो" /> : <Text style={[styles.homeAvatarText, { color: colors.primary }]}>{profileInitial}</Text>}
          </View>
          <View style={styles.profileWelcomeCopy}>
            <Text style={[styles.profileWelcomeEyebrow, { color: colors.primary }]}>माझे प्रोफाइल</Text>
            <Text style={[styles.profileWelcomeName, { color: colors.foreground }]} numberOfLines={1}>{profile.name.trim() || 'तुमचे नाव'}</Text>
            <Text style={[styles.profileWelcomeMeta, { color: colors.mutedForeground }]} numberOfLines={1}>{profileLocation || 'जिल्हा आणि तालुका भरा'}</Text>
          </View>
          <Pressable testID="home-profile-edit" accessibilityRole="button" accessibilityLabel="प्रोफाइल संपादित करा" onPress={() => router.push('/people')} style={({ pressed }) => [styles.profileEditButton, { backgroundColor: colors.secondary, opacity: pressed ? 0.7 : 1 }]}>
            <Feather name="edit-2" size={16} color={colors.primary} />
          </Pressable>
        </View>
        <View style={[styles.focusCard, { backgroundColor: colors.primary }]}>
          <View style={styles.focusCopy}>
            <Text style={styles.focusEyebrow}>आजचा फोकस</Text>
            <Text style={styles.focusTitle}>{openItems > 0 ? `${openItems} कामं बाकी आहेत` : 'आजची सर्व कामं पूर्ण'}</Text>
            <Text style={styles.focusText}>डायरी अपडेट ठेवा, रिपोर्ट तयार करणं आता सोपं आहे.</Text>
          </View>
          <View style={styles.focusMark}><Feather name="check-square" size={34} color="#FFFFFF" /></View>
        </View>
        <View style={styles.content}>
          <SectionTitle title="आजचा आढावा" />
          <View style={styles.metrics}>
            <MetricCard icon="clipboard" value={`${openItems}`} label="बाकी कामं" tone="blue" />
            <MetricCard icon="check-circle" value={`${completedItems}`} label="पूर्ण कामं" tone="green" />
            <MetricCard icon="user" value={profile.name ? '1' : '0'} label="प्रोफाइल" tone="purple" />
            <MetricCard icon="bar-chart-2" value={`${entries.length}`} label="या महिन्यातील नोंदी" tone="amber" />
          </View>
          <SectionTitle title="जलद कृती" />
          <View style={styles.quickRow}>
            <QuickAction icon="edit-3" label="डायरी नोंद" onPress={() => router.push('/diary')} colors={colors} />
            <QuickAction icon="percent" label="कॅल्क्युलेटर" onPress={() => router.push('/tools')} colors={colors} />
            <QuickAction icon="bar-chart-2" label="रिपोर्ट" onPress={() => router.push('/reports')} colors={colors} />
          </View>
          <SectionTitle title="अलीकडील डायरी" action="सर्व पहा" onPress={() => router.push('/diary')} />
          <View style={[styles.list, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {entries.slice(0, 3).length ? entries.slice(0, 3).map((entry) => (
              <View key={entry.id} style={[styles.entry, { borderBottomColor: colors.border }]}>
                <View style={[styles.entryDot, { backgroundColor: entry.done ? '#E4F7EF' : '#EAF0FF' }]}><Feather name={entry.done ? 'check' : 'clock'} size={15} color={entry.done ? '#178A5A' : colors.primary} /></View>
                <View style={styles.entryCopy}><Text style={[styles.entryTitle, { color: colors.foreground }]} numberOfLines={1}>{entry.title}</Text><Text style={[styles.entryMeta, { color: colors.mutedForeground }]}>{entry.category}  ·  {formatDay(entry.date)}</Text></View>
                <Feather name="chevron-right" size={17} color={colors.mutedForeground} />
              </View>
            )) : <Text style={[styles.empty, { color: colors.mutedForeground }]}>अजून कोणतीही डायरी नोंद नाही.</Text>}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function QuickAction({ icon, label, onPress, colors }: { icon: keyof typeof Feather.glyphMap; label: string; onPress: () => void; colors: ReturnType<typeof useColors> }) {
  return (
    <Pressable testID={`quick-${label}`} onPress={onPress} style={({ pressed }) => [styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.72 : 1 }]}>
      <View style={[styles.quickIcon, { backgroundColor: colors.secondary }]}><Feather name={icon} size={19} color={colors.primary} /></View>
      <Text style={[styles.quickLabel, { color: colors.foreground }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  appHeader: { paddingHorizontal: 20, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandBlock: { flex: 1, minWidth: 0 },
  brandName: { fontFamily: 'Inter_700Bold', fontSize: 16, letterSpacing: -0.2 },
  brandCaption: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 4 },
  dateBlock: { alignItems: 'flex-end', paddingRight: 2 },
  dateText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  weekdayText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, marginTop: 3 },
  bellButton: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  profileWelcome: { marginHorizontal: 20, minHeight: 116, borderRadius: 22, borderWidth: 1, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  homeAvatar: { width: 68, height: 68, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 14, overflow: 'hidden' },
  homeAvatarImage: { width: '100%', height: '100%' },
  homeAvatarText: { fontFamily: 'Inter_700Bold', fontSize: 28 },
  profileWelcomeCopy: { flex: 1, minWidth: 0 },
  profileWelcomeEyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 0.5 },
  profileWelcomeName: { fontFamily: 'Inter_700Bold', fontSize: 20, marginTop: 6 },
  profileWelcomeMeta: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 5 },
  profileEditButton: { width: 35, height: 35, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  content: { paddingHorizontal: 20 },
  focusCard: { marginHorizontal: 20, borderRadius: 24, minHeight: 150, padding: 21, flexDirection: 'row', overflow: 'hidden', marginBottom: 25 },
  focusCopy: { flex: 1, paddingRight: 12 },
  focusEyebrow: { color: '#C9D7FF', fontFamily: 'Inter_600SemiBold', fontSize: 12, letterSpacing: 1 },
  focusTitle: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 23, marginTop: 10, letterSpacing: -0.4 },
  focusText: { color: '#E6ECFF', fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, marginTop: 8 },
  focusMark: { width: 65, height: 65, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.17)', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 12 },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 27 },
  quickAction: { width: '31.5%', borderWidth: 1, borderRadius: 17, paddingVertical: 13, alignItems: 'center' },
  quickIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  quickLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 11, textAlign: 'center' },
  list: { borderWidth: 1, borderRadius: 19, paddingHorizontal: 15 },
  entry: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  entryDot: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  entryCopy: { flex: 1 },
  entryTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  entryMeta: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  empty: { fontFamily: 'Inter_400Regular', textAlign: 'center', paddingVertical: 25, fontSize: 13 },
});
