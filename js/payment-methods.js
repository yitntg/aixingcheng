/**
 * AI行程 - 支付方式处理脚本
 */

// 当前选择的支付方式
let currentPaymentMethod = 'card';

/**
 * 初始化页面
 */
document.addEventListener('DOMContentLoaded', function() {
  setupPaymentMethodSwitcher();
  setupTestData();
  // 支付按钮由airwallex-integration.js处理
  // setupPaymentButton();
});

/**
 * 设置支付方式切换
 */
function setupPaymentMethodSwitcher() {
  const paymentMethods = document.querySelectorAll('.payment-method');
  const paymentForms = document.querySelectorAll('.payment-method-form');
  
  paymentMethods.forEach(method => {
    method.addEventListener('click', function() {
      // 移除所有活跃状态
      paymentMethods.forEach(m => m.classList.remove('active'));
      paymentForms.forEach(f => f.classList.add('hidden'));
      
      // 设置当前选中的支付方式
      this.classList.add('active');
      currentPaymentMethod = this.getAttribute('data-method');
      
      // 显示对应的表单
      const formId = `${currentPaymentMethod}-form`;
      const form = document.getElementById(formId);
      if (form) {
        form.classList.remove('hidden');
      }
      
      // 更新按钮文本
      updatePaymentButtonText();

      // 处理特殊支付方式的UI显示/隐藏
      handleSpecialPaymentMethods(currentPaymentMethod);
    });
  });
}

/**
 * 处理特殊支付方式的UI显示/隐藏
 * @param {string} method - 当前选择的支付方式
 */
function handleSpecialPaymentMethods(method) {
  const paymentButton = document.getElementById('payment-button');
  
  // 重置按钮可见性和其他元素
  paymentButton.style.display = 'block';
  
  // 根据支付方式执行特殊逻辑
  switch(method) {
    case 'applepay':
      // Apple Pay接口在某些环境下需要特殊处理
      if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
        console.log('设备支持Apple Pay');
        document.getElementById('apple-pay-button').style.display = 'flex';
      } else {
        console.log('设备不支持Apple Pay');
        showError('您的设备可能不支持Apple Pay，请选择其他支付方式');
      }
      break;
      
    case 'googlepay':
      // Google Pay接口处理
      // 检查设备是否支持Google Pay
      if (window.google && window.google.payments) {
        console.log('设备支持Google Pay');
        document.getElementById('google-pay-button').style.display = 'flex';
      } else {
        console.log('设备不支持Google Pay');
        showError('您的设备可能不支持Google Pay，请选择其他支付方式');
      }
      break;
      
    case 'paypal':
      // PayPal在某些情况下可能使用其自带按钮
      // 如果使用PayPal SDK的自定义按钮，可以考虑隐藏默认按钮
      // paymentButton.style.display = 'none'; 
      break;
  }
}

/**
 * 设置演示数据
 */
function setupTestData() {
  // 预填充卡片表单以便测试
  const cardHolder = document.getElementById('card-holder');
  if (cardHolder) {
    cardHolder.value = '张三';
  }
  
  // 添加信用卡品牌示例
  simulateCardBrandDetection();
}

/**
 * 模拟卡片品牌检测
 */
function simulateCardBrandDetection() {
  const cardNumberInput = document.querySelector('#card-number-element');
  const cardBrand = document.querySelector('.card-brand');
  
  if (cardNumberInput && cardBrand) {
    // 添加一个假的信用卡图标来模拟
    setTimeout(() => {
      cardBrand.innerHTML = '<i class="fab fa-cc-visa" style="color: #1A1F71; font-size: 24px;"></i>';
    }, 1000);
  }
}

/**
 * 更新支付按钮文本
 */
function updatePaymentButtonText() {
  const paymentButton = document.getElementById('payment-button');
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
    case 'applepay':
      paymentButton.textContent = '使用Apple Pay支付';
      break;
    case 'googlepay':
      paymentButton.textContent = '使用Google Pay支付';
      break;
    case 'unionpay':
      paymentButton.textContent = '使用银联支付';
      break;
  }
}

/**
 * 显示错误消息
 */
function showError(message) {
  const errorElement = document.getElementById('error-message');
  if (!errorElement) return;
  
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  errorElement.style.backgroundColor = 'rgba(248, 113, 113, 0.1)';
  errorElement.style.color = 'var(--danger-color)';
}

/**
 * 显示成功消息
 */
function showSuccess(message) {
  const errorElement = document.getElementById('error-message');
  if (!errorElement) return;
  
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  errorElement.style.backgroundColor = 'rgba(52, 211, 153, 0.1)';
  errorElement.style.color = 'var(--success-color)';
}

/**
 * 设置Apple Pay按钮点击事件
 */
function setupApplePayButton() {
  const applePayButton = document.getElementById('apple-pay-button');
  if (applePayButton) {
    applePayButton.addEventListener('click', function() {
      // 模拟触发主支付按钮
      document.getElementById('payment-button').click();
    });
  }
}

/**
 * 设置Google Pay按钮点击事件
 */
function setupGooglePayButton() {
  const googlePayButton = document.getElementById('google-pay-button');
  if (googlePayButton) {
    googlePayButton.addEventListener('click', function() {
      // 模拟触发主支付按钮
      document.getElementById('payment-button').click();
    });
  }
}

// 执行初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    setupApplePayButton();
    setupGooglePayButton();
  });
} else {
  setupApplePayButton();
  setupGooglePayButton();
}

// 导出函数
window.paymentMethods = {
  getCurrentMethod: () => currentPaymentMethod,
  showError,
  showSuccess
}; 