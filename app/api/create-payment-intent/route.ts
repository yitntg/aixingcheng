import { NextResponse } from 'next/server';
import axios from 'axios';

// Airwallex API 基础URL
const AIRWALLEX_BASE_URL = process.env.AIRWALLEX_ENVIRONMENT === 'prod'
  ? 'https://api.airwallex.com'
  : 'https://api-demo.airwallex.com';

/**
 * 获取 Airwallex 访问令牌
 */
const getAirwallexToken = async () => {
  try {
    const response = await axios.post(
      `${AIRWALLEX_BASE_URL}/api/v1/authentication/login`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.AIRWALLEX_API_KEY || '',
          'x-client-id': process.env.AIRWALLEX_CLIENT_ID || '',
        },
      }
    );

    return response.data.token;
  } catch (error) {
    console.error('获取 Airwallex 令牌失败:', error);
    throw new Error('认证失败');
  }
};

/**
 * 创建支付意图
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency, productName } = body;

    if (!amount || !currency) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 获取访问令牌
    const token = await getAirwallexToken();

    // 创建支付意图
    const paymentIntentResponse = await axios.post(
      `${AIRWALLEX_BASE_URL}/api/v1/pa/payment_intents/create`,
      {
        amount,
        currency,
        descriptor: productName || 'Airwallex Payment',
        merchant_order_id: `order_${Date.now()}`,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/success`,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const paymentIntent = paymentIntentResponse.data;

    return NextResponse.json({
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error('创建支付意图失败:', error.response?.data || error.message);
    
    return NextResponse.json(
      { 
        error: '创建支付意图失败',
        details: error.response?.data || error.message
      },
      { status: 500 }
    );
  }
} 