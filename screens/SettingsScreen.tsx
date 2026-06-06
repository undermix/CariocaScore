import React, { useState, useEffect } from 'react';
import {
View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking, Platform,
ActivityIndicator, Modal, TextInput, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthActions } from '@convex-dev/auth/react';
import { useAction, useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import * as StoreReview from 'expo-store-review';
import { useTheme } from '../lib/ThemeContext';
import { ThemeMode, spacing, borderRadius, fontSize } from '../lib/theme';
import CountryFlag from 'react-native-country-flag';
import { COUNTRIES } from '../lib/countries';

const themes: { id: ThemeMode; label: string; icon: string; desc: string }[] = [
{ id: 'light', label: 'Claro', icon: 'sunny', desc: 'Fondo blanco, letras oscuras' },
{ id: 'dark', label: 'Oscuro', icon: 'moon', desc: 'Fondo oscuro, ahorra batería' },
{ id: 'casino', label: 'Mesa Verde', icon: 'leaf', desc: 'Estilo casino clásico' },
];

const fontScales = [
{ label: 'Pequeño', value: 0.85 },
{ label: 'Normal', value: 1 },
{ label: 'Grande', value: 1.15 },
{ label: 'Extra Grande', value: 1.3 },
];

export default function SettingsScreen({ navigation }: any) {
const { signOut } = useAuthActions();
const changePasswordAction = useAction(api.users.changePassword);
const userProfile = useQuery(api.games.getUserProfile, {});
const updateUserName = useMutation(api.games.updateUserName);
const updateUserCountry = useMutation(api.games.updateUserCountry);
const { colors, mode, fontScale, setMode, setFontScale, fs } = useTheme();
const [signingOut, setSigningOut] = useState(false);
const [showPasswordModal, setShowPasswordModal] = useState(false);
const [showNameModal, setShowNameModal] = useState(false);
const [showCountryModal, setShowCountryModal] = useState(false);
const [editName, setEditName] = useState('');
const [savingName, setSavingName] = useState(false);
const [currentPassword, setCurrentPassword] = useState('');
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [changingPassword, setChangingPassword] = useState(false);

useEffect(() => {
  if (!signingOut) return;
  let cancelled = false;
  signOut()
    .catch((e: any) => {
      if (!cancelled) {
        console.error('Sign out error:', e);
        Alert.alert('Error', 'No se pudo cerrar sesión. Intenta de nuevo.');
      }
    })
    .finally(() => {
      if (!cancelled) setSigningOut(false);
    });
  return () => { cancelled = true; };
}, [signingOut]);

const handleSaveName = async () => {
  if (!editName.trim()) {
    Alert.alert('Error', 'Por favor ingresa tu nombre');
    return;
  }
  setSavingName(true);
  try {
    await updateUserName({ name: editName.trim() });
    Alert.alert('Listo', 'Tu nombre ha sido actualizado');
    setShowNameModal(false);
  } catch {
    Alert.alert('Error', 'No se pudo actualizar el nombre');
  } finally {
    setSavingName(false);
  }
};

const handleChangePassword = async () => {
  if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
    Alert.alert('Error', 'Por favor completa todos los campos');
    return;
  }
  if (newPassword.length < 6) {
    Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
    return;
  }
  if (newPassword !== confirmPassword) {
    Alert.alert('Error', 'Las contraseñas nuevas no coinciden');
    return;
  }
  setChangingPassword(true);
  try {
    await changePasswordAction({
      currentPassword,
      newPassword,
    });
    Alert.alert('Listo', 'Tu contraseña ha sido actualizada correctamente');
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  } catch (e: any) {
    const msg = e?.message || '';
    if (msg.includes('incorrecta')) {
      Alert.alert('Error', 'La contraseña actual es incorrecta.');
    } else {
      Alert.alert('Error', 'No se pudo cambiar la contraseña. Intenta de nuevo.');
    }
  } finally {
    setChangingPassword(false);
  }
};

const handleSignOut = () => {
  Alert.alert('Cerrar sesión', '¿Estás seguro que deseas salir?', [
    { text: 'Cancelar', style: 'cancel' },
    {
      text: 'Salir',
      style: 'destructive',
      onPress: () => {
        setSigningOut(true);
      },
    },
  ]);
};

const handleRate = async () => {
try {
if (await StoreReview.hasAction()) {
await StoreReview.requestReview();
}
} catch {
// Silent fail
}
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
<View style={styles.section}>
<Text style={[styles.sectionTitle, { color: colors.textSecondary, fontSize: fs(fontSize.xs) }]}>{title}</Text>
<View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
{children}
</View>
</View>
);

const Row = ({ icon, label, value, onPress, danger }: {
icon: string; label: string; value?: string; onPress?: () => void; danger?: boolean;
}) => (
<TouchableOpacity
style={[styles.row, { borderBottomColor: colors.border }]}
onPress={onPress}
disabled={!onPress}
>
<View style={styles.rowLeft}>
<Ionicons name={icon as any} size={20} color={danger ? colors.danger : colors.primary} />
<Text style={[styles.rowLabel, { color: danger ? colors.danger : colors.text, fontSize: fs(fontSize.md) }]}>
{label}
</Text>
</View>
<View style={styles.rowRight}>
{value && <Text style={[styles.rowValue, { color: colors.textSecondary, fontSize: fs(fontSize.sm) }]}>{value}</Text>}
{onPress && <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />}
</View>
</TouchableOpacity>
);

return (
<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
<View style={[styles.header, { borderBottomColor: colors.border }]}>
<Text style={[styles.title, { color: colors.text, fontSize: fs(fontSize.xxl) }]}>Ajustes</Text>
</View>

<ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
{/* Theme */}
<Section title="TEMA VISUAL">
{themes.map((t) => (
<TouchableOpacity
key={t.id}
style={[styles.themeRow, { borderBottomColor: colors.border }]}
onPress={() => setMode(t.id)}
>
<Ionicons name={t.icon as any} size={20} color={mode === t.id ? colors.primary : colors.textMuted} />
<View style={styles.themeInfo}>
<Text style={[styles.themeLabel, { color: colors.text, fontSize: fs(fontSize.md) }]}>{t.label}</Text>
<Text style={[styles.themeDesc, { color: colors.textSecondary, fontSize: fs(fontSize.xs) }]}>{t.desc}</Text>
</View>
{mode === t.id && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
</TouchableOpacity>
))}
</Section>

{/* Font Size */}
<Section title="TAMAÑO DE FUENTE">
<View style={styles.fontScaleRow}>
{fontScales.map((s) => (
<TouchableOpacity
key={s.value}
style={[
styles.fontScaleBtn,
{
backgroundColor: fontScale === s.value ? colors.primary : colors.surfaceHighlight,
borderColor: fontScale === s.value ? colors.primary : colors.border,
},
]}
onPress={() => setFontScale(s.value)}
>
<Text style={[
styles.fontScaleBtnText,
{
color: fontScale === s.value ? '#FFF' : colors.textSecondary,
fontSize: fs(fontSize.xs),
},
]}>
{s.label}
</Text>
</TouchableOpacity>
))}
</View>
</Section>

{/* App */}
<Section title="APLICACIÓN">
<Row icon="star" label="Calificar app" onPress={handleRate} />
<Row icon="heart" label="Apoyar desarrollo" onPress={() => navigation.navigate('Donations')} />
<Row icon="information-circle" label="Versión" value="1.0.0" />
</Section>

{/* Account */}
<Section title="CUENTA">
<Row icon="person" label="Nombre" value={userProfile?.name || 'Sin nombre'} onPress={() => {
  setEditName(userProfile?.name || '');
  setShowNameModal(true);
}} />
<Row icon="globe-outline" label="País" value={userProfile?.country ? (COUNTRIES.find(c => c.code === userProfile.country)?.name || userProfile.country) : 'Seleccionar país'} onPress={() => setShowCountryModal(true)} />
<Row icon="key" label="Cambiar contraseña" onPress={() => setShowPasswordModal(true)} />
<Row icon="log-out" label={signingOut ? "Cerrando sesión..." : "Cerrar sesión"} onPress={signingOut ? undefined : handleSignOut} danger />
</Section>

{signingOut && (
<View style={styles.signingOutOverlay}>
  <ActivityIndicator size="small" color={colors.danger} />
  <Text style={[styles.signingOutText, { color: colors.textSecondary, fontSize: fs(fontSize.sm) }]}>
    Cerrando sesión...
  </Text>
</View>
)}
</ScrollView>

{/* Change Password Modal */}
<Modal visible={showPasswordModal} animationType="slide" transparent>
  <View style={styles.modalOverlay}>
    <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.modalHeader}>
        <Text style={[styles.modalTitle, { color: colors.text, fontSize: fs(fontSize.xl) }]}>
          Cambiar Contraseña
        </Text>
        <TouchableOpacity onPress={() => {
          setShowPasswordModal(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }}>
          <Ionicons name="close" size={24} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
        <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.modalInputText, { color: colors.text, fontSize: fs(fontSize.md) }]}
          placeholder="Contraseña actual"
          placeholderTextColor={colors.textMuted}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
        />
      </View>

      <View style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
        <Ionicons name="key-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.modalInputText, { color: colors.text, fontSize: fs(fontSize.md) }]}
          placeholder="Nueva contraseña"
          placeholderTextColor={colors.textMuted}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
      </View>

      <View style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
        <Ionicons name="key-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.modalInputText, { color: colors.text, fontSize: fs(fontSize.md) }]}
          placeholder="Confirmar nueva contraseña"
          placeholderTextColor={colors.textMuted}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={[styles.modalButton, { backgroundColor: colors.primary }]}
        onPress={handleChangePassword}
        disabled={changingPassword}
      >
        {changingPassword ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={[styles.modalButtonText, { fontSize: fs(fontSize.md) }]}>
            Cambiar Contraseña
          </Text>
        )}
      </TouchableOpacity>
    </View>
  </View>
