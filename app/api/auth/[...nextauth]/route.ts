import { authConfig } from "@/lib/auth";
import NextAuth from "next-auth";

// @ts-expect-error to be taken care of
const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };
// @ts-expect-error to be taken care of
export const { auth, signIn, signOut } = NextAuth(authConfig);
