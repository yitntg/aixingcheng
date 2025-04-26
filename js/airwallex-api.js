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
    const apiUrl = '/api/confirm-payment';
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
 * 确认信用卡支付 - 直接使用Airwallex SDK
 * @param {Object} params - 支付参数
 * @returns {Promise<Object>} - 支付结果
 */
async function confirmCardPayment(params) {
  try {
    // 验证必要参数
    if (!params.card_details) {
      throw new Error('缺少卡片信息');
    }
    
    // 使用SDK的confirmPaymentIntent方法
    const result = await Airwallex.confirmPaymentIntent({
      element: elementInstances.card,
      id: params.intent_id,
      client_secret: params.client_secret,
      payment_method: {
        type: 'card',
        card: params.card_details
      }
    });
    
    return result;
  } catch (error) {
    console.error('卡支付失败:', error);
    throw error;
  }
}

/**
 * 创建Airwallex元素
 * @param {string} type - 元素类型
 * @param {Object} options - 元素选项
 * @returns {Object} - 创建的元素
 */
function createElement(type, options = {}) {
  try {
    if (!Airwallex) {
      throw new Error('Airwallex SDK未初始化');
    }
    
    const element = Airwallex.createElement(type, options);
    elementInstances[type] = element;
    return element;
  } catch (error) {
    console.error(`创建${type}元素失败:`, error);
    throw error;
  }
}

/**
 * 获取创建的元素
 * @param {string} type - 元素类型
 * @returns {Object|null} - 元素实例
 */
function getElement(type) {
  return elementInstances[type] || null;
}

/**
 * 检查支付状态
 * @param {string} intentId - 支付意图ID
 * @returns {Promise<Object>} - 支付状态
 */
async function checkPaymentStatus(intentId) {
  try {
    const apiUrl = `/api/payment-intent/${intentId}`;
    console.log('检查支付状态:', intentId);
    
    const response = await fetch(apiUrl);
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

// 导出模块方法
export {
  init,
  createPaymentIntent,
  confirmPaymentIntent,
  confirmCardPayment,
  createElement,
  getElement,
  checkPaymentStatus
}; 