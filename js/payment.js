/**
 * 支付模块 - 处理AI行程规划会员订阅支付
 * 
 * 此模块处理信用卡、支付宝和微信支付方式，包括支付方法切换和表单验证
 */

// 导入支付相关集成
import { initAirwallex, createPaymentIntent, confirmPayment } from './airwallex-integration.js';

// 全局变量
let currentPaymentMethod = 'card'; // 默认支付方式为信用卡
let paymentIntent = null; // 存储支付意向ID

/**
 * 初始化支付模块
 */
async function initPaymentModule() {
  try {
    console.log('正在初始化支付模块...');
    
    // 初始化Airwallex
    await initAirwallex();
    console.log('Airwallex SDK初始化成功');
    
    // 创建支付意向
    paymentIntent = await createPaymentIntent({
      amount: 0.1, // 修改为0.1元用于测试
      currency: 'CNY',
      description: 'AI行程规划会员月度订阅'
    });
    console.log('支付意向创建成功:', paymentIntent);
    
    // 绑定支付方式切换事件
    bindPaymentMethodSwitching();
    
    // 绑定支付表单提交事件
    bindPaymentFormSubmission();
    
    // 绑定信用卡输入格式化
    bindCardInputFormatting();
    
    console.log('支付模块初始化完成');
  } catch (error) {
    console.error('初始化支付模块失败:', error);
    showError('支付系统加载失败，请刷新页面重试或联系客服');
  }
}

/**
 * 绑定支付方式切换事件
 */
function bindPaymentMethodSwitching() {
  const paymentMethods = document.querySelectorAll('.payment-method');
  
  paymentMethods.forEach(method => {
    method.addEventListener('click', () => {
      // 移除其他支付方式的活跃状态
      paymentMethods.forEach(m => m.classList.remove('active'));
      
      // 添加当前支付方式的活跃状态
      method.classList.add('active');
      
      // 更新当前支付方式
      currentPaymentMethod = method.getAttribute('data-method');
      
      // 显示相应的支付表单
      showPaymentMethod(currentPaymentMethod);
      
      console.log(`切换到${currentPaymentMethod}支付方式`);
    });
  });
}

/**
 * 显示选定的支付方式表单
 * @param {string} method - 支付方式: 'card', 'alipay', 'wechat'
 */
function showPaymentMethod(method) {
  // 隐藏所有支付表单
  document.querySelectorAll('.payment-method-form').forEach(form => {
    form.classList.add('hidden');
  });
  
  // 显示选定的支付表单
  const formId = `${method}-form`;
  const form = document.getElementById(formId);
  if (form) {
    form.classList.remove('hidden');
  }
}

/**
 * 绑定支付表单提交事件
 */
function bindPaymentFormSubmission() {
  const paymentForm = document.getElementById('payment-form');
  const paymentButton = document.getElementById('payment-button');
  
  paymentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    try {
      // 禁用支付按钮防止重复点击
      paymentButton.disabled = true;
      paymentButton.textContent = '处理中...';
      
      // 隐藏之前的错误信息
      hideError();
      
      // 根据当前支付方式处理支付
      switch (currentPaymentMethod) {
        case 'card':
          await handleCardPayment();
          break;
        case 'alipay':
          await handleAlipayPayment();
          break;
        case 'wechat':
          await handleWechatPayment();
          break;
        default:
          throw new Error('不支持的支付方式');
      }
    } catch (error) {
      console.error('支付处理失败:', error);
      showError(error.message || '支付处理失败，请重试');
      
      // 恢复支付按钮状态
      paymentButton.disabled = false;
      paymentButton.textContent = '确认支付 ¥0.10';
    }
  });
}

/**
 * 处理信用卡支付
 */
async function handleCardPayment() {
  // 验证信用卡表单
  const validationResult = validateCardForm();
  if (!validationResult.valid) {
    throw new Error(validationResult.message);
  }
  
  // 获取信用卡信息
  const cardHolderName = document.getElementById('card-holder').value.trim();
  const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
  const cardExpiry = document.getElementById('card-expiry').value.trim().split('/');
  const cardCvc = document.getElementById('card-cvc').value.trim();
  
  // 构建支付参数
  const paymentParams = {
    intent_id: paymentIntent.id,
    payment_method: 'card',
    payment_method_options: {
      card: {
        card_number: cardNumber,
        expiry_month: cardExpiry[0],
        expiry_year: cardExpiry[1],
        cvc: cardCvc,
        name: cardHolderName
      }
    }
  };
  
  // 确认支付
  const result = await confirmPayment(paymentParams);
  
  if (result.success) {
    showPaymentSuccess('信用卡支付成功！');
  } else {
    throw new Error(result.error || '信用卡支付失败，请检查卡信息或联系银行');
  }
}

