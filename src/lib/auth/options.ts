import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/database/prisma";
import * as argon2 from "argon2";
import { authenticator } from "@/lib/security/totp";
import { assertNotLocked, recordFailedAttempt, recordSuccessfulAttempt } from "@/lib/security/login-throttle";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "URUU Secure Login",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@shadowroot.tech" },
        password: { label: "Password", type: "password" },
        otp: { label: "MFA Code (if enabled)", type: "text" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const email = credentials.email;
        const forwardedFor = req?.headers?.["x-forwarded-for"];
        const ip = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(",")[0]?.trim();

        await assertNotLocked(email);

        const user = await prisma.user.findUnique({
          where: { email },
          include: { tenant: true }
        });

        if (!user || !(await argon2.verify(user.passwordHash, credentials.password))) {
          await recordFailedAttempt(email, ip);
          throw new Error("Invalid email or password");
        }

        if (user.mfaEnabled) {
          if (!user.mfaSecret) {
            await recordFailedAttempt(email, ip);
            throw new Error("MFA is enabled but not configured for this account");
          }
          if (!credentials.otp) {
            throw new Error("MFA code required");
          }
          const isValidOtp = authenticator.check(credentials.otp, user.mfaSecret);
          if (!isValidOtp) {
            await recordFailedAttempt(email, ip);
            throw new Error("Invalid MFA code");
          }
        }

        await recordSuccessfulAttempt(email, ip);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.tenantId = (user as any).tenantId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).tenantId = token.tenantId;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
