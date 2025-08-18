import { User, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { LoginUsecase } from '@/backend/application/auth/usecases/LoginUsecase';
import { LoginRequestDto } from '@/backend/domain/dtos/LoginRequestDto';
import { UserRepositoryImpl } from '@/backend/infrastructure/repositories/UserRepositoryImpl';

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
              id: result.user.id.toString(), // number를 string으로 변환
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

    async session(params: { session: Session; token: JWT }) {
      const { session, token } = params;
      if (session.user && token.id) {
        session.user.id = token.id;
        session.user.username = token.username!;
        session.user.email = token.email!;
        session.user.nickname = token.nickname!;
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
