import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const getConstructionAssistantResponse = async (question) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Ты строительный ассистент. Отвечай кратко, по делу, давай расчёты бетона, цемента, песка, материалов. Отвечай понятно для прораба.'
        },
        {
          role: 'user',
          content: question
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Ошибка при обращении к OpenAI:', error);
    throw new Error('Не удалось получить ответ от ассистента');
  }
}; 