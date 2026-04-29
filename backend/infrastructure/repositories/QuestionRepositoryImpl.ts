import { QuestionRepository } from '@/backend/domain/repositories/QuestionRepository';
import { Question, AudioFileInfo } from '@/backend/domain/entities/Question';
import { QuestionsResponse } from '@/backend/domain/dtos/QuestionsResponse';
import { QuestionsRequest } from '@/backend/domain/dtos/QuestionsRequest';
import { QuestionGenerator } from '@/backend/infrastructure/AI/GeminiLlmAI';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import prisma from '@/utils/prisma';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { r2Client } from '@/lib/r2/client';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class QuestionRepositoryImpl implements QuestionRepository {
  private generator: QuestionGenerator;
  private static readonly AUDIO_BASE_PATH = 'public/assets/audios';

  constructor() {
    this.generator = new QuestionGenerator();
  }

  // 질문 생성
  async generateQuestions(files: QuestionsRequest[]) {
    return this.generator.generate(files);
  }

  // 질문 저장
  async saveQuestions(
    generatedQuestions: QuestionsResponse[],
    reportId: number
  ): Promise<Question[]> {
    //order순으로 정렬
    const sortedQuestions = [...generatedQuestions].sort((a, b) => a.order - b.order);

    const saved = await prisma.$transaction(
      sortedQuestions.map((gen) =>
        prisma.question.create({
          data: {
            question: gen.question,
            order: gen.order,
            reportId,
          },
        })
      )
    );

    // 저장 결과에 정렬된 order를 매칭하여 반환
    return saved.map((q, idx) => ({
      id: q.id,
      order: (q as any).order ?? sortedQuestions[idx].order,
      question: q.question,
      sampleAnswer: q.sampleAnswer || undefined,
      userAnswer: q.userAnswer || undefined,
      recording: q.recording || undefined,
      reportId: q.reportId,
    }));
  }

  // questions테이블의 질문만 조회(TTS 요청 시 사용)
  async getQuestionsByReportId(reportId: number): Promise<Question[]> {
    try {
      const questions = await prisma.question.findMany({
        where: {
          reportId: reportId,
        },
        select: {
          id: true,
          order: true,
          question: true,
          reportId: true,
        },
        orderBy: {
          order: 'asc',
        },
        take: 10, // 최대 10개 질문 조회
      });

      return questions.map((q) => ({
        id: q.id,
        order: q.order || 0, // falsy
        question: q.question,
        reportId: q.reportId,
      }));
    } catch (error) {
      console.error('질문 조회 중 오류 발생:', error);
      throw new Error(
        `질문 조회에 실패했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // questions테이블 조회(report 조회 시 사용)
  async findAllByReportId(reportId: number): Promise<Question[]> {
    try {
      const questions = await prisma.question.findMany({
        where: { reportId },
        orderBy: { order: 'asc' },
      });

      return questions.map((q) => ({
        id: q.id,
        order: q.order || 0,
        question: q.question,
        reportId: q.reportId,
        sampleAnswer: q.sampleAnswer || undefined,
        userAnswer: q.userAnswer || undefined,
        recording: q.recording || undefined,
      }));
    } catch (error) {
      console.error('질문 조회 오류:', error);
      throw new Error('질문을 조회하는 중 오류가 발생했습니다.');
    }
  }

  // audio 관련 메서드
  async getAudioFileByQuestion(reportId: number, questionOrder: number): Promise<AudioFileInfo> {
    try {
      // 1. DB에서 해당 질문의 녹음 파일명 조회
      const question = await prisma.question.findFirst({
        where: {
          reportId: reportId,
          order: questionOrder,
        },
        select: {
          recording: true,
        },
      });

      if (!question || !question.recording) {
        throw new Error(`질문 ${questionOrder}번의 녹음 파일을 데이터베이스에서 찾을 수 없습니다.`);
      }

      // 2. R2 키 구성
      const fileKey = `${reportId}/${question.recording}`;

      // 3. R2 접근 명령 생성
      const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: fileKey,
      });

      // 4. 임시 URL 생성 (유효기간 1시간)
      const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

      // 5. MIME 타입 추정
      const mimeType = this.getMimeTypeFromFileName(question.recording);

      return { filePath: signedUrl };
    } catch (error) {
      console.error('음성 파일 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 파일명에서 MIME 타입 추정
   */
  private getMimeTypeFromFileName(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();

    const mimeTypes: Record<string, string> = {
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      webm: 'audio/webm',
      ogg: 'audio/ogg',
      m4a: 'audio/mp4',
      aac: 'audio/aac',
    };

    return mimeTypes[extension || ''] || 'audio/mpeg';
  }

  // 녹음본 생성
  async generateRecording(reportId: number, order: number, fileName: string): Promise<Question> {
    try {
      const target = await prisma.question.findFirst({
        where: { reportId, order },
        select: { id: true },
      });
      if (!target)
        throw new Error(`해당 reportId(${reportId}), order(${order}) 질문을 찾을 수 없습니다.`);

      const updated = await prisma.question.update({
        where: { id: target.id },
        data: { recording: fileName },
      });
      return updated as Question;
    } catch (e) {
      console.error('녹음본 파일 경로 업데이트 실패:', e);
      throw new Error('녹음본 파일 경로 업데이트에 실패했습니다.');
    }
  }
}
