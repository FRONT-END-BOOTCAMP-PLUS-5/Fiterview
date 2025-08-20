import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';
export interface ISessionUser {
  id: string;
  username?: string;
  email?: string;
  nickname?: string;
}

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user?: ISessionUser & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    username?: string;
    email?: string;
    nickname?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    username?: string;
    email?: string;
    nickname?: string;
  }
}
