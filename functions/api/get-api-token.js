// 获取Airwallex API令牌 - CloudFlare Pages Function
export async function onRequest(context) {
  // 设置CORS头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // 处理预检请求
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    // 检查请求方法
    if (context.request.method !== 'POST') {
      return new Response(
        JSON.stringify({
          error: '请求方法不支持',
          message: '此端点仅支持POST请求'
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
          message: '请在环境变量中设置AIRWALLEX_CLIENT_ID和AIRWALLEX_API_KEY'
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
    
    // 添加过期时间信息（令牌有效期为2小时）
    const expiresAt = Date.now() + 7200000; // 当前时间加2小时（毫秒）
    
    // 返回成功响应，包含令牌和过期时间
    return new Response(
      JSON.stringify({
        token: tokenData.token,
        expires_at: expiresAt,
        message: '令牌获取成功'
      }),
      { headers }
    );
  } catch (error) {
    // 捕获并处理所有错误
    console.error('获取API令牌错误:', error);
    
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