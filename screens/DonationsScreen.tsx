import React, { useState } from 'react';
import {
View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/ThemeContext';
import { spacing, borderRadius, fontSize } from '../lib/theme';

// Note: In production, this would use a0-purchases / IAP
// For now, we show a thank-you screen with donation tiers

const donationTiers = [
{ id: 'coffee', icon: 'cafe', label: 'Un café', price: '$1.99', desc: 'Gracias por el apoyo' },
{ id: 'beer', icon: 'beer', label: 'Una cerveza', price: '$4.99', desc: 'Muy generoso' },
{ id: 'pizza', icon: 'pizza', label: 'Una pizza', price: '$9.99', desc: 'Increíble apoyo' },
{ id: 'star', icon: 'star', label: 'Super fan', price: '$19.99', desc: 'Eres lo máximo' },
];

export default function DonationsScreen({ navigation }: any) {
const { colors, fs } = useTheme();
const [selectedTier, setSelectedTier] = useState<string | null>(null);
const [showThanks, setShowThanks] = useState(false);

const handleDonate = (tierId: string) => {
setSelectedTier(tierId);
// In production: await purchase(tierId);
Alert.alert(
'Donación',
'Las donaciones estarán disponibles próximamente en la tienda de aplicaciones. ¡Gracias por tu interés!',
[{ text: 'OK', onPress: () => setShowThanks(true) }]
);
};

if (showThanks) {
return (
<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
<View style={styles.thanksContainer}>
<View style={[styles.thanksIcon, { backgroundColor: colors.gold + '20' }]}>
<Ionicons name="heart" size={48} color={colors.danger} />
</View>
<Text style={[styles.thanksTitle, { color: colors.text, fontSize: fs(fontSize.xxl) }]}>
¡Gracias!
</Text>
<Text style={[styles.thanksText, { color: colors.textSecondary, fontSize: fs(fontSize.md) }]}>
Tu apoyo nos ayuda a seguir mejorando{'\n'}Carioca Score
</Text>
<TouchableOpacity
style={[styles.backButton, { backgroundColor: colors.primary }]}
onPress={() => navigation.goBack()}
>
<Text style={[styles.backButtonText, { fontSize: fs(fontSize.md) }]}>Volver</Text>
</TouchableOpacity>
</View>
</SafeAreaView>
);
}

return (
<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
<View style={[styles.header, { borderBottomColor: colors.border }]}>
<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
<Ionicons name="arrow-back" size={24} color={colors.text} />
</TouchableOpacity>
<Text style={[styles.headerTitle, { color: colors.text, fontSize: fs(fontSize.xl) }]}>
Apoyar Desarrollo
</Text>
<View style={{ width: 40 }} />
</View>

<ScrollView contentContainerStyle={styles.scroll}>
<View style={styles.heroSection}>
<Ionicons name="heart-circle" size={64} color={colors.danger} />
<Text style={[styles.heroTitle, { color: colors.text, fontSize: fs(fontSize.xl) }]}>
¡Apoya Carioca Score!
</Text>
<Text style={[styles.heroText, { color: colors.textSecondary, fontSize: fs(fontSize.md) }]}>
Si disfrutas la app, considera apoyar su desarrollo.{'\n'}Cada aporte nos ayuda a crear nuevas funciones.
</Text>
</View>

{donationTiers.map((tier) => (
<TouchableOpacity
key={tier.id}
style={[styles.tierCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
onPress={() => handleDonate(tier.id)}
activeOpacity={0.7}
>
<View style={[styles.tierIcon, { backgroundColor: colors.primary + '15' }]}>
<Ionicons name={tier.icon as any} size={24} color={colors.primary} />
</View>
<View style={styles.tierInfo}>
<Text style={[styles.tierLabel, { color: colors.text, fontSize: fs(fontSize.md) }]}>{tier.label}</Text>
<Text style={[styles.tierDesc, { color: colors.textSecondary, fontSize: fs(fontSize.xs) }]}>{tier.desc}</Text>
</View>
<Text style={[styles.tierPrice, { color: colors.primary, fontSize: fs(fontSize.lg) }]}>{tier.price}</Text>
</TouchableOpacity>
))}
</ScrollView>
</SafeAreaView>
);
}

const styles = StyleSheet.create({
container: { flex: 1 },
header: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'space-between',
paddingHorizontal: spacing.lg,
paddingVertical: spacing.md,
borderBottomWidth: 1,
},
backBtn: { padding: spacing.xs },
headerTitle: { fontWeight: '700' },
scroll: { padding: spacing.xl, paddingBottom: 40 },
heroSection: {
alignItems: 'center',
marginBottom: spacing.xxl,
paddingTop: spacing.lg,
},
heroTitle: { fontWeight: '700', marginTop: spacing.md },
heroText: { textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 },
tierCard: {
flexDirection: 'row',
alignItems: 'center',
padding: spacing.lg,
borderRadius: borderRadius.lg,
borderWidth: 1,
marginBottom: spacing.sm,
gap: spacing.md,
},
tierIcon: {
width: 44,
height: 44,
borderRadius: 22,
justifyContent: 'center',
alignItems: 'center',
},
tierInfo: { flex: 1 },
tierLabel: { fontWeight: '600' },
tierDesc: {},
tierPrice: { fontWeight: '800' },
thanksContainer: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
padding: spacing.xxxl,
},
thanksIcon: {
width: 96,
height: 96,
borderRadius: 48,
justifyContent: 'center',
alignItems: 'center',
marginBottom: spacing.xl,
},
thanksTitle: { fontWeight: '800', marginBottom: spacing.md },
thanksText: { textAlign: 'center', lineHeight: 22, marginBottom: spacing.xxl },
backButton: {
paddingHorizontal: spacing.xxl,
paddingVertical: spacing.md,
borderRadius: borderRadius.md,
},
backButtonText: { color: '#FFF', fontWeight: '600' },
});
