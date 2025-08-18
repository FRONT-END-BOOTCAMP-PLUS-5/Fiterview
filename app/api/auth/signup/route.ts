import { NextRequest, NextResponse } from 'next/server';
import { CreateUserUseCase } from '@/backend/application/auth/usecases/CreateUserUseCase';
import { UserRepositoryImpl } from '@/backend/infrastructure/repositories/UserRepositoryImpl';

export async function POST(request: NextRequest) {
  try {
    console.log('📝 회원가입 API 호출');

    // 1. JSON 데이터 파싱
    const body = await request.json();
    const { username, email, password, nickname } = body;

    console.log('📋 파싱된 데이터:', {
      username,
      email,
      password: '***',
      nickname,
    });

    // 2. 유효성 검사
    if (!username || !email || !password || !nickname) {
      return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 });
    }

    // 3. UseCase 실행
    const userRepository = new UserRepositoryImpl();
    const usecase = new CreateUserUseCase(userRepository);

    const result = await usecase.execute({
      username,
      email,
      password,
      nickname,
    });

    // 4. 응답 반환
    if (result.success) {
      console.log('✅ 회원가입 성공');
      return NextResponse.json(result, { status: 201 });
    } else {
      console.log('❌ 회원가입 실패:', result.message);
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
  } catch (error) {
    console.error('💥 회원가입 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
