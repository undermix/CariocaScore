import { Password } from "@convex-dev/auth/providers/Password";
import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params: any) {
        return {
          email: params.email as string,
          ...(params.name ? { name: params.name as string } : {}),
        };
      },
      reset: {
        id: "resend-reset",
        type: "email",
        name: "Resend",
        async sendVerificationRequest({ identifier: email, token }) {
          const resendKey = process.env.AUTH_RESEND_KEY;
          if (!resendKey) {
            console.warn("Falta la variable de entorno AUTH_RESEND_KEY. No se enviará el correo.");
            return;
          }
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Carioca Score <no-reply@cariocascore.makersapps.com>",
              to: [email],
              subject: "Código de recuperación de contraseña",
              html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                  <h2>Restablecer contraseña en Carioca Score</h2>
                  <p>Hemos recibido una solicitud para restablecer tu contraseña. Usa el siguiente código de verificación de un solo uso (OTP):</p>
                  <h1 style="background: #f0f0f0; padding: 10px; text-align: center; border-radius: 8px; letter-spacing: 4px; font-size: 32px; color: #00875A;">${token}</h1>
                  <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
                </div>
              `,
            }),
          });
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al enviar correo vía Resend: ${errorText}`);
          }
        },
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
});