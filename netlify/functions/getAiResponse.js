const fetch = require('node-fetch');

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = `https://generative-language.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

const formatChatHistory = (chatHistory) => {
  return chatHistory.slice(-6).map(msg => `${msg.sender === 'user' ? 'ユーザー' : 'AI'}: ${msg.text}`).join('\n');
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ text: 'エラー: APIキーがサーバー側で設定されていません。', suggestions: null }),
    };
  }

  try {
    const { userInput, stretches, userProfile, chatHistory } = JSON.parse(event.body);

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

\
{
  "text": "ここにユーザーへの応答メッセージが入ります。会話の流れを意識した自然な文章にしてください。",
  "suggestions": ["stretch-01", "stretch-05"]
}

`;

    const geminiResponse = await fetch(API_URL, {
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

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.json();
      console.error('Gemini API request failed:', errorBody);
      return {
        statusCode: geminiResponse.status,
        body: JSON.stringify({ text: 'AIの応答生成に失敗しました。', suggestions: null }),
      };
    }

    const responseData = await geminiResponse.json();
    const jsonResponse = responseData.candidates[0].content.parts[0].text;

    return {
      statusCode: 200,
      body: jsonResponse, // Return the JSON string directly
    };

  } catch (error) {
    console.error('Error in Netlify function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ text: 'サーバーでエラーが発生しました。', suggestions: null }),
    };
  }
};
