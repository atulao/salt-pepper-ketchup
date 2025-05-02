import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { prisma } from '../../../lib/prisma';

// Configure NextAuth options
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID || "",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
      authorization: {
        params: {
          // Updated scopes for LinkedIn
          scope: "r_emailaddress r_liteprofile"
        }
      },
      // Profile handler to standardize LinkedIn profile data
      profile(profile, tokens) {
        return {
          id: profile.id,
          name: profile.localizedFirstName + " " + profile.localizedLastName,
          email: profile.email || profile.emailAddress, // LinkedIn API may return email in different fields
          image: profile.profilePicture?.displayImage?.elements?.[0]?.identifiers?.[0]?.identifier || null
        };
      }
    }),
    // Add credentials provider for email/password login
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // This is where you would validate the user credentials
        // For now, we'll use a simple validation
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            throw new Error("No user found with this email");
          }

          // In a real app, you would verify the password hash here
          // For demonstration, we're just checking if it exists
          // This is NOT secure for production!
          const isPasswordValid = user.password === credentials.password;

          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
    newUser: "/onboarding/step1",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        // Log successful sign-in for debugging
        console.log(`User signed in with ${account.provider}`, { 
          userId: user.id,
          provider: account.provider
        });
        
        return {
          ...token,
          provider: account.provider,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          userId: user.id,
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string;
        session.user.provider = token.provider as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Log redirect attempts for debugging
      console.log("NextAuth redirect:", { url, baseUrl });
      
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    // Add error handling
    async signIn({ user, account, profile, email, credentials }) {
      // Log sign-in attempts for debugging
      console.log("Sign-in attempt:", { 
        provider: account?.provider,
        email: user?.email || email,
        success: !!user
      });
      
      if (account?.provider === "linkedin" && !user?.email) {
        console.error("LinkedIn sign-in failed: No email found in profile", profile);
        return false;
      }
      
      return true;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  logger: {
    error: (code, metadata) => {
      console.error(`NextAuth error: ${code}`, metadata);
    },
    warn: (code) => {
      console.warn(`NextAuth warning: ${code}`);
    },
    debug: (code, metadata) => {
      console.log(`NextAuth debug: ${code}`, metadata);
    },
  }
};

// Auth handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 