</Modal>

{/* Edit Name Modal */}
<Modal visible={showNameModal} animationType="slide" transparent>
  <View style={styles.modalOverlay}>
    <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.modalHeader}>
        <Text style={[styles.modalTitle, { color: colors.text, fontSize: fs(fontSize.xl) }]}>
          Editar Nombre
        </Text>
        <TouchableOpacity onPress={() => setShowNameModal(false)}>
          <Ionicons name="close" size={24} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <Text style={[{ color: colors.textSecondary, fontSize: fs(fontSize.sm), marginBottom: spacing.md }]}>
        Este nombre aparecerá en el Ranking Mundial
      </Text>

      <View style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
        <Ionicons name="person-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.modalInputText, { color: colors.text, fontSize: fs(fontSize.md) }]}
          placeholder="Tu nombre"
          placeholderTextColor={colors.textMuted}
          value={editName}
          onChangeText={setEditName}
          autoCapitalize="words"
          autoFocus
        />
      </View>

      <TouchableOpacity
        style={[styles.modalButton, { backgroundColor: colors.primary }]}
        onPress={handleSaveName}
        disabled={savingName}
      >
        {savingName ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={[styles.modalButtonText, { fontSize: fs(fontSize.md) }]}>
            Guardar
          </Text>
        )}
      </TouchableOpacity>
    </View>
  </View>
