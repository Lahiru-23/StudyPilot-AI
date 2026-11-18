
import 'dotenv/config';
import { generateGeminiResponse } from '../services/gemini.service.js';
async function testGemini() {
  try {
    console.log('Testing Gemini API...');

    const response = await generateGeminiResponse(
      'You are StudyPilot AI. Reply with: StudyPilot AI is connected successfully!'
    );

    console.log('Gemini response:', response);
  } catch (error) {
    console.error('Gemini test failed:', error);
  }
}

testGemini();
