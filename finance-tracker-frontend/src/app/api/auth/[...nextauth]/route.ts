import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // AzureADProvider({
    //   clientId: process.env.AZURE_AD_CLIENT_ID!,
    //   clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
    //   tenantId: process.env.AZURE_AD_TENANT_ID,
    // }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("SignIn callback - User:", user);
      console.log("SignIn callback - Account:", account);
      console.log("SignIn callback - Profile:", profile);
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log("Redirect callback - URL:", url, "Base URL:", baseUrl);
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async jwt({ token, account, profile }) {
      console.log("JWT callback - Token:", token);
      console.log("JWT callback - Account:", account);
      console.log("JWT callback - Profile:", profile);
      
      if (account && profile) {
        token.id = profile.sub;
        token.email = profile.email;
        token.name = profile.name;
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback - Session:", session);
      console.log("Session callback - Token:", token);
      
      session.user = {
        name: token.name as string,
        email: token.email as string,
        image: token.picture as string,
      };
    //   session.accessToken = token.accessToken as string;
    //   session.provider = token.provider as string;
      
      return session;
    },
  },
  debug: true, // Enable debug mode for more detailed logs
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
});

export { handler as GET, handler as POST };