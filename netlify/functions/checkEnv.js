exports.handler = async () => {
  const apiKeyExists = !!process.env.GEMINI_API_KEY;
  const message = `Is the GEMINI_API_KEY environment variable set? --- ${apiKeyExists ? 'YES' : 'NO'}`;
  
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/plain' },
    body: message,
  };
};
