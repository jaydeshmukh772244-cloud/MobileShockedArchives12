import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAppData } from '@/context/AppDataContext';
import type { DeathReportEntry, Profile } from '@/context/AppDataContext';
import { useColors } from '@/hooks/useColors';

export default function ReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, deathReports, addDeathReport, updateDeathReport, removeDeathReport, reportPeriod, updateReportPeriod } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [personName, setPersonName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [villageName, setVillageName] = useState('');
  const [deathPlace, setDeathPlace] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [cause, setCause] = useState('');
  const [remark, setRemark] = useState('');
  const [showPeriodEditor, setShowPeriodEditor] = useState(false);
  const [periodMonth, setPeriodMonth] = useState(String(reportPeriod.month));
  const [periodYear, setPeriodYear] = useState(String(reportPeriod.year));

  useEffect(() => {
    setPeriodMonth(String(reportPeriod.month));
    setPeriodYear(String(reportPeriod.year));
  }, [reportPeriod]);

  const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(reportPeriod.year, reportPeriod.month - 1, 1));

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
    if (editingId) {
      updateDeathReport(editingId, entry);
    } else {
      addDeathReport(entry);
    }
    resetForm();
    setEditingId(null);
    setShowForm(false);
  };

  const toggleForm = () => {
    if (showForm) {
      resetForm();
      setEditingId(null);
    }
    setShowForm((value) => !value);
  };

  const editDeathReport = (entry: DeathReportEntry) => {
    setEditingId(entry.id);
    setPersonName(entry.personName);
    setAge(entry.age);
    setGender(entry.gender);
    setVillageName(entry.villageName);
    setDeathPlace(entry.deathPlace);
    setDeathDate(entry.deathDate);
    setCause(entry.cause);
    setRemark(entry.remark);
    setShowForm(true);
  };

  const saveReportPeriod = () => {
    const month = Number(periodMonth);
    const year = Number(periodYear);
    if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year) || year < 1900 || year > 2200) {
      Alert.alert('चुकीची तारीख', 'महिना 1 ते 12 आणि योग्य वर्ष भरा.');
      return;
    }
    updateReportPeriod({ month, year });
    setShowPeriodEditor(false);
  };

  const exportPdf = async (action: 'share' | 'save') => {
    const html = buildDeathReportHtml({ profile, deathReports, monthLabel });
    try {
      if (Platform.OS === 'web') {
        window.print();
        return;
      }
      const Print = await import('expo-print');
      const Sharing = await import('expo-sharing');
      const { uri } = await Print.printToFileAsync({ html });
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('PDF तयार आहे', 'या device वर share सुविधा उपलब्ध नाही.');
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: action === 'share' ? 'मृत्यू अहवाल शेअर करा' : 'मृत्यू अहवाल सेव्ह करा',
        UTI: 'com.adobe.pdf',
      });
    } catch (error) {
      console.error('PDF export failed', error);
      Alert.alert('PDF तयार करता आला नाही', 'कृपया पुन्हा प्रयत्न करा.');
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollViewCompat bottomOffset={20} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 118 : insets.bottom + 100 }}>
        <ScreenHeader eyebrow="सहा राष्ट्रीय कार्यक्रमाचा आढावा" title="रिपोर्ट" subtitle="तुमच्या आरोग्य केंद्राचा मासिक अहवाल तयार करा." actionIcon={showForm ? 'x' : 'plus'} onAction={toggleForm} />
        <View style={styles.body}>
          <View style={[styles.sectionBanner, { backgroundColor: colors.secondary }]}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.card }]}><Feather name="folder" size={18} color={colors.primary} /></View>
            <View style={styles.sectionCopy}><Text style={[styles.sectionEyebrow, { color: colors.primary }]}>REPORT SECTION 1</Text><Text style={[styles.sectionTitle, { color: colors.foreground }]}>सहा राष्ट्रीय कार्यक्रमाचा आढावा</Text></View>
          </View>
          <View style={[styles.reportPaper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.paperTop}>
              <View style={styles.paperHeading}>
                <Text style={[styles.facilityName, { color: colors.foreground }]}>प्राथमिक आरोग्य केंद्र {profile.primaryHealthCenter || '—'}</Text>
                <Text style={[styles.facilityMeta, { color: colors.mutedForeground }]}>तालुका: {profile.taluka || '—'}  जिल्हा: {profile.district || '—'}</Text>
                <Text style={[styles.facilityMeta, { color: colors.mutedForeground }]}>उपकेंद्र: {profile.subCenter || '—'}</Text>
              </View>
              <Text style={[styles.monthLabel, { color: colors.foreground }]}>{monthLabel}</Text>
            </View>
            <View style={[styles.reportTitleRule, { borderTopColor: colors.border }]} />
            <Text style={[styles.reportTitle, { color: colors.foreground }]}>मृत्यू अहवाल</Text>
            <Text style={[styles.reportSubtitle, { color: colors.mutedForeground }]}>{deathReports.length} नोंदी या महिन्यात</Text>
            <Pressable onPress={() => setShowPeriodEditor((value) => !value)} style={({ pressed }) => [styles.periodButton, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}>
              <Feather name="calendar" size={14} color={colors.primary} />
              <Text style={[styles.periodButtonText, { color: colors.primary }]}>महिना / वर्ष बदला</Text>
            </Pressable>
          </View>
          {showPeriodEditor ? <View style={[styles.periodEditor, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.twoColumns}>
              <View style={styles.column}><FormField label="महिना (1-12)" value={periodMonth} onChangeText={setPeriodMonth} placeholder="उदा. 8" keyboardType="number-pad" colors={colors} /></View>
              <View style={styles.column}><FormField label="वर्ष" value={periodYear} onChangeText={setPeriodYear} placeholder="उदा. 2026" keyboardType="number-pad" colors={colors} /></View>
            </View>
            <Pressable onPress={saveReportPeriod} style={({ pressed }) => [styles.periodSaveButton, { backgroundColor: colors.primary, opacity: pressed ? 0.78 : 1 }]}><Text style={styles.saveText}>Period जतन करा</Text></Pressable>
          </View> : null}
          {showForm ? <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.formHeading}><View><Text style={[styles.formTitle, { color: colors.foreground }]}>{editingId ? 'मृत्यू नोंद बदला' : 'नवीन मृत्यू नोंद'}</Text><Text style={[styles.formHint, { color: colors.mutedForeground }]}>{editingId ? 'बदल करून नोंद पुन्हा जतन करा.' : 'अहवालातील पुढील क्रमांकासाठी माहिती भरा.'}</Text></View><Feather name="edit-3" size={18} color={colors.primary} /></View>
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
            <Pressable testID="save-death-report" onPress={saveDeathReport} style={({ pressed }) => [styles.saveButton, { backgroundColor: colors.primary, opacity: pressed ? 0.78 : 1 }]}><Feather name="check" size={17} color="#FFFFFF" /><Text style={styles.saveText}>{editingId ? 'बदल जतन करा' : 'मृत्यू नोंद जतन करा'}</Text></Pressable>
          </View> : null}
           <View style={styles.entriesHeader}>
             <View><Text style={[styles.entriesTitle, { color: colors.foreground }]}>मृत्यू अहवाल नोंदी</Text><Text style={[styles.entriesSubtitle, { color: colors.mutedForeground }]}>फोटोतील नमुन्याप्रमाणे प्रत्येक नोंद येथे दिसेल.</Text></View>
             <View style={[styles.countPill, { backgroundColor: colors.secondary }]}><Text style={[styles.countPillText, { color: colors.primary }]}>{deathReports.length}</Text></View>
           </View>
           {deathReports.length ? deathReports.map((entry, index) => (
            <DeathEntryCard key={entry.id} entry={entry} index={index} colors={colors} onEdit={() => editDeathReport(entry)} onRemove={() => Alert.alert('नोंद हटवायची?', `${entry.personName} यांची नोंद हटवायची आहे का?`, [{ text: 'रद्द करा', style: 'cancel' }, { text: 'हटवा', style: 'destructive', onPress: () => removeDeathReport(entry.id) }])} />
           )) : <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="file-text" size={24} color={colors.mutedForeground} /><Text style={[styles.emptyTitle, { color: colors.foreground }]}>अजून मृत्यू नोंद नाही</Text><Text style={[styles.emptyText, { color: colors.mutedForeground }]}>वरचे + बटन दाबून पहिली नोंद जोडा.</Text></View>}
          {deathReports.length ? <View style={[styles.exportCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.exportHeading}><View><Text style={[styles.exportTitle, { color: colors.foreground }]}>पूर्ण रिपोर्ट तयार आहे?</Text><Text style={[styles.exportText, { color: colors.mutedForeground }]}>तपासल्यानंतर PDF सेव्ह किंवा शेअर करा.</Text></View><Feather name="file-text" size={20} color={colors.primary} /></View>
            <View style={styles.exportButtons}>
              <Pressable testID="share-death-report-pdf" onPress={() => void exportPdf('share')} style={({ pressed }) => [styles.exportButton, { backgroundColor: colors.primary, opacity: pressed ? 0.78 : 1 }]}><Feather name="share-2" size={15} color="#FFFFFF" /><Text style={styles.exportButtonText}>PDF शेअर करा</Text></Pressable>
              <Pressable testID="save-death-report-pdf" onPress={() => void exportPdf('save')} style={({ pressed }) => [styles.exportButton, styles.exportButtonSecondary, { borderColor: colors.primary, opacity: pressed ? 0.78 : 1 }]}><Feather name="download" size={15} color={colors.primary} /><Text style={[styles.exportButtonSecondaryText, { color: colors.primary }]}>PDF सेव्ह करा</Text></Pressable>
            </View>
          </View> : null}
          <View style={[styles.signatureArea, { backgroundColor: colors.secondary }]}>
            <View style={styles.signatureColumn}>
              <Text style={[styles.signatureText, { color: colors.foreground }]}>सविनय सादर</Text>
              <Text style={[styles.signatureText, { color: colors.mutedForeground }]}>वैद्यकीय अधिकारी</Text>
              <Text style={[styles.signatureText, { color: colors.mutedForeground }]}>प्राथमिक आरोग्य केंद्र: {profile.primaryHealthCenter || '—'}</Text>
            </View>
            <View style={[styles.signatureColumn, styles.signatureRight]}>
              <Text style={[styles.signatureText, { color: colors.foreground }]}>नाव: {profile.name || '—'}</Text>
              <Text style={[styles.signatureText, { color: colors.mutedForeground }]}>आरोग्य सेवक</Text>
              <Text style={[styles.signatureText, { color: colors.mutedForeground }]}>उपकेंद्र: {profile.subCenter || '—'}</Text>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

function FormField({ label, value, onChangeText, placeholder, keyboardType, colors }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; keyboardType?: 'default' | 'number-pad'; colors: ReturnType<typeof useColors> }) {
  return <View style={styles.field}><Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} keyboardType={keyboardType} placeholderTextColor={colors.mutedForeground} style={[styles.fieldInput, { backgroundColor: colors.background, borderColor: colors.input, color: colors.foreground }]} /></View>;
}

function DeathEntryCard({ entry, index, colors, onEdit, onRemove }: { entry: DeathReportEntry; index: number; colors: ReturnType<typeof useColors>; onEdit: () => void; onRemove: () => void }) {
  return <View style={[styles.entryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
    <View style={[styles.entryNumber, { backgroundColor: colors.secondary }]}><Text style={[styles.entryNumberText, { color: colors.primary }]}>{index + 1}</Text></View>
    <View style={styles.entryCopy}>
      <Text style={[styles.entryName, { color: colors.foreground }]}>{entry.personName}</Text>
      <Text style={[styles.entryMeta, { color: colors.mutedForeground }]}>{entry.age || '—'} वर्षे · {entry.gender || '—'} · {entry.villageName || 'गाव नमूद नाही'}</Text>
      <Text style={[styles.entryMeta, { color: colors.mutedForeground }]}>{entry.deathPlace || 'ठिकाण नमूद नाही'} · {entry.deathDate}</Text>
      {entry.cause ? <Text style={[styles.entryCause, { color: colors.foreground }]}>कारण: {entry.cause}</Text> : null}
      {entry.remark ? <Text style={[styles.entryCause, { color: colors.mutedForeground }]}>शेरा: {entry.remark}</Text> : null}
    </View>
    <View style={styles.entryActions}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${entry.personName} ची नोंद बदला`} onPress={onEdit} hitSlop={10}><Feather name="edit-2" size={16} color={colors.primary} /></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`${entry.personName} ची नोंद हटवा`} onPress={onRemove} hitSlop={10}><Feather name="trash-2" size={16} color={colors.destructive} /></Pressable>
    </View>
  </View>;
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

function buildDeathReportHtml({ profile, deathReports, monthLabel }: { profile: Profile; deathReports: DeathReportEntry[]; monthLabel: string }) {
  const rows = deathReports.map((entry, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(entry.personName)}</td>
      <td>${escapeHtml(entry.age)}</td>
      <td>${escapeHtml(entry.gender)}</td>
      <td>${escapeHtml(entry.villageName)}</td>
      <td>${escapeHtml(entry.deathPlace)}</td>
      <td>${escapeHtml(entry.deathDate)}</td>
      <td>${escapeHtml(entry.cause)}</td>
      <td>${escapeHtml(entry.remark)}</td>
    </tr>
  `).join('');
  return `<!doctype html>
    <html><head><meta charset="utf-8"><title>मृत्यू अहवाल - ${escapeHtml(monthLabel)}</title>
    <style>
      @page { size: A4 landscape; margin: 16mm; }
      body { font-family: Arial, sans-serif; color: #172033; margin: 0; }
      .top { display: flex; justify-content: space-between; align-items: flex-start; }
      .center { text-align: center; flex: 1; }
      .facility { font-size: 18px; font-weight: 700; }
      .meta { font-size: 12px; margin-top: 5px; }
      .month { font-size: 13px; font-weight: 700; min-width: 130px; text-align: right; }
      h1 { font-size: 20px; text-align: center; margin: 24px 0 16px; }
      table { border-collapse: collapse; width: 100%; font-size: 10px; }
      th, td { border: 1px solid #6f7785; padding: 7px 5px; text-align: center; vertical-align: middle; }
      th { background: #eef2ff; font-weight: 700; }
      td:nth-child(2), td:nth-child(5), td:nth-child(6), td:nth-child(8), td:nth-child(9) { text-align: left; }
      .signatures { display: flex; justify-content: space-between; margin-top: 55px; font-size: 12px; line-height: 1.7; }
      .right { text-align: right; }
    </style></head><body>
      <div class="top">
        <div style="width:130px"></div>
        <div class="center">
           <div class="facility">${escapeHtml(`प्राथमिक आरोग्य केंद्र ${profile.primaryHealthCenter || '—'}`)}</div>
          <div class="meta">तालुका: ${escapeHtml(profile.taluka || '—')} &nbsp;&nbsp; जिल्हा: ${escapeHtml(profile.district || '—')}</div>
          <div class="meta">उपकेंद्र: ${escapeHtml(profile.subCenter || '—')}</div>
        </div>
        <div class="month">${escapeHtml(monthLabel)}</div>
      </div>
      <h1>मृत्यू अहवाल</h1>
      <table><thead><tr>
        <th>अ.नं.</th><th>मृत व्यक्तीचे नाव</th><th>वय</th><th>लिंग</th><th>गावाचे नाव</th><th>मृत्यूचे ठिकाण</th><th>मृत्यूचा दिनांक</th><th>मृत्यूचे कारण</th><th>शेरा</th>
      </tr></thead><tbody>${rows || '<tr><td colspan="9">कोणतीही नोंद नाही</td></tr>'}</tbody></table>
      <div class="signatures">
        <div>सविनय सादर<br>वैद्यकीय अधिकारी<br>प्राथमिक आरोग्य केंद्र: ${escapeHtml(profile.primaryHealthCenter || '—')}</div>
        <div class="right">नाव: ${escapeHtml(profile.name || '—')}<br>आरोग्य सेवक<br>उपकेंद्र: ${escapeHtml(profile.subCenter || '—')}</div>
      </div>
    </body></html>`;
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
  periodButton: { height: 34, borderRadius: 10, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 13 },
  periodButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 10 },
  periodEditor: { borderRadius: 17, borderWidth: 1, padding: 14, marginTop: -8, marginBottom: 18 },
  periodSaveButton: { height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginTop: -2 },
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
  entryActions: { gap: 14, paddingTop: 2 },
  emptyCard: { borderRadius: 17, borderWidth: 1, alignItems: 'center', paddingVertical: 24, paddingHorizontal: 18, marginBottom: 14 },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, marginTop: 9 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4, textAlign: 'center' },
  exportCard: { borderRadius: 17, borderWidth: 1, padding: 14, marginBottom: 14 },
  exportHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  exportTitle: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  exportText: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 4 },
  exportButtons: { flexDirection: 'row', gap: 8, marginTop: 13 },
  exportButton: { flex: 1, minHeight: 40, borderRadius: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 6 },
  exportButtonSecondary: { borderWidth: 1, backgroundColor: 'transparent' },
  exportButtonText: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 10 },
  exportButtonSecondaryText: { fontFamily: 'Inter_600SemiBold', fontSize: 10 },
  signatureArea: { borderRadius: 15, padding: 13, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  signatureColumn: { flex: 1 },
  signatureRight: { alignItems: 'flex-end' },
  signatureText: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 16 },
});