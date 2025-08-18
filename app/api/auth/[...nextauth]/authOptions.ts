import { Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { LoginUsecase } from '@/backend/application/auth/usecases/LoginUsecase';
import { LoginRequestDto } from '@/backend/application/users/dtos/LoginRequestDto';
import { UserRepositoryImpl } from '@/backend/infrastructure/repositories/UserRepositoryImpl';

interface ISessionUser {
  id?: number;
  username?: string;
  email?: string;
  nickname?: string;
}

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { username, password } = credentials ?? {};
        if (!username || !password) return null;

        try {
          const loginUsecase = new LoginUsecase(new UserRepositoryImpl());
          const loginRequestDto: LoginRequestDto = { username, password };

          const result = await loginUsecase.execute(loginRequestDto);

          if (result.success && result.user) {
            return {
              id: result.user.id.toString(),
              username: result.user.username,
              email: result.user.email,
              nickname: result.user.nickname,
            };
          }

          return null;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.nickname = user.nickname;
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user && token.id) {
        session.user.id = token.id;
        session.user.username = token.username as string;
        session.user.email = token.email as string;
        session.user.nickname = token.nickname as string;
      }

      return session;
    },

    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/login',
    signUp: '/signup',
    error: '/login',
  },
};
