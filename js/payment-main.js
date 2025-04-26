/**
 * AI行程规划支付系统 - 主入口文件
 * 
 * 支持的支付方式：
 * - 信用卡支付
 * - 支付宝支付
 * - 微信支付
 * - PayPal支付
 * - 银联支付
 * - Apple Pay
 * - Google Pay
 */

// 导入Airwallex支付API
import * as AirwallexApi from './airwallex-api.js';

// 全局变量
let paymentIntent = null; // 支付意图对象
let currentPaymentMethod = 'card'; // 当前选择的支付方式
let isInitialized = false; // 是否已初始化

// DOM元素
const paymentMethods = {}; // 支付方式元素
const forms = {}; // 表单元素
let paymentButton; // 支付按钮
let errorMessageElement; // 错误信息元素

/**
 * 初始化支付系统
 */
async function init() {
  console.log('初始化支付系统...');
  
  if (isInitialized) {
    console.log('支付系统已初始化');
    return;
  }
  
  try {
    // 初始化Airwallex API
    await AirwallexApi.init();
    
    // 获取DOM元素
    cacheDOMElements();
    
    // 创建支付意图
    paymentIntent = await AirwallexApi.createPaymentIntent({
      amount: 199.00,
      currency: 'CNY',
      description: 'AI行程规划会员月度订阅'
    });
    console.log('支付意图创建成功:', paymentIntent);
    
    // 设置支付方式切换
    setupPaymentMethodSwitcher();
    
    // 设置特殊支付方式（Apple Pay、Google Pay等）
    setupSpecialPaymentMethods();
    
    // 绑定支付按钮事件
    bindPaymentButtonEvents();
    
    // 设置默认支付方式
    selectPaymentMethod('card');
    
    isInitialized = true;
    console.log('支付系统初始化完成');
  } catch (error) {
    console.error('初始化支付系统失败:', error);
    showErrorMessage('支付系统初始化失败，请刷新页面重试');
  }
}

/**
 * 缓存DOM元素
 */
function cacheDOMElements() {
  // 支付方式元素
  document.querySelectorAll('.payment-method').forEach(method => {
    const methodType = method.getAttribute('data-method');
    paymentMethods[methodType] = method;
  });
  
  // 表单元素
  document.querySelectorAll('.payment-method-form').forEach(form => {
    const id = form.id;
    const methodType = id.replace('-form', '');
    forms[methodType] = form;
  });
  
  // 支付按钮
  paymentButton = document.getElementById('payment-button');
  
  // 错误信息元素
  errorMessageElement = document.getElementById('error-message');
  
  console.log('DOM元素缓存完成');
}

/**
 * 设置支付方式切换
 */
function setupPaymentMethodSwitcher() {
  Object.entries(paymentMethods).forEach(([methodType, element]) => {
    element.addEventListener('click', () => {
      selectPaymentMethod(methodType);
    });
  });
}

/**
 * 选择支付方式
 * @param {string} methodType - 支付方式类型
 */
function selectPaymentMethod(methodType) {
  // 更新当前支付方式
  currentPaymentMethod = methodType;
  
  // 更新UI
  Object.values(paymentMethods).forEach(method => {
    method.classList.remove('active');
  });
  
  if (paymentMethods[methodType]) {
    paymentMethods[methodType].classList.add('active');
  }
  
  // 隐藏所有表单
  Object.values(forms).forEach(form => {
    form.classList.add('hidden');
  });
  
  // 显示当前表单
  if (forms[methodType]) {
    forms[methodType].classList.remove('hidden');
  }
  
  // 重置错误信息
  hideErrorMessage();
  
  // 更新按钮文本
  updatePaymentButtonText();
  
  // 处理特殊支付方式
  handleSpecialPaymentMethod(methodType);
  
  console.log(`切换到${methodType}支付方式`);
}

/**
 * 更新支付按钮文本
 */
