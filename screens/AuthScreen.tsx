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
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');

export default function AuthScreen() {
const { signIn } = useAuthActions();
const { colors, fs } = useTheme();
const [step, setStep] = useState<'signIn' | 'signUp' | 'forgot' | 'resetVerification'>('signIn');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [name, setName] = useState('');
const [code, setCode] = useState('');
const [loading, setLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);
const [googleLoading, setGoogleLoading] = useState(false);

const handleGoogleAuth = async () => {
  setGoogleLoading(true);
  try {
    const redirectUrl = Linking.createURL("oauth-callback");
    const result = await signIn("google", { redirectTo: redirectUrl });
    if (result && result.redirect) {
      await WebBrowser.openAuthSessionAsync(
        result.redirect.toString(),
        redirectUrl
      );
    }
  } catch (e: any) {
    console.error('[AUTH] Google error:', e);
    Alert.alert('Error de Autenticación', 'No se pudo iniciar sesión con Google.');
  } finally {
    setGoogleLoading(false);
  }
};

const handleAuth = async () => {
if (step === 'forgot') {
  if (!email.trim()) {
    Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
    return;
  }
  setLoading(true);
  try {
    await signIn('password', { email: email.trim(), flow: 'reset' });
    Alert.alert('Código Enviado', 'Se ha enviado un código de recuperación a tu correo electrónico.');
    setStep('resetVerification');
  } catch (e: any) {
    console.error('[AUTH] Forgot password error:', e);
    Alert.alert('Error', 'No se pudo enviar el correo de recuperación. Verifica el correo ingresado.');
  } finally {
    setLoading(false);
  }
  return;
}

if (step === 'resetVerification') {
  if (!email.trim() || !code.trim() || !password.trim()) {
    Alert.alert('Error', 'Por favor ingresa correo, código de recuperación y nueva contraseña');
    return;
  }
  if (password.length < 8) {
    Alert.alert('Error', 'La nueva contraseña debe tener al menos 8 caracteres');
    return;
  }
  setLoading(true);
  try {
    await signIn('password', {
      email: email.trim(),
      code: code.trim(),
      newPassword: password,
      flow: 'reset-verification',
    });
    Alert.alert('Listo', 'Contraseña restablecida y sesión iniciada correctamente.');
  } catch (e: any) {
    console.error('[AUTH] Reset verification error:', e);
    Alert.alert('Acceso Denegado', 'Código de verificación inválido o expirado.');
  } finally {
    setLoading(false);
  }
  return;
}

if (!email.trim() || !password.trim()) {
Alert.alert('Error', 'Por favor ingresa correo y contraseña');
return;
}
if (step === 'signUp' && !name.trim()) {
Alert.alert('Error', 'Por favor ingresa tu nombre');
return;
}
if (step === 'signUp' && password.length < 8) {
  Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
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
{step === 'signIn' && 'Iniciar Sesión'}
{step === 'signUp' && 'Crear Cuenta'}
{step === 'forgot' && 'Recuperar Contraseña'}
{step === 'resetVerification' && 'Restablecer Contraseña'}
</Text>

{step === 'forgot' && (
  <Text style={[{ color: colors.textSecondary, fontSize: fs(fontSize.sm), textAlign: 'center', marginBottom: spacing.lg }]}>
    Ingresa tu correo electrónico y te enviaremos un código de verificación para restablecer tu contraseña.
  </Text>
)}
{step === 'resetVerification' && (
  <Text style={[{ color: colors.textSecondary, fontSize: fs(fontSize.sm), textAlign: 'center', marginBottom: spacing.lg }]}>
    Ingresa el código OTP enviado a <Text style={{ fontWeight: '600' }}>{email}</Text> y tu nueva contraseña.
  </Text>
)}

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

{step !== 'resetVerification' && (
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
)}

{step === 'resetVerification' && (
<View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
<Ionicons name="key-outline" size={20} color={colors.textMuted} />
<TextInput
style={[styles.input, { color: colors.text, fontSize: fs(fontSize.md) }]}
placeholder="Código de verificación (OTP)"
placeholderTextColor={colors.textMuted}
value={code}
onChangeText={setCode}
keyboardType="number-pad"
autoCapitalize="none"
/>
</View>
)}

{step !== 'forgot' && (
<View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
<Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
<TextInput
style={[styles.input, { color: colors.text, fontSize: fs(fontSize.md) }]}
placeholder={step === 'resetVerification' ? "Nueva contraseña" : "Contraseña"}
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
)}

{step === 'signIn' && (
  <TouchableOpacity 
    style={{ alignSelf: 'flex-end', marginBottom: spacing.md }}
    onPress={() => setStep('forgot')}
  >
    <Text style={{ color: colors.primary, fontSize: fs(fontSize.sm), fontWeight: '500' }}>
      ¿Olvidaste tu contraseña?
    </Text>
  </TouchableOpacity>
)}

<TouchableOpacity
style={[styles.primaryButton, { backgroundColor: colors.primary }]}
onPress={handleAuth}
disabled={loading || googleLoading}
>
{loading ? (
<ActivityIndicator color="#FFF" />
) : (
<Text style={[styles.primaryButtonText, { fontSize: fs(fontSize.lg) }]}>
{step === 'signIn' && 'Entrar'}
{step === 'signUp' && 'Registrarme'}
{step === 'forgot' && 'Enviar código'}
{step === 'resetVerification' && 'Restablecer contraseña'}
</Text>
)}
</TouchableOpacity>

{(step === 'signIn' || step === 'signUp') && (
  <>
    <View style={styles.dividerContainer}>
      <View style={[styles.dividerLine, { backgroundColor: colors.inputBorder }]} />
      <Text style={[styles.dividerText, { color: colors.textMuted, fontSize: fs(fontSize.sm) }]}>
        o continuar con
      </Text>
      <View style={[styles.dividerLine, { backgroundColor: colors.inputBorder }]} />
    </View>

    <TouchableOpacity
      style={[styles.googleButton, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}
      onPress={handleGoogleAuth}
      disabled={googleLoading || loading}
    >
      {googleLoading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <>
          <Ionicons name="logo-google" size={20} color="#EA4335" />
          <Text style={[styles.googleButtonText, { color: colors.text, fontSize: fs(fontSize.md) }]}>
            Google
          </Text>
        </>
      )}
    </TouchableOpacity>
  </>
)}

{step === 'resetVerification' && (
  <TouchableOpacity
    style={{ alignItems: 'center', marginTop: spacing.md }}
    onPress={() => setStep('forgot')}
  >
    <Text style={{ color: colors.textSecondary, fontSize: fs(fontSize.sm) }}>
      ¿No recibiste el código? <Text style={{ color: colors.primary, fontWeight: '600' }}>Re-enviar</Text>
    </Text>
  </TouchableOpacity>
)}

{step === 'signIn' || step === 'signUp' ? (
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
) : (
  <TouchableOpacity
    style={styles.switchButton}
    onPress={() => setStep('signIn')}
  >
    <Text style={[styles.switchText, { color: colors.primary, fontSize: fs(fontSize.sm), fontWeight: '600' }]}>
      Volver a Iniciar Sesión
    </Text>
  </TouchableOpacity>
)}
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
dividerContainer: {
flexDirection: 'row',
alignItems: 'center',
marginVertical: spacing.lg,
},
dividerLine: {
flex: 1,
height: 1,
},
dividerText: {
paddingHorizontal: spacing.md,
fontWeight: '600',
},
googleButton: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'center',
borderRadius: borderRadius.md,
paddingVertical: spacing.lg - 2,
borderWidth: 1,
gap: spacing.sm,
},
googleButtonText: {
fontWeight: '600',
},
});