import React, { useState, useEffect, useRef } from 'react';
import {
View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert,
TextInput, Modal, Platform, Keyboard, TouchableWithoutFeedback,
Animated, Dimensions, KeyboardAvoidingView, LayoutAnimation, UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useTheme } from '../lib/ThemeContext';
import { spacing, borderRadius, fontSize, DEFAULT_ROUNDS } from '../lib/theme';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CONFETTI_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
const NUM_CONFETTI = 50;

function ConfettiPiece({ delay, color, startX }: { delay: number; color: string; startX: number }) {
  const translateY = useRef(new Animated.Value(-20)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const xDrift = (Math.random() - 0.5) * 200;
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT + 50,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: xDrift,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: Math.random() * 10,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 10],
    outputRange: ['0deg', '3600deg'],
  });

  const size = 6 + Math.random() * 10;
  const isCircle = Math.random() > 0.5;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: -20,
        left: startX,
        width: size,
        height: isCircle ? size : size * 2.5,
        backgroundColor: color,
        borderRadius: isCircle ? size / 2 : 2,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate: spin }],
      }}
    />
  );
}

function ConfettiOverlay({ winnerName, colors: themeColors, fs, onDismiss }: { winnerName: string; colors: any; fs: any; onDismiss: () => void }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(onDismiss, 6000);
    return () => clearTimeout(timer);
  }, []);

  const confettiPieces = Array.from({ length: NUM_CONFETTI }, (_, i) => ({
    id: i,
    delay: Math.random() * 1500,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    startX: Math.random() * SCREEN_WIDTH,
  }));

  return (
    <TouchableWithoutFeedback onPress={onDismiss}>
      <View style={confettiStyles.overlay}>
        {confettiPieces.map((p) => (
          <ConfettiPiece key={p.id} delay={p.delay} color={p.color} startX={p.startX} />
        ))}
        <Animated.View style={[confettiStyles.banner, { 
          opacity: opacityAnim, 
          transform: [{ scale: scaleAnim }],
          backgroundColor: themeColors.card,
          borderColor: themeColors.gold + '60',
        }]}>
          <Text style={{ fontSize: 48 }}>🏆</Text>
          <Text style={[confettiStyles.congratsText, { color: themeColors.gold }]}>
            ¡Felicidades!
          </Text>
          <Text style={[confettiStyles.winnerText, { color: themeColors.text, fontSize: fs(fontSize.xxl) }]}>
            {winnerName}
          </Text>
          <Text style={[confettiStyles.subtitleText, { color: themeColors.textSecondary, fontSize: fs(fontSize.md) }]}>
            ha ganado la partida
          </Text>
          <Text style={[confettiStyles.tapText, { color: themeColors.textMuted, fontSize: fs(fontSize.xs) }]}>
            Toca para cerrar
          </Text>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const confettiStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  banner: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 32,
    borderRadius: 20,
    borderWidth: 2,
    gap: 8,
    zIndex: 1000,
  },
  congratsText: {
    fontWeight: '800',
    fontSize: 24,
    letterSpacing: 1,
  },
  winnerText: {
    fontWeight: '800',
  },
  subtitleText: {
    marginTop: 4,
  },
  tapText: {
    marginTop: 12,
  },
});

export default function ActiveGameScreen({ route, navigation }: any) {
const { gameId } = route.params;
const { colors, fs } = useTheme();
const game = useQuery(api.games.getGame, { gameId });
const updateScores = useMutation(api.games.updateScores);
const addPlayerMut = useMutation(api.games.addPlayer);
const removePlayerMut = useMutation(api.games.removePlayer);
const editPlayerMut = useMutation(api.games.editPlayerName);

const [showScoreModal, setShowScoreModal] = useState(false);
const [editingRoundIndex, setEditingRoundIndex] = useState(-1);
const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({});
const [showAddPlayer, setShowAddPlayer] = useState(false);
const [newPlayerName, setNewPlayerName] = useState('');
const [showConfetti, setShowConfetti] = useState(false);
const [prevStatus, setPrevStatus] = useState<string | null>(null);
const viewShotRef = useRef<View>(null);

const shareScore = async () => {
try {
  const uri = await captureRef(viewShotRef, {
    format: 'png',
    quality: 0.9,
  });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: '¡Mi victoria en Carioca!',
    });
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } else {
    Alert.alert('No soportado', 'La función de compartir no está disponible en este dispositivo.');
  }
} catch (error) {
  Alert.alert('Error', 'No se pudo generar la imagen para compartir.');
}
};