function updatePaymentButtonText() {
  if (!paymentButton) return;
  
  switch (currentPaymentMethod) {
    case 'card':
      paymentButton.textContent = '确认支付 ¥0.10';
      break;
    case 'alipay':
      paymentButton.textContent = '使用支付宝支付';
      break;
    case 'wechat':
      paymentButton.textContent = '使用微信支付';
      break;
    case 'paypal':
      paymentButton.textContent = '使用PayPal支付';
      break;
    case 'unionpay':
      paymentButton.textContent = '使用银联支付';
      break;
    case 'applepay':
      paymentButton.textContent = '使用Apple Pay支付';
      break;
    case 'googlepay':
      paymentButton.textContent = '使用Google Pay支付';
      break;
    default:
      paymentButton.textContent = '确认支付';
  }
}

/**
 * 处理特殊支付方式
 * @param {string} methodType - 支付方式类型
 */
function handleSpecialPaymentMethod(methodType) {
  // 默认显示主支付按钮
  if (paymentButton) {
    paymentButton.style.display = 'block';
  }
  
  // 隐藏所有特殊支付按钮
  document.querySelectorAll('.special-payment-button').forEach(button => {
    button.style.display = 'none';
  });
  
  // 处理特殊支付方式
  switch (methodType) {
    case 'applepay':
      handleApplePay();
      break;
    case 'googlepay':
      handleGooglePay();
      break;
    case 'wechat':
      handleWeChatPay();
      break;
    case 'alipay':
      handleAliPay();
      break;
    case 'paypal':
      handlePayPal();
      break;
    case 'unionpay':
      handleUnionPay();
      break;
  }
}

/**
 * 绑定支付按钮事件
 */
function bindPaymentButtonEvents() {
  if (!paymentButton) return;
  
  const paymentForm = document.getElementById('payment-form');
  if (!paymentForm) return;
  
  paymentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    processPayment();
  });
}

/**
 * 处理支付
 */
async function processPayment() {
  try {
    // 禁用支付按钮
    setPaymentButtonLoading(true);
    
    // 隐藏错误信息
    hideErrorMessage();
    
    // 根据支付方式处理支付
    switch (currentPaymentMethod) {
      case 'card':
        await processCardPayment();
        break;
      case 'alipay':
        await processAlipayPayment();
        break;
      case 'wechat':
        await processWeChatPayment();
        break;
      case 'paypal':
        await processPayPalPayment();
        break;
      case 'unionpay':
        await processUnionPayPayment();
        break;
      case 'applepay':
        await processApplePayPayment();
        break;
      case 'googlepay':
        await processGooglePayPayment();
        break;
      default:
        throw new Error('不支持的支付方式');
    }
  } catch (error) {
    console.error('支付处理失败:', error);
    showErrorMessage(error.message || '支付处理失败，请重试');
    
    // 恢复支付按钮
    setPaymentButtonLoading(false);
  }
}

/**
 * 设置支付按钮加载状态
 * @param {boolean} isLoading - 是否加载中
 */
function setPaymentButtonLoading(isLoading) {
  if (!paymentButton) return;
  
  if (isLoading) {
    paymentButton.disabled = true;
    paymentButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 处理中...';
  } else {
    paymentButton.disabled = false;
    updatePaymentButtonText();
  }
}

/**
 * 显示错误信息
 * @param {string} message - 错误信息
 */
function showErrorMessage(message) {
  if (!errorMessageElement) return;
  
  errorMessageElement.textContent = message;
  errorMessageElement.style.display = 'block';
  errorMessageElement.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
  errorMessageElement.style.color = 'var(--danger-color)';
}

/**
 * 显示成功信息
 * @param {string} message - 成功信息
 */
function showSuccessMessage(message) {
  if (!errorMessageElement) return;
  
  errorMessageElement.textContent = message;
  errorMessageElement.style.display = 'block';
  errorMessageElement.style.backgroundColor = 'rgba(46, 204, 113, 0.1)';
  errorMessageElement.style.color = 'var(--success-color)';
}

/**
 * 隐藏错误信息
 */
function hideErrorMessage() {
  if (!errorMessageElement) return;
  
  errorMessageElement.style.display = 'none';
  errorMessageElement.textContent = '';
}

