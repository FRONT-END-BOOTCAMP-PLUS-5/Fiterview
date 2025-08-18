import { Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { LoginUsecase } from '@/backend/application/auth/usecases/LoginUsecase';
import { LoginRequestDto } from '@/backend/application/users/dtos/LoginRequestDto';
import { UserRepositoryImpl } from '@/backend/infrastructure/repositories/UserRepositoryImpl';
import { CreateUserUseCase } from '@/backend/application/auth/usecases/CreateUserUseCase';
import { SignUpRequestDto } from '@/backend/application/users/dtos/SignUpRequestDto';

interface ISessionUser {
  id?: number;
  username?: string;
  email?: string;
  nickname?: string;
}

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
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
    async signIn({
      user,
      account,
      profile,
    }: {
      user: User;
      account: { provider: string } | null;
      profile?: any;
    }) {
      // Google OAuth로 로그인한 경우 사용자 정보 처리
      if (account?.provider === 'google' && profile) {
        try {
          const userRepository = new UserRepositoryImpl();

          // 이메일로 기존 사용자 확인
          const existingUser = await userRepository.findUserByEmail(profile.email);

          if (existingUser) {
            // 기존 사용자가 있으면 연결
            user.id = existingUser.id!.toString();
            user.username = existingUser.username;
            user.nickname = existingUser.nickname;
            return true;
          } else {
            // 새 사용자 생성
            const createUserUseCase = new CreateUserUseCase(userRepository);

            // 사용자명 생성 (이메일에서 추출하고 충돌 시 숫자 추가)
            let username = profile.email.split('@')[0];
            let counter = 1;
            let finalUsername = username;

            // 사용자명 충돌 확인 및 해결
            while (await userRepository.findUserByUsername(finalUsername)) {
              finalUsername = `${username}${counter}`;
              counter++;
            }

            // 랜덤 비밀번호 생성 (Google OAuth 사용자는 비밀번호를 사용하지 않음)
            const randomPassword =
              Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);

            const signUpRequestDto: SignUpRequestDto = {
              username: finalUsername,
              email: profile.email,
              nickname: profile.name || profile.email.split('@')[0],
              password: randomPassword,
            };

            const result = await createUserUseCase.execute(signUpRequestDto);

            if (result.success && result.user) {
              user.id = result.user.id!.toString();
              user.username = result.user.username;
              user.nickname = result.user.nickname;
              return true;
            }
          }
        } catch (error) {
          console.error('Google OAuth 사용자 처리 중 오류:', error);
          return false;
        }
      }
      return true;
    },
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
