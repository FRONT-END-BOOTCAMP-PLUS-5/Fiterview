export class FileProcessingService {
  private static readonly MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
  private static readonly SUPPORTED_AUDIO_TYPES = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/webm',
    'audio/ogg',
    'audio/m4a',
    'audio/aac',
  ];

  /**
   * 파일 크기 검증
   */
  static validateFileSize(fileSize: number): {
    isValid: boolean;
    error?: string;
    fileSizeMB: string;
  } {
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);

    if (fileSize > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `파일 크기가 너무 큽니다. (${fileSizeMB}MB > 25MB)`,
        fileSizeMB,
      };
    }

    return {
      isValid: true,
      fileSizeMB,
    };
  }

  /**
   * 오디오 파일 타입 검증
   */
  static validateAudioFileType(mimeType: string): boolean {
    return this.SUPPORTED_AUDIO_TYPES.includes(mimeType);
  }

  /**
   * 파일을 Buffer로 변환
   */
  static async fileToBuffer(file: File): Promise<Buffer> {
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * base64 문자열을 Buffer로 변환
   */
  static base64ToBuffer(base64String: string): Buffer {
    return Buffer.from(base64String, 'base64');
  }

  /**
   * Buffer를 File 객체로 변환
   */
  static bufferToFile(buffer: Buffer, fileName: string, mimeType: string): File {
    return new File([buffer], fileName, { type: mimeType });
  }
}
