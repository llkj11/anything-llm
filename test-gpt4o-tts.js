process.env.TTS_PROVIDER = 'gpt4o-tts'; process.env.TTS_GPT4O_KEY = 'sk-test'; const { getTTSProvider } = require('./server/utils/TextToSpeech'); const provider = getTTSProvider(); console.log('Provider type:', provider.constructor.name);
