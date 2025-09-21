/**
 * Forwards the user's request to our secure Netlify serverless function.
 * This function acts as a proxy to the Gemini API.
 * @param {string} userInput The latest input from the user.
 * @param {Array<object>} stretches The list of all available stretches.
 * @param {string} userProfile The user's profile information.
 * @param {Array<object>} chatHistory The history of the conversation.
 * @returns {Promise<{text: string, suggestions: string[] | null}>}
 */
export const generateAIResponse = async (userInput, stretches = [], userProfile = '', chatHistory = []) => {
  // Handle initial greeting without calling the backend
  if (!userInput) {
    return {
        text: `こんにちは！AIパーソナルトレーナーです。
あなたの体調や目標に合わせて最適なストレッチを提案します。
まずは、マイページであなたのことを教えてください。
もちろん、このまま「肩こりがひどい」や「リラックスしたい」のように話しかけてくれても大丈夫です！`,
        suggestions: null,
    }
  }

  try {
    const response = await fetch('/api/getAiResponse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        userInput,
        stretches,
        userProfile,
        chatHistory 
      }),
    });

    if (!response.ok) {
      // Try to parse the error response from the function
      const errorData = await response.json();
      throw new Error(errorData.text || 'APIリクエストに失敗しました。');
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error calling serverless function:', error);
    return {
      text: `申し訳ありません、AIとの通信中にエラーが発生しました。 (${error.message})`,
      suggestions: null,
    };
  }
};
