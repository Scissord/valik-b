import { getConstructionAssistantResponse } from '#root/services/AI/openaiService.js';

export const askAssistant = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Вопрос обязателен'
      });
    }

    const response = await getConstructionAssistantResponse(question);

    return res.status(200).json({
      success: true,
      data: {
        answer: response
      }
    });
  } catch (error) {
    console.error('Ошибка в контроллере ассистента:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Внутренняя ошибка сервера'
    });
  }
}; 