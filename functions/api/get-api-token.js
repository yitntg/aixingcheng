// 获取API令牌 - CloudFlare Pages Function
export async function onRequest(context) {
  // 设置CORS头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // 处理预检请求
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    // 检查请求方法
    if (context.request.method !== 'GET') {
      return new Response(
        JSON.stringify({
          error: '请求方法不支持',
          message: '此端点仅支持GET请求'
        }),
        { status: 405, headers }
      );
    }

    // 获取环境变量
    const clientId = context.env.AIRWALLEX_CLIENT_ID;
    const apiKey = context.env.AIRWALLEX_API_KEY;
    const apiBase = context.env.AIRWALLEX_API_BASE || 'https://api.airwallex.com';

    // 验证环境变量
    if (!clientId || !apiKey) {
      return new Response(
        JSON.stringify({
          error: 'API凭证未配置',
          message: '请在环境变量中设置AIRWALLEX_CLIENT_ID和AIRWALLEX_API_KEY',
          env_status: {
            client_id: Boolean(clientId),
            api_key: Boolean(apiKey)
          }
        }),
        { status: 500, headers }
      );
    }

    // 获取API令牌
    const tokenResponse = await fetch(`${apiBase}/api/v1/authentication/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'x-client-id': clientId
      }
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.json();
      throw new Error(`认证失败: ${tokenError.message || tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    
    // 返回成功响应
    return new Response(
      JSON.stringify({
        token: tokenData.token,
        expires_at: tokenData.expires_at
      }),
      { headers }
    );
  } catch (error) {
    // 返回错误响应
    return new Response(
      JSON.stringify({
        error: '获取API令牌失败',
        message: error.message
      }),
      { status: 500, headers }
    );
  }
} 