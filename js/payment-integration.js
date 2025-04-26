/**
 * AI行程 - Airwallex支付集成
 */

// 配置信息
const config = {
  env: 'prod', // 'demo'或'prod'环境
  origin: window.location.origin,
  locale: 'zh',
  currency: 'CNY',
  amount: 199.00, // 订阅金额 - 真实订阅价格
}

// Airwallex实例
let airwallexInstance;
let paymentIntent;
let cardElement;

/**
 * 初始化Airwallex
 */
async function initAirwallex() {
  try {
    // 加载Airwallex SDK
    airwallexInstance = await Airwallex.loadAirwallex({
      env: config.env,
      origin: config.origin,
      locale: config.locale,
    });
    
    console.log('Airwallex SDK初始化成功');
    
    // 获取支付意图
    await getPaymentIntent();
    
    // 创建卡片元素
    createCardElement();
    
    // 设置支付按钮
    setupPaymentButton();
    
  } catch (error) {
    console.error('初始化Airwallex失败:', error);
    showError('初始化支付系统失败，请刷新页面重试');
  }
}

/**
 * 获取支付意图
 */
async function getPaymentIntent() {
  try {
    // 从服务器获取支付意图
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        amount: config.amount,
        currency: config.currency,
        description: 'AI行程规划会员月度订阅'
      })
    });
    
    if (!response.ok) {
      throw new Error('创建支付意图失败：' + response.statusText);
    }
    
    paymentIntent = await response.json();
    console.log('获取支付意图成功:', paymentIntent.id);
    
  } catch (error) {
    console.error('获取支付意图失败:', error);
    showError('准备支付信息失败，请稍后再试');
    throw error;
  }
}

/**
 * 创建卡片元素
 */
function createCardElement() {
  const elementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#4d5461',
        '::placeholder': {
          color: '#737791',
        },
      },
      invalid: {
        color: '#f87171',
      },
    },
  };
  
  try {
    cardElement = airwallexInstance.createElement('card', elementOptions);
    cardElement.mount('card-element');
  } catch (error) {
    console.error('创建卡片元素失败:', error);
    showError('加载支付表单失败，请刷新页面重试');
  }
}

/**
 * 设置支付按钮
 */
function setupPaymentButton() {
  const paymentButton = document.getElementById('payment-button');
  
  if (paymentButton) {
    paymentButton.addEventListener('click', handlePayment);
  }
}

/**
 * 处理支付
 */
async function handlePayment() {
  const paymentButton = document.getElementById('payment-button');
  paymentButton.disabled = true;
  
  // 修改按钮文本和样式
  const originalButtonText = paymentButton.textContent;
  paymentButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 处理中...';
  
  // 显示处理中消息
  showMessage('正在处理您的支付请求...', 'processing');
  
  try {
    // 获取支付方式
    const currentMethod = getCurrentPaymentMethod();
    
    // 准备支付参数
    const paymentParams = {
      intent_id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      payment_method: currentMethod,
      payment_method_options: {}
    };
    
    // 根据不同支付方式准备特定参数
    switch(currentMethod) {
      case 'card':
        // 获取卡信息
        const cardHolder = document.getElementById('card-holder')?.value || '';
        const cardNumber = document.getElementById('card-number')?.value.replace(/\s/g, '') || '';
        const cardExpiry = document.getElementById('card-expiry')?.value.split('/') || ['', ''];
        const cardCvc = document.getElementById('card-cvc')?.value || '';
        
        // 添加卡信息到支付参数
        paymentParams.payment_method_options.card = {
          card_number: cardNumber,
          expiry_month: cardExpiry[0],
          expiry_year: cardExpiry[1],
          cvc: cardCvc,
          name: cardHolder,
          auto_capture: true
        };
        break;
        
      case 'alipay':
      case 'wechat':
      case 'paypal':
      case 'unionpay':
        // 添加回调URL
        paymentParams.payment_method_options[currentMethod] = {
          return_url: window.location.origin + '/payment-return.html'
        };
        break;
    }
    
    console.log('发送支付请求:', paymentParams);
    
    // 调用后端API确认支付
    const response = await fetch('/api/confirm-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentParams)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '支付处理失败，请重试');
    }
    
    const confirmResult = await response.json();
    console.log('支付结果:', confirmResult);
    
    // 处理支付结果
    handlePaymentResult(confirmResult);
  } catch (error) {
    console.error('支付失败:', error);
    
    // 显示错误信息
    showError(error.message || '支付处理失败，请重试');
    
    // 还原按钮
    paymentButton.innerHTML = originalButtonText;
    paymentButton.disabled = false;
  }
}

/**
 * 获取当前支付方式
 */
function getCurrentPaymentMethod() {
  // 通过活跃的支付方式元素查找
  const activeMethod = document.querySelector('.payment-method.active');
  if (activeMethod) {
    return activeMethod.getAttribute('data-method');
  }
  return 'card'; // 默认支付方式
}

/**
 * 处理支付结果
 * @param {Object} result - 支付结果对象
 */
