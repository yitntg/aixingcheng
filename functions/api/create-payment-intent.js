// 创建支付意图API - CloudFlare Pages Function
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

    // 解析请求体
    const paymentData = await context.request.json();
    
    // 验证必要参数
    if (!paymentData.amount || !paymentData.currency) {
      return new Response(
        JSON.stringify({
          error: '参数错误',
          message: '缺少必要参数：amount 或 currency'
        }),
        { status: 400, headers }
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
    const token = tokenData.token;

    // 准备请求数据
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const merchantOrderId = paymentData.merchantOrderId || `order_${Date.now()}`;
    
    const requestData = {
      amount: paymentData.amount,
      currency: paymentData.currency,
      merchant_order_id: merchantOrderId,
      request_id: requestId,
      order: {
        products: [{
          name: 'AI行程高级会员',
          desc: '月度订阅服务',
          quantity: 1,
          unit_price: paymentData.amount,
          currency: paymentData.currency,
        }]
      },
      return_url: `${paymentData.returnUrl || context.request.url.origin}/payment-success.html`
    };

    // 创建支付意图
    const paymentResponse = await fetch(`${apiBase}/api/v1/pa/payment_intents/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestData)
    });

    if (!paymentResponse.ok) {
      const paymentError = await paymentResponse.json();
      throw new Error(`创建支付意图失败: ${paymentError.message || paymentResponse.statusText}`);
    }

    const paymentResult = await paymentResponse.json();
    
    // 返回成功响应
    return new Response(
      JSON.stringify(paymentResult),
      { headers }
    );
  } catch (error) {
    // 返回错误响应
    return new Response(
      JSON.stringify({
        error: '创建支付意图失败',
        message: error.message
      }),
      { status: 500, headers }
    );
  }
} 