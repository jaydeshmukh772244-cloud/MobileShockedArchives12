import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useColors } from '@/hooks/useColors';

const numberValue = (value: string) => Number(value.replace(',', '.')) || 0;

export default function ToolsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState<'gst' | 'percent' | 'hours'>('gst');
  const [amount, setAmount] = useState('1000');
  const [gst, setGst] = useState('18');
  const [percent, setPercent] = useState('10');
  const [hours, setHours] = useState('8');
  const [minutes, setMinutes] = useState('30');
  const result = useMemo(() => {
    const base = numberValue(amount);
    const tax = base * numberValue(gst) / 100;
    const p = base * numberValue(percent) / 100;
    return { tax, total: base + tax, percentage: p, time: numberValue(hours) + numberValue(minutes) / 60 };
  }, [amount, gst, percent, hours, minutes]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollViewCompat showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 118 : insets.bottom + 100 }}>
        <ScreenHeader eyebrow="ऑफिस टूल्स" title="कॅल्क्युलेटर" subtitle="नेहमी लागणाऱ्या गणना काही सेकंदांत करा." />
        <View style={styles.body}>
          <View style={styles.toolTabs}>
            {[
              { key: 'gst' as const, icon: 'tag' as const, label: 'GST' },
              { key: 'percent' as const, icon: 'percent' as const, label: 'टक्केवारी' },
              { key: 'hours' as const, icon: 'clock' as const, label: 'वेळ' },
            ].map((item) => (
              <Pressable key={item.key} onPress={() => setActive(item.key)} style={[styles.toolTab, { backgroundColor: active === item.key ? colors.primary : colors.card, borderColor: active === item.key ? colors.primary : colors.border }]}>
                <Feather name={item.icon} size={17} color={active === item.key ? '#FFFFFF' : colors.mutedForeground} />
                <Text style={[styles.toolTabText, { color: active === item.key ? '#FFFFFF' : colors.mutedForeground }]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
          {active === 'gst' ? (
            <CalculatorCard title="GST कॅल्क्युलेटर" description="करासहित अंतिम रक्कम पटकन काढा." colors={colors}>
              <InputRow label="मूळ रक्कम" value={amount} onChangeText={setAmount} prefix="₹" colors={colors} />
              <InputRow label="GST दर" value={gst} onChangeText={setGst} suffix="%" colors={colors} />
              <ResultRow label="GST रक्कम" value={`₹${result.tax.toFixed(2)}`} colors={colors} />
              <ResultRow label="अंतिम रक्कम" value={`₹${result.total.toFixed(2)}`} primary colors={colors} />
            </CalculatorCard>
          ) : active === 'percent' ? (
            <CalculatorCard title="टक्केवारी कॅल्क्युलेटर" description="सूट, कमिशन किंवा वाढीची रक्कम शोधा." colors={colors}>
              <InputRow label="मूळ रक्कम" value={amount} onChangeText={setAmount} prefix="₹" colors={colors} />
              <InputRow label="टक्केवारी" value={percent} onChangeText={setPercent} suffix="%" colors={colors} />
              <ResultRow label={`${percent || '0'}% रक्कम`} value={`₹${result.percentage.toFixed(2)}`} primary colors={colors} />
              <ResultRow label="टक्केवारीनंतर एकूण" value={`₹${(numberValue(amount) + result.percentage).toFixed(2)}`} colors={colors} />
            </CalculatorCard>
          ) : (
            <CalculatorCard title="कामाचा वेळ" description="तास आणि मिनिटं एकत्र करून एकूण वेळ पहा." colors={colors}>
              <InputRow label="तास" value={hours} onChangeText={setHours} suffix="तास" colors={colors} />
              <InputRow label="मिनिटं" value={minutes} onChangeText={setMinutes} suffix="मिनिटं" colors={colors} />
              <ResultRow label="एकूण वेळ" value={`${result.time.toFixed(2)} तास`} primary colors={colors} />
            </CalculatorCard>
          )}
          <View style={[styles.tip, { backgroundColor: colors.accent }]}>
            <Feather name="info" size={17} color={colors.accentForeground} />
            <Text style={[styles.tipText, { color: colors.accentForeground }]}>रक्कम किंवा दर बदलला की निकाल आपोआप अपडेट होतो.</Text>
          </View>
        </View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

function CalculatorCard({ title, description, children, colors }: { title: string; description: string; children: React.ReactNode; colors: ReturnType<typeof useColors> }) {
  return <View style={[styles.calcCard, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={[styles.calcTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.calcDescription, { color: colors.mutedForeground }]}>{description}</Text><View style={styles.calcBody}>{children}</View></View>;
}

function InputRow({ label, value, onChangeText, prefix, suffix, colors }: { label: string; value: string; onChangeText: (value: string) => void; prefix?: string; suffix?: string; colors: ReturnType<typeof useColors> }) {
  return <View style={styles.inputRow}><Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>{label}</Text><View style={[styles.numberInput, { backgroundColor: colors.background, borderColor: colors.input }]}>{prefix ? <Text style={[styles.affix, { color: colors.mutedForeground }]}>{prefix}</Text> : null}<TextInput keyboardType="decimal-pad" value={value} onChangeText={onChangeText} style={[styles.numberText, { color: colors.foreground }]} />{suffix ? <Text style={[styles.affix, { color: colors.mutedForeground }]}>{suffix}</Text> : null}</View></View>;
}

function ResultRow({ label, value, primary, colors }: { label: string; value: string; primary?: boolean; colors: ReturnType<typeof useColors> }) {
  return <View style={[styles.resultRow, { borderTopColor: colors.border }]}><Text style={[styles.resultLabel, { color: colors.mutedForeground }]}>{label}</Text><Text style={[styles.resultValue, { color: primary ? colors.primary : colors.foreground }]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { paddingHorizontal: 20 },
  toolTabs: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  toolTab: { flex: 1, height: 55, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  toolTabText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  calcCard: { borderRadius: 21, borderWidth: 1, padding: 18 },
  calcTitle: { fontFamily: 'Inter_700Bold', fontSize: 19 },
  calcDescription: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 5 },
  calcBody: { marginTop: 17 },
  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 },
  inputLabel: { fontFamily: 'Inter_500Medium', fontSize: 13 },
  numberInput: { width: 145, height: 43, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 11 },
  numberText: { flex: 1, textAlign: 'right', fontFamily: 'Inter_600SemiBold', fontSize: 15, padding: 0 },
  affix: { fontFamily: 'Inter_500Medium', fontSize: 13, marginHorizontal: 3 },
  resultRow: { borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 13, marginTop: 3 },
  resultLabel: { fontFamily: 'Inter_500Medium', fontSize: 13 },
  resultValue: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  tip: { borderRadius: 15, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 15 },
  tipText: { fontFamily: 'Inter_500Medium', fontSize: 11, lineHeight: 17, flex: 1 },
});