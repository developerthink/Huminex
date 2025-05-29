import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import User from "./models/user/user";
import connectDB from "./config/db";
import { RoleType } from "./types/models/user/user";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";

// Function to find or create user for OAuth providers
const findOrCreateOAuthUser = async ({
  email,
  image,
  name,
}: {
  email: string;
  image: string;
  name?: string;
}) => {
  await connectDB();

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return existingUser;
  }

  // Create new user for OAuth
  const newUser = await User.create({
    name: name || email.split("@")[0],
    email,
    image,
  });

  return newUser;
};

export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
  providers: [
    // Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    // GitHub OAuth
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
    // Credentials (Email/Password)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          await connectDB();

          if (!credentials?.email || !credentials?.password) {
            throw new Error("Please provide both email and password");
          }

          const { email, password } = credentials;

          // Find user by email
          const user = await User.findOne({ email }).select("+password");

          // If no user found, throw error
          if (!user) {
            throw new Error(
              "No account found with this email. Please register first."
            );
          }
          console.log(password);
          // Verify password using the model's method
          const isPasswordValid = await user.comparePassword(
            password as string
          );

          if (!isPasswordValid) {
            throw new Error("Incorrect password. Please try again.");
          }

          // Return user data without password
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          // Return null if user cannot be authenticated
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // Handle OAuth sign in
    async signIn({ user, account, profile }) {
      // Skip for credentials provider
      if (account?.provider === "credentials") {
        return true;
      }

      // Validate required fields for OAuth
      if (!user?.email) {
        throw new Error("Email is required");
      }

      try {
        // Handle OAuth user creation/retrieval
        const userData = await findOrCreateOAuthUser({
          email: user.email,
          image: user.image || "",
          name: (user.name as string) || (profile?.name as string),
        });

        // Update user object with database ID and role
        user.id = userData._id.toString();
        user.role = userData.role;

        return true;
      } catch (error) {
        console.error("OAuth sign in error:", error);
        throw new Error("Failed to sign in with OAuth. Please try again.");
      }
    },
    // JWT callback
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      if (trigger === "update") {
        token.role = session.user.role;
      }
      return token;
    },
    // Session callback
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: token.role as RoleType,
        },
      };
    },
  },
  // Custom pages
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  // Session configuration
  session: {
    strategy: "jwt",
  },
  // Secret for JWT
  secret: process.env.NEXTAUTH_SECRET,
});
