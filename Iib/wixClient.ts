// lib/wixClient.ts
import { createClient, OAuthStrategy } from "@wix/sdk";
import { items } from "@wix/data";

export const wixClient = createClient({
  auth: OAuthStrategy({
    clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID!, // set this in .env.local
  }),
  modules: { items },
});