import React from 'react';
import {
View, Text, TouchableOpacity, StyleSheet, FlatList, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useTheme } from '../lib/ThemeContext';
import { spacing, borderRadius, fontSize } from '../lib/theme';

export default function HomeScreen({ navigation }: any) {
const { colors, fs } = useTheme();
const games = useQuery(api.games.listGames, {});
const deleteGame = useMutation(api.games.deleteGame);

const activeGames = games?.filter((g: any) => g.status === 'active') || [];
const completedGames = games?.filter((g: any) => g.status === 'completed') || [];

const handleDelete = (gameId: any, name: string) => {
Alert.alert(
'Eliminar partida',
`¿Estás seguro de eliminar "${name}"?`,
[
{ text: 'Cancelar', style: 'cancel' },
{
text: 'Eliminar',
style: 'destructive',
onPress: () => deleteGame({ gameId }),
},
]
);
};

const renderGame = ({ item }: any) => {
const isActive = item.status === 'active';
const isOwner = item.isOwner !== false;
const completedRounds = item.rounds.filter((r: any) => r.completed).length;
const totalRounds = item.rounds.length;
const leader = item.players.length > 0
? [...item.players].sort((a: any, b: any) => a.totalScore - b.totalScore)[0]
: null;

return (
<TouchableOpacity
style={[styles.gameCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
onPress={() => navigation.navigate('ActiveGame', { gameId: item._id })}
activeOpacity={0.7}
>
<View style={styles.gameHeader}>
<View style={styles.gameInfo}>
<View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
<Text style={[styles.gameName, { color: colors.text, fontSize: fs(fontSize.lg) }]} numberOfLines={1}>
{item.name}
</Text>
{!isOwner && (
  <View style={[styles.invitedBadge, { backgroundColor: colors.primary + '20' }]}>
    <Ionicons name="people" size={10} color={colors.primary} />
    <Text style={{ color: colors.primary, fontSize: fs(fontSize.xs - 2), fontWeight: '600' }}>Invitado</Text>
  </View>
)}
</View>
<Text style={[styles.gameMeta, { color: colors.textSecondary, fontSize: fs(fontSize.sm) }]}>
{item.players.length} jugadores · {completedRounds}/{totalRounds} rondas
</Text>
</View>
<View style={[
styles.statusBadge,
{ backgroundColor: isActive ? colors.success + '20' : colors.primary + '20' }
]}>
<View style={[
styles.statusDot,
{ backgroundColor: isActive ? colors.success : colors.primary }
]} />
<Text style={[
styles.statusText,
{ color: isActive ? colors.success : colors.primary, fontSize: fs(fontSize.xs) }
]}>
{isActive ? 'En curso' : 'Finalizada'}
</Text>
</View>
</View>

{leader && (
<View style={[styles.leaderRow, { borderTopColor: colors.border }]}>
<Ionicons name="trophy" size={14} color={colors.gold} />
<Text style={[styles.leaderText, { color: colors.textSecondary, fontSize: fs(fontSize.sm) }]}>
{leader.name}: {leader.totalScore} pts
</Text>
</View>
)}

{/* Progress bar */}
<View style={[styles.progressBar, { backgroundColor: colors.surfaceHighlight }]}>
<View style={[
styles.progressFill,
{
backgroundColor: isActive ? colors.success : colors.primary,
width: `${(completedRounds / Math.max(totalRounds, 1)) * 100}%`,
}
]} />
</View>

<View style={styles.gameActions}>
<TouchableOpacity
style={[styles.actionBtn, { backgroundColor: colors.surfaceHighlight }]}
onPress={() => navigation.navigate('ActiveGame', { gameId: item._id })}
>
<Ionicons name={isActive ? 'play' : 'eye'} size={16} color={colors.primary} />
<Text style={[styles.actionText, { color: colors.primary, fontSize: fs(fontSize.xs) }]}>
{isActive ? 'Continuar' : 'Ver'}
</Text>
</TouchableOpacity>
{isOwner && (
<TouchableOpacity
style={[styles.actionBtn, { backgroundColor: colors.danger + '15' }]}
onPress={() => handleDelete(item._id, item.name)}
>
<Ionicons name="trash-outline" size={16} color={colors.danger} />
</TouchableOpacity>
)}
</View>
</TouchableOpacity>
);
};

const allGames = [...activeGames, ...completedGames];

return (
<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
<View style={[styles.header, { borderBottomColor: colors.border }]}>
<View>
<Text style={[styles.title, { color: colors.text, fontSize: fs(fontSize.xxl) }]}>
Carioca Score
</Text>
<Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: fs(fontSize.sm) }]}>
{activeGames.length > 0
? `${activeGames.length} partida${activeGames.length > 1 ? 's' : ''} en curso`
: 'Sin partidas activas'}
</Text>
</View>
</View>

{allGames.length === 0 ? (
<View style={styles.emptyState}>
<View style={[styles.emptyIcon, { backgroundColor: colors.primary + '15' }]}>
<Ionicons name="card-outline" size={48} color={colors.primary} />
</View>
<Text style={[styles.emptyTitle, { color: colors.text, fontSize: fs(fontSize.xl) }]}>
¡Bienvenido!
</Text>
<Text style={[styles.emptyText, { color: colors.textSecondary, fontSize: fs(fontSize.md) }]}>
Crea tu primera partida de Carioca{'\n'}y comienza a llevar el puntaje
</Text>
<TouchableOpacity
style={[styles.createBtn, { backgroundColor: colors.primary }]}
onPress={() => navigation.navigate('CreateGame')}
>
<Ionicons name="add" size={22} color="#FFF" />
<Text style={[styles.createBtnText, { fontSize: fs(fontSize.lg) }]}>Nueva Partida</Text>
</TouchableOpacity>
</View>
) : (
<FlatList
data={allGames}
keyExtractor={(item: any) => item._id}
renderItem={renderGame}
contentContainerStyle={styles.list}
showsVerticalScrollIndicator={false}
/>
)}

{allGames.length > 0 && (
<TouchableOpacity
style={[styles.fab, { backgroundColor: colors.primary }]}
onPress={() => navigation.navigate('CreateGame')}
>
<Ionicons name="add" size={28} color="#FFF" />
</TouchableOpacity>
)}
</SafeAreaView>
);
}

