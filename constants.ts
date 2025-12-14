import { Subject } from './types';

export const SYSTEM_INSTRUCTION = `
You are an expert, friendly, and encouraging AI tutor specifically for Class 10 students of the Rajasthan Board of Secondary Education (RBSE).
Your name is "Saathi" (Friend).

**Guidelines:**
1. **Curriculum:** Strictly adhere to the latest NCERT/RBSE syllabus for Class 10.
2. **Language:** Communicate primarily in a mix of Hindi and English (Hinglish) to make it easy for students to understand, unless they ask specifically in English.
   - Example: "Newton's First Law (Law of Inertia) kehta hai ki agar koi object rest par hai..."
3. **Tone:** Be patient, motivating, and educational. Use emojis occasionally to keep it engaging.
4. **Structure:** Break down complex answers into bullet points.
5. **Formulas:** When explaining Math or Science, clearly state formulas.
6. **Interaction:** If a student is stuck, ask guiding questions instead of just giving the answer immediately.

You cover these subjects: Science, Mathematics, Social Science, Hindi, English, and Sanskrit.
`;

export const SUBJECTS: Subject[] = [
  {
    id: 'science',
    name: 'Science',
    hindiName: 'विज्ञान',
    icon: '🧬',
    color: 'bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-200',
    description: 'Physics, Chemistry, Biology'
  },
  {
    id: 'math',
    name: 'Mathematics',
    hindiName: 'गणित',
    icon: '📐',
    color: 'bg-indigo-100 text-indigo-600 border-indigo-200 hover:bg-indigo-200',
    description: 'Algebra, Geometry, Stats'
  },
  {
    id: 'social',
    name: 'Social Science',
    hindiName: 'सामाजिक विज्ञान',
    icon: '🌍',
    color: 'bg-amber-100 text-amber-600 border-amber-200 hover:bg-amber-200',
    description: 'History, Geography, Civics'
  },
  {
    id: 'english',
    name: 'English',
    hindiName: 'अंग्रेजी',
    icon: '📖',
    color: 'bg-emerald-100 text-emerald-600 border-emerald-200 hover:bg-emerald-200',
    description: 'Grammar, Literature'
  },
  {
    id: 'hindi',
    name: 'Hindi',
    hindiName: 'हिंदी',
    icon: '✍️',
    color: 'bg-rose-100 text-rose-600 border-rose-200 hover:bg-rose-200',
    description: 'Vyakaran, Kshitij'
  },
  {
    id: 'sanskrit',
    name: 'Sanskrit',
    hindiName: 'संस्कृत',
    icon: '🕉️',
    color: 'bg-purple-100 text-purple-600 border-purple-200 hover:bg-purple-200',
    description: 'Shemushi, Grammar'
  }
];