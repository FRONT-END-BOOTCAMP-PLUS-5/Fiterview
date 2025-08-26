import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { UpdateUserUseCase } from '@/backend/application/users/usecases/UpdateUserUseCase';
import { UserRepositoryImpl } from '@/backend/infrastructure/repositories/UserRepositoryImpl';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { email, nickname, password } = body as {
      email?: string;
      nickname?: string;
      password?: string;
    };

    if (!email && !nickname && !password) {
      return NextResponse.json({ error: '수정할 항목이 없습니다.' }, { status: 400 });
    }

    const usecase = new UpdateUserUseCase(new UserRepositoryImpl());
    const result = await usecase.execute({
      id: Number(session.user.id),
      email: email || undefined,
      password: password || undefined,
      nickname: nickname || undefined,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
