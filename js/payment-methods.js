/**
 * AI行程 - 支付方式处理脚本
 */

// 当前选择的支付方式
let currentPaymentMethod = 'card';

/**
 * 初始化页面
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('payment-methods.js: DOM加载完成，准备设置支付方式切换');
  setupPaymentMethodSwitcher();
  setupTestData();
  setupApplePayButton();
  setupGooglePayButton();
  // 支付按钮由airwallex-integration.js处理
  // setupPaymentButton();
});

/**
 * 设置支付方式切换
 */
function setupPaymentMethodSwitcher() {
  console.log('payment-methods.js: 设置支付方式切换');
  const paymentMethods = document.querySelectorAll('.payment-method');
  const paymentForms = document.querySelectorAll('.payment-method-form');
  
  console.log(`找到${paymentMethods.length}个支付方式和${paymentForms.length}个支付表单`);
  
  paymentMethods.forEach(method => {
    const methodType = method.getAttribute('data-method');
    console.log(`为支付方式 ${methodType} 绑定点击事件`);
    
    method.addEventListener('click', function() {
      console.log(`支付方式 ${methodType} 被点击`);
      
      // 移除所有活跃状态
      paymentMethods.forEach(m => m.classList.remove('active'));
      paymentForms.forEach(f => f.classList.add('hidden'));
      
      // 设置当前选中的支付方式
      this.classList.add('active');
      currentPaymentMethod = this.getAttribute('data-method');
      console.log(`payment-methods.js: 当前支付方式设置为 ${currentPaymentMethod}`);
      
      // 显示对应的表单
      const formId = `${currentPaymentMethod}-form`;
      const form = document.getElementById(formId);
      
      if (form) {
        console.log(`找到并显示表单: ${formId}`);
        form.classList.remove('hidden');
      } else {
        console.error(`未找到支付表单: ${formId}`);
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
  
  // 隐藏所有特殊支付按钮
  const specialButtons = ['apple-pay-button', 'google-pay-button', 'wechat-pay-button', 'alipay-button', 'paypal-button', 'unionpay-button'];
  specialButtons.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = 'none';
    }
  });
  
  // 根据支付方式执行特殊逻辑
  switch(method) {
    case 'applepay':
      // Apple Pay接口在某些环境下需要特殊处理
      if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
        console.log('设备支持Apple Pay');
        document.getElementById('apple-pay-button').style.display = 'flex';
      } else {
        console.log('设备不支持Apple Pay');
        // 显示模拟的Apple Pay按钮，实际使用中应该隐藏
        document.getElementById('apple-pay-button').style.display = 'flex';
        showError('提示：此为演示环境。实际生产环境中，只有在支持Apple Pay的设备上才会显示此按钮。');
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
        // 显示模拟的Google Pay按钮，实际使用中应该隐藏
        document.getElementById('google-pay-button').style.display = 'flex';
        showError('提示：此为演示环境。实际生产环境中，只有在支持Google Pay的设备上才会显示此按钮。');
      }
      break;
      
    case 'paypal':
      // PayPal在某些情况下可能使用其自带按钮
      document.getElementById('paypal-button-container').innerHTML = '<div id="paypal-button" style="width: 100%; height: 50px; border-radius: 5px; background-color: #0070BA; display: flex; justify-content: center; align-items: center; color: white; margin-bottom: 20px; cursor: pointer;"><i class="fab fa-paypal" style="margin-right: 10px;"></i> PayPal 支付</div>';
      
      // 为PayPal按钮添加点击事件
      const paypalButton = document.getElementById('paypal-button');
      if (paypalButton) {
        paypalButton.addEventListener('click', function() {
          document.getElementById('payment-button').click();
        });
      }
      break;
      
    case 'wechat':
      // 添加微信支付二维码内容
      const wechatForm = document.getElementById('wechat-form');
      if (wechatForm && !document.getElementById('wechat-pay-button')) {
        const wechatButton = document.createElement('div');
        wechatButton.id = 'wechat-pay-button';
        wechatButton.style = 'width: 100%; height: 50px; border-radius: 5px; background-color: #07C160; display: flex; justify-content: center; align-items: center; color: white; margin-bottom: 20px; cursor: pointer;';
        wechatButton.innerHTML = '<i class="fab fa-weixin" style="margin-right: 10px;"></i> 微信支付';
        wechatButton.addEventListener('click', function() {
          document.getElementById('payment-button').click();
        });
        
        // 添加模拟的二维码图像
        const qrCode = document.createElement('div');
        qrCode.style = 'width: 180px; height: 180px; background-color: #f5f5f5; margin: 0 auto; border: 1px solid #ddd; display: flex; justify-content: center; align-items: center; margin-bottom: 15px; display: none;';
        qrCode.innerHTML = '<i class="fas fa-qrcode" style="font-size: 100px; color: #666;"></i>';
        qrCode.id = 'wechat-qrcode';
        
        wechatForm.querySelector('.form-group').appendChild(qrCode);
        wechatForm.querySelector('.form-group').appendChild(wechatButton);
      }
      break;
      
    case 'alipay':
      // 添加支付宝支付按钮
      const alipayForm = document.getElementById('alipay-form');
      if (alipayForm && !document.getElementById('alipay-button')) {
        const alipayButton = document.createElement('div');
        alipayButton.id = 'alipay-button';
        alipayButton.style = 'width: 100%; height: 50px; border-radius: 5px; background-color: #1677FF; display: flex; justify-content: center; align-items: center; color: white; margin-bottom: 20px; cursor: pointer;';
        alipayButton.innerHTML = '<i class="fab fa-alipay" style="margin-right: 10px;"></i> 支付宝支付';
        alipayButton.addEventListener('click', function() {
          document.getElementById('payment-button').click();
        });
        alipayForm.querySelector('.form-group').appendChild(alipayButton);
      }
      break;
      
    case 'unionpay':
      // 添加银联支付按钮
      const unionpayForm = document.getElementById('unionpay-form');
      if (unionpayForm && !document.getElementById('unionpay-button')) {
        const unionpayButton = document.createElement('div');
        unionpayButton.id = 'unionpay-button';
        unionpayButton.style = 'width: 100%; height: 50px; border-radius: 5px; background-color: #CF2D28; display: flex; justify-content: center; align-items: center; color: white; margin-bottom: 20px; cursor: pointer;';
        unionpayButton.innerHTML = '<i class="fas fa-credit-card" style="margin-right: 10px;"></i> 银联支付';
        unionpayButton.addEventListener('click', function() {
          document.getElementById('payment-button').click();
        });
        unionpayForm.querySelector('.form-group').appendChild(unionpayButton);
      }
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