/**
 * 处理支付结果
 * @param {Object} result - 支付结果
 */
function handlePaymentResult(result) {
  if (!result) {
    showErrorMessage('未收到支付结果');
    return;
  }
  
  console.log('处理支付结果:', result);
  
  switch (result.status) {
    case 'SUCCEEDED':
      // 支付成功
      showSuccessMessage('支付成功！正在跳转...');
      
      // 跳转到成功页面
      setTimeout(() => {
        window.location.href = `/payment-success.html?txn_id=${result.id || paymentIntent.id}`;
      }, 1500);
      break;
      
    case 'REQUIRES_PAYMENT_METHOD':
      // 支付方式无效
      showErrorMessage('支付方式无效，请重试或选择其他支付方式');
      setPaymentButtonLoading(false);
      break;
      
    case 'REQUIRES_ACTION':
    case 'REQUIRES_CUSTOMER_ACTION':
      // 需要额外操作
      if (result.next_action) {
        handleNextAction(result.next_action);
      } else {
        showErrorMessage('需要额外操作完成支付，但未提供操作信息');
        setPaymentButtonLoading(false);
      }
      break;
      
    case 'PROCESSING':
      // 支付处理中
      showSuccessMessage('支付处理中，请稍候...');
      
      // 定时查询支付状态
      startPaymentStatusPolling(result.id);
      break;
      
    case 'CANCELLED':
      showErrorMessage('支付已取消');
      setPaymentButtonLoading(false);
      break;
      
    case 'FAILED':
      showErrorMessage(result.error_message || '支付失败，请重试');
      setPaymentButtonLoading(false);
      break;
      
    default:
      showErrorMessage(`未知支付状态: ${result.status}`);
      setPaymentButtonLoading(false);
  }
}

/**
 * 处理支付下一步操作
 * @param {Object} nextAction - 下一步操作
 */
function handleNextAction(nextAction) {
  switch (nextAction.type) {
    case 'redirect':
      // 重定向到第三方页面
      showSuccessMessage('正在跳转到支付页面...');
      setTimeout(() => {
        window.location.href = nextAction.url;
      }, 1000);
      break;
      
    case 'qrcode':
      // 显示二维码
      showQRCode(nextAction.qrcode_data || nextAction.data);
      break;
      
    case '3ds':
      // 3DS验证
      show3DSVerification(nextAction);
      break;
      
    default:
      showErrorMessage(`不支持的后续操作类型: ${nextAction.type}`);
      setPaymentButtonLoading(false);
  }
}

/**
 * 显示二维码
 * @param {string} qrcodeData - 二维码数据
 */
function showQRCode(qrcodeData) {
  // 创建二维码容器
  let qrcodeContainer = document.getElementById('payment-qrcode');
  
  if (!qrcodeContainer) {
    qrcodeContainer = document.createElement('div');
    qrcodeContainer.id = 'payment-qrcode';
    qrcodeContainer.style.textAlign = 'center';
    qrcodeContainer.style.marginBottom = '20px';
    
    // 插入到合适的位置
    const formContainer = document.querySelector('.payment-form-container');
    if (formContainer) {
      formContainer.insertBefore(qrcodeContainer, document.getElementById('payment-form'));
    } else {
      const paymentForm = document.getElementById('payment-form');
      if (paymentForm) {
        paymentForm.parentNode.insertBefore(qrcodeContainer, paymentForm);
      } else {
        document.querySelector('.payment-container').appendChild(qrcodeContainer);
      }
    }
  }
  
  // 生成二维码图像
  qrcodeContainer.innerHTML = `
    <h3 style="margin-bottom: 15px;">请扫描二维码完成支付</h3>
    <div style="display: inline-block; background: white; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
      <img src="${qrcodeData.startsWith('http') ? qrcodeData : 'https://api.qrserver.com/v1/create-qr-code/?data=' + encodeURIComponent(qrcodeData) + '&size=200x200'}" 
           alt="支付二维码" style="max-width: 200px; max-height: 200px;">
    </div>
    <p style="margin-top: 15px; color: var(--dark-gray);">支付完成后页面将自动跳转</p>
  `;
  
  // 显示消息
  showSuccessMessage('请扫描二维码完成支付');
  
  // 开始轮询支付状态
  if (paymentIntent && paymentIntent.id) {
    startPaymentStatusPolling(paymentIntent.id);
  }
}