useKeepAwake();

useEffect(() => {
  if (game) {
    if (prevStatus === 'active' && game.status === 'completed') {
      setShowConfetti(true);
    }
    setPrevStatus(game.status);
  }
}, [game?.status]);

if (!game) {
return (
<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
<View style={styles.loadingContainer}>
<Text style={[{ color: colors.textSecondary, fontSize: fs(fontSize.md) }]}>Cargando partida...</Text>
</View>
</SafeAreaView>
);
}

const sortedPlayers = [...game.players].sort((a, b) => a.totalScore - b.totalScore);
const isCompleted = game.status === 'completed';
const isOwner = game.isOwner !== false;

const dealerIndex = game.currentRoundIndex % game.players.length;
const dealerName = game.players[dealerIndex]?.name;
const currentRoundObj = game.rounds[game.currentRoundIndex];
const defaultRoundInfo = DEFAULT_ROUNDS.find((r) => r.name === currentRoundObj?.name);
const numberOfCards = defaultRoundInfo ? defaultRoundInfo.cards : null;

const openScoreEntry = (roundIndex: number) => {
const inputs: Record<string, string> = {};
game.players.forEach((p) => {
inputs[p.id] = p.scores[roundIndex] !== 0 ? p.scores[roundIndex].toString() : '';
});
setScoreInputs(inputs);
setEditingRoundIndex(roundIndex);
setShowScoreModal(true);
};

const saveScores = async () => {
const scores = game.players.map((p) => ({
playerId: p.id,
score: parseInt(scoreInputs[p.id] || '0', 10) || 0,
}));
try {
LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
await updateScores({ gameId, roundIndex: editingRoundIndex, scores });
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
setShowScoreModal(false);
} catch (e) {
Alert.alert('Error', 'No se pudieron guardar los puntajes');
}
};

const handleAddPlayer = async () => {
const trimmed = newPlayerName.trim();
if (!trimmed) return;
try {
await addPlayerMut({ gameId, playerName: trimmed });
setNewPlayerName('');
setShowAddPlayer(false);
} catch (e) {
Alert.alert('Error', 'No se pudo agregar el jugador');
}
};

const handleRemovePlayer = (playerId: string, name: string) => {
Alert.alert('Eliminar jugador', `¿Eliminar a ${name}?`, [
{ text: 'Cancelar', style: 'cancel' },
{ text: 'Eliminar', style: 'destructive', onPress: () => removePlayerMut({ gameId, playerId }) },
]);
};

const getMedalIcon = (index: number) => {
    if (index === 0) return { name: 'trophy', color: '#FFD700' };
    if (index === 1) return { name: 'medal', color: '#C0C0C0' };
    if (index === 2) return { name: 'medal', color: '#CD7F32' };
    return { name: 'close-circle', color: colors.danger };
  };