/**
 * 处理支付宝支付
 */
async function handleAlipayPayment() {
  // 构建支付参数
  const paymentParams = {
    intent_id: paymentIntent.id,
    payment_method: 'alipay',
    payment_method_options: {
      alipay: {
        return_url: window.location.origin + '/payment-return'
      }
    }
  };
  
  // 确认支付
  const result = await confirmPayment(paymentParams);
  
  if (result.success && result.redirect_url) {
    // 跳转到支付宝付款页面
    window.location.href = result.redirect_url;
  } else {
    throw new Error(result.error || '支付宝支付初始化失败，请重试');
  }
}

/**
 * 处理微信支付
 */
async function handleWechatPayment() {
  // 构建支付参数
  const paymentParams = {
    intent_id: paymentIntent.id,
    payment_method: 'wechat',
    payment_method_options: {
      wechat: {
        app_id: 'your_wechat_app_id'
      }
    }
  };
  
  // 确认支付
  const result = await confirmPayment(paymentParams);
  
  if (result.success && result.qr_code_url) {
    // 显示微信支付二维码
    // 注意：实际应用中需要创建一个二维码显示组件
    const wechatForm = document.getElementById('wechat-form');
    const qrCodeImg = document.createElement('img');
    qrCodeImg.src = result.qr_code_url;
    qrCodeImg.alt = '微信支付二维码';
    qrCodeImg.style.width = '200px';
    qrCodeImg.style.height = '200px';
    
    // 清除之前的二维码（如果有）
    const existingQrCode = wechatForm.querySelector('.wechat-qrcode');
    if (existingQrCode) {
      existingQrCode.remove();
    }
    
    // 添加新的二维码
    const qrCodeContainer = document.createElement('div');
    qrCodeContainer.className = 'wechat-qrcode';
    qrCodeContainer.style.textAlign = 'center';
    qrCodeContainer.style.marginTop = '20px';
    qrCodeContainer.appendChild(qrCodeImg);
    
    const instruction = document.createElement('p');
    instruction.textContent = '请使用微信扫描二维码完成支付';
    instruction.style.marginTop = '10px';
    qrCodeContainer.appendChild(instruction);
    
    wechatForm.appendChild(qrCodeContainer);
    
    // 恢复支付按钮状态
    const paymentButton = document.getElementById('payment-button');
    paymentButton.disabled = false;
    paymentButton.textContent = '确认支付 ¥0.10';
  } else {
    throw new Error(result.error || '微信支付二维码生成失败，请重试');
  }
}

/**
 * 验证信用卡表单
 * @returns {Object} 验证结果对象 {valid: boolean, message: string}
 */
function validateCardForm() {
  const cardHolder = document.getElementById('card-holder').value.trim();
  const cardNumber = document.getElementById('card-number').value.trim().replace(/\s/g, '');
  const cardExpiry = document.getElementById('card-expiry').value.trim();
  const cardCvc = document.getElementById('card-cvc').value.trim();
  
  if (!cardHolder) {
    return { valid: false, message: '请输入持卡人姓名' };
  }
  
  if (!cardNumber || cardNumber.length < 15 || cardNumber.length > 19 || !/^\d+$/.test(cardNumber)) {
    return { valid: false, message: '请输入有效的卡号' };
  }
  
  if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
    return { valid: false, message: '请输入有效的到期日期 (MM/YY)' };
  }
  
  const [month, year] = cardExpiry.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  if (parseInt(month) < 1 || parseInt(month) > 12) {
    return { valid: false, message: '月份必须介于1-12之间' };
  }
  
  if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
    return { valid: false, message: '卡片已过期' };
  }
  
  if (!cardCvc || !/^\d{3,4}$/.test(cardCvc)) {
    return { valid: false, message: '请输入有效的安全码 (CVC)' };
  }
  
  return { valid: true, message: '' };
}

