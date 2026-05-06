const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION;

const azureTtsClient = {
  key: AZURE_SPEECH_KEY,
  region: AZURE_SPEECH_REGION,
  endpoint: AZURE_SPEECH_REGION
    ? `https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`
    : '',
};

export default azureTtsClient;