return (
<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
{/* Header */}
<View style={[styles.header, { borderBottomColor: colors.border }]}>
<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
<Ionicons name="arrow-back" size={24} color={colors.text} />
</TouchableOpacity>
<View style={styles.headerCenter}>
<Text style={[styles.headerTitle, { color: colors.text, fontSize: fs(fontSize.lg) }]} numberOfLines={1}>
{game.name}
</Text>
{isCompleted ? (
<Text style={[styles.headerSub, { color: colors.success, fontSize: fs(fontSize.xs) }]}>Finalizada</Text>
) : (
<Text style={[styles.headerSub, { color: colors.textSecondary, fontSize: fs(fontSize.xs) }]}>
Ronda {game.currentRoundIndex + 1} de {game.rounds.length}
</Text>
)}
</View>
{!isCompleted && isOwner && (
<TouchableOpacity onPress={() => setShowAddPlayer(true)} style={styles.backBtn}>
<Ionicons name="person-add-outline" size={22} color={colors.primary} />
</TouchableOpacity>
)}
</View>

<ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
{/* Winner banner */}
{isCompleted && sortedPlayers.length > 0 && (
<View style={{ marginBottom: spacing.lg }}>
<View ref={viewShotRef} collapsable={false} style={[styles.winnerCard, { backgroundColor: colors.card, borderColor: colors.gold, borderWidth: 2 }]}>
<View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md}}>
<Ionicons name="trophy" size={36} color={colors.gold} />
</View>
<Text style={[styles.winnerCardTitle, { color: colors.text, fontSize: fs(fontSize.xl) }]}>¡Victoria en Carioca!</Text>
<Text style={[styles.winnerCardSubtitle, { color: colors.textSecondary, fontSize: fs(fontSize.sm), marginBottom: spacing.lg }]}>{game.name}</Text>
<View style={[styles.winnerRankingContainer, { backgroundColor: colors.border }]}>
{sortedPlayers.slice(0, 3).map((player, idx) => (
<View key={player.id} style={styles.winnerRankingRow}>
<Text style={[styles.winnerRankingName, { color: idx === 0 ? colors.gold : colors.text, fontSize: fs(idx === 0 ? fontSize.lg : fontSize.md) }]}>
{idx + 1}. {player.name}
</Text>
<Text style={[styles.winnerRankingScore, { color: idx === 0 ? colors.gold : colors.textSecondary, fontSize: fs(idx === 0 ? fontSize.lg : fontSize.md) }]}>
{player.totalScore} pts
</Text>
</View>
))}
</View>
</View>
<TouchableOpacity style={[styles.shareBtn, { backgroundColor: '#E1306C' }]} onPress={shareScore}>
<Ionicons name="logo-instagram" size={20} color="#FFF" />
<Text style={styles.shareBtnText}>Compartir Resultado</Text>
</TouchableOpacity>
</View>
)}

{/* Current Round */}
{!isCompleted && (
<View style={[styles.currentRound, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
<View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: spacing.xs }}>
<Text style={[styles.currentRoundLabel, { color: colors.primary, fontSize: fs(fontSize.xs) }]}>OBJETIVO DE LA RONDA</Text>
{numberOfCards && (
<Text style={[styles.currentRoundLabel, { color: colors.accent, fontSize: fs(fontSize.xs) }]}>{numberOfCards} CARTAS</Text>
)}
</View>

<Text style={[styles.currentRoundName, { color: colors.text, fontSize: fs(fontSize.xl), textAlign: 'center' }]}>
{currentRoundObj?.name}
</Text>

<View style={{ backgroundColor: colors.card, paddingVertical: spacing.xs, paddingHorizontal: spacing.md, borderRadius: borderRadius.full, marginTop: spacing.xs, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.cardBorder }}>
<Text style={{ color: colors.textSecondary, fontSize: fs(fontSize.sm), fontWeight: '600' }}>
<Ionicons name="card-outline" size={14} color={colors.textSecondary} /> Reparte: <Text style={{ color: colors.text }}>{dealerName}</Text>
</Text>
</View>

{isOwner ? (
<TouchableOpacity
style={[styles.enterScoresBtn, { backgroundColor: colors.primary }]}
onPress={() => openScoreEntry(game.currentRoundIndex)}
>
<Ionicons name="create-outline" size={18} color="#FFF" />
<Text style={[styles.enterScoresText, { fontSize: fs(fontSize.md) }]}>Ingresar Puntajes</Text>
</TouchableOpacity>
) : (
<Text style={[{ color: colors.textSecondary, fontSize: fs(fontSize.sm), marginTop: spacing.xs }]}>
Esperando puntajes del creador...
</Text>
)}
</View>
)}

{/* Rankings */}
<Text style={[styles.sectionTitle, { color: colors.text, fontSize: fs(fontSize.md) }]}>Ranking</Text>
{sortedPlayers.map((player, index) => {
const medal = getMedalIcon(index);
const isLast = index === sortedPlayers.length - 1 && sortedPlayers.length > 1;
return (
<View key={player.id} style={[
styles.playerRank,
{ backgroundColor: colors.card, borderColor: isLast ? colors.danger + '30' : colors.cardBorder },
index === 0 && { borderColor: colors.gold + '40' },
]}>
<View style={styles.rankLeft}>
{medal ? (
<Ionicons name={medal.name} size={20} color={medal.color} />
) : (
<Ionicons name="person-circle-outline" size={24} color={colors.textSecondary} />
)}
<Text style={[styles.playerName, { color: colors.text, fontSize: fs(fontSize.md) }]} numberOfLines={1}>
{player.name}
</Text>
</View>
<View style={styles.rankRight}>
<Text style={[
styles.playerScore,
{ color: index === 0 ? colors.gold : isLast ? colors.danger : colors.text, fontSize: fs(fontSize.lg) }
]}>
{player.totalScore}
</Text>
{!isCompleted && isOwner && (
<TouchableOpacity onPress={() => handleRemovePlayer(player.id, player.name)}>
<Ionicons name="close-circle-outline" size={18} color={colors.textMuted} />
</TouchableOpacity>
)}
</View>
</View>
);
})}

