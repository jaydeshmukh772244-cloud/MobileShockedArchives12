import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAppData, PersonKind } from '@/context/AppDataContext';
import { useColors } from '@/hooks/useColors';

export default function PeopleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { people, addPerson, removePerson } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [kind, setKind] = useState<PersonKind>('team');

  const savePerson = () => {
    if (!name.trim() || !role.trim()) {
      Alert.alert('माहिती अपुरी आहे', 'नाव आणि भूमिका लिहा.');
      return;
    }
    addPerson({ name: name.trim(), role: role.trim(), phone: phone.trim() || 'फोन नंबर नाही', email: '', kind });
    setName(''); setRole(''); setPhone(''); setKind('team'); setShowForm(false);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollViewCompat showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 118 : insets.bottom + 100 }}>
        <ScreenHeader eyebrow="लोक आणि संपर्क" title="युजर्स" subtitle="टीम आणि ग्राहकांची बेसिक माहिती सहज सांभाळा." actionIcon={showForm ? 'x' : 'plus'} onAction={() => setShowForm((value) => !value)} />
        {showForm ? <View style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.formTitle, { color: colors.foreground }]}>नवीन युजर</Text>
          <TextInput value={name} onChangeText={setName} placeholder="पूर्ण नाव" placeholderTextColor={colors.mutedForeground} style={[styles.input, { backgroundColor: colors.background, borderColor: colors.input, color: colors.foreground }]} />
          <TextInput value={role} onChangeText={setRole} placeholder="भूमिका / कंपनी" placeholderTextColor={colors.mutedForeground} style={[styles.input, { backgroundColor: colors.background, borderColor: colors.input, color: colors.foreground }]} />
          <TextInput value={phone} onChangeText={setPhone} placeholder="फोन नंबर (ऐच्छिक)" keyboardType="phone-pad" placeholderTextColor={colors.mutedForeground} style={[styles.input, { backgroundColor: colors.background, borderColor: colors.input, color: colors.foreground }]} />
          <View style={styles.kindRow}>
            {([{ key: 'team' as const, label: 'टीम सदस्य' }, { key: 'customer' as const, label: 'ग्राहक' }]).map((item) => <Pressable key={item.key} onPress={() => setKind(item.key)} style={[styles.kind, { backgroundColor: kind === item.key ? colors.primary : colors.background, borderColor: kind === item.key ? colors.primary : colors.border }]}><Text style={[styles.kindText, { color: kind === item.key ? '#FFFFFF' : colors.mutedForeground }]}>{item.label}</Text></Pressable>)}
          </View>
          <Pressable onPress={savePerson} style={[styles.saveButton, { backgroundColor: colors.primary }]}><Feather name="user-plus" size={17} color="#FFFFFF" /><Text style={styles.saveText}>युजर जतन करा</Text></Pressable>
        </View> : null}
        <View style={styles.body}>
          <View style={[styles.countBanner, { backgroundColor: colors.secondary }]}><Feather name="users" size={18} color={colors.primary} /><Text style={[styles.countText, { color: colors.foreground }]}>{people.length} युजर्स नोंदवले आहेत</Text></View>
          {people.map((person) => <View key={person.id} style={[styles.personCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: person.kind === 'team' ? colors.secondary : colors.accent }]}><Text style={[styles.avatarText, { color: person.kind === 'team' ? colors.primary : colors.accentForeground }]}>{person.name.slice(0, 1)}</Text></View>
            <View style={styles.personCopy}><Text style={[styles.personName, { color: colors.foreground }]}>{person.name}</Text><Text style={[styles.personRole, { color: colors.mutedForeground }]}>{person.role}</Text><View style={styles.personMeta}><Feather name="phone" size={11} color={colors.mutedForeground} /><Text style={[styles.phone, { color: colors.mutedForeground }]}>{person.phone}</Text></View></View>
            <Pressable onPress={() => Alert.alert('युजर हटवायचा?', `${person.name} ची माहिती हटवायची आहे का?`, [{ text: 'रद्द करा', style: 'cancel' }, { text: 'हटवा', style: 'destructive', onPress: () => removePerson(person.id) }])} hitSlop={10}><Feather name="more-vertical" size={18} color={colors.mutedForeground} /></Pressable>
          </View>)}
        </View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  form: { marginHorizontal: 20, padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 20 },
  formTitle: { fontFamily: 'Inter_700Bold', fontSize: 17, marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 13, paddingHorizontal: 13, paddingVertical: 11, fontFamily: 'Inter_400Regular', fontSize: 14, marginBottom: 10 },
  kindRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  kind: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  kindText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  saveButton: { height: 45, borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveText: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  body: { paddingHorizontal: 20 },
  countBanner: { borderRadius: 14, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 14 },
  countText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  personCard: { borderRadius: 18, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 45, height: 45, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontFamily: 'Inter_700Bold', fontSize: 19 },
  personCopy: { flex: 1 },
  personName: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  personRole: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 3 },
  personMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 7 },
  phone: { fontFamily: 'Inter_400Regular', fontSize: 11 },
});