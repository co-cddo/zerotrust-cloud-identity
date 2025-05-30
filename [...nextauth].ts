import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { Issuer } from 'openid-client';


export const authOptions: NextAuthOptions = {
  secret: process.env.NEXT_AUTH_SECRET,
  pages: {
    signIn: "/",
  },
  providers: [
    Credentials({
      // @ts-ignore
      authorize(credentials) {
        const { password, email }: any = credentials;
        if (
          password === process.env.CREDENTIALS_PASSWORD &&
          email === process.env.CREDENTIALS_EMAIL
        ) {
          return {
            email,
          };
        }

        return null;
      },
    }),
    {
      id: "appid",
      name: "appid",
      type: "oauth",
      wellKnown: process.env.APPID_DISCOVERY_ENDPOINT,
      clientId: process.env.APPID_CLIENT_ID,
      clientSecret: process.env.APPID_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
        };
      },
    },
    {
      id: "isv",
      name: "isv",
      type: "oauth",
      wellKnown: process.env.VERIFY_WELLKNOWN,
      clientId: process.env.VERIFY_CLIENT_ID,
      clientSecret: process.env.VERIFY_CLIENT_SECRET,
      authorization: {
      params: {
          scope: 'openid profile email',
          code_challenge_method: 'S256',
        },
      },
      profile(profile) {
        console.log("Returned OIDC profile:", profile);
        return {
          id: profile.sub,
          email: profile.email,
        };
      },
    },
  ],
};

export default NextAuth(authOptions);
