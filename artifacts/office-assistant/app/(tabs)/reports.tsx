import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ScreenHeader } from '@/components/ScreenHeader';
import { DeathReportEntry, useAppData } from '@/context/AppDataContext';
import { useColors } from '@/hooks/useColors';

export default function ReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, deathReports, addDeathReport, removeDeathReport } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [personName, setPersonName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [villageName, setVillageName] = useState('');
  const [deathPlace, setDeathPlace] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [cause, setCause] = useState('');
  const [remark, setRemark] = useState('');

  const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());

  const resetForm = () => {
    setPersonName('');
    setAge('');
    setGender('');
    setVillageName('');
    setDeathPlace('');
    setDeathDate('');
    setCause('');
    setRemark('');
  };

  const saveDeathReport = () => {
    if (!personName.trim() || !deathDate.trim()) {
      Alert.alert('माहिती अपुरी आहे', 'मृत व्यक्तीचे नाव आणि मृत्यूची तारीख लिहा.');
      return;
    }
    const entry: Omit<DeathReportEntry, 'id'> = {
      personName: personName.trim(),
      age: age.trim(),
      gender: gender.trim(),
      villageName: villageName.trim(),
      deathPlace: deathPlace.trim(),
      deathDate: deathDate.trim(),
      cause: cause.trim(),
      remark: remark.trim(),
    };
    addDeathReport(entry);
    resetForm();
    setShowForm(false);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollViewCompat bottomOffset={20} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 118 : insets.bottom + 100 }}>
        <ScreenHeader eyebrow="सहा राष्ट्रीय कार्यक्रमाचा आढावा" title="रिपोर्ट" subtitle="तुमच्या आरोग्य केंद्राचा मासिक अहवाल तयार करा." actionIcon={showForm ? 'x' : 'plus'} onAction={() => setShowForm((value) => !value)} />
        <View style={styles.body}>
          <View style={[styles.sectionBanner, { backgroundColor: colors.secondary }]}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.card }]}><Feather name="folder" size={18} color={colors.primary} /></View>
            <View style={styles.sectionCopy}><Text style={[styles.sectionEyebrow, { color: colors.primary }]}>REPORT SECTION 1</Text><Text style={[styles.sectionTitle, { color: colors.foreground }]}>सहा राष्ट्रीय कार्यक्रमाचा आढावा</Text></View>
          </View>
          <View style={[styles.reportPaper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.paperTop}>
              <View style={styles.paperHeading}>
                <Text style={[styles.facilityName, { color: colors.foreground }]}>{profile.primaryHealthCenter || 'प्राथमिक आरोग्य केंद्र'}</Text>
                <Text style={[styles.facilityMeta, { color: colors.mutedForeground }]}>तालुका: {profile.taluka || '—'}  जिल्हा: {profile.district || '—'}</Text>
                <Text style={[styles.facilityMeta, { color: colors.mutedForeground }]}>उपकेंद्र: {profile.subCenter || '—'}</Text>
              </View>
              <Text style={[styles.monthLabel, { color: colors.foreground }]}>MONTH {monthLabel.toUpperCase()}</Text>
            </View>
            <View style={[styles.reportTitleRule, { borderTopColor: colors.border }]} />
            <Text style={[styles.reportTitle, { color: colors.foreground }]}>मृत्यू अहवाल</Text>
            <Text style={[styles.reportSubtitle, { color: colors.mutedForeground }]}>{deathReports.length} नोंदी या महिन्यात</Text>
          </View>
          {showForm ? <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.formHeading}><View><Text style={[styles.formTitle, { color: colors.foreground }]}>नवीन मृत्यू नोंद</Text><Text style={[styles.formHint, { color: colors.mutedForeground }]}>अहवालातील पुढील क्रमांकासाठी माहिती भरा.</Text></View><Feather name="edit-3" size={18} color={colors.primary} /></View>
            <FormField label="मृत व्यक्तीचे नाव *" value={personName} onChangeText={setPersonName} placeholder="पूर्ण नाव" colors={colors} />
            <View style={styles.twoColumns}>
              <View style={styles.column}><FormField label="वय" value={age} onChangeText={setAge} placeholder="वय" keyboardType="number-pad" colors={colors} /></View>
              <View style={styles.column}><FormField label="लिंग" value={gender} onChangeText={setGender} placeholder="M / F" colors={colors} /></View>
            </View>
            <View style={styles.twoColumns}>
              <View style={styles.column}><FormField label="गावाचे नाव" value={villageName} onChangeText={setVillageName} placeholder="गाव" colors={colors} /></View>
              <View style={styles.column}><FormField label="मृत्यूचे ठिकाण" value={deathPlace} onChangeText={setDeathPlace} placeholder="ठिकाण" colors={colors} /></View>
            </View>
            <FormField label="मृत्यूची तारीख *" value={deathDate} onChangeText={setDeathDate} placeholder="DD/MM/YYYY" keyboardType="number-pad" colors={colors} />
            <FormField label="मृत्यूचे कारण" value={cause} onChangeText={setCause} placeholder="मृत्यूचे कारण" colors={colors} />
            <FormField label="शेरा" value={remark} onChangeText={setRemark} placeholder="अतिरिक्त माहिती" colors={colors} />
            <Pressable testID="save-death-report" onPress={saveDeathReport} style={({ pressed }) => [styles.saveButton, { backgroundColor: colors.primary, opacity: pressed ? 0.78 : 1 }]}><Feather name="check" size={17} color="#FFFFFF" /><Text style={styles.saveText}>मृत्यू नोंद जतन करा</Text></Pressable>
          </View> : null}
          <View style={styles.entriesHeader}>
            <View><Text style={[styles.entriesTitle, { color: colors.foreground }]}>मृत्यू अहवाल नोंदी</Text><Text style={[styles.entriesSubtitle, { color: colors.mutedForeground }]}>फोटोतील नमुन्याप्रमाणे प्रत्येक नोंद येथे दिसेल.</Text></View>
            <View style={[styles.countPill, { backgroundColor: colors.secondary }]}><Text style={[styles.countPillText, { color: colors.primary }]}>{deathReports.length}</Text></View>
          </View>
          {deathReports.length ? deathReports.map((entry, index) => (
            <DeathEntryCard key={entry.id} entry={entry} index={index} colors={colors} onRemove={() => Alert.alert('नोंद हटवायची?', `${entry.personName} यांची नोंद हटवायची आहे का?`, [{ text: 'रद्द करा', style: 'cancel' }, { text: 'हटवा', style: 'destructive', onPress: () => removeDeathReport(entry.id) }])} />
          )) : <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="file-text" size={24} color={colors.mutedForeground} /><Text style={[styles.emptyTitle, { color: colors.foreground }]}>अजून मृत्यू नोंद नाही</Text><Text style={[styles.emptyText, { color: colors.mutedForeground }]}>वरचे + बटन दाबून पहिली नोंद जोडा.</Text></View>}
          <View style={[styles.footerCard, { backgroundColor: colors.secondary }]}>
            <Feather name="user-check" size={18} color={colors.primary} />
            <View style={styles.footerCopy}><Text style={[styles.footerName, { color: colors.foreground }]}>अहवाल तयार करणारे</Text><Text style={[styles.footerText, { color: colors.mutedForeground }]}>{profile.name || 'तुमचे नाव'} · आरोग्य सेवक · {profile.subCenter || 'उपकेंद्र'}</Text></View>
          </View>
        </View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

