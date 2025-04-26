export async function onRequest(context) {
  // 设置响应头
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // 处理 OPTIONS 请求（预检请求）
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers,
    });
  }

  // 只允许 POST 请求
  if (context.request.method !== 'POST') {
    return new Response(
      JSON.stringify({
        error: '只接受 POST 请求',
      }),
      {
        status: 405,
        headers,
      }
    );
  }

  // 异步处理支付创建
  return handlePaymentIntent(context, headers);
}

async function handlePaymentIntent(context, headers) {
  try {
    // 获取环境变量 - 在实际环境中需要设置这些变量
    const clientId = context.env.AIRWALLEX_CLIENT_ID || 'YOUR_CLIENT_ID'; // 请替换为真实的Client ID
    const apiKey = context.env.AIRWALLEX_API_KEY || 'YOUR_API_KEY'; // 请替换为真实的API Key
    const apiBase = context.env.AIRWALLEX_API_BASE || 'https://api-demo.airwallex.com';

    // 解析请求体
    const paymentData = await context.request.json();

    // 验证必要字段
    if (!paymentData.amount || !paymentData.planType) {
      return new Response(
        JSON.stringify({
          error: '缺少必要参数',
          details: '必须提供amount和planType字段',
        }),
        {
          status: 400,
          headers,
        }
      );
    }

    // 获取Airwallex API令牌
    const tokenResponse = await fetch(`${apiBase}/api/v1/authentication/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'x-client-id': clientId,
      },
      body: JSON.stringify({}),
    });

    // 检查令牌响应
    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.json();
      return new Response(
        JSON.stringify({ 
          error: '获取Airwallex令牌失败', 
          details: tokenError 
        }),
        { 
          status: 500, 
          headers 
        }
      );
    }

    const tokenData = await tokenResponse.json();
    const token = tokenData.token;

    // 创建唯一请求ID和订单ID
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const merchantOrderId = paymentData.merchantOrderId || `order_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    // 构建支付意图请求数据
    const requestData = {
      request_id: requestId,
      merchant_order_id: merchantOrderId,
      amount: paymentData.amount,
      currency: paymentData.currency || 'CNY',
      order: {
        products: [
          {
            name: getPlanName(paymentData.planType),
            quantity: 1,
            unit_price: paymentData.amount,
          },
        ],
      },
      return_url: `${context.request.url.split('/api')[0]}/payment-success.html`,
    };
    
    console.log('创建支付意图请求数据:', JSON.stringify(requestData, null, 2));

    // 创建支付意图
    const paymentResponse = await fetch(`${apiBase}/api/v1/pa/payment_intents/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    });

    // 检查支付意图响应
    if (!paymentResponse.ok) {
      const paymentError = await paymentResponse.json();
      return new Response(
        JSON.stringify({ 
          error: '创建支付意图失败', 
          details: paymentError 
        }),
        { 
          status: 500, 
          headers 
        }
      );
    }

    const paymentResult = await paymentResponse.json();

    // 返回支付意图ID和客户端密钥
    return new Response(
      JSON.stringify({
        id: paymentResult.id,
        client_secret: paymentResult.client_secret,
        status: paymentResult.status,
      }),
      { 
        status: 200, 
        headers 
      }
    );
  } catch (error) {
    console.error('处理支付意图时出错:', error);

    return new Response(
      JSON.stringify({
        error: '处理支付请求失败',
        message: error.message || '未知错误',
      }),
      {
        status: 500,
        headers,
      }
    );
  }
}

// 根据计划类型获取计划名称
function getPlanName(planType) {
  switch (planType) {
    case 'basic':
      return '智慧旅行-基础版';
    case 'premium':
      return '智慧旅行-高级版';
    case 'annual':
      return '智慧旅行-年度尊享版';
    default:
      return '智慧旅行-订阅';
  }
} 