/**
 * Audio Format Converter for OpenAI Transcription
 * 
 * This script helps convert audio files to formats compatible with
 * OpenAI's transcription models, particularly GPT-4o transcribe models.
 * 
 * Note: This script requires ffmpeg to be installed and in your PATH.
 * Windows: https://ffmpeg.org/download.html
 * Mac: brew install ffmpeg
 * Linux: apt-get install ffmpeg
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Check if ffmpeg is installed
const checkFfmpeg = () => {
  return new Promise((resolve, reject) => {
    exec('ffmpeg -version', (error) => {
      if (error) {
        console.error('\x1b[31m[ERROR]\x1b[0m ffmpeg is not installed or not in your PATH.');
        console.log('Please install ffmpeg:');
        console.log('- Windows: https://ffmpeg.org/download.html');
        console.log('- Mac: brew install ffmpeg');
        console.log('- Linux: apt-get install ffmpeg');
        reject(new Error('ffmpeg not found'));
      } else {
        resolve();
      }
    });
  });
};

// Convert audio file to MP3 format
const convertToMp3 = (inputFile, outputFile) => {
  return new Promise((resolve, reject) => {
    console.log(`\x1b[34m[INFO]\x1b[0m Converting ${inputFile} to MP3 format...`);
    
    // Use ffmpeg to convert the file
    exec(`ffmpeg -i "${inputFile}" -vn -ar 44100 -ac 2 -b:a 192k "${outputFile}" -y`, (error, stdout, stderr) => {
      if (error) {
        console.error(`\x1b[31m[ERROR]\x1b[0m Conversion failed: ${error.message}`);
        reject(error);
        return;
      }
      
      console.log(`\x1b[32m[SUCCESS]\x1b[0m Converted to ${outputFile}`);
      resolve();
    });
  });
};

// Main function
const main = async () => {
  try {
    // Check if ffmpeg is installed
    await checkFfmpeg();
    
    // Ask for input file
    rl.question('Enter the path to your audio file: ', async (inputFile) => {
      // Check if file exists
      if (!fs.existsSync(inputFile)) {
        console.error(`\x1b[31m[ERROR]\x1b[0m File not found: ${inputFile}`);
        rl.close();
        return;
      }
      
      // Generate output filename
      const inputExt = path.extname(inputFile);
      const basename = path.basename(inputFile, inputExt);
      const outputFile = path.join(path.dirname(inputFile), `${basename}_converted.mp3`);
      
      try {
        // Convert the file
        await convertToMp3(inputFile, outputFile);
        
        console.log('\x1b[32m[SUCCESS]\x1b[0m File converted successfully!');
        console.log(`Original file: ${inputFile}`);
        console.log(`Converted file: ${outputFile}`);
        console.log('\nYou can now use this file with the GPT-4o transcription models.');
        
        rl.close();
      } catch (error) {
        console.error('\x1b[31m[ERROR]\x1b[0m Conversion failed.', error);
        rl.close();
      }
    });
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m', error.message);
    rl.close();
  }
};

// Run the program
main(); 