function FormField({ label, value, onChangeText, placeholder, keyboardType, colors }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; keyboardType?: 'default' | 'number-pad'; colors: ReturnType<typeof useColors> }) {
  return <View style={styles.field}><Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} keyboardType={keyboardType} placeholderTextColor={colors.mutedForeground} style={[styles.fieldInput, { backgroundColor: colors.background, borderColor: colors.input, color: colors.foreground }]} /></View>;
}

function DeathEntryCard({ entry, index, colors, onRemove }: { entry: DeathReportEntry; index: number; colors: ReturnType<typeof useColors>; onRemove: () => void }) {
  return <View style={[styles.entryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
    <View style={[styles.entryNumber, { backgroundColor: colors.secondary }]}><Text style={[styles.entryNumberText, { color: colors.primary }]}>{index + 1}</Text></View>
    <View style={styles.entryCopy}>
      <Text style={[styles.entryName, { color: colors.foreground }]}>{entry.personName}</Text>
      <Text style={[styles.entryMeta, { color: colors.mutedForeground }]}>{entry.age || '—'} वर्षे · {entry.gender || '—'} · {entry.villageName || 'गाव नमूद नाही'}</Text>
      <Text style={[styles.entryMeta, { color: colors.mutedForeground }]}>{entry.deathPlace || 'ठिकाण नमूद नाही'} · {entry.deathDate}</Text>
      {entry.cause ? <Text style={[styles.entryCause, { color: colors.foreground }]}>कारण: {entry.cause}</Text> : null}
      {entry.remark ? <Text style={[styles.entryCause, { color: colors.mutedForeground }]}>शेरा: {entry.remark}</Text> : null}
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel={`${entry.personName} ची नोंद हटवा`} onPress={onRemove} hitSlop={10}><Feather name="trash-2" size={17} color={colors.destructive} /></Pressable>
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { paddingHorizontal: 20 },
  sectionBanner: { borderRadius: 17, padding: 13, flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sectionIcon: { width: 37, height: 37, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  sectionCopy: { flex: 1 },
  sectionEyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 0.7 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 14, marginTop: 3 },
  reportPaper: { borderRadius: 19, borderWidth: 1, padding: 16, marginBottom: 18 },
  paperTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  paperHeading: { flex: 1, paddingRight: 8 },
  facilityName: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  facilityMeta: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 4 },
  monthLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 9, maxWidth: 90, textAlign: 'right' },
  reportTitleRule: { borderTopWidth: 1, marginTop: 13 },
  reportTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, textAlign: 'center', marginTop: 12 },
  reportSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, textAlign: 'center', marginTop: 4 },
  formCard: { borderRadius: 19, borderWidth: 1, padding: 16, marginBottom: 18 },
  formHeading: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 15 },
  formTitle: { fontFamily: 'Inter_700Bold', fontSize: 17 },
  formHint: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  twoColumns: { flexDirection: 'row', gap: 9 },
  column: { flex: 1, minWidth: 0 },
  field: { marginBottom: 11 },
  fieldLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10, marginBottom: 6 },
  fieldInput: { height: 42, borderWidth: 1, borderRadius: 11, paddingHorizontal: 11, fontFamily: 'Inter_400Regular', fontSize: 13 },
  saveButton: { height: 44, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 2 },
  saveText: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  entriesHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 },
  entriesTitle: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  entriesSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 4 },
  countPill: { minWidth: 31, height: 31, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  countPillText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  entryCard: { borderRadius: 17, borderWidth: 1, padding: 13, flexDirection: 'row', alignItems: 'flex-start', marginBottom: 9 },
  entryNumber: { width: 29, height: 29, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  entryNumberText: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  entryCopy: { flex: 1, paddingRight: 8 },
  entryName: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  entryMeta: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 4 },
  entryCause: { fontFamily: 'Inter_500Medium', fontSize: 10, marginTop: 5 },
  emptyCard: { borderRadius: 17, borderWidth: 1, alignItems: 'center', paddingVertical: 24, paddingHorizontal: 18, marginBottom: 14 },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, marginTop: 9 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4, textAlign: 'center' },
  footerCard: { borderRadius: 15, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  footerCopy: { flex: 1 },
  footerName: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  footerText: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 3 },
});