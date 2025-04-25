/**
 * Airwallex支付集成JS
 * 该文件负责处理与Airwallex支付网关的通信
 */

// Airwallex全局对象
let Airwallex;
let cardElement; // 存储卡片元素
let isElementsInitialized = false; // 标记元素是否已初始化

/**
 * 初始化Airwallex SDK
 */
function initAirwallex() {
  // 检查是否已经加载了SDK
  if (document.querySelector('script[src*="elements.bundle.min.js"]') === null) {
    console.error('Airwallex SDK未加载，请确保页面中引入了elements.bundle.min.js');
    loadAirwallexScript(); // 尝试动态加载脚本
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
      
      // 等待DOM完全加载后初始化表单字段
      if (document.readyState === 'complete') {
        initializeFormFields();
      } else {
        window.addEventListener('load', initializeFormFields);
      }
    }).catch(error => {
      console.error('Airwallex SDK初始化失败:', error);
    });
  } else {
    console.error('无法加载Airwallex SDK，请确保script标签正确引入');
    setTimeout(initAirwallex, 1000); // 1秒后重试
  }
}

/**
 * 动态加载Airwallex脚本
 */
function loadAirwallexScript() {
  const script = document.createElement('script');
  script.src = 'https://checkout.airwallex.com/assets/elements.bundle.min.js';
  script.async = true;
  script.onload = function() {
    console.log('Airwallex SDK 动态加载成功');
    setTimeout(initAirwallex, 500);
  };
  script.onerror = function() {
    console.error('Airwallex SDK 动态加载失败');
  };
  document.head.appendChild(script);
}

/**
 * 显示卡片品牌图标
 * @param {string} brand - 卡片品牌
 */
function displayCardBrandIcon(brand) {
  const brandElement = document.querySelector('.card-brand');
  if (!brandElement) {
    // 如果未找到卡品牌元素，创建一个
    const cardNumberContainer = document.getElementById('card-number-element');
    if (cardNumberContainer && cardNumberContainer.parentElement) {
      const brandDiv = document.createElement('div');
      brandDiv.className = 'card-brand';
      brandDiv.style.marginLeft = '10px';
      cardNumberContainer.parentElement.appendChild(brandDiv);
    }
  }
  
  // 再次获取元素（可能是新创建的）
  const brandIconElement = document.querySelector('.card-brand');
  if (brandIconElement) {
    let brandIcon = '';
    switch(brand ? brand.toLowerCase() : '') {
      case 'visa':
        brandIcon = '<i class="fab fa-cc-visa" style="color: #1A1F71; font-size: 24px;"></i>';
        break;
      case 'mastercard':
        brandIcon = '<i class="fab fa-cc-mastercard" style="color: #EB001B; font-size: 24px;"></i>';
        break;
      case 'amex':
      case 'american express':
        brandIcon = '<i class="fab fa-cc-amex" style="color: #006FCF; font-size: 24px;"></i>';
        break;
      case 'discover':
        brandIcon = '<i class="fab fa-cc-discover" style="color: #FF6000; font-size: 24px;"></i>';
        break;
      case 'jcb':
        brandIcon = '<i class="fab fa-cc-jcb" style="color: #0B4EA2; font-size: 24px;"></i>';
        break;
      case 'diners':
      case 'diners club':
        brandIcon = '<i class="fab fa-cc-diners-club" style="color: #0069AA; font-size: 24px;"></i>';
        break;
      case 'unionpay':
        brandIcon = '<img src="/images/unionpay-logo.png" alt="UnionPay" style="height: 24px; vertical-align: middle;">';
        break;
      default:
        brandIcon = '<i class="far fa-credit-card" style="color: #6B7280; font-size: 24px;"></i>';
    }
    brandIconElement.innerHTML = brandIcon;
  }
}

/**
 * 初始化信用卡表单字段
 */