/**
 * 开始轮询支付状态
 * @param {string} intentId - 支付意图ID
 */
function startPaymentStatusPolling(intentId) {
  if (!intentId) return;
  
  let attempts = 0;
  const maxAttempts = 12; // 最多尝试12次，约1分钟
  const interval = 5000; // 每5秒查询一次
  
  const statusCheckTimer = setInterval(async () => {
    if (attempts >= maxAttempts) {
      clearInterval(statusCheckTimer);
      showErrorMessage('支付状态查询超时，请刷新页面或查看订单状态');
      return;
    }
    
    attempts++;
    
    try {
      const response = await fetch(`/api/payment-intent/${intentId}`);
      
      if (!response.ok) {
        throw new Error('查询支付状态失败');
      }
      
      const result = await response.json();
      
      if (result.status === 'SUCCEEDED') {
        // 支付成功
        clearInterval(statusCheckTimer);
        showSuccessMessage('支付成功！正在跳转...');
        
        setTimeout(() => {
          window.location.href = `/payment-success.html?txn_id=${intentId}`;
        }, 1500);
      } else if (result.status === 'FAILED' || result.status === 'CANCELLED') {
        // 支付失败或取消
        clearInterval(statusCheckTimer);
        showErrorMessage(result.error_message || '支付未成功，请重试');
        setPaymentButtonLoading(false);
      } else if (result.status !== 'PROCESSING' && result.status !== 'REQUIRES_CUSTOMER_ACTION') {
        // 其他非处理中状态
        clearInterval(statusCheckTimer);
        handlePaymentResult(result);
      }
      // 如果仍在处理中，继续轮询
    } catch (error) {
      console.error('查询支付状态失败:', error);
      // 查询失败不停止轮询，继续尝试
    }
  }, interval);
  
  // 存储定时器引用，以便在必要时清除
  window.paymentStatusTimer = statusCheckTimer;
}

/**
 * 处理信用卡支付
 */
async function processCardPayment() {
  try {
    // 验证卡信息
    const cardHolder = document.getElementById('card-holder')?.value || '';
    const cardNumber = document.getElementById('card-number')?.value.replace(/\s/g, '') || '';
    const cardExpiry = document.getElementById('card-expiry')?.value.split('/') || ['', ''];
    const cardCvc = document.getElementById('card-cvc')?.value || '';
    
    // 简单验证
    if (!cardHolder.trim()) {
      throw new Error('请输入持卡人姓名');
    }
    
    if (!cardNumber.trim() || cardNumber.length < 15) {
      throw new Error('请输入有效的卡号');
    }
    
    if (!cardExpiry[0] || !cardExpiry[1] || cardExpiry[0].length !== 2 || cardExpiry[1].length !== 2) {
      throw new Error('请输入有效的到期日期（月/年）');
    }
    
    if (!cardCvc.trim() || !/^\d{3,4}$/.test(cardCvc)) {
      throw new Error('请输入有效的安全码');
    }
    
    // 准备支付参数
    const paymentParams = {
      intent_id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      payment_method: 'card',
      payment_method_options: {
        card: {
          card_number: cardNumber,
          expiry_month: cardExpiry[0],
          expiry_year: cardExpiry[1],
          cvc: cardCvc,
          name: cardHolder,
          auto_capture: true
        }
      }
    };
    
    // 发送支付请求
    const response = await fetch('/api/confirm-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentParams)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '支付处理失败，请重试');
    }
    
    const result = await response.json();
    handlePaymentResult(result);
  } catch (error) {
    console.error('信用卡支付失败:', error);
    throw error;
  }
}

// 导出模块函数
export {
  init,
  processPayment,
  selectPaymentMethod,
  showErrorMessage,
  showSuccessMessage
}; 