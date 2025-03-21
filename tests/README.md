# GPT-4o Transcription Models Test

This directory contains scripts to test the new OpenAI GPT-4o transcription models that are supported in AnythingLLM.

## Available Models

- `whisper-1` (original Whisper model)
- `gpt-4o-transcribe` (new GPT-4o transcription model)
- `gpt-4o-mini-transcribe` (smaller, more efficient GPT-4o transcription model)

## Prerequisites

1. Node.js installed
2. An OpenAI API key with access to GPT-4o models
3. A test audio file in MP3 format (the scripts will attempt to download a sample file automatically)

## Running the Test

### Windows

1. Double-click the `run-transcription-test.bat` file
2. When prompted, enter your OpenAI API key
3. The script will automatically download a test audio file if none exists

### macOS/Linux

1. Make the script executable: `chmod +x run-transcription-test.sh`
2. Run the script: `./run-transcription-test.sh`
3. When prompted, enter your OpenAI API key
4. The script will automatically download a test audio file if none exists

## Manual Testing

You can also run the test script directly:

```bash
# Download a test audio file if needed
node download-test-audio.js

# Set your API key
export OPENAI_API_KEY=your_api_key_here

# Run the test
node test-gpt4o-transcription.js
```

## Understanding the Results

The test will output:
- Success or failure status for each model
- Processing time for each transcription
- The first 150 characters of each transcription
- Any error messages if a model fails

## Troubleshooting

If you encounter the "Failed to save preferences: gpt-4o-mini-transcribe is not a valid Whisper model selection" error in AnythingLLM:

1. Edit the `server/utils/helpers/updateENV.js` file
2. Look for the `validLocalWhisper` function (around line 710)
3. Make sure it has the new models in its `validModels` array:
   ```javascript
   const validModels = [
     // Local Whisper models
     "Xenova/whisper-small", 
     "Xenova/whisper-large",
     // OpenAI models
     "whisper-1",
     "gpt-4o-transcribe",
     "gpt-4o-mini-transcribe"
   ];
   ```
4. Also ensure the `WhisperModelPref` entry in the `KEY_MAPPING` object includes this validation function:
   ```javascript
   WhisperModelPref: {
     envKey: "WHISPER_MODEL_PREF",
     checks: [validLocalWhisper], // Make sure this function is included
     postUpdate: [],
   },
   ```
5. Restart the AnythingLLM server 