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
    async signIn() {
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/login/callback`;
      }
      return baseUrl;
    },
    async jwt({ token, account, profile }) {
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
      session.user = {
        name: token.name as string,
        email: token.email as string,
        image: token.picture as string,
      };
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