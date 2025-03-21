/**
 * Script to download a sample audio file for testing
 * 
 * This script downloads a small sample audio file for use with
 * the transcription test script.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// The URL to a small sample MP3 file
// This is a public domain audio file from the Free Music Archive
const SAMPLE_AUDIO_URL = 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3';
const OUTPUT_FILE = path.join(__dirname, 'test-audio.mp3');

console.log('Downloading sample audio file for testing...');
console.log(`Source: ${SAMPLE_AUDIO_URL}`);
console.log(`Destination: ${OUTPUT_FILE}`);
console.log('');

// Check if file already exists
if (fs.existsSync(OUTPUT_FILE)) {
  const stats = fs.statSync(OUTPUT_FILE);
  if (stats.size > 0) {
    console.log('Test audio file already exists. Delete it first if you want to download a new one.');
    process.exit(0);
  }
}

// Create a file stream to save the audio
const fileStream = fs.createWriteStream(OUTPUT_FILE);

// Download the file
https.get(SAMPLE_AUDIO_URL, (response) => {
  // Check if the request was successful
  if (response.statusCode !== 200) {
    console.error(`Failed to download file. Status code: ${response.statusCode}`);
    fileStream.close();
    fs.unlinkSync(OUTPUT_FILE);
    process.exit(1);
  }

  // Log the content length if available
  const contentLength = response.headers['content-length'];
  if (contentLength) {
    console.log(`File size: ${Math.round(contentLength / 1024)} KB`);
  }

  // Pipe the response to the file
  response.pipe(fileStream);

  // Handle download completion
  fileStream.on('finish', () => {
    fileStream.close();
    console.log('Download complete!');
    console.log('You can now run the transcription test script.');
  });
}).on('error', (err) => {
  console.error(`Error downloading file: ${err.message}`);
  fileStream.close();
  fs.unlinkSync(OUTPUT_FILE);
  process.exit(1);
}); 