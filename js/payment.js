/**
 * AI行程订阅支付系统
 * 使用Airwallex支付API集成
 */

// 全局变量
let selectedPlan = null;
let selectedAmount = 0;
let selectedCurrency = 'CNY';
let paymentIntent = null;
let clientSecret = null;

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
  console.log('支付系统初始化中...');
  
  // 添加快速支付提示
  const cardHeader = document.querySelector('.card-header');
  if (cardHeader) {
    const quickPayBadge = document.createElement('span');
    quickPayBadge.className = 'badge bg-warning position-absolute top-0 end-0 mt-2 me-2';
    quickPayBadge.textContent = '快速支付';
    quickPayBadge.style.fontSize = '0.8rem';
    cardHeader.style.position = 'relative';
    cardHeader.appendChild(quickPayBadge);
  }
  
  // 绑定提交按钮事件
  const submitButton = document.getElementById('submit-button');
  if (submitButton) {
    submitButton.addEventListener('click', handleSubmit);
  }
  
  // 绑定支付按钮事件
  const paymentButton = document.getElementById('payment-button');
  if (paymentButton) {
    paymentButton.addEventListener('click', handlePayment);
  }
});

/**
 * 选择套餐计划
 * @param {string} plan - 选择的计划类型
 * @param {number} amount - 计划金额
 * @param {string} currency - 货币类型
 */
function selectPlan(plan, amount, currency) {
  console.log(`选择了${plan}计划，金额：${amount} ${currency}`);
  
  // 更新全局变量
  selectedPlan = plan;
  selectedAmount = amount;
  selectedCurrency = currency;
  
  // 更新UI显示
  const planNameElement = document.getElementById('selected-plan-name');
  const planPriceElement = document.getElementById('selected-plan-price');
  const submitButton = document.getElementById('submit-button');
  
  // 根据计划类型更新显示名称
  let planDisplayName = '';
  switch (plan) {
    case 'monthly':
      planDisplayName = '月度订阅';
      break;
    case 'yearly':
      planDisplayName = '年度订阅';
      break;
    case 'premium':
      planDisplayName = '高级订阅';
      break;
    default:
      planDisplayName = '未知计划';
  }
  
  if (planNameElement) {
    planNameElement.textContent = planDisplayName;
  }
  
  if (planPriceElement) {
    planPriceElement.textContent = `¥${amount}.00 ${plan === 'monthly' ? '/月' : '/年'}`;
  }
  
  if (submitButton) {
    submitButton.disabled = false;
  }
  
  // 滚动到订阅表单
  document.getElementById('subscribe').scrollIntoView({ behavior: 'smooth' });
}

/**
 * 处理表单提交
 * @param {Event} event - 事件对象
 */
async function handleSubmit(event) {
  event.preventDefault();
  
  // 获取表单元素（如果有）
  const firstName = document.getElementById('firstName')?.value || '未提供';
  const lastName = document.getElementById('lastName')?.value || '未提供';
  const email = document.getElementById('email')?.value || 'anonymous@example.com';
  const phone = document.getElementById('phone')?.value || '未提供';
  
  // 仅验证是否选择了套餐
  if (!selectedPlan || selectedAmount <= 0) {
    showMessage('请选择订阅计划', 'danger');
    return;
  }
  
  // 显示加载状态
  const submitButton = document.getElementById('submit-button');
  submitButton.disabled = true;
  submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 处理中...';
  
  try {
    // 创建支付意图
    const paymentIntentData = {
      amount: selectedAmount,
      currency: selectedCurrency,
      merchantOrderId: `order_${Date.now()}`,
      customerInfo: {
        firstName,
        lastName, 
        email,
        phone
      },
      returnUrl: window.location.origin + '/payment-success.html'
    };
    
    const paymentIntentResponse = await createPaymentIntent(paymentIntentData);
    paymentIntent = paymentIntentResponse;
    clientSecret = paymentIntentResponse.client_secret;
    
    // 显示支付表单
    document.getElementById('subscription-form').style.display = 'none';
    document.getElementById('payment-container').style.display = 'block';
    
    // 初始化支付组件
    await initializePaymentElement(clientSecret);
    
  } catch (error) {
    console.error('创建支付意图失败:', error);
    showMessage('处理订阅请求时发生错误，请稍后再试', 'danger');
    
    // 重置按钮状态
    submitButton.disabled = false;
    submitButton.innerHTML = '继续付款';
  }
}

/**
 * 创建支付意图
 * @param {Object} paymentData - 支付数据
 * @returns {Promise<Object>} - 支付意图对象
 */
async function createPaymentIntent(paymentData) {
  try {
    const response = await fetch('/functions/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '创建支付意图失败');
    }
    
    return await response.json();
  } catch (error) {
    console.error('支付意图API调用失败:', error);
    throw error;
  }
}

