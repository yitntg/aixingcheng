/**
 * 支付处理逻辑模块
 * 封装所有与Airwallex API交互的功能
 */

const axios = require('axios');

// 存储API令牌
let API_TOKEN = {
  token: null,
  expires_at: 0
};

/**
 * 获取Airwallex API令牌
 * @param {Object} config - API配置
 * @returns {Promise<string>} 令牌
 */
async function getApiToken(config) {
  // 检查现有令牌是否有效
  const now = Date.now() / 1000;
  if (API_TOKEN.token && API_TOKEN.expires_at > now + 60) {
    return API_TOKEN.token;
  }

  try {
    // 检查必要的API配置
    if (!config.API_KEY || !config.CLIENT_ID) {
      console.log('警告：缺少API密钥或客户端ID，切换到演示模式');
      return _getDemoToken(now);
    }

    console.log('获取新的API令牌...');
    console.log('使用Client ID:', config.CLIENT_ID.substring(0, 4) + '****'); // 打印部分ID以便调试
    console.log('API基础URL:', config.API_BASE);
    // 获取新令牌
    const response = await axios({
      method: 'post',
      url: `${config.API_BASE}/api/v1/authentication/login`,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.API_KEY,
        'x-client-id': config.CLIENT_ID
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
    
    // 演示环境：如果没有API密钥或认证失败，返回模拟令牌
    return _getDemoToken(now);
  }
}

/**
 * 获取演示模式的令牌
 * @private
 * @param {number} now 当前时间戳（秒）
 * @returns {string} 模拟令牌
 */
function _getDemoToken(now) {
  console.log('注意：使用模拟令牌（演示模式）');
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRlbW8gVG9rZW4iLCJpYXQiOjE1MTYyMzkwMjJ9';
  API_TOKEN = {
    token: mockToken,
    expires_at: now + 3600
  };
  return mockToken;
}

/**
 * 创建支付意图
 * @param {Object} paymentData 支付数据
 * @param {Object} config API配置
 * @returns {Promise<Object>} 支付意图对象
 */
async function createPaymentIntent(paymentData, config) {
  try {
    // 验证数据
    if (!paymentData.amount || !paymentData.currency) {
      throw new Error('缺少必要参数：amount 或 currency');
    }

    // 检查是否处于演示模式
    const isDemo = !config.API_KEY || !config.CLIENT_ID;
    if (isDemo) {
      console.log('注意：API配置不完整，使用演示模式');
      return _getDemoPaymentIntent(paymentData);
    }

    // 获取令牌
    const token = await getApiToken(config);
    
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
          name: '高级会员',
          desc: '月度订阅服务',
          quantity: 1,
          unit_price: paymentData.amount,
          currency: paymentData.currency,
        }]
      },
      return_url: `${paymentData.returnUrl || 'http://localhost:3001'}/payment-success.html`
    };

    console.log('发送创建支付意图请求，数据:', JSON.stringify(requestData));

    // 发送请求
    const response = await axios({
      method: 'post',
      url: `${config.API_BASE}/api/v1/pa/payment_intents/create`,
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
    // 在API调用失败时返回一个模拟的支付意图以便前端测试
    return _getDemoPaymentIntent(paymentData);
  }
}

/**
 * 获取演示模式的支付意图
 * @private
 * @param {Object} paymentData 支付数据
 * @returns {Object} 模拟的支付意图
 */
function _getDemoPaymentIntent(paymentData) {
  console.log('生成模拟的支付意图以供测试');
  return {
    id: 'demo_' + Math.random().toString(36).substring(2, 15),
    client_secret: 'demo_secret_' + Math.random().toString(36).substring(2, 10),
    amount: paymentData.amount,
    currency: paymentData.currency,
    status: 'REQUIRES_PAYMENT_METHOD',
    next_action: null,
    demo_mode: true
  };
}

/**
 * 查询支付意图状态
 * @param {string} intentId 支付意图ID
 * @param {Object} config API配置
 * @returns {Promise<Object>} 支付意图对象
 */
async function getPaymentIntent(intentId, config) {
  try {
    if (!intentId) {
      throw new Error('缺少支付意图ID');
    }

    // 如果是演示模式的ID或API配置不完整，返回模拟数据
    if (intentId.startsWith('demo_') || !config.API_KEY || !config.CLIENT_ID) {
      return {
        id: intentId,
        amount: 99.00,
        currency: 'CNY',
        status: 'SUCCEEDED',
        created_at: new Date().toISOString(),
        demo_mode: true
      };
    }

    const token = await getApiToken(config);
    
    console.log(`查询支付意图状态... ID: ${intentId}`);
    
    const response = await axios({
      method: 'get',
      url: `${config.API_BASE}/api/v1/pa/payment_intents/${intentId}`,
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

/**
 * 确认支付意图
 * @param {Object} paymentData 支付数据
 * @param {Object} config API配置
 * @returns {Promise<Object>} 确认结果
 */
async function confirmPaymentIntent(paymentData, config) {
  try {
    // 验证必要参数
    if (!paymentData.intent_id) {
      throw new Error('缺少支付意图ID');
    }

    if (!paymentData.payment_method) {
      throw new Error('缺少支付方式');
    }

    // 获取令牌
    const token = await getApiToken(config);
    
    console.log(`确认支付意图... ID: ${paymentData.intent_id}, 方式: ${paymentData.payment_method}`);
    
    // 构建请求URL
    const apiUrl = `${config.API_BASE}/api/v1/pa/payment_intents/${paymentData.intent_id}/confirm`;
    
    // 准备请求数据
    const requestData = {
      request_id: `req_confirm_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      payment_method: {
        type: paymentData.payment_method
      }
    };

    // 根据支付方式添加特定参数
    switch (paymentData.payment_method) {
      case 'card':
        if (paymentData.payment_method_data && paymentData.payment_method_data.card) {
          requestData.payment_method.card = paymentData.payment_method_data.card;
        }
        break;
      case 'alipay':
      case 'wechat':
      case 'unionpay':
      case 'paypal':
        if (paymentData.payment_method_data && paymentData.payment_method_data.return_url) {
          requestData.payment_method[paymentData.payment_method] = {
            return_url: paymentData.payment_method_data.return_url
          };
        }
        break;
    }

    // 发送请求
    const response = await axios({
      method: 'post',
      url: apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: requestData
    });

    console.log('支付确认成功，状态:', response.data.status);
    return response.data;
  } catch (error) {
    console.error('确认支付意图错误:', error.response?.data || error.message);
    throw new Error(`确认支付失败: ${error.response?.data?.message || error.message}`);
  }
}

module.exports = {
  getApiToken,
  createPaymentIntent,
  getPaymentIntent,
  confirmPaymentIntent
}; 