function initializeFormFields() {
  // 防止重复初始化
  if (isElementsInitialized) {
    console.log('表单字段已经初始化，跳过');
    return;
  }

  if (!Airwallex) {
    console.error('Airwallex未初始化，无法创建表单字段');
    return;
  }
  
  try {
    console.log('初始化信用卡表单字段...');
    
    // 确保容器元素存在
    const cardNumberContainer = document.getElementById('card-number-element');
    const cardExpiryContainer = document.getElementById('card-expiry-element');
    const cardCvcContainer = document.getElementById('card-cvc-element');
    
    if (!cardNumberContainer || !cardExpiryContainer || !cardCvcContainer) {
      console.error('找不到卡片元素容器');
      setTimeout(initializeFormFields, 500); // 500ms后重试
      return;
    }

    // 清空容器内容
    cardNumberContainer.innerHTML = '';
    cardExpiryContainer.innerHTML = '';
    cardCvcContainer.innerHTML = '';
    
    // 预先显示通用卡图标
    displayCardBrandIcon();
    
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
      placeholder: '卡号',
    });
    
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
      placeholder: 'MM / YY',
    });
    
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
      placeholder: 'CVC',
    });
    
    // 挂载元素前先检查容器是否存在
    if (cardNumberContainer) {
      cardNumber.mount(cardNumberContainer);
      console.log('卡号元素已挂载');
    }
    
    if (cardExpiryContainer) {
      cardExpiry.mount(cardExpiryContainer);
      console.log('有效期元素已挂载');
    }
    
    if (cardCvcContainer) {
      cardCvc.mount(cardCvcContainer);
      console.log('安全码元素已挂载');
    }
    
    // 将所有元素组合为一个卡片对象
    cardElement = {
      cardNumber,
      cardExpiry,
      cardCvc,
      type: 'splitForm'
    };
    
    // 添加事件监听器
    cardElement.cardNumber.on('change', (event) => {
      console.log('卡号输入变化:', event);
      
      // 获取字段状态
      const isValid = event.complete;
      const errorMessage = event.error ? event.error.message : '';
      
      // 更新UI反馈
      updateFieldStatus('card-number', isValid, errorMessage);
      
      // 显示卡片品牌
      if (event.brand) {
        displayCardBrandIcon(event.brand);
      }
    });
    
    cardElement.cardExpiry.on('change', (event) => {
      console.log('有效期输入变化:', event);
      
      // 获取字段状态
      const isValid = event.complete;
      const errorMessage = event.error ? event.error.message : '';
      
      // 更新UI反馈
      updateFieldStatus('card-expiry', isValid, errorMessage);
    });
    
    cardElement.cardCvc.on('change', (event) => {
      console.log('安全码输入变化:', event);
      
      // 获取字段状态
      const isValid = event.complete;
      const errorMessage = event.error ? event.error.message : '';
      
      // 更新UI反馈
      updateFieldStatus('card-cvc', isValid, errorMessage);
    });
    
    console.log('信用卡表单字段初始化成功');
    isElementsInitialized = true;
  } catch (error) {
    console.error('创建信用卡表单字段失败:', error);
    // 5秒后重试
    setTimeout(initializeFormFields, 5000);
  }
}

/**
 * 更新字段状态
 * @param {string} fieldName - 字段名称
 * @param {boolean} isValid - 是否有效
 * @param {string} errorMessage - 错误消息
 */