{/* Score Table */}
<Text style={[styles.sectionTitle, { color: colors.text, fontSize: fs(fontSize.md), marginTop: spacing.xxl }]}>
Detalle por Rondas
</Text>
<ScrollView horizontal showsHorizontalScrollIndicator={false}>
<View>
{/* Table header */}
<View style={[styles.tableRow, { backgroundColor: colors.surface }]}>
<View style={[styles.tableHeaderCell, styles.roundCell]}>
<Text style={[styles.tableHeaderText, { color: colors.textSecondary, fontSize: fs(fontSize.xs) }]}>Ronda</Text>
</View>
{game.players.map((p) => (
<View key={p.id} style={styles.tableHeaderCell}>
<Text style={[styles.tableHeaderText, { color: colors.textSecondary, fontSize: fs(fontSize.xs) }]} numberOfLines={1}>
{p.name}
</Text>
</View>
))}
</View>
{/* Table rows */}
{game.rounds.map((round, ri) => (
<TouchableOpacity
key={round.id}
style={[
styles.tableRow,
{ backgroundColor: ri === game.currentRoundIndex && !isCompleted ? colors.primary + '10' : colors.card },
{ borderBottomColor: colors.border },
round.completed && { opacity: 0.7 },
]}
onPress={() => {
  if (!isOwner) {
    Alert.alert('Solo lectura', 'Solo el creador de la partida puede editar puntajes.');
    return;
  }
  if (isCompleted) {
    Alert.alert('Partida finalizada', 'Los puntajes ya no se pueden cambiar.');
    return;
  }
  if (round.completed) {
    Alert.alert(
      'Editar ronda completada',
      '¿Seguro que quieres editar los puntajes? (Esto actualizará los totales y puede alterar los puestos).',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Editar', style: 'destructive', onPress: () => openScoreEntry(ri) }
      ]
    );
    return;
  }
  openScoreEntry(ri);
}}
activeOpacity={isCompleted || round.completed ? 0.7 : 0.2}
>
<View style={[styles.tableCell, styles.roundCell]}>
<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
{round.completed && (
  <Ionicons name="lock-closed" size={10} color={colors.success} />
)}
<Text style={[styles.roundCellText, {
color: round.completed ? colors.success : colors.textSecondary,
fontSize: fs(fontSize.xs),
}]} numberOfLines={1}>
{round.completed ? '✓ ' : ''}{round.name}
</Text>
</View>
</View>
{game.players.map((p) => (
<View key={p.id} style={styles.tableCell}>
<Text style={[styles.scoreCellText, {
color: p.scores[ri] === 0 ? colors.textMuted : colors.text,
fontSize: fs(fontSize.sm),
}]}>
{p.scores[ri]}
</Text>
</View>
))}
</TouchableOpacity>
))}
{/* Total row */}
<View style={[styles.tableRow, { backgroundColor: colors.surfaceHighlight }]}>
<View style={[styles.tableCell, styles.roundCell]}>
<Text style={[styles.tableTotalText, { color: colors.text, fontSize: fs(fontSize.sm) }]}>TOTAL</Text>
</View>
{game.players.map((p) => (
<View key={p.id} style={styles.tableCell}>
<Text style={[styles.tableTotalText, { color: colors.text, fontSize: fs(fontSize.md) }]}>
{p.totalScore}
</Text>
</View>
))}
</View>
</View>
</ScrollView>
</ScrollView>

