import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt", // use JWT for sessions
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // Add Google profile info to token
      if (account && profile) {
        token.id = profile.sub;
        token.email = profile.email;
        token.name = profile.name;
      }
      return token;
    },
    async session({ session, token }) {
      // Add custom token info to session object
      session.user = {
        name: token.name as string,
        email: token.email as string,
        image: token.picture as string,
      };
      return session;
    },
  },
});

export { handler as GET, handler as POST };