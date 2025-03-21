/**
 * Test script for validating GPT-4o transcription models with OpenAI API
 * 
 * Usage:
 * 1. Place an audio file named "test-audio.mp3" in the same directory
 * 2. Set your OpenAI API key in the OPENAI_API_KEY environment variable
 * 3. Run the script: node test-gpt4o-transcription.js
 */

const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

// Check for API key
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('\x1b[31m[ERROR]\x1b[0m OpenAI API key not found. Please set the OPENAI_API_KEY environment variable.');
  process.exit(1);
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: apiKey
});

// Audio file validation
const audioFileName = 'test-audio.mp3';
const audioFilePath = path.join(__dirname, audioFileName);

if (!fs.existsSync(audioFilePath)) {
  console.error(`\x1b[31m[ERROR]\x1b[0m Audio file not found at ${audioFilePath}`);
  console.log('Please place a test audio file named "test-audio.mp3" in the tests directory.');
  process.exit(1);
}

// Test models
const models = [
  'whisper-1',
  'gpt-4o-transcribe',
  'gpt-4o-mini-transcribe'
];

async function testTranscription() {
  console.log('\x1b[34m[INFO]\x1b[0m Testing OpenAI transcription models with file:', audioFileName);
  
  for (const model of models) {
    console.log(`\n\x1b[34m[INFO]\x1b[0m Testing model: ${model}`);
    
    try {
      console.log(`\x1b[33m[PROCESSING]\x1b[0m Transcribing with ${model}...`);
      
      const startTime = Date.now();
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(audioFilePath),
        model: model,
      });
      const endTime = Date.now();
      
      const processingTime = ((endTime - startTime) / 1000).toFixed(2);
      
      console.log(`\x1b[32m[SUCCESS]\x1b[0m Model ${model} worked! Processing time: ${processingTime} seconds`);
      console.log('Full transcription:');
      console.log(transcription.text);
      
    } catch (error) {
      console.log(`\x1b[31m[ERROR]\x1b[0m Model ${model} failed with error:`);
      if (error.response) {
        console.log(error.response.error || error.response.data || error.message);
      } else {
        console.log(error.message);
      }
    }
  }
}

// Create a simple download function to get a test audio file if needed
async function downloadTestAudio() {
  if (fs.existsSync(audioFilePath)) {
    const stats = fs.statSync(audioFilePath);
    if (stats.size > 0) {
      console.log('\x1b[34m[INFO]\x1b[0m Test audio file already exists, skipping download.');
      return;
    }
  }
  
  console.log('\x1b[34m[INFO]\x1b[0m Test audio file not found or empty. Please download a sample MP3 from a source like');
  console.log('https://file-examples.com/index.php/sample-audio-files/sample-mp3-download/');
  console.log('and save it as "test-audio.mp3" in the tests directory.');
}

// Run the tests
async function run() {
  try {
    await downloadTestAudio();
    if (fs.existsSync(audioFilePath)) {
      await testTranscription();
    }
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m An unexpected error occurred:', error);
  }
}

run(); 