/**
 * Airwallex支付集成JS
 * 该文件负责处理与Airwallex支付网关的通信
 */

// Airwallex全局对象
let Airwallex;
let cardElement; // 存储卡片元素

/**
 * 初始化Airwallex SDK
 */
function initAirwallex() {
  // 检查是否已经加载了SDK
  if (document.querySelector('script[src*="elements.bundle.min.js"]') === null) {
    console.error('Airwallex SDK未加载，请确保页面中引入了elements.bundle.min.js');
    return;
  }

  // 加载Airwallex SDK
  if (window.Airwallex) {
    Airwallex = window.Airwallex;
    Airwallex.loadAirwallex({
      env: 'demo', // 可选值: 'sandbox', 'demo', 'prod'
      origin: window.location.origin, // 用于验证的域名
    }).then(() => {
      console.log('Airwallex SDK初始化成功');
      // 触发初始化成功事件
      document.dispatchEvent(new CustomEvent('airwallex-ready'));
      
      // 初始化表单字段
      initializeFormFields();
    }).catch(error => {
      console.error('Airwallex SDK初始化失败:', error);
    });
  } else {
    console.error('无法加载Airwallex SDK，请确保script标签正确引入');
  }
}

/**
 * 初始化信用卡表单字段
 */
function initializeFormFields() {
  if (!Airwallex) {
    console.error('Airwallex未初始化，无法创建表单字段');
    return;
  }
  
  try {
    console.log('初始化信用卡表单字段...');
    
    // 创建卡号字段
    const cardNumber = Airwallex.createElement('cardNumber', {
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
    });
    cardNumber.mount('card-number-element');
    
    // 创建有效期字段
    const cardExpiry = Airwallex.createElement('expiry', {
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
    });
    cardExpiry.mount('card-expiry-element');
    
    // 创建CVC安全码字段
    const cardCvc = Airwallex.createElement('cvc', {
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
    });
    cardCvc.mount('card-cvc-element');
    
    // 将所有元素组合为一个卡片对象
    cardElement = {
      cardNumber,
      cardExpiry,
      cardCvc,
      type: 'splitForm'
    };
    
    console.log('信用卡表单字段初始化成功');
  } catch (error) {
    console.error('创建信用卡表单字段失败:', error);
  }
}

/**
 * 创建支付意图（PaymentIntent）
 * 调用后端API创建支付意图
 * 
 * @param {Object} paymentData - 支付数据
 * @returns {Promise} - 支付意图对象
 */
async function createPaymentIntent(paymentData) {
  try {
    console.log('创建支付意图，数据：', paymentData);
    
    // 调用后端API创建支付意图
    const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? `http://localhost:3000/api/create-payment-intent` // 本地开发环境
      : `/api/create-payment-intent`; // 生产环境
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData)
    });
    
    if (!response.ok) {
      throw new Error('创建支付意图失败：' + response.statusText);
    }
    
    return await response.json();
  } catch (error) {
    console.error('创建支付意图错误:', error);
    // 如果API调用失败，使用模拟数据（仅用于演示/测试）
    return {
      id: 'demo_' + Math.random().toString(36).substring(2, 15),
      client_secret: 'demo_secret_' + Math.random().toString(36).substring(2, 10),
      amount: paymentData.amount,
      currency: paymentData.currency,
      status: 'REQUIRES_PAYMENT_METHOD'
    };
  }
}

/**
 * 确认支付
 * 
 * @param {Object} intent - 支付意图对象
 * @param {Object} customer - 客户信息
 * @returns {Promise} - 支付结果
 */
async function confirmPayment(intent, customer) {
  if (!Airwallex || !cardElement) {
    console.error('Airwallex或卡片元素未初始化');
    return { error: '支付系统未初始化' };
  }

  try {
    // 确认支付意图
    const result = await Airwallex.confirmPaymentIntent({
      element: cardElement.type === 'splitForm' ? cardElement.cardNumber : cardElement,
      id: intent.id,
      client_secret: intent.client_secret,
      payment_method: {
        card: cardElement.type === 'splitForm' ? cardElement.cardNumber : cardElement,
        billing: {
          first_name: customer.firstName,
          last_name: customer.lastName,
          email: customer.email
        }
      }
    });

    console.log('支付确认结果:', result);
    return result;
  } catch (error) {
    console.error('支付确认失败:', error);
    return { error: error.message || '支付处理失败' };
  }
}

/**
 * 处理支付结果
 * 
 * @param {Object} result - 支付结果
 */
function handlePaymentResult(result) {
  if (result.status === 'SUCCEEDED') {
    // 支付成功 - 跳转到成功页面
    window.location.href = `./payment-success.html?txn_id=${result.id}`;
  } else if (result.error) {
    // 支付失败 - 跳转到失败页面
    window.location.href = `./payment-failed.html?error_message=${encodeURIComponent(result.error)}&error_code=PAYMENT_ERROR`;
  } else {
    // 其他状态处理
    console.log('支付状态:', result.status);
  }
}

/**
 * 设置支付事件监听器
 */
function setupEventListeners() {
  // 监听表单提交事件
  document.addEventListener('payment-form-submit', async function(event) {
    const { paymentData, customer } = event.detail;
    
    try {
      // 显示处理中
      if (window.paymentMethods && window.paymentMethods.showSuccess) {
        window.paymentMethods.showSuccess('正在处理您的支付请求...');
      }
      
      // 1. 创建支付意图
      const intent = await createPaymentIntent(paymentData);
      
      // 2. 确认支付
      const result = await confirmPayment(intent, customer);
      
      // 3. 处理支付结果
      handlePaymentResult(result);
    } catch (error) {
      console.error('支付处理过程中出错:', error);
      // 显示错误信息
      if (window.paymentMethods && window.paymentMethods.showError) {
        window.paymentMethods.showError('支付处理失败：' + (error.message || '未知错误'));
      } else {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
          errorElement.textContent = '支付处理失败：' + (error.message || '未知错误');
          errorElement.style.display = 'block';
        }
      }
    }
  });
}

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  initAirwallex();
  setupEventListeners();
});

// 导出函数以供其他模块使用
window.airwallexPayment = {
  init: initAirwallex,
  createPaymentIntent,
  confirmPayment,
  handlePaymentResult
}; 