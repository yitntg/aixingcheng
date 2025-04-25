/**
 * AI行程 - Airwallex支付集成
 */

// 配置信息
const config = {
  env: 'demo', // 'demo'或'prod'环境
  origin: window.location.origin,
  locale: 'zh',
  currency: 'CNY',
  amount: 0.1, // 订阅金额 - 修改为0.1元用于测试
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
 * 注意：实际应用中应该从后端获取支付意图
 */
async function getPaymentIntent() {
  try {
    // 模拟从服务器获取支付意图
    // 在实际应用中，应该通过API请求从服务器获取
    // const response = await fetch('/api/create-payment-intent', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ 
    //     amount: config.amount,
    //     currency: config.currency 
    //   })
    // });
    // 
    // if (!response.ok) {
    //   throw new Error('创建支付意图失败');
    // }
    // 
    // paymentIntent = await response.json();
    
    // 模拟支付意图（仅供演示）
    paymentIntent = {
      id: 'demo_' + Math.random().toString(36).substring(2, 15),
      client_secret: 'demo_secret_' + Math.random().toString(36).substring(2, 15),
      amount: config.amount,
      currency: config.currency,
    };
    
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
    // 确认支付意图
    const confirmResult = await airwallexInstance.confirmPaymentIntent({
      element: cardElement,
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      payment_method_options: {
        card: {
          auto_capture: true
        }
      }
    });
    
    console.log('支付结果:', confirmResult);
    
    // 处理支付结果
    if (confirmResult && confirmResult.status === 'SUCCEEDED') {
      // 支付成功
      showMessage('支付成功！正在跳转...', 'success');
      
      // 跳转到成功页面
      setTimeout(() => {
        window.location.href = `./payment-success.html?txn_id=${paymentIntent.id}`;
      }, 1000);
    } else {
      // 处理其他支付状态
      handlePaymentStatus(confirmResult);
    }
  } catch (error) {
    console.error('支付失败:', error);
    
    // 显示错误信息
    showError(error.message || '支付处理失败，请重试');
    
    // 还原按钮
    paymentButton.innerHTML = originalButtonText;
    paymentButton.disabled = false;
    
    // 处理特定错误
    if (error.code) {
      handlePaymentError(error);
    }
  }
}

/**
 * 处理支付状态
 */
function handlePaymentStatus(result) {
  if (!result) return;
  
  const paymentButton = document.getElementById('payment-button');
  
  switch (result.status) {
    case 'PROCESSING':
      showMessage('支付正在处理中，请稍候...', 'processing');
      
      // 可以在这里实现轮询查询支付状态
      // pollPaymentStatus(result.id);
      break;
      
    case 'REQUIRES_ACTION':
      showMessage('需要额外的验证步骤', 'processing');
      
      // 处理3DS验证
      airwallexInstance.handleNextAction({
        intent_id: result.id,
        client_secret: paymentIntent.client_secret,
        onSuccess: (successResult) => {
          // 验证成功
          showMessage('验证成功，支付完成！', 'success');
          setTimeout(() => {
            window.location.href = `./payment-success.html?txn_id=${result.id}`;
          }, 1000);
        },
        onError: (error) => {
          // 验证失败
          showError('验证失败: ' + error.message);
          paymentButton.innerHTML = '重试支付';
          paymentButton.disabled = false;
        },
      });
      break;
      
    default:
      showError(`支付状态: ${result.status}`);
      
      // 还原按钮
      paymentButton.innerHTML = '重试支付';
      paymentButton.disabled = false;
      
      // 对于未知状态，可能需要跳转到失败页面
      setTimeout(() => {
        window.location.href = `./payment-failed.html?error_message=${encodeURIComponent('支付未完成')}&error_code=${encodeURIComponent(result.status)}`;
      }, 2000);
  }
}

/**
 * 处理支付错误
 */
function handlePaymentError(error) {
  // 跳转到失败页面
  setTimeout(() => {
    window.location.href = `./payment-failed.html?error_message=${encodeURIComponent(error.message)}&error_code=${encodeURIComponent(error.code)}`;
  }, 2000);
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