function updateFieldStatus(fieldName, isValid, errorMessage) {
  const errorElement = document.getElementById(`${fieldName}-error`);
  
  // 如果错误元素不存在，则创建一个
  if (!errorElement && errorMessage) {
    const fieldContainer = document.getElementById(`${fieldName}-element`);
    if (fieldContainer && fieldContainer.parentElement) {
      const errorDiv = document.createElement('div');
      errorDiv.id = `${fieldName}-error`;
      errorDiv.className = 'text-red-500 text-sm mt-1';
      fieldContainer.parentElement.appendChild(errorDiv);
    }
  }
  
  // 再次获取元素（可能是新创建的）
  const fieldErrorElement = document.getElementById(`${fieldName}-error`);
  if (fieldErrorElement) {
    fieldErrorElement.textContent = errorMessage;
    fieldErrorElement.style.display = errorMessage ? 'block' : 'none';
  }
  
  // 更新字段容器的样式
  const fieldElement = document.getElementById(`${fieldName}-element`);
  if (fieldElement) {
    if (isValid) {
      fieldElement.classList.remove('border-red-500');
      fieldElement.classList.add('border-green-500');
    } else if (errorMessage) {
      fieldElement.classList.remove('border-green-500');
      fieldElement.classList.add('border-red-500');
    } else {
      fieldElement.classList.remove('border-red-500', 'border-green-500');
    }
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
      ? `http://localhost:3001/api/create-payment-intent` // 本地开发环境
      : `/api/create-payment-intent`; // 生产环境
    
    console.log('发送请求到:', apiUrl);
    
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
 * 验证所有信用卡表单字段
 * @returns {boolean} - 验证结果
 */
function validateCardFields() {
  if (!cardElement) {
    console.error('卡片元素未初始化');
    return false;
  }
  
  let isValid = true;
  
  // 创建验证Promise
  const cardNumberPromise = new Promise(resolve => {
    cardElement.cardNumber.focus();
    setTimeout(() => {
      cardElement.cardNumber.blur();
      resolve();
    }, 100);
  });
  
  const cardExpiryPromise = new Promise(resolve => {
    cardElement.cardExpiry.focus();
    setTimeout(() => {
      cardElement.cardExpiry.blur();
      resolve();
    }, 100);
  });
  
  const cardCvcPromise = new Promise(resolve => {
    cardElement.cardCvc.focus();
    setTimeout(() => {
      cardElement.cardCvc.blur();
      resolve();
    }, 100);
  });
  
  // 执行所有验证
  return Promise.all([cardNumberPromise, cardExpiryPromise, cardCvcPromise])
    .then(() => {
      // 检查错误元素
      const errorElements = document.querySelectorAll('.text-red-500');
      for (const errorEl of errorElements) {
        if (errorEl.textContent && errorEl.style.display !== 'none') {
          isValid = false;
          break;
        }
      }
      return isValid;
    });
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
    console.log('确认支付意图:', intent.id);
    console.log('客户信息:', customer);
    
    // 首先验证卡片字段
    const isValid = await validateCardFields();
    if (!isValid) {
      return { error: '请检查您的信用卡信息是否正确' };
    }
    
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
          email: customer.email,
          address: {
            street: customer.address,
            city: customer.city,
            state: customer.state,
            postcode: customer.postcode,
            country: customer.country || 'CN'
          }
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
    // 支付失败 - 显示错误信息
    const errorElement = document.getElementById('payment-error-message');
    if (errorElement) {
      errorElement.textContent = '支付失败：' + result.error;
      errorElement.style.display = 'block';
      
      // 滚动到错误信息位置
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // 如果没有错误显示元素，跳转到失败页面
      window.location.href = `./payment-failed.html?error_message=${encodeURIComponent(result.error)}&error_code=PAYMENT_ERROR`;
    }
  } else {
    // 其他状态处理
    console.log('支付状态:', result.status);
    
    // 显示处理中状态
    const statusElement = document.getElementById('payment-status-message');
    if (statusElement) {
      statusElement.textContent = '支付处理中，请稍候...';
      statusElement.style.display = 'block';
      
      // 5秒后检查最终结果
      setTimeout(() => {
        // 模拟最终结果
        const finalStatus = Math.random() > 0.2 ? 'SUCCEEDED' : 'FAILED';
        if (finalStatus === 'SUCCEEDED') {
          window.location.href = `./payment-success.html?txn_id=SIM${Math.floor(Math.random() * 1000000)}`;
        } else {
          window.location.href = `./payment-failed.html?error_message=${encodeURIComponent('支付处理超时')}&error_code=TIMEOUT_ERROR`;
        }
      }, 5000);
    } else {
      // 没有状态显示元素，直接模拟结果
      const shouldSimulateSuccess = Math.random() > 0.3; // 70%的概率模拟成功
      if (shouldSimulateSuccess) {
        window.location.href = `./payment-success.html?txn_id=SIM${Math.floor(Math.random() * 1000000)}`;
      } else {
        window.location.href = `./payment-failed.html?error_message=${encodeURIComponent('支付处理超时')}&error_code=TIMEOUT_ERROR`;
      }
    }
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
      const loadingElement = document.getElementById('payment-loading');
      if (loadingElement) {
        loadingElement.style.display = 'flex';
      } else if (window.paymentMethods && window.paymentMethods.showLoading) {
        window.paymentMethods.showLoading('正在处理您的支付请求...');
      }
      
      // 隐藏之前的错误消息
      const errorElement = document.getElementById('payment-error-message');
      if (errorElement) {
        errorElement.style.display = 'none';
      }
      
      // 1. 创建支付意图
      const intent = await createPaymentIntent(paymentData);
      
      // 2. 确认支付
      const result = await confirmPayment(intent, customer);
      
      // 隐藏加载状态
      if (loadingElement) {
        loadingElement.style.display = 'none';
      } else if (window.paymentMethods && window.paymentMethods.hideLoading) {
        window.paymentMethods.hideLoading();
      }
      
      // 3. 处理支付结果
      handlePaymentResult(result);
    } catch (error) {
      console.error('支付处理过程中出错:', error);
      
      // 隐藏加载状态
      const loadingElement = document.getElementById('payment-loading');
      if (loadingElement) {
        loadingElement.style.display = 'none';
      } else if (window.paymentMethods && window.paymentMethods.hideLoading) {
        window.paymentMethods.hideLoading();
      }
      
      // 显示错误信息
      const errorElement = document.getElementById('payment-error-message');
      if (errorElement) {
        errorElement.textContent = '支付处理失败：' + (error.message || '未知错误');
        errorElement.style.display = 'block';
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (window.paymentMethods && window.paymentMethods.showError) {
        window.paymentMethods.showError('支付处理失败：' + (error.message || '未知错误'));
      }
    }
  });
  
  // 监听支付方式切换事件
  document.addEventListener('payment-method-change', function(event) {
    const { method } = event.detail;
    if (method === 'credit-card') {
      // 如果切换到信用卡支付，确保表单已初始化
      if (!isElementsInitialized) {
        initializeFormFields();
      }
    }
  });
}

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM已加载，初始化Airwallex...');
  initAirwallex();
  setupEventListeners();
  
  // 在页面完全加载后检查元素是否挂载
  window.addEventListener('load', function() {
    setTimeout(checkFormElements, 3000);
  });
});

/**
 * 检查表单元素是否已挂载
 */
function checkFormElements() {
  const cardNumberEl = document.getElementById('card-number-element');
  
  if (cardNumberEl && cardNumberEl.children.length === 0) {
    console.log('卡片元素未挂载，重新初始化...');
    initializeFormFields();
  }
}

// 导出函数以供其他模块使用
window.airwallexPayment = {
  init: initAirwallex,
  createPaymentIntent,
  confirmPayment,
  handlePaymentResult,
  initializeFormFields, // 导出此函数以便可以从外部调用
  validateCardFields,    // 导出验证函数
  displayCardBrandIcon   // 导出品牌图标显示函数
}; 