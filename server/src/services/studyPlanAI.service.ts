
import { generateGeminiResponse } from './gemini.service.js';

interface StudyScheduleItem {
  subjectName: string;
  subjectDifficulty: string;
  activity: string;
  durationMinutes: number;
  startTime: string;
  endTime: string;
}

export async function generateStudyPlanAdvice(
  schedule: StudyScheduleItem[]
): Promise<string> {
  const scheduleSummary = schedule.slice(0, 20).map((item) => ({
    subject: item.subjectName,
    difficulty: item.subjectDifficulty,
    activity: item.activity,
    duration: item.durationMinutes,
    time: `${item.startTime} - ${item.endTime}`
  }));

  const prompt = `
You are StudyPilot AI, an intelligent academic study coach.

Analyze the following student's study schedule.

Study schedule:
${JSON.stringify(scheduleSummary, null, 2)}

Provide:
1. A short overall evaluation of the schedule.
2. Three practical study recommendations.
3. Advice on managing difficult subjects.
4. One motivational closing sentence.

Rules:
- Use simple, friendly English.
- Give practical and realistic advice.
- Do not invent subjects or activities.
- Keep the response under 180 words.
`;

  return generateGeminiResponse(prompt);
}
