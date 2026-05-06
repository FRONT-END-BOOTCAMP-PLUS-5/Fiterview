import { TTSRequest } from '@/backend/domain/dtos/TTSRequest';
import { TTSResponse } from '@/backend/domain/dtos/TTSResponse';
import { TtsAI } from '@/backend/domain/AI/TtsAI';
import azureTtsClient from '@/utils/AIs/AzureAI';

export class AzureTtsAI implements TtsAI {
  async synthesizeSpeech(speechRequest: TTSRequest): Promise<TTSResponse> {
    if (!azureTtsClient.key || !azureTtsClient.endpoint) {
      throw new Error(
        'Azure TTS 환경변수(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION)가 설정되지 않았습니다.'
      );
    }

    const voiceName = speechRequest.voice || 'ko-KR-SunHiNeural';

    const escapeXml = (text: string) =>
      text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

    const ssml = `<?xml version="1.0" encoding="utf-8"?><speak version='1.0' xml:lang='ko-KR'><voice name='${voiceName}'>${escapeXml(speechRequest.text)}</voice></speak>`;

    const res = await fetch(azureTtsClient.endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': azureTtsClient.key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
      },
      body: ssml,
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Azure TTS 요청 실패 (${res.status}): ${body}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    return { audio: Buffer.from(arrayBuffer) };
  }
}
