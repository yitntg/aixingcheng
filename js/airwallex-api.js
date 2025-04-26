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
    
    // 调用后端API确认支付
    const apiUrl = '/api/confirm-payment-intent';
    console.log('确认支付意图:', params);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '支付处理失败，请重试');
    }
    
    return await response.json();
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
    console.log('确认卡支付:', params);
    
    // 调用后端API确认支付
    const response = await fetch('/api/confirm-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent_id: params.intent_id,
        payment_method: 'card',
        payment_method_data: params.card_details
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '信用卡支付处理失败，请重试');
    }
    
    return await response.json();
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
    console.log(`确认${method}支付:`, params);
    
    // 获取当前域名作为返回地址
    const returnUrl = params.payment_method_options?.[method]?.return_url || 
                      `${window.location.origin}/payment-return.html`;
    
    // 调用后端API
    const response = await fetch('/api/confirm-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent_id: params.intent_id,
        payment_method: method,
        payment_method_data: {
          return_url: returnUrl
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `${method}支付处理失败，请重试`);
    }
    
    return await response.json();
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
    console.log('确认微信支付:', params);
    
    // 调用后端API
    const response = await fetch('/api/confirm-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent_id: params.intent_id,
        payment_method: 'wechat',
        payment_method_data: {
          return_url: params.payment_method_options?.wechat?.return_url || 
                      `${window.location.origin}/payment-return.html`
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '微信支付处理失败，请重试');
    }
    
    return await response.json();
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
    if (!intentId) {
      throw new Error('缺少支付意图ID');
    }
    
    // 调用后端API查询支付状态
    const apiUrl = `/api/payment-intent/${intentId}`;
    console.log('检查支付状态:', intentId);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '查询支付状态失败');
    }
    
    return await response.json();
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