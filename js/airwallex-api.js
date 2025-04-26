/**
 * Airwallex API 封装模块
 * 封装Airwallex支付相关的API调用
 */

// Airwallex SDK 对象
let Airwallex = null;
let elementInstances = {}; // 存储已创建的元素实例

// Airwallex SDK 配置
const AIRWALLEX_CONFIG = {
  env: 'prod', // 环境: 'demo', 'prod'
  origin: window.location.origin, // 用于验证的域名
  // apiKey从环境变量中获取，不在前端直接设置
};

/**
 * 初始化Airwallex SDK
 */
async function init() {
  try {
    // 加载Airwallex SDK
    await loadAirwallexSDK();
    
    // 初始化Airwallex
    await Airwallex.loadAirwallex(AIRWALLEX_CONFIG);
    
    console.log('Airwallex SDK初始化成功');
    return true;
  } catch (error) {
    console.error('初始化Airwallex SDK失败:', error);
    throw new Error('支付系统初始化失败，请刷新页面重试');
  }
}

/**
 * 加载Airwallex SDK
 */
async function loadAirwallexSDK() {
  // 检查是否已经加载
  if (window.Airwallex) {
    Airwallex = window.Airwallex;
    return;
  }
  
  // 检查SDK脚本是否已加载
  if (document.querySelector('script[src*="elements.bundle.min.js"]') === null) {
    // 动态加载SDK脚本
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.airwallex.com/assets/elements.bundle.min.js';
      script.async = true;
      
      script.onload = () => {
        Airwallex = window.Airwallex;
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('无法加载Airwallex SDK'));
      };
      
      document.head.appendChild(script);
    });
  }
}

/**
 * 创建支付意图
 * @param {Object} data - 支付数据
 * @returns {Promise<Object>} - 支付意图对象
 */
async function createPaymentIntent(data) {
  try {
    // 调用后端API创建支付意图
    const apiUrl = '/api/create-payment-intent';
    console.log('创建支付意图:', data);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '创建支付订单失败，请重试');
    }
    
    return await response.json();
  } catch (error) {
    console.error('创建支付意图失败:', error);
    throw new Error('创建支付订单失败，请重试');
  }
}

/**
 * 确认支付意图
 * @param {Object} params - 支付参数
 * @returns {Promise<Object>} - 支付结果
 */
async function confirmPaymentIntent(params) {
  try {
    // 验证必要参数
    if (!params.intent_id) {
      throw new Error('缺少支付意图ID');
    }
    
    if (!params.payment_method) {
      throw new Error('缺少支付方式');
    }
    
    // 根据支付方式处理
    switch (params.payment_method) {
      case 'card':
        return await confirmCardPayment(params);
      case 'alipay':
        return await confirmRedirectPayment(params, 'alipay');
      case 'wechatpay':
        return await confirmWeChatPayment(params);
      case 'paypal':
        return await confirmRedirectPayment(params, 'paypal');
      case 'union_pay':
        return await confirmRedirectPayment(params, 'union_pay');
      default:
        throw new Error(`不支持的支付方式: ${params.payment_method}`);
    }
  } catch (error) {
    console.error('确认支付意图失败:', error);
    return { error: error.message || '支付处理失败' };
  }
}

/**
 * 确认信用卡支付
 * @param {Object} params - 支付参数
 * @returns {Promise<Object>} - 支付结果
 */
async function confirmCardPayment(params) {
  // 检查卡信息
  if (!params.card_details) {
    throw new Error('缺少卡片信息');
  }
  
  try {
    // 使用Airwallex SDK确认支付
    // 实际集成中应调用真实的Airwallex API
    console.log('确认卡支付:', params);
    
    // 模拟支付结果
    return {
      id: params.intent_id,
      status: 'SUCCEEDED',
      amount: params.amount || 0.1,
      currency: params.currency || 'CNY'
    };
  } catch (error) {
    console.error('卡支付失败:', error);
    throw error;
  }
}

/**
 * 确认重定向支付（支付宝、PayPal、银联等）
 * @param {Object} params - 支付参数
 * @param {string} method - 支付方式
 * @returns {Promise<Object>} - 支付结果
 */
async function confirmRedirectPayment(params, method) {
  try {
    // 使用Airwallex SDK确认支付
    // 实际集成中应调用真实的Airwallex API
    console.log(`确认${method}支付:`, params);
    
    // 模拟重定向支付响应
    const returnUrl = params.payment_method_options?.[method]?.return_url || `${window.location.origin}/payment-return.html`;
    
    // 创建带有查询参数的重定向URL
    const redirectUrl = new URL('https://example.com/pay');
    redirectUrl.searchParams.append('method', method);
    redirectUrl.searchParams.append('intent_id', params.intent_id);
    redirectUrl.searchParams.append('return_url', returnUrl);
    
    return {
      id: params.intent_id,
      status: 'REQUIRES_ACTION',
      next_action: {
        type: 'redirect',
        url: redirectUrl.toString()
      }
    };
  } catch (error) {
    console.error(`${method}支付失败:`, error);
    throw error;
  }
}

/**
 * 确认微信支付
 * @param {Object} params - 支付参数
 * @returns {Promise<Object>} - 支付结果
 */
async function confirmWeChatPayment(params) {
  try {
    // 使用Airwallex SDK确认支付
    // 实际集成中应调用真实的Airwallex API
    console.log('确认微信支付:', params);
    
    // 模拟微信支付响应
    return {
      id: params.intent_id,
      status: 'REQUIRES_ACTION',
      next_action: {
        type: 'qrcode',
        qrcode_data: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=weixin://wxpay/bizpayurl?pr=example'
      }
    };
  } catch (error) {
    console.error('微信支付失败:', error);
    throw error;
  }
}

/**
 * 检查支付状态
 * @param {string} intentId - 支付意图ID
 * @returns {Promise<Object>} - 支付状态
 */
async function checkPaymentStatus(intentId) {
  try {
    // 实际环境中，这个请求应该发送到您的后端服务器
    // 后端服务器将使用您的Airwallex API密钥查询支付状态
    console.log('检查支付状态:', intentId);
    
    // 模拟支付状态
    const statuses = ['PROCESSING', 'SUCCEEDED', 'FAILED'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      id: intentId,
      status: randomStatus
    };
  } catch (error) {
    console.error('检查支付状态失败:', error);
    throw new Error('检查支付状态失败');
  }
}

/**
 * 生成随机ID
 * @returns {string} - 随机ID
 */
function generateRandomId() {
  return Math.random().toString(36).substring(2, 15);
}

// 导出模块方法
export {
  init,
  createPaymentIntent,
  confirmPaymentIntent,
  checkPaymentStatus
}; 