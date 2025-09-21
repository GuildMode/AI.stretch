exports.handler = async (event) => {
  console.log("--- Function Invoked ---");

  if (event.httpMethod !== 'POST') {
    console.log(`Invalid method: ${event.httpMethod}`);
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    console.log("Step 1: Checking for API Key...");
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      console.error("FATAL: GEMINI_API_KEY environment variable not found.");
      return {
        statusCode: 500,
        body: JSON.stringify({ text: 'エラー: APIキーがサーバーで読み込めませんでした。' }),
      };
    }
    console.log("Step 1: API Key found.");

    console.log("Step 2: Parsing event body...");
    if (!event.body) {
      console.error("FATAL: Event body is empty.");
      return { statusCode: 400, body: JSON.stringify({ text: 'リクエストボディが空です。' }) };
    }
    const { userInput, stretches, userProfile, chatHistory } = JSON.parse(event.body);
    console.log("Step 2: Event body parsed successfully.");

    console.log("Step 3: Constructing prompt...");
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
${chatHistory.slice(-6).map(msg => `${msg.sender === 'user' ? 'ユーザー' : 'AI'}: ${msg.text}`).join('\n')}

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
    console.log("Step 3: Prompt constructed.");

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

    console.log("Step 4: Calling Gemini API...");
    const geminiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      }),
    });
    console.log(`Step 4: Gemini API call completed with status: ${geminiResponse.status}`);

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error(`Gemini API request failed with status ${geminiResponse.status}:`, errorText);
      return { statusCode: geminiResponse.status, body: JSON.stringify({ text: `AIの応答生成に失敗しました。ステータス: ${geminiResponse.status}` }) };
    }

    console.log("Step 5: Parsing Gemini response...");
    const responseData = await geminiResponse.json();
    const jsonResponse = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("Step 5: Gemini response parsed.");

    if (!jsonResponse) {
      console.error("Gemini API response is missing expected content.", responseData);
      return { statusCode: 500, body: JSON.stringify({ text: 'AIから予期せぬ形式の応答がありました。' }) };
    }

    console.log("Step 6: Returning successful response.");
    return {
      statusCode: 200,
      body: jsonResponse,
    };

  } catch (error) {
    console.error('[FATAL] Unhandled error in function execution:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ text: 'サーバーで予期せぬエラーが発生しました。', suggestions: null }),
    };
  }
};