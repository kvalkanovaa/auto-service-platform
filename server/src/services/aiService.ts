import { GoogleGenerativeAI } from '@google/generative-ai';
import { IVehicle } from '../models/Vehicle';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface AiAnalysisResult {
  summary: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  suggestedCategories: string[];
  questions: string[];
  briefForShop: string;
}

export const analyzeSymptoms = async (
  vehicle: IVehicle,
  description: string
): Promise<AiAnalysisResult> => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const prompt = `Ти си експерт автомобилен диагностик. Анализирай следния проблем с автомобила и дай структурирана оценка.

Информация за автомобила:
- Марка и модел: ${vehicle.brand} ${vehicle.model}
- Година: ${vehicle.year}
- Двигател: ${vehicle.engine}
- Гориво: ${vehicle.fuelType}
- Скоростна кутия: ${vehicle.transmission}
${vehicle.mileage ? `- Пробег: ${vehicle.mileage} км` : ''}

Описание на проблема:
${description}

Отговори с JSON обект в този точен формат:
{
  "summary": "Кратко обобщение на вероятния проблем (2-3 изречения)",
  "urgency": "low|medium|high|critical",
  "suggestedCategories": ["категория1", "категория2"],
  "questions": ["въпрос1", "въпрос2", "въпрос3"],
  "briefForShop": "Технически бриф за механика (на английски)"
}

Налични категории: engine, diagnostics, brakes, suspension, tires, electrical, air-conditioning, bodywork, transmission, oil-service

Нива на спешност:
- low: може да изчака планирана поддръжка
- medium: трябва да се адресира в рамките на 1-2 седмици
- high: трябва да се адресира в рамките на няколко дни
- critical: изисква незабавно внимание, риск за безопасността

Отговори на български, освен briefForShop.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return JSON.parse(text) as AiAnalysisResult;
};

// One follow-up is allowed per report (controlled via aiFollowupAnswers presence in the model).
// To expand to a subscription model: add a `aiFollowupCount` field to ProblemReport,
// check against the user's plan limit (free: 1, pro: unlimited) before calling this function,
// and return 402 Payment Required when the limit is exceeded.
export const refineAnalysis = async (
  vehicle: IVehicle,
  description: string,
  questions: string[],
  answers: string[]
): Promise<AiAnalysisResult> => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const qaSection = questions
    .map((q, i) => `Въпрос: ${q}\nОтговор: ${answers[i]?.trim() || '(не е посочено)'}`)
    .join('\n\n');

  const prompt = `Ти си експерт автомобилен диагностик. Вече анализира проблем с автомобил и зададе уточняващи въпроси. Потребителят отговори на тях. Направи прецизиран финален анализ, като вземеш предвид новата информация.

Информация за автомобила:
- Марка и модел: ${vehicle.brand} ${vehicle.model}
- Година: ${vehicle.year}
- Двигател: ${vehicle.engine}
- Гориво: ${vehicle.fuelType}
- Скоростна кутия: ${vehicle.transmission}
${vehicle.mileage ? `- Пробег: ${vehicle.mileage} км` : ''}

Оригинално описание на проблема:
${description}

Уточняващи въпроси и отговори от потребителя:
${qaSection}

Отговори с JSON обект в същия точен формат:
{
  "summary": "Прецизирано обобщение (2-4 изречения), като вземеш предвид отговорите на потребителя",
  "urgency": "low|medium|high|critical",
  "suggestedCategories": ["категория1", "категория2"],
  "questions": [],
  "briefForShop": "Прецизиран технически бриф за механика на английски, включващ контекста от отговорите"
}

Налични категории: engine, diagnostics, brakes, suspension, tires, electrical, air-conditioning, bodywork, transmission, oil-service

Нива на спешност:
- low: може да изчака планирана поддръжка
- medium: трябва да се адресира в рамките на 1-2 седмици
- high: трябва да се адресира в рамките на няколко дни
- critical: изисква незабавно внимание, риск за безопасността

Важно: Върни questions като празен масив [] — вече имаш достатъчно информация за финален анализ.
Отговори на български, освен briefForShop.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return JSON.parse(text) as AiAnalysisResult;
};