function handlePaymentResult(result) {
  if (!result) {
    showError('未收到支付结果');
    return;
  }
  
  // 根据状态处理
  switch (result.status) {
    case 'SUCCEEDED':
      // 支付成功
      showMessage('支付成功！正在跳转...', 'success');
      
      // 跳转到成功页面
      setTimeout(() => {
        window.location.href = `./payment-success.html?txn_id=${result.id || paymentIntent.id}`;
      }, 1500);
      break;
      
    case 'REQUIRES_PAYMENT_METHOD':
      // 支付方式错误
      showError('支付方式无效，请重试或使用其他支付方式');
      break;
      
    case 'REQUIRES_CUSTOMER_ACTION':
    case 'REQUIRES_ACTION':
      // 需要用户额外操作
      if (result.next_action && result.next_action.type === 'redirect') {
        // 重定向到第三方页面
        showMessage('正在重定向到支付页面...', 'processing');
        setTimeout(() => {
          window.location.href = result.next_action.url;
        }, 1000);
      } else if (result.next_action && result.next_action.type === 'qrcode' && result.next_action.data) {
        // 显示二维码
        displayQRCode(result.next_action.data);
      } else {
        showError('需要额外操作以完成支付');
      }
      break;
      
    case 'PROCESSING':
      // 支付处理中
      showMessage('支付正在处理中，请稍候...', 'processing');
      // 可以设置定时查询支付状态
      pollPaymentStatus(result.id);
      break;
      
    case 'CANCELLED':
      showError('支付已取消');
      break;
      
    case 'FAILED':
      showError(result.error_message || '支付失败，请重试');
      break;
      
    default:
      showMessage(`支付状态: ${result.status}，请稍后查看结果`, 'processing');
  }
}

/**
 * 定时查询支付状态
 * @param {string} intentId - 支付意图ID
 */
function pollPaymentStatus(intentId) {
  if (!intentId) return;
  
  let attempts = 0;
  const maxAttempts = 10;
  const interval = 3000; // 3秒查询一次
  
  const checkStatus = async () => {
    if (attempts >= maxAttempts) {
      showMessage('支付状态查询超时，请刷新页面查看结果', 'processing');
      return;
    }
    
    try {
      const response = await fetch(`/api/payment-intent/${intentId}`);
      if (!response.ok) {
        throw new Error('查询支付状态失败');
      }
      
      const result = await response.json();
      
      if (result.status === 'SUCCEEDED') {
        // 支付成功
        showMessage('支付成功！正在跳转...', 'success');
        setTimeout(() => {
          window.location.href = `./payment-success.html?txn_id=${intentId}`;
        }, 1500);
        return;
      } else if (result.status === 'FAILED' || result.status === 'CANCELLED') {
        // 支付失败
        showError(result.error_message || '支付失败');
        return;
      } else if (result.status !== 'PROCESSING') {
        // 其他非处理中状态
        handlePaymentResult(result);
        return;
      }
      
      // 仍在处理中，继续查询
      attempts++;
      setTimeout(checkStatus, interval);
    } catch (error) {
      console.error('查询支付状态失败:', error);
      attempts++;
      setTimeout(checkStatus, interval);
    }
  };
  
  // 开始查询
  setTimeout(checkStatus, interval);
}

/**
 * 显示二维码
 * @param {string} qrcodeData - 二维码数据或URL
 */
function displayQRCode(qrcodeData) {
  // 查找或创建二维码容器
  let qrcodeContainer = document.getElementById('payment-qrcode');
  if (!qrcodeContainer) {
    qrcodeContainer = document.createElement('div');
    qrcodeContainer.id = 'payment-qrcode';
    qrcodeContainer.style.textAlign = 'center';
    qrcodeContainer.style.marginBottom = '20px';
    
    // 插入到按钮前面
    const paymentButton = document.getElementById('payment-button');
    if (paymentButton && paymentButton.parentNode) {
      paymentButton.parentNode.insertBefore(qrcodeContainer, paymentButton);
    } else {
      // 找不到支付按钮，尝试插入到错误消息前面
      const errorElement = document.getElementById('error-message');
      if (errorElement && errorElement.parentNode) {
        errorElement.parentNode.insertBefore(qrcodeContainer, errorElement);
      } else {
        // 最后尝试添加到表单中
        const form = document.getElementById('payment-form');
        if (form) {
          form.appendChild(qrcodeContainer);
        } else {
          console.error('无法找到插入二维码的位置');
          return;
        }
      }
    }
  }
  
  // 生成二维码图像HTML
  qrcodeContainer.innerHTML = `
    <h3>请扫描以下二维码完成支付</h3>
    <div style="background-color: #fff; padding: 15px; display: inline-block; margin: 10px 0;">
      <img src="${qrcodeData.startsWith('http') ? qrcodeData : 'https://api.qrserver.com/v1/create-qr-code/?data=' + encodeURIComponent(qrcodeData) + '&size=200x200'}" 
           alt="支付二维码" style="max-width: 200px; max-height: 200px;">
    </div>
    <p>请使用手机扫描二维码完成支付</p>
  `;
  
  // 显示提示
  showMessage('请扫描二维码完成支付', 'processing');
}

/**
 * 显示消息
 */
function showMessage(message, type = 'info') {
  const errorElement = document.getElementById('error-message');
  if (!errorElement) return;
  
  // 根据类型设置样式
  errorElement.style.display = 'block';
  
  switch (type) {
    case 'success':
      errorElement.style.backgroundColor = 'rgba(52, 211, 153, 0.1)';
      errorElement.style.color = 'var(--success-color)';
      break;
    case 'processing':
      errorElement.style.backgroundColor = 'rgba(249, 250, 251, 0.5)';
      errorElement.style.color = 'var(--secondary-color)';
      break;
    case 'error':
      errorElement.style.backgroundColor = 'rgba(248, 113, 113, 0.1)';
      errorElement.style.color = 'var(--danger-color)';
      break;
    default:
      errorElement.style.backgroundColor = 'rgba(248, 250, 252, 0.8)';
      errorElement.style.color = 'var(--text-color)';
  }
  
  errorElement.textContent = message;
}

/**
 * 显示错误消息
 */
function showError(message) {
  showMessage(message, 'error');
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
  // 检查是否有Airwallex SDK
  if (typeof Airwallex !== 'undefined') {
    initAirwallex();
  } else {
    console.error('Airwallex SDK未加载');
    showError('支付系统未正确加载，请刷新页面重试');
  }
}); 