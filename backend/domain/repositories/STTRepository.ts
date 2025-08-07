import { STTRequest } from '../dtos/STTRequest';
import { STTResponse } from '../dtos/STTResponse';

export interface STTRepository {
  transcribe(request: STTRequest): Promise<STTResponse>;
}
