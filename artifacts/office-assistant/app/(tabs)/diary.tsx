import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAppData } from '@/context/AppDataContext';
import { useColors } from '@/hooks/useColors';

const formatDay = (date: string) =>
  new Intl.DateTimeFormat('mr-IN', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`));

export default function DiaryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { entries, addEntry, toggleEntry, removeEntry } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('सामान्य');
  const [filter, setFilter] = useState<'all' | 'open' | 'done'>('all');
  const visibleEntries = useMemo(
    () => entries.filter((entry) => filter === 'all' || (filter === 'done' ? entry.done : !entry.done)),
    [entries, filter],
  );

  const saveEntry = () => {
    if (!title.trim()) {
      Alert.alert('शीर्षक आवश्यक आहे', 'डायरी नोंदीसाठी एक छोटं शीर्षक लिहा.');
      return;
    }
    addEntry({ title: title.trim(), note: note.trim() || 'अतिरिक्त माहिती नाही.', category, done: false });
    setTitle('');
    setNote('');
    setCategory('सामान्य');
    setShowForm(false);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollViewCompat
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 118 : insets.bottom + 100 }}
      >
        <ScreenHeader
          eyebrow="दिवसाची नोंद"
          title="डायरी"
          subtitle="कामं, भेटी आणि महत्त्वाच्या नोंदी एका जागी ठेवा."
          actionIcon={showForm ? 'x' : 'plus'}
          onAction={() => setShowForm((value) => !value)}
        />
        {showForm ? (
          <View style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>नवीन नोंद</Text>
            <TextInput
              testID="diary-title"
              value={title}
              onChangeText={setTitle}
              placeholder="उदा. ग्राहकाला कॉल करायचा"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.input, color: colors.foreground }]}
            />
            <TextInput
              testID="diary-note"
              value={note}
              onChangeText={setNote}
              placeholder="थोडक्यात अधिक माहिती..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              style={[styles.input, styles.noteInput, { backgroundColor: colors.background, borderColor: colors.input, color: colors.foreground }]}
            />
            <Text style={[styles.label, { color: colors.mutedForeground }]}>कॅटेगरी</Text>
            <View style={styles.chips}>
              {['सामान्य', 'मीटिंग', 'फॉलो-अप', 'अकाउंट्स'].map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  style={[styles.chip, { backgroundColor: category === item ? colors.primary : colors.background, borderColor: category === item ? colors.primary : colors.border }]}
                >
                  <Text style={[styles.chipText, { color: category === item ? '#FFFFFF' : colors.mutedForeground }]}>{item}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable testID="save-diary" onPress={saveEntry} style={({ pressed }) => [styles.saveButton, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}>
              <Feather name="check" size={17} color="#FFFFFF" />
              <Text style={styles.saveText}>नोंद जतन करा</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.body}>
          <View style={styles.filterRow}>
            {[
              { key: 'all' as const, label: 'सर्व', count: entries.length },
              { key: 'open' as const, label: 'बाकी', count: entries.filter((entry) => !entry.done).length },
              { key: 'done' as const, label: 'पूर्ण', count: entries.filter((entry) => entry.done).length },
            ].map((item) => (
              <Pressable key={item.key} onPress={() => setFilter(item.key)} style={[styles.filter, { backgroundColor: filter === item.key ? colors.secondary : 'transparent' }]}>
                <Text style={[styles.filterText, { color: filter === item.key ? colors.primary : colors.mutedForeground }]}>{item.label}</Text>
                <Text style={[styles.filterCount, { color: filter === item.key ? colors.primary : colors.mutedForeground }]}>{item.count}</Text>
              </Pressable>
            ))}
          </View>
          {visibleEntries.length ? visibleEntries.map((entry) => (
            <DiaryCard key={entry.id} entry={entry} onToggle={() => { toggleEntry(entry.id); void Haptics.selectionAsync(); }} onDelete={() => Alert.alert('नोंद हटवायची?', 'ही कृती पूर्ववत करता येणार नाही.', [{ text: 'रद्द करा', style: 'cancel' }, { text: 'हटवा', style: 'destructive', onPress: () => removeEntry(entry.id) }])} colors={colors} />
          )) : (
            <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}><Feather name="book-open" size={24} color={colors.primary} /></View>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>या फिल्टरमध्ये नोंद नाही</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>नवीन डायरी नोंद जोडण्यासाठी वरचं प्लस बटन वापरा.</Text>
            </View>
          )}
        </View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

function DiaryCard({ entry, onToggle, onDelete, colors }: { entry: { title: string; note: string; date: string; category: string; done: boolean }; onToggle: () => void; onDelete: () => void; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Pressable testID={`toggle-${entry.title}`} onPress={onToggle} style={[styles.checkbox, { backgroundColor: entry.done ? '#E4F7EF' : colors.background, borderColor: entry.done ? '#178A5A' : colors.input }]}>
        {entry.done ? <Feather name="check" size={15} color="#178A5A" /> : null}
      </Pressable>
      <View style={styles.cardCopy}>
        <View style={styles.cardTop}>
          <Text style={[styles.cardTitle, { color: entry.done ? colors.mutedForeground : colors.foreground, textDecorationLine: entry.done ? 'line-through' : 'none' }]}>{entry.title}</Text>
          <Pressable accessibilityRole="button" onPress={onDelete} hitSlop={10}><Feather name="more-horizontal" size={18} color={colors.mutedForeground} /></Pressable>
        </View>
        <Text style={[styles.cardNote, { color: colors.mutedForeground }]} numberOfLines={2}>{entry.note}</Text>
        <View style={styles.cardMeta}><Text style={[styles.category, { color: colors.primary, backgroundColor: colors.secondary }]}>{entry.category}</Text><Text style={[styles.date, { color: colors.mutedForeground }]}>{formatDay(entry.date)}</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  form: { marginHorizontal: 20, padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 21 },
  formTitle: { fontFamily: 'Inter_700Bold', fontSize: 17, marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 13, paddingHorizontal: 13, paddingVertical: 11, fontFamily: 'Inter_400Regular', fontSize: 14, marginBottom: 10 },
  noteInput: { minHeight: 74, textAlignVertical: 'top' },
  label: { fontFamily: 'Inter_500Medium', fontSize: 12, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 14 },
  chip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 11, paddingVertical: 7 },
  chipText: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  saveButton: { height: 45, borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveText: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  body: { paddingHorizontal: 20 },
  filterRow: { flexDirection: 'row', backgroundColor: '#EDF1F7', borderRadius: 13, padding: 4, marginBottom: 16 },
  filter: { flex: 1, paddingVertical: 9, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5 },
  filterText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  filterCount: { fontFamily: 'Inter_700Bold', fontSize: 11 },
  card: { borderWidth: 1, borderRadius: 18, padding: 14, flexDirection: 'row', marginBottom: 11 },
  checkbox: { width: 27, height: 27, borderRadius: 9, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginTop: 1, marginRight: 11 },
  cardCopy: { flex: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  cardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, flex: 1, lineHeight: 19 },
  cardNote: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, marginTop: 5 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 11, gap: 9 },
  category: { fontFamily: 'Inter_600SemiBold', fontSize: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7 },
  date: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  empty: { borderWidth: 1, borderRadius: 19, alignItems: 'center', padding: 28, marginTop: 4 },
  emptyIcon: { width: 52, height: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  emptyTitle: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 12, textAlign: 'center', lineHeight: 18, marginTop: 7 },
});