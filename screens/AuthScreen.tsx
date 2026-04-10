import React, { useState } from 'react';
import {
View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
Platform, ScrollView, ActivityIndicator, Alert, Dimensions, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthActions } from '@convex-dev/auth/react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/ThemeContext';
import { spacing, borderRadius, fontSize } from '../lib/theme';

const { width } = Dimensions.get('window');

export default function AuthScreen() {
const { signIn } = useAuthActions();
const { colors, fs } = useTheme();
const [step, setStep] = useState<'signIn' | 'signUp'>('signIn');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [name, setName] = useState('');
const [loading, setLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);

const handleAuth = async () => {
if (!email.trim() || !password.trim()) {
Alert.alert('Error', 'Por favor ingresa correo y contraseña');
return;
}
if (step === 'signUp' && !name.trim()) {
Alert.alert('Error', 'Por favor ingresa tu nombre');
return;
}
setLoading(true);
console.log('[AUTH] handleAuth starting:', step);
try {
await signIn('password', { 
email: email.trim(), 
password,
flow: step,
...(step === 'signUp' ? { name: name.trim() } : {}),
});
console.log('[AUTH] handleAuth success! Promise resolved.');
} catch (e: any) {
console.log('[AUTH] handleAuth error caught:', e);
let message = 'Ocurrió un error inesperado. Intenta de nuevo.';
const errStr = String(e?.message || e);

if (step === 'signIn') {
if (errStr.includes('InvalidAccountId')) {
  message = 'Ese correo no está registrado. Por favor crea una cuenta primero.';
} else {
  message = 'Contraseña incorrecta. Intenta de nuevo.';
}
} else {
if (errStr.includes('Account already exists')) {
  message = 'Este correo ya tiene una cuenta. Mejor inicia sesión.';
} else {
  message = 'No se pudo crear la cuenta. Verifica tus datos de registro.';
}
}

Alert.alert('Acceso Denegado', message);
} finally {
console.log('[AUTH] handleAuth finally block');
setLoading(false);
}
};

return (
<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
<KeyboardAvoidingView 
behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
style={styles.flex}
>
<ScrollView 
contentContainerStyle={styles.scroll}
keyboardShouldPersistTaps="handled"
>
{/* Logo Section */}
<View style={styles.logoSection}>
<Image
  source={require('../assets/icon.png')}
  style={styles.logoImage}
  resizeMode="contain"
/>
<Text style={[styles.appName, { color: colors.text, fontSize: fs(fontSize.xxxl) }]}>
Carioca Score
</Text>
<Text style={[styles.tagline, { color: colors.textSecondary, fontSize: fs(fontSize.md) }]}>
Tu compañero para el juego de cartas
</Text>
</View>

{/* Form */}
<View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
<Text style={[styles.formTitle, { color: colors.text, fontSize: fs(fontSize.xl) }]}>
{step === 'signIn' ? 'Iniciar Sesión' : 'Crear Cuenta'}
</Text>

{step === 'signUp' && (
<View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
<Ionicons name="person-outline" size={20} color={colors.textMuted} />
<TextInput
style={[styles.input, { color: colors.text, fontSize: fs(fontSize.md) }]}
placeholder="Nombre"
placeholderTextColor={colors.textMuted}
value={name}
onChangeText={setName}
autoCapitalize="words"
/>
</View>
)}

<View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
<Ionicons name="mail-outline" size={20} color={colors.textMuted} />
<TextInput
style={[styles.input, { color: colors.text, fontSize: fs(fontSize.md) }]}
placeholder="Correo electrónico"
placeholderTextColor={colors.textMuted}
value={email}
onChangeText={setEmail}
keyboardType="email-address"
autoCapitalize="none"
autoComplete="email"
/>
</View>

<View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
<Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
<TextInput
style={[styles.input, { color: colors.text, fontSize: fs(fontSize.md) }]}
placeholder="Contraseña"
placeholderTextColor={colors.textMuted}
value={password}
onChangeText={setPassword}
secureTextEntry={!showPassword}
/>
<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
<Ionicons
name={showPassword ? 'eye-off-outline' : 'eye-outline'}
size={20}
color={colors.textMuted}
/>
</TouchableOpacity>
</View>

<TouchableOpacity
style={[styles.primaryButton, { backgroundColor: colors.primary }]}
onPress={handleAuth}
disabled={loading}
>
{loading ? (
<ActivityIndicator color="#FFF" />
) : (
<Text style={[styles.primaryButtonText, { fontSize: fs(fontSize.lg) }]}>
{step === 'signIn' ? 'Entrar' : 'Registrarme'}
</Text>
)}
</TouchableOpacity>

<TouchableOpacity
style={styles.switchButton}
onPress={() => setStep(step === 'signIn' ? 'signUp' : 'signIn')}
>
<Text style={[styles.switchText, { color: colors.textSecondary, fontSize: fs(fontSize.sm) }]}>
{step === 'signIn' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
<Text style={{ color: colors.primary, fontWeight: '600' }}>
{step === 'signIn' ? 'Regístrate' : 'Inicia sesión'}
</Text>
</Text>
</TouchableOpacity>
</View>
</ScrollView>
</KeyboardAvoidingView>
</SafeAreaView>
);
}

const styles = StyleSheet.create({
container: { flex: 1 },
flex: { flex: 1 },
scroll: {
flexGrow: 1,
justifyContent: 'center',
paddingHorizontal: spacing.xl,
paddingBottom: spacing.xxxl,
},
logoSection: {
alignItems: 'center',
marginBottom: spacing.xxxl,
},
logoImage: {
width: 110,
height: 110,
borderRadius: 24,
marginBottom: spacing.lg,
},
appName: {
fontWeight: '800',
letterSpacing: -0.5,
},
tagline: {
marginTop: spacing.xs,
},
formCard: {
borderRadius: borderRadius.lg,
padding: spacing.xxl,
borderWidth: 1,
},
formTitle: {
fontWeight: '700',
textAlign: 'center',
marginBottom: spacing.xxl,
},
inputContainer: {
flexDirection: 'row',
alignItems: 'center',
borderWidth: 1,
borderRadius: borderRadius.md,
paddingHorizontal: spacing.lg,
paddingVertical: Platform.OS === 'ios' ? spacing.md + 2 : spacing.xs,
marginBottom: spacing.md,
gap: spacing.sm,
},
input: {
flex: 1,
paddingVertical: spacing.xs,
},
primaryButton: {
borderRadius: borderRadius.md,
paddingVertical: spacing.lg,
alignItems: 'center',
marginTop: spacing.md,
},
primaryButtonText: {
color: '#FFF',
fontWeight: '700',
},
switchButton: {
alignItems: 'center',
marginTop: spacing.xl,
},
switchText: {
textAlign: 'center',
},
});