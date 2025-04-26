/**
 * 支付处理器模块 - 处理各种支付方式的具体逻辑
 */

import * as AirwallexApi from './airwallex-api.js';

/**
 * 处理信用卡支付
 * @param {Object} paymentIntent - 支付意图对象
 * @returns {Promise<Object>} - 支付结果
 */
async function processCardPayment(paymentIntent) {
  try {
    // 验证表单
    const validationResult = validateCardForm();
    if (!validationResult.valid) {
      throw new Error(validationResult.message);
    }
    
    // 获取卡片信息
    const cardHolder = document.getElementById('card-holder').value.trim();
    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const cardExpiry = document.getElementById('card-expiry').value.trim().split('/');
    const cardCvc = document.getElementById('card-cvc').value.trim();
    
    // 构建支付参数
    const params = {
      intent_id: paymentIntent.id,
      payment_method: 'card',
      card_details: {
        card_number: cardNumber,
        expiry_month: cardExpiry[0],
        expiry_year: cardExpiry[1],
        cvc: cardCvc,
        name: cardHolder
      }
    };
    
    // 确认支付
    return await AirwallexApi.confirmPaymentIntent(params);
  } catch (error) {
    console.error('信用卡支付失败:', error);
    throw error;
  }
}

/**
 * 处理支付宝支付
 * @param {Object} paymentIntent - 支付意图对象
 * @returns {Promise<Object>} - 支付结果
 */
async function processAlipayPayment(paymentIntent) {
  try {
    // 构建支付参数
    const params = {
      intent_id: paymentIntent.id,
      payment_method: 'alipay',
      payment_method_options: {
        alipay: {
          return_url: window.location.origin + '/payment-return.html'
        }
      }
    };
    
    // 确认支付
    return await AirwallexApi.confirmPaymentIntent(params);
  } catch (error) {
    console.error('支付宝支付失败:', error);
    throw error;
  }
}

/**
 * 处理微信支付
 * @param {Object} paymentIntent - 支付意图对象
 * @returns {Promise<Object>} - 支付结果
 */
async function processWeChatPayment(paymentIntent) {
  try {
    // 构建支付参数
    const params = {
      intent_id: paymentIntent.id,
      payment_method: 'wechatpay',
      payment_method_options: {
        wechatpay: {
          client_type: 'WEB'
        }
      }
    };
    
    // 确认支付
    const result = await AirwallexApi.confirmPaymentIntent(params);
    
    // 如果有二维码，显示二维码
    if (result.next_action && result.next_action.qrcode_data) {
      displayWeChatQRCode(result.next_action.qrcode_data);
      
      // 开始轮询支付状态
      startPollingPaymentStatus(result.id);
    }
    
    return result;
  } catch (error) {
    console.error('微信支付失败:', error);
    throw error;
  }
}

/**
 * 处理PayPal支付
 * @param {Object} paymentIntent - 支付意图对象
 * @returns {Promise<Object>} - 支付结果
 */
async function processPayPalPayment(paymentIntent) {
  try {
    // 构建支付参数
    const params = {
      intent_id: paymentIntent.id,
      payment_method: 'paypal',
      payment_method_options: {
        paypal: {
          return_url: window.location.origin + '/payment-return.html'
        }
      }
    };
    
    // 确认支付
    return await AirwallexApi.confirmPaymentIntent(params);
  } catch (error) {
    console.error('PayPal支付失败:', error);
    throw error;
  }
}

/**
 * 处理银联支付
 * @param {Object} paymentIntent - 支付意图对象
 * @returns {Promise<Object>} - 支付结果
 */
async function processUnionPayPayment(paymentIntent) {
  try {
    // 构建支付参数
    const params = {
      intent_id: paymentIntent.id,
      payment_method: 'union_pay',
      payment_method_options: {
        union_pay: {
          return_url: window.location.origin + '/payment-return.html'
        }
      }
    };
    
    // 确认支付
    return await AirwallexApi.confirmPaymentIntent(params);
  } catch (error) {
    console.error('银联支付失败:', error);
    throw error;
  }
}

/**
 * 处理Apple Pay支付
 * @param {Object} paymentIntent - 支付意图对象
 * @returns {Promise<Object>} - 支付结果
 */
async function processApplePayPayment(paymentIntent) {
  try {
    // 检查设备是否支持Apple Pay
    if (!window.ApplePaySession || !ApplePaySession.canMakePayments()) {
      throw new Error('您的设备不支持Apple Pay');
    }
    
    // 构建支付参数
    const params = {
      intent_id: paymentIntent.id,
      payment_method: 'applepay',
      payment_method_options: {
        applepay: {
          return_url: window.location.origin + '/payment-return.html'
        }
      }
    };
    
    // 确认支付
    return await AirwallexApi.confirmPaymentIntent(params);
  } catch (error) {
    console.error('Apple Pay支付失败:', error);
    throw error;
  }
}

/**
 * 处理Google Pay支付
 * @param {Object} paymentIntent - 支付意图对象
 * @returns {Promise<Object>} - 支付结果
 */
