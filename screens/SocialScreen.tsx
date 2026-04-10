import React, { useState } from 'react';
import {
View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput,
FlatList, Alert, Share, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CountryFlag from 'react-native-country-flag';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useTheme } from '../lib/ThemeContext';
import { spacing, borderRadius, fontSize } from '../lib/theme';

const COUNTRIES = [
{ code: 'AR', flag: '🇦🇷', name: 'Argentina' },
{ code: 'BO', flag: '🇧🇴', name: 'Bolivia' },
{ code: 'BR', flag: '🇧🇷', name: 'Brasil' },
{ code: 'CL', flag: '🇨🇱', name: 'Chile' },
{ code: 'CO', flag: '🇨🇴', name: 'Colombia' },
{ code: 'CR', flag: '🇨🇷', name: 'Costa Rica' },
{ code: 'CU', flag: '🇨🇺', name: 'Cuba' },
{ code: 'DO', flag: '🇩🇴', name: 'Rep. Dominicana' },
{ code: 'EC', flag: '🇪🇨', name: 'Ecuador' },
{ code: 'SV', flag: '🇸🇻', name: 'El Salvador' },
{ code: 'GT', flag: '🇬🇹', name: 'Guatemala' },
{ code: 'HN', flag: '🇭🇳', name: 'Honduras' },
{ code: 'MX', flag: '🇲🇽', name: 'México' },
{ code: 'NI', flag: '🇳🇮', name: 'Nicaragua' },
{ code: 'PA', flag: '🇵🇦', name: 'Panamá' },
{ code: 'PY', flag: '🇵🇾', name: 'Paraguay' },
{ code: 'PE', flag: '🇵🇪', name: 'Perú' },
{ code: 'PR', flag: '🇵🇷', name: 'Puerto Rico' },
{ code: 'UY', flag: '🇺🇾', name: 'Uruguay' },
{ code: 'VE', flag: '🇻🇪', name: 'Venezuela' },
{ code: 'ES', flag: '🇪🇸', name: 'España' },
{ code: 'US', flag: '🇺🇸', name: 'Estados Unidos' },
];

function getFlagRenderer(code: string | null | undefined, size: number = 20) {
  if (!code || code === '🌍') {
    return <Ionicons name="earth" size={size + 2} color="#88aacc" />;
  }
  return <CountryFlag isoCode={code} size={size} style={{ borderRadius: 4 }} />;
}