</Modal>

{/* Select Country Modal */}
<Modal visible={showCountryModal} animationType="slide" transparent>
  <View style={styles.modalOverlay}>
    <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.cardBorder, maxHeight: '80%' }]}>
      <View style={styles.modalHeader}>
        <Text style={[styles.modalTitle, { color: colors.text, fontSize: fs(fontSize.xl) }]}>
          Seleccionar País
        </Text>
        <TouchableOpacity onPress={() => setShowCountryModal(false)}>
          <Ionicons name="close" size={24} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={COUNTRIES}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, { borderBottomColor: colors.border }]}
            onPress={async () => {
              try {
                await updateUserCountry({ country: item.code });
                setShowCountryModal(false);
              } catch (e) {
                console.error("Failed to update country:", e);
                Alert.alert('Error', 'No se pudo actualizar el país.');
              }
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <CountryFlag isoCode={item.code} size={20} style={{ borderRadius: 4 }} />
              <Text style={[{ color: colors.text, fontSize: fs(fontSize.md) }]}>{item.name}</Text>
            </View>
            {userProfile?.country === item.code && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
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
header: {
paddingHorizontal: spacing.xl,
paddingVertical: spacing.lg,
borderBottomWidth: 1,
},
title: { fontWeight: '800', letterSpacing: -0.5 },
scroll: { padding: spacing.lg, paddingBottom: 40 },
section: { marginBottom: spacing.xl },
sectionTitle: {
fontWeight: '700',
letterSpacing: 0.5,
marginBottom: spacing.sm,
paddingLeft: spacing.xs,
},
sectionCard: {
borderRadius: borderRadius.lg,
borderWidth: 1,
overflow: 'hidden',
},
row: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'space-between',
paddingHorizontal: spacing.lg,
paddingVertical: spacing.md + 2,
borderBottomWidth: 0.5,
},
rowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
rowRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
rowLabel: { fontWeight: '500' },
rowValue: {},
themeRow: {
flexDirection: 'row',
alignItems: 'center',
paddingHorizontal: spacing.lg,
paddingVertical: spacing.md,
borderBottomWidth: 0.5,
gap: spacing.md,
},
themeInfo: { flex: 1 },
themeLabel: { fontWeight: '600' },
themeDesc: {},
fontScaleRow: {
flexDirection: 'row',
padding: spacing.md,
gap: spacing.sm,
},
fontScaleBtn: {
flex: 1,
paddingVertical: spacing.sm,
borderRadius: borderRadius.sm,
alignItems: 'center',
borderWidth: 1,
},
fontScaleBtnText: { fontWeight: '600' },
signingOutOverlay: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: spacing.sm,
  paddingVertical: spacing.lg,
},
signingOutText: {
  fontWeight: '500',
},
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  padding: spacing.xl,
},
modalContent: {
  borderRadius: borderRadius.lg,
  padding: spacing.xxl,
  borderWidth: 1,
},
modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: spacing.xl,
},
modalTitle: {
  fontWeight: '700',
},
modalInput: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderRadius: borderRadius.md,
  paddingHorizontal: spacing.lg,
  paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.xs,
  marginBottom: spacing.md,
  gap: spacing.sm,
},
modalInputText: {
  flex: 1,
  paddingVertical: spacing.xs,
},
modalButton: {
  borderRadius: borderRadius.md,
  paddingVertical: spacing.lg,
  alignItems: 'center',
  marginTop: spacing.md,
},
modalButtonText: {
  color: '#FFF',
  fontWeight: '700',
},
});