import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAppData } from '@/context/AppDataContext';
import { useColors } from '@/hooks/useColors';

export default function PeopleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useAppData();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    setName(profile.name);
    setRole(profile.role);
    setPhone(profile.phone);
    setEmail(profile.email);
  }, [profile]);

  const saveProfile = () => {
    if (!name.trim()) {
      Alert.alert('माहिती अपुरी आहे', 'कृपया तुमचे पूर्ण नाव लिहा.');
      return;
    }
    updateProfile({
      name: name.trim(),
      role: role.trim(),
      phone: phone.trim(),
      email: email.trim(),
    });
    Alert.alert('प्रोफाइल जतन झाले', 'तुमची माहिती यशस्वीपणे जतन झाली.');
  };

  const initial = name.trim().slice(0, 1) || 'आ';

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollViewCompat showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 118 : insets.bottom + 100 }}>
        <ScreenHeader eyebrow="वैयक्तिक माहिती" title="माझे प्रोफाइल" subtitle="आरोग्य सेवक (MPW) अॅप वापरणाऱ्या व्यक्तीची माहिती." />
        <View style={styles.body}>
          <View style={[styles.profileCard, { backgroundColor: colors.primary }]}>
            <View style={styles.profileAvatar}><Text style={styles.profileAvatarText}>{initial}</Text></View>
            <View style={styles.profileCopy}>
              <Text style={styles.profileEyebrow}>सध्याचे प्रोफाइल</Text>
              <Text style={styles.profileName}>{name.trim() || 'तुमचे नाव'}</Text>
              <Text style={styles.profileRole}>{role.trim() || 'पद / जबाबदारी नमूद करा'}</Text>
            </View>
            <Feather name="user" size={24} color="#D8E3FF" />
          </View>
          <View style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>तुमची माहिती</Text>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>पूर्ण नाव *</Text>
            <TextInput value={name} onChangeText={setName} placeholder="उदा. अमोल देशमुख" placeholderTextColor={colors.mutedForeground} style={[styles.input, { backgroundColor: colors.background, borderColor: colors.input, color: colors.foreground }]} />
            <Text style={[styles.label, { color: colors.mutedForeground }]}>पद / जबाबदारी</Text>
            <TextInput value={role} onChangeText={setRole} placeholder="उदा. आरोग्य सेवक (MPW)" placeholderTextColor={colors.mutedForeground} style={[styles.input, { backgroundColor: colors.background, borderColor: colors.input, color: colors.foreground }]} />
            <Text style={[styles.label, { color: colors.mutedForeground }]}>मोबाईल नंबर</Text>
            <TextInput value={phone} onChangeText={setPhone} placeholder="मोबाईल नंबर" keyboardType="phone-pad" placeholderTextColor={colors.mutedForeground} style={[styles.input, { backgroundColor: colors.background, borderColor: colors.input, color: colors.foreground }]} />
            <Text style={[styles.label, { color: colors.mutedForeground }]}>ईमेल</Text>
            <TextInput value={email} onChangeText={setEmail} placeholder="ईमेल (ऐच्छिक)" keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.mutedForeground} style={[styles.input, { backgroundColor: colors.background, borderColor: colors.input, color: colors.foreground }]} />
            <Pressable onPress={saveProfile} style={({ pressed }) => [styles.saveButton, { backgroundColor: colors.primary, opacity: pressed ? 0.78 : 1 }]}><Feather name="save" size={17} color="#FFFFFF" /><Text style={styles.saveText}>प्रोफाइल जतन करा</Text></Pressable>
          </View>
          <View style={[styles.infoBanner, { backgroundColor: colors.secondary }]}>
            <Feather name="shield" size={18} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.foreground }]}>हे प्रोफाइल फक्त अॅप वापरणाऱ्या तुमच्यासाठी आहे. ग्राहक किंवा टीम सदस्यांची स्वतंत्र माहिती येथे ठेवली जाणार नाही.</Text>
          </View>
        </View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { paddingHorizontal: 20 },
  profileCard: { borderRadius: 22, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  profileAvatar: { width: 58, height: 58, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  profileAvatarText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 25 },
  profileCopy: { flex: 1 },
  profileEyebrow: { color: '#C9D7FF', fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 0.7 },
  profileName: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 18, marginTop: 5 },
  profileRole: { color: '#E0E8FF', fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 3 },
  form: { padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 14 },
  formTitle: { fontFamily: 'Inter_700Bold', fontSize: 17, marginBottom: 16 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 11, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 13, paddingHorizontal: 13, paddingVertical: 11, fontFamily: 'Inter_400Regular', fontSize: 14, marginBottom: 12 },
  saveButton: { height: 45, borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveText: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  infoBanner: { borderRadius: 15, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  infoText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
});