export default function SocialScreen() {
const { colors, fs } = useTheme();
const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
const [showCountryPicker, setShowCountryPicker] = useState(false);
const [showAddFriend, setShowAddFriend] = useState(false);
const [friendCodeInput, setFriendCodeInput] = useState('');
const [searching, setSearching] = useState(false);

const globalStats = useQuery(api.games.getGlobalStats, selectedCountry ? { country: selectedCountry } : {});
const myFriendCode = useQuery(api.friends.getMyFriendCode, {});
const friends = useQuery(api.friends.listFriends, {});
const generateCode = useMutation(api.friends.generateFriendCode);
const sendRequest = useMutation(api.friends.sendFriendRequest);
const acceptRequest = useMutation(api.friends.acceptFriendRequest);
const rejectRequest = useMutation(api.friends.rejectFriendRequest);
const removeFriend = useMutation(api.friends.removeFriend);
const searchResult = useQuery(
api.friends.searchByCode,
friendCodeInput.trim().length >= 4 ? { code: friendCodeInput.trim() } : "skip"
);

const handleGenerateCode = async () => {
try {
await generateCode();
} catch {
Alert.alert('Error', 'No se pudo generar el código');
}
};

const handleShareCode = async () => {
if (!myFriendCode) return;
try {
await Share.share({
message: `Agrega me en Carioca Score con mi código de amigo: ${myFriendCode}`,
});
} catch { /* ignore */ }
};

const handleSendRequest = async (friendId: any) => {
try {
await sendRequest({ friendId });
Alert.alert('Listo', 'Solicitud de amistad enviada');
setShowAddFriend(false);
setFriendCodeInput('');
} catch (e: any) {
Alert.alert('Error', e?.message || 'No se pudo enviar la solicitud');
}
};

const handleAccept = async (friendshipId: any) => {
try { await acceptRequest({ friendshipId }); } catch {
Alert.alert('Error', 'No se pudo aceptar');
}
};

const handleReject = async (friendshipId: any) => {
try { await rejectRequest({ friendshipId }); } catch {
Alert.alert('Error', 'No se pudo rechazar');
}
};

const handleRemove = (friendshipId: any, name: string) => {
Alert.alert('Eliminar amigo', `¿Eliminar a ${name} de tu lista?`, [
{ text: 'Cancelar', style: 'cancel' },
{ text: 'Eliminar', style: 'destructive', onPress: () => removeFriend({ friendshipId }) },
]);
};

const pendingIncoming = friends?.filter((f: any) => f.status === 'pending' && f.isIncoming) || [];
const acceptedFriends = friends?.filter((f: any) => f.status === 'accepted') || [];
const pendingSent = friends?.filter((f: any) => f.status === 'pending' && !f.isIncoming) || [];

return (
<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
<View style={[styles.header, { borderBottomColor: colors.border }]}>
<Text style={[styles.title, { color: colors.text, fontSize: fs(fontSize.xxl) }]}>
Home
</Text>
</View>

<ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
{/* My Friend Code */}
<View style={[styles.codeCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
<View style={styles.codeHeader}>
<Ionicons name="qr-code-outline" size={20} color={colors.primary} />
<Text style={[styles.codeLabel, { color: colors.textSecondary, fontSize: fs(fontSize.sm) }]}>
Mi Código de Amigo
</Text>
</View>
{myFriendCode ? (
<View style={styles.codeRow}>
<Text style={[styles.codeValue, { color: colors.primary, fontSize: fs(fontSize.xxxl) }]}>
{myFriendCode}
</Text>
<TouchableOpacity
style={[styles.shareBtn, { backgroundColor: colors.primary + '20' }]}
onPress={handleShareCode}
>
<Ionicons name="share-outline" size={18} color={colors.primary} />
</TouchableOpacity>
</View>
) : (
<TouchableOpacity
style={[styles.generateBtn, { backgroundColor: colors.primary }]}
onPress={handleGenerateCode}
>
<Text style={[styles.generateBtnText, { fontSize: fs(fontSize.md) }]}>
Generar Código
</Text>
</TouchableOpacity>
)}
</View>

{/* Add Friend Button */}
<TouchableOpacity
style={[styles.addFriendBtn, { backgroundColor: colors.primary }]}
onPress={() => setShowAddFriend(true)}
>
<Ionicons name="person-add" size={18} color="#FFF" />
<Text style={[styles.addFriendText, { fontSize: fs(fontSize.md) }]}>
Agregar Amigo por Código
</Text>
</TouchableOpacity>

{/* Pending Requests */}
{pendingIncoming.length > 0 && (
<>
<Text style={[styles.sectionTitle, { color: colors.warning, fontSize: fs(fontSize.lg) }]}>
Solicitudes Pendientes ({pendingIncoming.length})
</Text>
{pendingIncoming.map((f: any) => (
<View key={f.friendshipId} style={[styles.friendCard, { backgroundColor: colors.card, borderColor: colors.warning + '40' }]}>
<View style={styles.friendInfo}>
{getFlagRenderer(f.country, 18)}
<Text style={[styles.friendName, { color: colors.text, fontSize: fs(fontSize.md) }]}>
{f.name}
</Text>
</View>
<View style={styles.friendActions}>
<TouchableOpacity
style={[styles.acceptBtn, { backgroundColor: colors.success }]}
onPress={() => handleAccept(f.friendshipId)}
>
<Ionicons name="checkmark" size={18} color="#FFF" />
</TouchableOpacity>
<TouchableOpacity
style={[styles.rejectBtn, { backgroundColor: colors.danger }]}
onPress={() => handleReject(f.friendshipId)}
>
<Ionicons name="close" size={18} color="#FFF" />
</TouchableOpacity>
</View>
</View>
))}
</>
)}

{/* Friends List */}
<Text style={[styles.sectionTitle, { color: colors.text, fontSize: fs(fontSize.lg), marginTop: spacing.xl }]}>
Amigos ({acceptedFriends.length})
</Text>
{acceptedFriends.length === 0 ? (
<View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
<Ionicons name="people-outline" size={40} color={colors.textMuted} />
<Text style={[styles.emptyText, { color: colors.textSecondary, fontSize: fs(fontSize.md) }]}>
Comparte tu código para agregar amigos
</Text>
</View>
) : (
acceptedFriends.map((f: any) => (
<View key={f.friendshipId} style={[styles.friendCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
<View style={styles.friendInfo}>
{getFlagRenderer(f.country, 18)}
<Text style={[styles.friendName, { color: colors.text, fontSize: fs(fontSize.md) }]}>
{f.name}
</Text>
</View>
<TouchableOpacity onPress={() => handleRemove(f.friendshipId, f.name)}>
<Ionicons name="trash-outline" size={18} color={colors.danger} />
</TouchableOpacity>
</View>
))
)}

{/* Pending Sent */}
{pendingSent.length > 0 && (
<>
<Text style={[styles.sectionTitle, { color: colors.textSecondary, fontSize: fs(fontSize.sm), marginTop: spacing.lg }]}>
Enviadas ({pendingSent.length})
</Text>
{pendingSent.map((f: any) => (
<View key={f.friendshipId} style={[styles.friendCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: 0.7 }]}>
<View style={styles.friendInfo}>
{getFlagRenderer(f.country, 18)}
<Text style={[styles.friendName, { color: colors.text, fontSize: fs(fontSize.md) }]}>
{f.name}
</Text>
</View>
<Text style={[{ color: colors.textMuted, fontSize: fs(fontSize.xs) }]}>Pendiente</Text>
</View>
))}
</>
)}

{/* Global Ranking */}
<View style={[styles.globalHeader, { marginTop: spacing.xxl }]}>
<Text style={[styles.sectionTitle, { color: colors.text, fontSize: fs(fontSize.lg) }]}>
Ranking Mundial
</Text>
<TouchableOpacity
style={[styles.countryBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
onPress={() => setShowCountryPicker(true)}
>
{getFlagRenderer(selectedCountry, 16)}
<Text style={[{ color: colors.primary, fontSize: fs(fontSize.xs), fontWeight: '600' }]}>
{selectedCountry ? COUNTRIES.find(c => c.code === selectedCountry)?.name || selectedCountry : 'Todos'}
</Text>
</TouchableOpacity>
</View>

{(!globalStats || globalStats.length === 0) ? (
<View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
<Ionicons name="globe-outline" size={40} color={colors.textMuted} />
<Text style={[styles.emptyText, { color: colors.textSecondary, fontSize: fs(fontSize.md) }]}>
{selectedCountry ? 'Sin jugadores en este país' : 'Completa partidas para aparecer'}
</Text>
</View>
) : (
globalStats.map((player: any, index: number) => {
const medalColors = [colors.gold, colors.silver, colors.bronze];
return (
<View key={`${player.playerName}-${index}`} style={[styles.rankCard, { backgroundColor: colors.card, borderColor: index === 0 ? colors.gold + '40' : colors.cardBorder }]}>
<View style={[styles.rankBadge, { backgroundColor: (medalColors[index] || colors.textMuted) + '20' }]}>
<Text style={[styles.rankNum, { color: medalColors[index] || colors.textSecondary, fontSize: fs(fontSize.md) }]}>
{index + 1}
</Text>
</View>
{getFlagRenderer(player.country, 20)}
<View style={{ flex: 1 }}>
<Text style={[styles.rankName, { color: colors.text, fontSize: fs(fontSize.md) }]} numberOfLines={1}>
{player.playerName}
</Text>
<Text style={[{ color: colors.textSecondary, fontSize: fs(fontSize.xs) }]}>
Prom: {player.averageScore} pts
</Text>
</View>
<View style={styles.rankRight}>
<Text style={[styles.rankWins, { color: colors.gold, fontSize: fs(fontSize.lg) }]}>
{player.totalWins}
</Text>
<Text style={[{ color: colors.textMuted, fontSize: fs(fontSize.xs) }]}>
{player.totalWins === 1 ? 'victoria' : 'victorias'}
</Text>
</View>
</View>
);
})
)}
</ScrollView>

{/* Add Friend Modal */}
<Modal visible={showAddFriend} animationType="slide" transparent>
<View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
<View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
<View style={styles.modalHeader}>
<Text style={[styles.modalTitle, { color: colors.text, fontSize: fs(fontSize.xl) }]}>
Agregar Amigo
</Text>
<TouchableOpacity onPress={() => { setShowAddFriend(false); setFriendCodeInput(''); }}>
<Ionicons name="close" size={24} color={colors.textSecondary} />
</TouchableOpacity>
</View>

<Text style={[{ color: colors.textSecondary, fontSize: fs(fontSize.sm), marginBottom: spacing.lg }]}>
Ingresa el código de amigo (ej: C65464)
</Text>

<View style={[styles.codeInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
<Ionicons name="search" size={18} color={colors.textMuted} />
<TextInput
style={[styles.codeInputText, { color: colors.text, fontSize: fs(fontSize.lg) }]}
placeholder="C65464"
placeholderTextColor={colors.textMuted}
value={friendCodeInput}
onChangeText={(t) => setFriendCodeInput(t.toUpperCase())}
autoCapitalize="characters"
autoFocus
maxLength={7}
/>
</View>

{searchResult && (
<View style={[styles.searchResult, { backgroundColor: colors.card, borderColor: colors.primary + '40' }]}>
<View style={styles.friendInfo}>
{getFlagRenderer(searchResult.country, 22)}
<Text style={[styles.friendName, { color: colors.text, fontSize: fs(fontSize.lg) }]}>
{searchResult.name}
</Text>
</View>
<TouchableOpacity
style={[styles.sendBtn, { backgroundColor: colors.primary }]}
onPress={() => handleSendRequest(searchResult.userId)}
>
<Ionicons name="person-add" size={16} color="#FFF" />
<Text style={[{ color: '#FFF', fontWeight: '600', fontSize: fs(fontSize.sm) }]}>Agregar</Text>
</TouchableOpacity>
</View>
)}

{friendCodeInput.trim().length >= 4 && !searchResult && (
<Text style={[{ color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg, fontSize: fs(fontSize.sm) }]}>
{friendCodeInput.trim() === myFriendCode 
  ? 'Ese es tu propio código. ¡No puedes agregarte a ti mismo!' 
  : 'No se encontró usuario con ese código'}
</Text>
)}
</View>
</View>
</Modal>

{/* Country Picker Modal */}
<Modal visible={showCountryPicker} animationType="slide" transparent>
<View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
<View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
<View style={styles.modalHeader}>
<Text style={[styles.modalTitle, { color: colors.text, fontSize: fs(fontSize.xl) }]}>
Filtrar por país
</Text>
<TouchableOpacity onPress={() => setShowCountryPicker(false)}>
<Ionicons name="close" size={24} color={colors.textSecondary} />
</TouchableOpacity>
</View>
<TouchableOpacity
style={[styles.countryRow, { borderBottomColor: colors.border }]}
onPress={() => { setSelectedCountry(null); setShowCountryPicker(false); }}
>
{getFlagRenderer(null, 24)}
<Text style={[{ color: colors.text, fontSize: fs(fontSize.md), flex: 1 }]}>Todos los países</Text>
{selectedCountry === null && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
</TouchableOpacity>
<FlatList
data={COUNTRIES}
keyExtractor={(item) => item.code}
renderItem={({ item }) => (
<TouchableOpacity
style={[styles.countryRow, { borderBottomColor: colors.border }]}
onPress={() => { setSelectedCountry(item.code); setShowCountryPicker(false); }}
>
{getFlagRenderer(item.code, 20)}
<Text style={[{ color: colors.text, fontSize: fs(fontSize.md), flex: 1 }]}>{item.name}</Text>
{selectedCountry === item.code && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
</TouchableOpacity>
)}
/>
</View>
</View>
</Modal>
</SafeAreaView>
);
}

const styles = StyleSheet.create({
container: { flex: 1 },
header: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderBottomWidth: 1 },
title: { fontWeight: '800', letterSpacing: -0.5 },
scroll: { padding: spacing.lg, paddingBottom: 40 },
codeCard: {
padding: spacing.lg,
borderRadius: borderRadius.lg,
borderWidth: 1,
marginBottom: spacing.md,
},
codeHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
codeLabel: { fontWeight: '600' },
codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
codeValue: { fontWeight: '900', letterSpacing: 3 },
shareBtn: {
width: 40, height: 40, borderRadius: 20,
justifyContent: 'center', alignItems: 'center',
},
generateBtn: {
paddingVertical: spacing.md,
borderRadius: borderRadius.md,
alignItems: 'center',
},
generateBtnText: { color: '#FFF', fontWeight: '700' },
addFriendBtn: {
flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
paddingVertical: spacing.md, borderRadius: borderRadius.md,
gap: spacing.sm, marginBottom: spacing.xl,
},
addFriendText: { color: '#FFF', fontWeight: '700' },
sectionTitle: { fontWeight: '700', marginBottom: spacing.sm },
emptyCard: {
alignItems: 'center', padding: spacing.xxxl,
borderRadius: borderRadius.lg, borderWidth: 1, gap: spacing.md,
},
emptyText: { textAlign: 'center' },
friendCard: {
flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
padding: spacing.md, borderRadius: borderRadius.sm, borderWidth: 1,
marginBottom: spacing.xs,
},
friendInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing.sm },
friendName: { fontWeight: '600', flex: 1 },
friendActions: { flexDirection: 'row', gap: spacing.sm },
acceptBtn: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
rejectBtn: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
globalHeader: {
flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
marginBottom: spacing.md,
},
countryBtn: {
flexDirection: 'row', alignItems: 'center',
paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
borderRadius: borderRadius.full, borderWidth: 1, gap: spacing.xs,
},
rankCard: {
flexDirection: 'row', alignItems: 'center',
padding: spacing.md, borderRadius: borderRadius.sm, borderWidth: 1,
marginBottom: spacing.xs, gap: spacing.sm,
},
rankBadge: {
width: 30, height: 30, borderRadius: 15,
justifyContent: 'center', alignItems: 'center',
},
rankNum: { fontWeight: '900' },
rankName: { fontWeight: '600' },
rankRight: { alignItems: 'center' },
rankWins: { fontWeight: '800' },
modalOverlay: { flex: 1, justifyContent: 'flex-end' },
modalContent: {
borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl,
padding: spacing.xxl, maxHeight: '70%',
},
modalHeader: {
flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
marginBottom: spacing.lg,
},
modalTitle: { fontWeight: '700' },
codeInput: {
flexDirection: 'row', alignItems: 'center',
borderWidth: 1, borderRadius: borderRadius.md,
paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
gap: spacing.sm,
},
codeInputText: { flex: 1, fontWeight: '700', letterSpacing: 2 },
searchResult: {
flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
padding: spacing.lg, borderRadius: borderRadius.md, borderWidth: 1,
marginTop: spacing.lg,
},
sendBtn: {
flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
borderRadius: borderRadius.sm,
},
countryRow: {
flexDirection: 'row', alignItems: 'center',
paddingVertical: spacing.md, borderBottomWidth: 0.5, gap: spacing.md,
},
});
