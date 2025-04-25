/**
 * AI行程 - Airwallex支付后端服务
 * 这是一个Express服务器，用于安全处理与Airwallex API的通信
 */

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Airwallex API配置
const AIRWALLEX_API = {
  CLIENT_ID: process.env.AIRWALLEX_CLIENT_ID || 'C8VXbgIDQO-i8Cr8G3IiFQ', // 测试环境使用
  API_KEY: process.env.AIRWALLEX_API_KEY || '', // 应从环境变量获取
  API_BASE: process.env.AIRWALLEX_API_BASE || 'https://api-demo.airwallex.com', // 演示环境
};

// 中间件
app.use(express.json());
app.use(cors());
app.use(morgan('dev')); // 日志中间件
app.use(express.static(path.join(__dirname, '../'))); // 提供静态文件（前端）

// 存储API令牌
let API_TOKEN = {
  token: null,
  expires_at: 0
};

/**
 * 获取Airwallex API令牌
 * @returns {Promise<string>} 令牌
 */
async function getApiToken() {
  // 检查现有令牌是否有效
  const now = Date.now() / 1000;
  if (API_TOKEN.token && API_TOKEN.expires_at > now + 60) {
    return API_TOKEN.token;
  }

  try {
    console.log('获取新的API令牌...');
    // 获取新令牌
    const response = await axios({
      method: 'post',
      url: `${AIRWALLEX_API.API_BASE}/api/v1/authentication/login`,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': AIRWALLEX_API.API_KEY,
        'x-client-id': AIRWALLEX_API.CLIENT_ID
      }
    });

    if (response.data && response.data.token) {
      API_TOKEN = {
        token: response.data.token,
        expires_at: now + response.data.expires_in
      };
      console.log('API令牌获取成功，有效期至:', new Date((now + response.data.expires_in) * 1000).toLocaleString());
      return API_TOKEN.token;
    } else {
      throw new Error('获取令牌失败：响应中无令牌');
    }
  } catch (error) {
    console.error('Airwallex认证错误:', error.response?.data || error.message);
    throw new Error(`认证失败: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * 创建支付意图
 * @param {Object} paymentData 支付数据
 * @returns {Promise<Object>} 支付意图对象
 */
async function createPaymentIntent(paymentData) {
  try {
    // 验证数据
    if (!paymentData.amount || !paymentData.currency) {
      throw new Error('缺少必要参数：amount 或 currency');
    }

    // 获取令牌
    const token = await getApiToken();
    
    // 准备请求数据
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const merchantOrderId = paymentData.merchantOrderId || `order_${Date.now()}`;
    
    console.log(`创建支付意图... 订单ID: ${merchantOrderId}, 金额: ${paymentData.amount} ${paymentData.currency}`);
    
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
      return_url: `${paymentData.returnUrl || 'http://localhost:3000'}/payment-success.html`
    };

    // 发送请求
    const response = await axios({
      method: 'post',
      url: `${AIRWALLEX_API.API_BASE}/api/v1/pa/payment_intents/create`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: requestData
    });

    console.log('支付意图创建成功:', response.data.id);
    return response.data;
  } catch (error) {
    console.error('创建支付意图错误:', error.response?.data || error.message);
    throw new Error(`创建支付意图失败: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * 查询支付意图状态
 * @param {string} intentId 支付意图ID
 * @returns {Promise<Object>} 支付意图对象
 */
async function getPaymentIntent(intentId) {
  try {
    if (!intentId) {
      throw new Error('缺少支付意图ID');
    }

    const token = await getApiToken();
    
    console.log(`查询支付意图状态... ID: ${intentId}`);
    
    const response = await axios({
      method: 'get',
      url: `${AIRWALLEX_API.API_BASE}/api/v1/pa/payment_intents/${intentId}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`支付意图状态: ${response.data.status}`);
    return response.data;
  } catch (error) {
    console.error('查询支付意图错误:', error.response?.data || error.message);
    throw new Error(`查询支付意图失败: ${error.response?.data?.message || error.message}`);
  }
}

// API路由 - 创建支付意图
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const paymentData = req.body;
    const paymentIntent = await createPaymentIntent(paymentData);
    res.json(paymentIntent);
  } catch (error) {
    console.error('API错误 - 创建支付意图:', error.message);
    res.status(500).json({ 
      error: '创建支付意图失败', 
      message: error.message 
    });
  }
});

// API路由 - 查询支付意图
app.get('/api/payment-intent/:id', async (req, res) => {
  try {
    const intentId = req.params.id;
    const paymentIntent = await getPaymentIntent(intentId);
    res.json(paymentIntent);
  } catch (error) {
    console.error('API错误 - 查询支付意图:', error.message);
    res.status(500).json({ 
      error: '查询支付意图失败', 
      message: error.message 
    });
  }
});

// 通用路由 - 将所有其他请求重定向到前端应用
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
=================================================
  AI行程支付服务已启动！
  http://localhost:${PORT}
=================================================
  
  API端点:
  - 创建支付意图: POST http://localhost:${PORT}/api/create-payment-intent
  - 查询支付意图: GET http://localhost:${PORT}/api/payment-intent/:id
  
  使用 Ctrl+C 停止服务器
=================================================
`);
}); 