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
  console.log('处理支付结果:', result);
  
  if (result.status === 'SUCCEEDED') {
    showSuccessMessage('支付成功！正在跳转...');
    
    // 跳转到成功页面
    setTimeout(() => {
      window.location.href = `/payment-success.html?txn_id=${result.id || paymentIntent.id}`;
    }, 2000);
  } else if (result.next_action) {
    // 需要额外操作
    handleNextAction(result.next_action);
  } else if (result.error) {
    // 支付失败
    throw new Error(result.error);
  } else {
    // 其他状态
    showSuccessMessage('支付请求已提交，请稍后查看结果');
  }
}

/**
 * 处理下一步操作
 * @param {Object} nextAction - 下一步操作信息
 */
function handleNextAction(nextAction) {
  if (nextAction.type === 'redirect') {
    // 跳转到第三方支付页面
    window.location.href = nextAction.url;
  } else if (nextAction.type === 'qrcode') {
    // 显示二维码
    showQRCode(nextAction.qrcode_url || nextAction.qrcode_data);
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