async function processGooglePayPayment(paymentIntent) {
  try {
    // 检查设备是否支持Google Pay
    if (!window.google || !window.google.payments) {
      throw new Error('您的设备不支持Google Pay');
    }
    
    // 构建支付参数
    const params = {
      intent_id: paymentIntent.id,
      payment_method: 'googlepay',
      payment_method_options: {
        googlepay: {
          return_url: window.location.origin + '/payment-return.html'
        }
      }
    };
    
    // 确认支付
    return await AirwallexApi.confirmPaymentIntent(params);
  } catch (error) {
    console.error('Google Pay支付失败:', error);
    throw error;
  }
}

/**
 * 显示微信支付二维码
 * @param {string} qrcodeData - 二维码数据
 */
function displayWeChatQRCode(qrcodeData) {
  const qrcodeContainer = document.getElementById('wechat-qrcode');
  if (!qrcodeContainer) return;
  
  // 显示二维码容器
  qrcodeContainer.style.display = 'flex';
  
  // 创建二维码图片
  const qrImage = document.createElement('img');
  qrImage.src = qrcodeData;
  qrImage.alt = '微信支付二维码';
  qrImage.style.width = '100%';
  qrImage.style.height = '100%';
  
  // 清空并添加二维码图片
  qrcodeContainer.innerHTML = '';
  qrcodeContainer.appendChild(qrImage);
  
  // 添加提示文字
  const statusElement = document.getElementById('wechat-status') || createWeChatStatusElement();
  statusElement.textContent = '请使用微信扫描二维码进行支付';
}

/**
 * 创建微信支付状态元素
 * @returns {HTMLElement} - 状态元素
 */
function createWeChatStatusElement() {
  const wechatForm = document.getElementById('wechat-form');
  if (!wechatForm) return null;
  
  const statusElement = document.createElement('div');
  statusElement.id = 'wechat-status';
  statusElement.style = 'text-align: center; margin-top: 10px; color: #666;';
  
  const qrcodeContainer = document.getElementById('wechat-qrcode');
  if (qrcodeContainer && qrcodeContainer.parentNode) {
    qrcodeContainer.parentNode.insertBefore(statusElement, qrcodeContainer.nextSibling);
  } else {
    wechatForm.querySelector('.form-group').appendChild(statusElement);
  }
  
  return statusElement;
}

/**
 * 开始轮询支付状态
 * @param {string} intentId - 支付意图ID
 */
function startPollingPaymentStatus(intentId) {
  const statusElement = document.getElementById('wechat-status');
  if (!statusElement) return;
  
  // 设置轮询间隔
  const interval = setInterval(async () => {
    try {
      // 查询支付状态
      const result = await AirwallexApi.checkPaymentStatus(intentId);
      
      // 根据状态更新UI
      if (result.status === 'SUCCEEDED') {
        // 支付成功
        clearInterval(interval);
        statusElement.textContent = '支付成功！正在跳转...';
        statusElement.style.color = '#2ecc71';
        
        // 跳转到成功页面
        setTimeout(() => {
          window.location.href = `/payment-success.html?txn_id=${intentId}`;
        }, 2000);
      } else if (result.status === 'FAILED') {
        // 支付失败
        clearInterval(interval);
        statusElement.textContent = '支付失败，请重试';
        statusElement.style.color = '#e74c3c';
      } else {
        // 处理中
        statusElement.textContent = '等待支付确认...';
      }
    } catch (error) {
      console.error('查询支付状态失败:', error);
    }
  }, 3000);
  
  // 60秒后停止轮询
  setTimeout(() => {
    clearInterval(interval);
    
    // 检查最终状态
    if (statusElement.textContent.indexOf('成功') === -1 && 
        statusElement.textContent.indexOf('失败') === -1) {
      statusElement.textContent = '支付超时，请重试';
      statusElement.style.color = '#e74c3c';
    }
  }, 60000);
}

/**
 * 验证信用卡表单
 * @returns {Object} - 验证结果 {valid: boolean, message: string}
 */
function validateCardForm() {
  const cardHolder = document.getElementById('card-holder')?.value.trim();
  const cardNumber = document.getElementById('card-number')?.value.trim().replace(/\s/g, '');
  const cardExpiry = document.getElementById('card-expiry')?.value.trim();
  const cardCvc = document.getElementById('card-cvc')?.value.trim();
  
  // 验证持卡人
  if (!cardHolder) {
    return { valid: false, message: '请输入持卡人姓名' };
  }
  
  // 验证卡号
  if (!cardNumber || cardNumber.length < 15 || cardNumber.length > 19 || !/^\d+$/.test(cardNumber)) {
    return { valid: false, message: '请输入有效的卡号' };
  }
  
  // 验证有效期
  if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
    return { valid: false, message: '请输入有效的到期日期 (MM/YY)' };
  }
  
  const [month, year] = cardExpiry.split('/');
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;
  
  if (parseInt(month) < 1 || parseInt(month) > 12) {
    return { valid: false, message: '月份必须介于1-12之间' };
  }
  
  if (parseInt(year) < currentYear || 
      (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
    return { valid: false, message: '卡片已过期' };
  }
  
  // 验证CVC
  if (!cardCvc || !/^\d{3,4}$/.test(cardCvc)) {
    return { valid: false, message: '请输入有效的安全码 (CVC)' };
  }
  
  return { valid: true, message: '' };
}

// 导出模块函数
export {
  processCardPayment,
  processAlipayPayment,
  processWeChatPayment,
  processPayPalPayment,
  processUnionPayPayment,
  processApplePayPayment,
  processGooglePayPayment
}; 