{/* Score Entry Modal */}
<Modal visible={showScoreModal} animationType="slide" transparent>
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
>
<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
<View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
<View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
<View style={styles.modalHeader}>
<Text style={[styles.modalTitle, { color: colors.text, fontSize: fs(fontSize.xl) }]}>
{editingRoundIndex >= 0 ? game.rounds[editingRoundIndex]?.name : ''}
</Text>
<TouchableOpacity onPress={() => setShowScoreModal(false)}>
<Ionicons name="close" size={24} color={colors.textSecondary} />
</TouchableOpacity>
</View>
<Text style={[styles.modalSubtitle, { color: colors.textSecondary, fontSize: fs(fontSize.sm) }]}>
Ingresa el puntaje de cada jugador
</Text>
<ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
{game.players.map((p, idx) => (
<View key={p.id} style={[styles.scoreInputRow, { borderBottomColor: colors.border }]}>
<Text style={[styles.scoreInputLabel, { color: colors.text, fontSize: fs(fontSize.md) }]}>
{p.name}
</Text>
<TextInput
style={[styles.scoreInput, {
backgroundColor: colors.inputBg,
borderColor: colors.inputBorder,
color: colors.text,
fontSize: fs(fontSize.lg),
}]}
keyboardType="number-pad"
returnKeyType="done"
placeholder="0"
placeholderTextColor={colors.textMuted}
value={scoreInputs[p.id] || ''}
onChangeText={(v) => {
  const numeric = v.replace(/[^0-9]/g, '');
  setScoreInputs(prev => ({ ...prev, [p.id]: numeric }));
}}
selectTextOnFocus
onSubmitEditing={Keyboard.dismiss}
/>
</View>
))}
</ScrollView>
<TouchableOpacity
style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}
onPress={() => { Keyboard.dismiss(); saveScores(); }}
>
<Text style={[styles.modalSaveText, { fontSize: fs(fontSize.lg) }]}>Guardar Puntajes</Text>
</TouchableOpacity>
</View>
</View>
</TouchableWithoutFeedback>
</KeyboardAvoidingView>
</Modal>

{/* Add Player Modal */}
<Modal visible={showAddPlayer} animationType="fade" transparent>
<View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
<View style={[styles.smallModal, { backgroundColor: colors.surface }]}>
<Text style={[styles.modalTitle, { color: colors.text, fontSize: fs(fontSize.lg) }]}>Agregar Jugador</Text>
<TextInput
style={[styles.textInput, {
backgroundColor: colors.inputBg,
borderColor: colors.inputBorder,
color: colors.text,
fontSize: fs(fontSize.md),
marginTop: spacing.md,
}]}
placeholder="Nombre del jugador"
placeholderTextColor={colors.textMuted}
value={newPlayerName}
onChangeText={setNewPlayerName}
autoFocus
/>
<View style={styles.modalBtnRow}>
<TouchableOpacity
style={[styles.modalCancelBtn, { borderColor: colors.border }]}
onPress={() => { setShowAddPlayer(false); setNewPlayerName(''); }}
>
<Text style={[{ color: colors.textSecondary, fontSize: fs(fontSize.md) }]}>Cancelar</Text>
</TouchableOpacity>
<TouchableOpacity
style={[styles.modalConfirmBtn, { backgroundColor: colors.primary }]}
onPress={handleAddPlayer}
>
<Text style={[{ color: '#FFF', fontWeight: '600', fontSize: fs(fontSize.md) }]}>Agregar</Text>
</TouchableOpacity>
</View>
</View>
</View>
</Modal>

{showConfetti && isCompleted && sortedPlayers.length > 0 && (
  <ConfettiOverlay
    winnerName={sortedPlayers[0].name}
    colors={colors}
    fs={fs}
    onDismiss={() => setShowConfetti(false)}
  />
)}
</SafeAreaView>
);
}

