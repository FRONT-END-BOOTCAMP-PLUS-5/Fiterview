import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

interface ISessionUser {
  id?: number;
  username?: string;
  email?: string;
  nickname?: string;
}

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user?: ISessionUser & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id?: number;
    username?: string;
    email?: string;
    nickname?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id?: number;
    username?: string;
    email?: string;
    nickname?: string;
  }
}
