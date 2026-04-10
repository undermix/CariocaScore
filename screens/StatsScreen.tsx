import React from 'react';
import {
View, Text, StyleSheet, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useTheme } from '../lib/ThemeContext';
import { spacing, borderRadius, fontSize } from '../lib/theme';

export default function StatsScreen() {
const { colors, fs } = useTheme();
const stats = useQuery(api.games.getStats, {});

if (!stats) {
return (
<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
<Text style={[styles.loading, { color: colors.textSecondary }]}>Cargando...</Text>
</SafeAreaView>
);
}

const maxWins = Math.max(...stats.playerStats.map((p: any) => p.wins), 1);
const totalRoundsPlayed = stats.playerStats.reduce((sum: number, p: any) => sum + p.gamesPlayed, 0);

return (
<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
<View style={[styles.header, { borderBottomColor: colors.border }]}>
<Text style={[styles.title, { color: colors.text, fontSize: fs(fontSize.xxl) }]}>
  Mi Dashboard
</Text>
</View>

<ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
{/* Summary Cards */}
<View style={styles.summaryRow}>
<View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
<Ionicons name="game-controller" size={24} color={colors.primary} />
<Text style={[styles.summaryValue, { color: colors.text, fontSize: fs(fontSize.xxl) }]}>
{stats.totalGames}
</Text>
<Text style={[styles.summaryLabel, { color: colors.textSecondary, fontSize: fs(fontSize.xs) }]}>
Total
</Text>
</View>
<View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
<Ionicons name="checkmark-circle" size={24} color={colors.success} />
<Text style={[styles.summaryValue, { color: colors.text, fontSize: fs(fontSize.xxl) }]}>
{stats.completedGames}
</Text>
<Text style={[styles.summaryLabel, { color: colors.textSecondary, fontSize: fs(fontSize.xs) }]}>
Completadas
</Text>
</View>
<View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
<Ionicons name="play-circle" size={24} color={colors.warning} />
<Text style={[styles.summaryValue, { color: colors.text, fontSize: fs(fontSize.xxl) }]}>
{stats.activeGames}
</Text>
<Text style={[styles.summaryLabel, { color: colors.textSecondary, fontSize: fs(fontSize.xs) }]}>
Activas
</Text>
</View>
</View>

{/* Best Player Highlight */}
{stats.playerStats.length > 0 && (
<View style={[styles.highlightCard, { backgroundColor: colors.gold + '15', borderColor: colors.gold + '30' }]}>
<Ionicons name="trophy" size={28} color={colors.gold} />
<View style={{ flex: 1 }}>
  <Text style={[{ color: colors.textSecondary, fontSize: fs(fontSize.xs), fontWeight: '600' }]}>
    Mejor Jugador
  </Text>
  <Text style={[{ color: colors.text, fontSize: fs(fontSize.xl), fontWeight: '800' }]}>
    {stats.playerStats[0].name}
  </Text>
  <Text style={[{ color: colors.textSecondary, fontSize: fs(fontSize.sm) }]}>
    {stats.playerStats[0].wins} victorias · Prom: {stats.playerStats[0].averageScore} pts
  </Text>
</View>
</View>
)}

{/* Player Rankings */}
<Text style={[styles.sectionTitle, { color: colors.text, fontSize: fs(fontSize.lg), marginTop: spacing.xl }]}>
Ranking de Jugadores
</Text>

{stats.playerStats.length === 0 ? (
<View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
<Ionicons name="bar-chart-outline" size={40} color={colors.textMuted} />
<Text style={[styles.emptyText, { color: colors.textSecondary, fontSize: fs(fontSize.md) }]}>
Completa partidas para ver estadísticas
</Text>
</View>
) : (
stats.playerStats.map((player: any, index: number) => (
<View key={player.name} style={[styles.playerCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
<View style={styles.playerHeader}>
<View style={styles.playerLeft}>
{index === 0 ? (
<Ionicons name="trophy" size={20} color={colors.gold} />
) : index === 1 ? (
<Ionicons name="medal" size={20} color={colors.silver} />
) : index === 2 ? (
<Ionicons name="medal" size={20} color={colors.bronze} />
) : (
<View style={[styles.rankCircle, { backgroundColor: colors.surfaceHighlight }]}>
<Text style={[{ color: colors.textSecondary, fontSize: fs(fontSize.xs), fontWeight: '700' }]}>
{index + 1}
</Text>
</View>
)}
<Text style={[styles.playerName, { color: colors.text, fontSize: fs(fontSize.md) }]}>
{player.name}
</Text>
</View>
<Text style={[styles.winsText, { color: colors.gold, fontSize: fs(fontSize.lg) }]}>
{player.wins}V
</Text>
</View>

{/* Visual bar */}
<View style={[styles.barBg, { backgroundColor: colors.surfaceHighlight }]}>
<View style={[styles.barFill, {
backgroundColor: index === 0 ? colors.gold : index === 1 ? colors.silver : colors.primary,
width: `${(player.wins / maxWins) * 100}%`,
}]} />
</View>

<View style={styles.playerMeta}>
<Text style={[styles.metaItem, { color: colors.textSecondary, fontSize: fs(fontSize.xs) }]}>
Partidas: {player.gamesPlayed}
</Text>
<Text style={[styles.metaItem, { color: colors.textSecondary, fontSize: fs(fontSize.xs) }]}>
Promedio: {player.averageScore}
</Text>
<Text style={[styles.metaItem, { color: colors.textSecondary, fontSize: fs(fontSize.xs) }]}>
Mejor: {player.bestScore}
</Text>
</View>
</View>
))
)}
</ScrollView>
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
scroll: { padding: spacing.lg, paddingBottom: 40 },
loading: { padding: spacing.xxl, textAlign: 'center' },
summaryRow: {
flexDirection: 'row',
gap: spacing.sm,
marginBottom: spacing.lg,
},
summaryCard: {
flex: 1,
alignItems: 'center',
padding: spacing.lg,
borderRadius: borderRadius.lg,
borderWidth: 1,
gap: spacing.xs,
},
summaryValue: { fontWeight: '800' },
summaryLabel: { fontWeight: '500' },
highlightCard: {
flexDirection: 'row',
alignItems: 'center',
padding: spacing.lg,
borderRadius: borderRadius.lg,
borderWidth: 1,
gap: spacing.md,
marginBottom: spacing.md,
},
sectionTitle: { fontWeight: '700', marginBottom: spacing.sm },
emptyCard: {
alignItems: 'center',
padding: spacing.xxxl,
borderRadius: borderRadius.lg,
borderWidth: 1,
gap: spacing.md,
},
emptyText: { textAlign: 'center' },
playerCard: {
padding: spacing.lg,
borderRadius: borderRadius.lg,
borderWidth: 1,
marginBottom: spacing.sm,
},
playerHeader: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'space-between',
marginBottom: spacing.sm,
},
playerLeft: {
flexDirection: 'row',
alignItems: 'center',
gap: spacing.sm,
},
playerName: { fontWeight: '600' },
winsText: { fontWeight: '800' },
rankCircle: {
width: 24,
height: 24,
borderRadius: 12,
justifyContent: 'center',
alignItems: 'center',
},
barBg: {
height: 6,
borderRadius: 3,
overflow: 'hidden',
marginBottom: spacing.sm,
},
barFill: {
height: '100%',
borderRadius: 3,
minWidth: 4,
},
playerMeta: {
flexDirection: 'row',
gap: spacing.lg,
},
metaItem: { fontWeight: '500' },
});