/**
 * 显示支付成功信息
 * @param {string} message - 成功消息
 */
function showPaymentSuccess(message) {
  // 清除支付表单
  const paymentForm = document.getElementById('payment-form');
  paymentForm.innerHTML = '';
  
  // 创建成功消息容器
  const successContainer = document.createElement('div');
  successContainer.className = 'payment-success';
  successContainer.style.textAlign = 'center';
  successContainer.style.padding = '40px 20px';
  
  // 添加成功图标
  const successIcon = document.createElement('div');
  successIcon.innerHTML = '<i class="fas fa-check-circle" style="font-size: 64px; color: var(--success-color);"></i>';
  successContainer.appendChild(successIcon);
  
  // 添加成功消息
  const successMessage = document.createElement('h3');
  successMessage.textContent = message;
  successMessage.style.margin = '20px 0';
  successMessage.style.fontSize = '24px';
  successContainer.appendChild(successMessage);
  
  // 添加后续提示
  const successInfo = document.createElement('p');
  successInfo.textContent = '您的会员订阅已激活，将在3秒后跳转到会员中心...';
  successInfo.style.color = 'var(--dark-gray)';
  successContainer.appendChild(successInfo);
  
  // 将成功消息添加到表单容器
  paymentForm.appendChild(successContainer);
  
  // 设置延迟后跳转到会员中心
  setTimeout(() => {
    window.location.href = '/member-center';
  }, 3000);
}

/**
 * 显示错误信息
 * @param {string} message - 错误消息
 */
function showError(message) {
  const errorElement = document.getElementById('error-message');
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  errorElement.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
  errorElement.style.color = 'var(--danger-color)';
  errorElement.style.border = '1px solid var(--danger-color)';
}

/**
 * 隐藏错误信息
 */
function hideError() {
  const errorElement = document.getElementById('error-message');
  errorElement.style.display = 'none';
  errorElement.textContent = '';
}

/**
 * 绑定信用卡输入格式化
 */
function bindCardInputFormatting() {
  // 卡号格式化为 xxxx xxxx xxxx xxxx
  const cardNumberInput = document.getElementById('card-number');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function(e) {
      let value = this.value.replace(/\D/g, '');
      let formattedValue = '';
      
      for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formattedValue += ' ';
        }
        formattedValue += value[i];
      }
      
      this.value = formattedValue;
      
      // 更新卡品牌图标（简化版本）
      const cardBrandIcon = document.querySelector('.card-brand i');
      if (value.length > 0) {
        if (value.startsWith('4')) {
          cardBrandIcon.className = 'fab fa-cc-visa';
          cardBrandIcon.style.color = '#1A1F71';
        } else if (value.startsWith('5')) {
          cardBrandIcon.className = 'fab fa-cc-mastercard';
          cardBrandIcon.style.color = '#EB001B';
        } else if (value.startsWith('3')) {
          cardBrandIcon.className = 'fab fa-cc-amex';
          cardBrandIcon.style.color = '#2E77BC';
        } else {
          cardBrandIcon.className = 'far fa-credit-card';
          cardBrandIcon.style.color = '#6B7280';
        }
      } else {
        cardBrandIcon.className = 'far fa-credit-card';
        cardBrandIcon.style.color = '#6B7280';
      }
    });
  }
  
  // 有效期格式化为 MM/YY
  const cardExpiryInput = document.getElementById('card-expiry');
  if (cardExpiryInput) {
    cardExpiryInput.addEventListener('input', function(e) {
      let value = this.value.replace(/\D/g, '');
      
      if (value.length > 0) {
        if (value.length <= 2) {
          this.value = value;
        } else {
          // 格式化为MM/YY
          this.value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        
        // 输入月份后自动添加斜杠
        if (value.length === 2 && !this.value.includes('/')) {
          this.value += '/';
        }
      }
    });
  }
}

// 页面加载完成后初始化支付模块
document.addEventListener('DOMContentLoaded', initPaymentModule);

// 导出模块函数以供其他模块使用
export {
  initPaymentModule,
  handleCardPayment,
  handleAlipayPayment,
  handleWechatPayment
}; 