/**
 * 获取Airwallex API令牌
 * @returns {Promise<Object>} - API令牌对象
 */
async function getApiToken() {
  try {
    const response = await fetch('/functions/api/get-api-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '获取API令牌失败');
    }
    
    return await response.json();
  } catch (error) {
    console.error('获取API令牌失败:', error);
    throw error;
  }
}

/**
 * 初始化支付元素
 * @param {string} clientSecret - 客户端密钥
 */
async function initializePaymentElement(clientSecret) {
  try {
    // 加载Airwallex JS SDK
    await loadAirwallexScript();
    
    // 获取API令牌
    const tokenData = await getApiToken();
    const token = tokenData.token;
    
    // 初始化Airwallex
    window.Airwallex.init({
      env: 'demo', // 根据环境设置: 'demo' 或 'prod'
      origin: window.location.origin,
    });
    
    // 创建支付元素
    const elementOptions = {
      intent_id: paymentIntent.id,
      client_secret: clientSecret,
      currency: selectedCurrency,
      mode: 'payment'
    };
    
    // 清除之前的元素
    const paymentElement = document.getElementById('payment-element');
    paymentElement.innerHTML = '';
    
    // 创建新的元素
    const element = window.Airwallex.createElement('payment', elementOptions);
    
    // 挂载元素
    element.mount('payment-element');
    
    // 添加事件监听
    element.on('onSuccess', handlePaymentSuccess);
    element.on('onError', handlePaymentError);
    element.on('onCancel', handlePaymentCancel);
    
    // 保存元素引用
    window.paymentElement = element;
    
    showMessage('支付表单已准备就绪', 'info');
  } catch (error) {
    console.error('初始化支付元素失败:', error);
    showMessage('支付系统加载失败，请刷新页面重试', 'danger');
  }
}

/**
 * 加载Airwallex JS SDK
 * @returns {Promise<void>}
 */
function loadAirwallexScript() {
  return new Promise((resolve, reject) => {
    if (window.Airwallex) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://checkout.airwallex.com/assets/elements.bundle.min.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('无法加载Airwallex SDK'));
    
    document.head.appendChild(script);
  });
}

/**
 * 处理支付提交
 * @param {Event} event - 事件对象
 */
async function handlePayment(event) {
  event.preventDefault();
  
  const paymentButton = document.getElementById('payment-button');
  paymentButton.disabled = true;
  paymentButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 处理支付...';
  
  try {
    if (!window.paymentElement) {
      throw new Error('支付元素未初始化');
    }
    
    // 提交支付
    await window.paymentElement.submit();
  } catch (error) {
    console.error('支付提交失败:', error);
    showMessage('支付处理失败，请稍后再试', 'danger');
    
    // 重置按钮状态
    paymentButton.disabled = false;
    paymentButton.innerHTML = '完成付款';
  }
}

/**
 * 处理支付成功
 * @param {Event} event - 事件对象
 */
function handlePaymentSuccess(event) {
  console.log('支付成功:', event);
  
  // 重定向到成功页面
  window.location.href = '/payment-success.html?id=' + encodeURIComponent(paymentIntent.id);
}

/**
 * 处理支付错误
 * @param {Event} event - 事件对象
 */
function handlePaymentError(event) {
  console.error('支付错误:', event);
  
  const errorMessage = event.error && event.error.message 
    ? event.error.message 
    : '支付处理失败，请稍后再试';
  
  showMessage(errorMessage, 'danger');
  
  // 重置按钮状态
  const paymentButton = document.getElementById('payment-button');
  paymentButton.disabled = false;
  paymentButton.innerHTML = '重新尝试付款';
}

/**
 * 处理支付取消
 */
function handlePaymentCancel() {
  console.log('支付已取消');
  showMessage('您已取消支付', 'warning');
  
  // 重置按钮状态
  const paymentButton = document.getElementById('payment-button');
  paymentButton.disabled = false;
  paymentButton.innerHTML = '完成付款';
}

/**
 * 显示消息
 * @param {string} message - 消息文本
 * @param {string} type - 消息类型 (success, info, warning, danger)
 */
function showMessage(message, type = 'info') {
  const messageElement = document.getElementById('payment-message');
  if (!messageElement) return;
  
  // 清除之前的所有类
  messageElement.className = '';
  
  // 添加新类
  messageElement.classList.add('alert', `alert-${type}`, 'mt-3', 'animate-fade-in');
  
  // 设置消息
  messageElement.textContent = message;
  
  // 添加动画
  messageElement.style.animation = 'none';
  messageElement.offsetHeight; // 触发重绘
  messageElement.style.animation = 'fadeIn 0.5s ease-out forwards';
} 