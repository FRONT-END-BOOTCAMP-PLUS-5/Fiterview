//WebAudio로 RMS 에너지 계산
export function getEnergy(analyser: AnalyserNode | null, timeBuf: Uint8Array | null): number {
  if (!analyser || !timeBuf) return 0;
  const audioBuffer = timeBuf.buffer as ArrayBuffer;
  const compatibleArray = new Uint8Array(audioBuffer);
  analyser.getByteTimeDomainData(compatibleArray);
  timeBuf.set(compatibleArray);
  let sum = 0;
  for (let i = 0; i < timeBuf.length; i++) {
    const v = (timeBuf[i] - 128) / 128;
    sum += v * v;
  }
  const rms = Math.sqrt(sum / timeBuf.length);
  return rms;
}
