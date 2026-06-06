import React, { useState } from 'react';
import {
View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
Alert, Platform, Modal, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useTheme } from '../lib/ThemeContext';
import { spacing, borderRadius, fontSize, DEFAULT_ROUNDS } from '../lib/theme';
import { saveLocalGame } from '../lib/offlineStorage';

type PlayerEntry = {
name: string;
linkedUserId?: any;
isLinked: boolean;
};

export default function CreateGameScreen({ navigation }: any) {
const { colors, fs } = useTheme();
const createGame = useMutation(api.games.createGame);
const friends = useQuery(api.friends.listFriends, {});

const [gameName, setGameName] = useState('');
const [playerName, setPlayerName] = useState('');
const [players, setPlayers] = useState<PlayerEntry[]>([]);
const [selectedRounds, setSelectedRounds] = useState<typeof DEFAULT_ROUNDS>(DEFAULT_ROUNDS);
const [useCustom, setUseCustom] = useState(false);
const [customRoundName, setCustomRoundName] = useState('');
const [showFriendsModal, setShowFriendsModal] = useState(false);

const acceptedFriends = (friends || []).filter((f: any) => f.status === 'accepted');

const addLocalPlayer = () => {
const trimmed = playerName.trim();
if (!trimmed) return;
if (players.some((p) => p.name === trimmed)) {
Alert.alert('Error', 'Ya existe un jugador con ese nombre');
return;
}
setPlayers([...players, { name: trimmed, isLinked: false }]);
setPlayerName('');
};

const addFriendAsPlayer = (friend: any) => {
if (players.some((p) => p.linkedUserId === friend.friendUserId)) {
Alert.alert('Ya agregado', `${friend.name} ya está en la partida`);
return;
}
if (players.some((p) => p.name === friend.name)) {
Alert.alert('Error', `Ya existe un jugador con el nombre "${friend.name}"`);
return;
}
setPlayers([...players, {
name: friend.name,
linkedUserId: friend.friendUserId,
isLinked: true,
}]);
setShowFriendsModal(false);
};

const removePlayer = (index: number) => {
setPlayers(players.filter((_, i) => i !== index));
};

const addCustomRound = () => {
const trimmed = customRoundName.trim();
if (!trimmed) return;
setSelectedRounds([...selectedRounds, { id: `custom_${Date.now()}`, name: trimmed, cards: 0 }]);
setCustomRoundName('');
};

const removeRound = (index: number) => {
setSelectedRounds(selectedRounds.filter((_, i) => i !== index));
};

const handleCreate = async () => {
if (!gameName.trim()) {
Alert.alert('Error', 'Ingresa un nombre para la partida');
return;
}
if (players.length < 2) {
Alert.alert('Error', 'Se necesitan al menos 2 jugadores');
return;
}
if (selectedRounds.length === 0) {
Alert.alert('Error', 'Selecciona al menos una ronda');
return;
}

try {
const gameId = await createGame({
name: gameName.trim(),
players: players.map((p) => ({
name: p.name,
linkedUserId: p.linkedUserId,
})),
rounds: selectedRounds.map((r) => ({ id: r.id, name: r.name })),
customRounds: useCustom,
});
navigation.replace('ActiveGame', { gameId });
} catch (e) {
console.log('[CREATE GAME] Error creating game in Convex:', e);
Alert.alert(
  'Modo Sin Conexión',
  'No se pudo conectar con el servidor. ¿Deseas crear la partida localmente en tu dispositivo? Se sincronizará cuando vuelvas a tener señal.',
  [
    { text: 'Cancelar', style: 'cancel' },
    {
      text: 'Crear Local',
      onPress: async () => {
        const localGameId = `local_${Date.now()}`;
        const localGame = {
          _id: localGameId,
          _creationTime: Date.now(),
          name: gameName.trim(),
          status: 'active',
          userId: 'local_user',
          isLocal: true,
          players: players.map((p, i) => ({
            id: `player_${i}_${Date.now()}`,
            name: p.name,
            scores: new Array(selectedRounds.length).fill(0),
            totalScore: 0,
            linkedUserId: p.linkedUserId,
          })),
          rounds: selectedRounds.map((r) => ({ id: r.id, name: r.name, completed: false })),
          currentRoundIndex: 0,
          customRounds: useCustom,
        };
        await saveLocalGame(localGame);
        navigation.replace('ActiveGame', { gameId: localGameId });
      }
    }
  ]
);
}
};

return (
<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
<View style={[styles.header, { borderBottomColor: colors.border }]}>
<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
<Ionicons name="arrow-back" size={24} color={colors.text} />
</TouchableOpacity>
<Text style={[styles.headerTitle, { color: colors.text, fontSize: fs(fontSize.xl) }]}>
Nueva Partida
</Text>
<View style={{ width: 40 }} />
</View>

<ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
{/* Game Name */}
<Text style={[styles.sectionTitle, { color: colors.text, fontSize: fs(fontSize.md) }]}>
Nombre de la partida
</Text>
<TextInput
style={[styles.textInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontSize: fs(fontSize.md) }]}
placeholder="Ej: Carioca del sábado"
placeholderTextColor={colors.textMuted}
value={gameName}
onChangeText={setGameName}
/>

{/* Players */}
<Text style={[styles.sectionTitle, { color: colors.text, fontSize: fs(fontSize.md), marginTop: spacing.xxl }]}>
Jugadores ({players.length})
</Text>

{/* Add local player */}
<View style={styles.addRow}>
<TextInput
style={[styles.textInput, { flex: 1, backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontSize: fs(fontSize.md) }]}
placeholder="Nombre del jugador"
placeholderTextColor={colors.textMuted}
value={playerName}
onChangeText={setPlayerName}
onSubmitEditing={addLocalPlayer}
returnKeyType="done"
/>
<TouchableOpacity
style={[styles.addBtn, { backgroundColor: colors.primary }]}
onPress={addLocalPlayer}
>
<Ionicons name="add" size={24} color="#FFF" />
</TouchableOpacity>
</View>

{/* Invite friends button */}
{acceptedFriends.length > 0 && (
<TouchableOpacity
style={[styles.inviteFriendsBtn, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}
onPress={() => setShowFriendsModal(true)}
>
<Ionicons name="people" size={20} color={colors.primary} />
<Text style={[styles.inviteFriendsText, { color: colors.primary, fontSize: fs(fontSize.md) }]}>
Invitar Amigos ({acceptedFriends.length} disponibles)
</Text>
<Ionicons name="chevron-forward" size={18} color={colors.primary} />
</TouchableOpacity>
)}

{/* Player list */}
{players.map((player, i) => (
<View key={i} style={[styles.playerChip, { backgroundColor: colors.card, borderColor: player.isLinked ? colors.primary + '40' : colors.cardBorder }]}>
<Ionicons
name={player.isLinked ? "person-circle" : "person"}
size={16}
color={player.isLinked ? colors.primary : colors.textSecondary}
/>
<Text style={[styles.playerChipText, { color: colors.text, fontSize: fs(fontSize.md) }]}>{player.name}</Text>
{player.isLinked && (
<View style={[styles.linkedBadge, { backgroundColor: colors.primary + '20' }]}>
<Text style={[{ color: colors.primary, fontSize: fs(fontSize.xs), fontWeight: '600' }]}>Vinculado</Text>
</View>
)}
<TouchableOpacity onPress={() => removePlayer(i)}>
<Ionicons name="close-circle" size={20} color={colors.danger} />
</TouchableOpacity>
</View>
))}

{/* Rounds */}
<View style={[styles.roundsHeader, { marginTop: spacing.xxl }]}>
<Text style={[styles.sectionTitle, { color: colors.text, fontSize: fs(fontSize.md) }]}>
Rondas ({selectedRounds.length})
</Text>
<TouchableOpacity onPress={() => {
if (useCustom) {
setSelectedRounds(DEFAULT_ROUNDS);
}
setUseCustom(!useCustom);
}}>
<Text style={[styles.toggleText, { color: colors.primary, fontSize: fs(fontSize.sm) }]}>
{useCustom ? 'Usar predefinidas' : 'Personalizar'}
</Text>
</TouchableOpacity>
</View>

{useCustom && (
<View style={styles.addRow}>
<TextInput
style={[styles.textInput, { flex: 1, backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontSize: fs(fontSize.md) }]}
placeholder="Nombre de la ronda"
placeholderTextColor={colors.textMuted}
value={customRoundName}
onChangeText={setCustomRoundName}
onSubmitEditing={addCustomRound}
returnKeyType="done"
/>
<TouchableOpacity
style={[styles.addBtn, { backgroundColor: colors.primary }]}
onPress={addCustomRound}
>
<Ionicons name="add" size={24} color="#FFF" />
</TouchableOpacity>
</View>
)}

{selectedRounds.map((round, i) => (
<View key={round.id} style={[styles.roundItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
<View style={[styles.roundNumber, { backgroundColor: colors.primary + '20' }]}>
<Text style={[styles.roundNumberText, { color: colors.primary, fontSize: fs(fontSize.sm) }]}>{i + 1}</Text>
</View>
<Text style={[styles.roundName, { color: colors.text, fontSize: fs(fontSize.md) }]} numberOfLines={1}>
{round.name}
</Text>
{useCustom && (
<TouchableOpacity onPress={() => removeRound(i)}>
<Ionicons name="close-circle" size={20} color={colors.danger} />
</TouchableOpacity>
)}
</View>
))}

{/* Create Button */}
<TouchableOpacity
style={[styles.createButton, { backgroundColor: colors.primary, opacity: players.length >= 2 ? 1 : 0.5 }]}
onPress={handleCreate}
disabled={players.length < 2}
>
<Ionicons name="play" size={22} color="#FFF" />
<Text style={[styles.createButtonText, { fontSize: fs(fontSize.lg) }]}>Crear Partida</Text>
</TouchableOpacity>
</ScrollView>

{/* Friends Selection Modal */}
<Modal visible={showFriendsModal} animationType="slide" transparent>
<View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
<View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
<View style={styles.modalHeader}>
<Text style={[styles.modalTitle, { color: colors.text, fontSize: fs(fontSize.xl) }]}>
Invitar Amigos
</Text>
<TouchableOpacity onPress={() => setShowFriendsModal(false)}>
<Ionicons name="close" size={24} color={colors.textSecondary} />
</TouchableOpacity>
</View>
<Text style={[{ color: colors.textSecondary, fontSize: fs(fontSize.sm), marginBottom: spacing.md }]}>
Selecciona amigos para agregar a la partida. Sus puntajes se guardarán en su cuenta.
</Text>

{acceptedFriends.length === 0 ? (
<View style={{ alignItems: 'center', padding: spacing.xxl }}>
<Ionicons name="people-outline" size={48} color={colors.textMuted} />
<Text style={[{ color: colors.textSecondary, fontSize: fs(fontSize.md), marginTop: spacing.md, textAlign: 'center' }]}>
No tienes amigos agregados.{'\n'}Agrega amigos desde Home con su código.
</Text>
</View>
) : (
<FlatList
data={acceptedFriends}
keyExtractor={(item: any) => item.friendshipId}
renderItem={({ item }: any) => {
const alreadyAdded = players.some((p) => p.linkedUserId === item.friendUserId);
return (
<TouchableOpacity
style={[styles.friendRow, {
backgroundColor: alreadyAdded ? colors.success + '10' : colors.card,
borderColor: alreadyAdded ? colors.success + '30' : colors.cardBorder,
}]}
onPress={() => !alreadyAdded && addFriendAsPlayer(item)}
disabled={alreadyAdded}
>
<Ionicons name="person-circle" size={32} color={alreadyAdded ? colors.success : colors.primary} />
<View style={{ flex: 1 }}>
<Text style={[{ color: colors.text, fontSize: fs(fontSize.md), fontWeight: '600' }]}>
{item.name}
</Text>
{item.country ? (
<Text style={[{ color: colors.textSecondary, fontSize: fs(fontSize.xs) }]}>
{item.country}
</Text>
) : null}
</View>
{alreadyAdded ? (
<Ionicons name="checkmark-circle" size={24} color={colors.success} />
) : (
<Ionicons name="add-circle" size={24} color={colors.primary} />
)}
</TouchableOpacity>
);
}}
/>
)}
</View>
</View>
</Modal>
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
scroll: { padding: spacing.xl, paddingBottom: 100 },
sectionTitle: { fontWeight: '700', marginBottom: spacing.sm },
textInput: {
borderWidth: 1,
borderRadius: borderRadius.md,
paddingHorizontal: spacing.lg,
paddingVertical: Platform.OS === 'ios' ? spacing.md + 2 : spacing.sm,
},
addRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
addBtn: {
width: 48,
height: 48,
borderRadius: borderRadius.md,
justifyContent: 'center',
alignItems: 'center',
},
inviteFriendsBtn: {
flexDirection: 'row',
alignItems: 'center',
padding: spacing.md,
borderRadius: borderRadius.md,
borderWidth: 1,
marginBottom: spacing.sm,
gap: spacing.sm,
},
inviteFriendsText: { flex: 1, fontWeight: '600' },
playerChip: {
flexDirection: 'row',
alignItems: 'center',
padding: spacing.md,
borderRadius: borderRadius.sm,
borderWidth: 1,
marginBottom: spacing.xs,
gap: spacing.sm,
},
playerChipText: { flex: 1, fontWeight: '500' },
linkedBadge: {
paddingHorizontal: spacing.sm,
paddingVertical: 2,
borderRadius: borderRadius.full,
},
roundsHeader: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
},
toggleText: { fontWeight: '600' },
roundItem: {
flexDirection: 'row',
alignItems: 'center',
padding: spacing.md,
borderRadius: borderRadius.sm,
borderWidth: 1,
marginBottom: spacing.xs,
gap: spacing.sm,
},
roundNumber: {
width: 28,
height: 28,
borderRadius: 14,
justifyContent: 'center',
alignItems: 'center',
},
roundNumberText: { fontWeight: '700' },
roundName: { flex: 1, fontWeight: '500' },
createButton: {
flexDirection: 'row',
justifyContent: 'center',
alignItems: 'center',
paddingVertical: spacing.lg,
borderRadius: borderRadius.md,
marginTop: spacing.xxl,
gap: spacing.sm,
},
createButtonText: { color: '#FFF', fontWeight: '700' },
modalOverlay: {
flex: 1,
justifyContent: 'flex-end',
},
modalContent: {
borderTopLeftRadius: borderRadius.xl,
borderTopRightRadius: borderRadius.xl,
padding: spacing.xxl,
maxHeight: '70%',
},
modalHeader: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: spacing.sm,
},
modalTitle: { fontWeight: '700' },
friendRow: {
flexDirection: 'row',
alignItems: 'center',
padding: spacing.md,
borderRadius: borderRadius.md,
borderWidth: 1,
marginBottom: spacing.xs,
gap: spacing.sm,
},
});