const styles = StyleSheet.create({
container: { flex: 1 },
loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
header: {
flexDirection: 'row',
alignItems: 'center',
paddingHorizontal: spacing.lg,
paddingVertical: spacing.md,
borderBottomWidth: 1,
},
backBtn: { padding: spacing.xs },
headerCenter: { flex: 1, alignItems: 'center' },
headerTitle: { fontWeight: '700' },
headerSub: { marginTop: 1 },
scrollContainer: { flex: 1 },
scrollContent: { padding: spacing.lg, paddingBottom: 40 },
winnerCard: {
  padding: spacing.xl,
  borderRadius: borderRadius.xl,
  marginBottom: spacing.md,
  alignItems: 'center',
},
winnerCardTitle: {
  fontWeight: '800',
  textAlign: 'center',
  marginBottom: 4,
},
winnerCardSubtitle: {
  textAlign: 'center',
},
winnerRankingContainer: {
  width: '100%',
  padding: spacing.md,
  borderRadius: borderRadius.md,
},
winnerRankingRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingVertical: spacing.xs,
},
winnerRankingName: {
  fontWeight: '700',
},
winnerRankingScore: {
  fontWeight: '600',
},
shareBtn: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  padding: spacing.md,
  borderRadius: borderRadius.lg,
  gap: spacing.sm,
},
shareBtnText: {
  color: '#FFF',
  fontWeight: '700',
  fontSize: 16,
},
currentRound: {
padding: spacing.lg,
borderRadius: borderRadius.lg,
borderWidth: 1,
marginBottom: spacing.xl,
alignItems: 'center',
},
currentRoundLabel: { fontWeight: '800', letterSpacing: 1, marginBottom: spacing.xs },
currentRoundName: { fontWeight: '700', marginBottom: spacing.md },
enterScoresBtn: {
flexDirection: 'row',
alignItems: 'center',
paddingHorizontal: spacing.xl,
paddingVertical: spacing.sm + 2,
borderRadius: borderRadius.md,
gap: spacing.sm,
},
enterScoresText: { color: '#FFF', fontWeight: '600' },
sectionTitle: { fontWeight: '700', marginBottom: spacing.sm },
playerRank: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'space-between',
padding: spacing.md,
borderRadius: borderRadius.sm,
borderWidth: 1,
marginBottom: spacing.xs,
},
rankLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing.sm },
rankRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
rankBubble: {
width: 24,
height: 24,
borderRadius: 12,
justifyContent: 'center',
alignItems: 'center',
},
rankNumber: { fontWeight: '700' },
playerName: { fontWeight: '500', flex: 1 },
playerScore: { fontWeight: '800' },
tableRow: {
flexDirection: 'row',
borderBottomWidth: 0.5,
},
tableHeaderCell: {
width: 80,
paddingVertical: spacing.sm,
paddingHorizontal: spacing.xs,
alignItems: 'center',
},
tableHeaderText: { fontWeight: '700' },
tableCell: {
width: 80,
paddingVertical: spacing.sm,
paddingHorizontal: spacing.xs,
alignItems: 'center',
justifyContent: 'center',
},
roundCell: { width: 130, alignItems: 'flex-start', paddingLeft: spacing.sm },
roundCellText: { fontWeight: '500' },
scoreCellText: { fontWeight: '600' },
tableTotalText: { fontWeight: '800' },
modalOverlay: {
flex: 1,
justifyContent: 'flex-end',
},
modalContent: {
borderTopLeftRadius: borderRadius.xl,
borderTopRightRadius: borderRadius.xl,
padding: spacing.xxl,
maxHeight: '80%',
},
modalHeader: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: spacing.xs,
},
modalTitle: { fontWeight: '700' },
modalSubtitle: { marginBottom: spacing.lg },
modalScroll: { maxHeight: 400 },
scoreInputRow: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'space-between',
paddingVertical: spacing.md,
borderBottomWidth: 0.5,
},
scoreInputLabel: { fontWeight: '500', flex: 1 },
scoreInput: {
width: 100,
borderWidth: 1,
borderRadius: borderRadius.sm,
paddingHorizontal: spacing.md,
paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
textAlign: 'center',
fontWeight: '700',
},
modalSaveBtn: {
paddingVertical: spacing.lg,
borderRadius: borderRadius.md,
alignItems: 'center',
marginTop: spacing.lg,
},
modalSaveText: { color: '#FFF', fontWeight: '700' },
smallModal: {
margin: spacing.xxl,
borderRadius: borderRadius.lg,
padding: spacing.xxl,
},
textInput: {
borderWidth: 1,
borderRadius: borderRadius.md,
paddingHorizontal: spacing.lg,
paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
},
modalBtnRow: {
flexDirection: 'row',
gap: spacing.sm,
marginTop: spacing.lg,
},
modalCancelBtn: {
flex: 1,
paddingVertical: spacing.md,
borderRadius: borderRadius.md,
borderWidth: 1,
alignItems: 'center',
},
modalConfirmBtn: {
flex: 1,
paddingVertical: spacing.md,
borderRadius: borderRadius.md,
alignItems: 'center',
},
});