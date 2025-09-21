const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const API_URL = `https://generative-language.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

// A utility function to format the chat history for the prompt
const formatChatHistory = (chatHistory) => {
  // Take the last 6 messages to keep the prompt concise
  return chatHistory.slice(-6).map(msg => `${msg.sender === 'user' ? 'ユーザー' : 'AI'}: ${msg.text}`).join('\n');
};

/**
 * Generates an AI response using the Gemini API.
 * @param {string} userInput The latest input from the user.
 * @param {Array<object>} stretches The list of all available stretches.
 * @param {string} userProfile The user\'s profile information.
 * @param {Array<object>} chatHistory The history of the conversation.
 * @returns {Promise<{text: string, suggestions: string[] | null}>}
 */
export const generateAIResponse = async (userInput, stretches = [], userProfile = '', chatHistory = []) => {
  // Handle initial greeting without calling API
  if (!userInput) {
    return {
        text: `こんにちは！AIパーソナルトレーナーです。
あなたの体調や目標に合わせて最適なストレッチを提案します。
まずは、マイページであなたのことを教えてください。
もちろん、このまま「肩こりがひどい」や「リラックスしたい」のように話しかけてくれても大丈夫です！`,
        suggestions: null,
    }
  }

  if (!API_KEY) {
    return {
      text: 'エラー: Gemini APIキーが設定されていません。.env.localファイルを確認してください。',
      suggestions: null,
    };
  }

  const prompt = `
あなたは「AIパーソナルトレーナー」です。以下の情報を元に、ユーザーへの応答を生成してください。

# あなたの役割
- ユーザーのプロフィールや会話の流れを深く理解し、一人ひとりに寄り添った応答をします。
- ユーザーの悩みや目的に対して、最も効果的だと思われるストレッチを提案します。
- 提案するだけでなく、ユーザーを励まし、モチベーションを高めるような、温かみのあるコミュニケーションを心がけてください。
- ユーザー情報が未設定の場合は、設定を促すようなメッセージを応答に含めてください。

# 利用可能な全ストレッチのリスト (JSON形式)
${JSON.stringify(stretches, null, 2)}

# ユーザーに関する情報
${userProfile || 'まだ設定されていません。'}

# これまでの会話履歴 (直近最大6件)
${formatChatHistory(chatHistory)}

# 今回のユーザーからの入力
${userInput}

# 指示
1. 上記のすべての情報を考慮して、ユーザーへの最適な応答メッセージ("text")を生成してください。
2. 提案したいストレッチがある場合は、そのストレッチの "id" のみを抜き出し、配列("suggestions")として含めてください。提案がない場合は null または空の配列にしてください。
3. あなたの応答は、必ず以下のJSON形式に従ってください。他の言葉や説明は一切含めないでください。

\`\`\`json
{
  "text": "ここにユーザーへの応答メッセージが入ります。会話の流れを意識した自然な文章にしてください。",
  "suggestions": ["stretch-01", "stretch-05"]
}
\`\`\`
`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
        }
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Gemini API request failed:', errorBody);
      throw new Error(`APIリクエストに失敗しました。ステータス: ${response.status}`);
    }

    const data = await response.json();
    // Handle cases where the model might not return content
    if (!data.candidates || !data.candidates[0].content) {
      throw new Error('APIからの応答が不正な形式です。');
    }
    const jsonResponse = data.candidates[0].content.parts[0].text;
    const parsedResponse = JSON.parse(jsonResponse);

    return parsedResponse;

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return {
      text: '申し訳ありません、AIの応答生成中にエラーが発生しました。APIキーやネットワーク接続を確認し、少し時間をおいてからもう一度お試しください。',
      suggestions: null,
    };
  }
};