const styles = StyleSheet.create({
container: { flex: 1 },
header: {
paddingHorizontal: spacing.xl,
paddingVertical: spacing.lg,
borderBottomWidth: 1,
},
title: { fontWeight: '800', letterSpacing: -0.5 },
subtitle: { marginTop: 2 },
list: { padding: spacing.lg, paddingBottom: 100 },
gameCard: {
borderRadius: borderRadius.lg,
padding: spacing.lg,
marginBottom: spacing.md,
borderWidth: 1,
},
gameHeader: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'flex-start',
},
gameInfo: { flex: 1, marginRight: spacing.sm },
gameName: { fontWeight: '700' },
gameMeta: { marginTop: 2 },
statusBadge: {
flexDirection: 'row',
alignItems: 'center',
paddingHorizontal: spacing.sm,
paddingVertical: spacing.xs,
borderRadius: borderRadius.full,
gap: 4,
},
statusDot: {
width: 6,
height: 6,
borderRadius: 3,
},
statusText: { fontWeight: '600' },
leaderRow: {
flexDirection: 'row',
alignItems: 'center',
marginTop: spacing.sm,
paddingTop: spacing.sm,
borderTopWidth: 1,
gap: 6,
},
leaderText: { fontWeight: '500' },
progressBar: {
height: 4,
borderRadius: 2,
marginTop: spacing.sm,
overflow: 'hidden',
},
progressFill: {
height: '100%',
borderRadius: 2,
},
gameActions: {
flexDirection: 'row',
gap: spacing.sm,
marginTop: spacing.md,
},
actionBtn: {
flexDirection: 'row',
alignItems: 'center',
paddingHorizontal: spacing.md,
paddingVertical: spacing.sm,
borderRadius: borderRadius.sm,
gap: 4,
},
actionText: { fontWeight: '600' },
emptyState: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
paddingHorizontal: spacing.xxxl,
},
emptyIcon: {
width: 96,
height: 96,
borderRadius: 48,
justifyContent: 'center',
alignItems: 'center',
marginBottom: spacing.xl,
},
emptyTitle: { fontWeight: '700', marginBottom: spacing.sm },
emptyText: { textAlign: 'center', lineHeight: 22, marginBottom: spacing.xxl },
createBtn: {
flexDirection: 'row',
alignItems: 'center',
paddingHorizontal: spacing.xxl,
paddingVertical: spacing.lg,
borderRadius: borderRadius.md,
gap: spacing.sm,
},
createBtnText: { color: '#FFF', fontWeight: '700' },
fab: {
position: 'absolute',
bottom: 24,
right: 20,
width: 56,
height: 56,
borderRadius: 28,
justifyContent: 'center',
alignItems: 'center',
elevation: 8,
shadowColor: '#000',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.3,
shadowRadius: 8,
},
invitedBadge: {
flexDirection: 'row',
alignItems: 'center',
gap: 4,
},
});