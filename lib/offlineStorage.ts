import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_GAMES_KEY = '@carioca_local_games';
const CACHED_ONLINE_GAMES_KEY = '@carioca_cached_online_games';

export interface LocalGame {
  _id: string;
  _creationTime: number;
  name: string;
  status: string; // 'active' | 'completed'
  userId: string;
  isLocal: boolean;
  players: Array<{
    id: string;
    name: string;
    scores: number[];
    totalScore: number;
    linkedUserId?: string;
  }>;
  rounds: Array<{
    id: string;
    name: string;
    completed: boolean;
  }>;
  currentRoundIndex: number;
  customRounds?: boolean;
  completedAt?: number;
}

// 1. Obtener todas las partidas locales
export async function getLocalGames(): Promise<LocalGame[]> {
  try {
    const data = await AsyncStorage.getItem(LOCAL_GAMES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('[OFFLINE] Error al leer partidas locales:', error);
    return [];
  }
}

// 2. Obtener una partida local específica por ID
export async function getLocalGame(gameId: string): Promise<LocalGame | null> {
  const games = await getLocalGames();
  return games.find((g) => g._id === gameId) || null;
}

// 3. Guardar o actualizar una partida local
export async function saveLocalGame(game: LocalGame): Promise<void> {
  try {
    const games = await getLocalGames();
    const index = games.findIndex((g) => g._id === game._id);
    if (index >= 0) {
      games[index] = game;
    } else {
      games.push(game);
    }
    await AsyncStorage.setItem(LOCAL_GAMES_KEY, JSON.stringify(games));
  } catch (error) {
    console.error('[OFFLINE] Error al guardar partida local:', error);
  }
}

// 4. Eliminar una partida local
export async function deleteLocalGame(gameId: string): Promise<void> {
  try {
    const games = await getLocalGames();
    const filtered = games.filter((g) => g._id !== gameId);
    await AsyncStorage.setItem(LOCAL_GAMES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('[OFFLINE] Error al eliminar partida local:', error);
  }
}

// 5. Cachear partidas que vienen de Convex (online)
export async function cacheOnlineGames(games: any[]): Promise<void> {
  try {
    // Solo guardamos un subset de datos para evitar llenar el almacenamiento
    const cleaned = games.map((g) => ({
      _id: g._id,
      _creationTime: g._creationTime,
      name: g.name,
      status: g.status,
      userId: g.userId,
      players: g.players,
      rounds: g.rounds,
      currentRoundIndex: g.currentRoundIndex,
      customRounds: g.customRounds,
      completedAt: g.completedAt,
      isOwner: g.isOwner,
    }));
    await AsyncStorage.setItem(CACHED_ONLINE_GAMES_KEY, JSON.stringify(cleaned));
  } catch (error) {
    console.error('[OFFLINE] Error al cachear partidas online:', error);
  }
}

// 6. Obtener las partidas online cacheadas
export async function getCachedOnlineGames(): Promise<any[]> {
  try {
    const data = await AsyncStorage.getItem(CACHED_ONLINE_GAMES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('[OFFLINE] Error al obtener partidas cacheadas:', error);
    return [];
  }
}

// 7. Sincronizar partidas locales pendientes con Convex
export async function syncOfflineGames(
  syncOfflineGameMut: any
): Promise<number> {
  const localGames = await getLocalGames();
  if (localGames.length === 0) return 0;

  console.log(`[OFFLINE] Intentando sincronizar ${localGames.length} partidas...`);
  let syncedCount = 0;

  for (const game of localGames) {
    try {
      await syncOfflineGameMut({
        name: game.name,
        status: game.status,
        players: game.players.map((p) => ({
          name: p.name,
          scores: p.scores,
          totalScore: p.totalScore,
          linkedUserId: p.linkedUserId,
        })),
        rounds: game.rounds.map((r) => ({
          id: r.id,
          name: r.name,
          completed: r.completed,
        })),
        currentRoundIndex: game.currentRoundIndex,
        customRounds: game.customRounds,
        completedAt: game.completedAt,
      });

      await deleteLocalGame(game._id);
      syncedCount++;
    } catch (error) {
      console.error(`[OFFLINE] Error al sincronizar partida "${game.name}":`, error);
    }
  }

  return syncedCount;
}
