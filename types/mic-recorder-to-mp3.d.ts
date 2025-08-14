declare module 'mic-recorder-to-mp3' {
  type BlobPartLike = BlobPart;

  interface MicRecorderOptions {
    bitRate?: number;
    encoderSampleRate?: number;
    sampleRate?: number;
  }

  class MicRecorder {
    constructor(options?: MicRecorderOptions);
    start(): Promise<void>;
    stop(): {
      getMp3(): Promise<[BlobPartLike[], Blob]>;
    };
  }

  export default MicRecorder;
}
