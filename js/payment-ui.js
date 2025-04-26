/**
 * 支付UI模块 - 处理支付界面相关的UI操作
 */

/**
 * 创建特殊支付按钮
 * @param {string} paymentType - 支付类型
 * @param {string} text - 按钮文本
 * @param {string} color - 按钮颜色
 * @param {string} icon - 按钮图标
 * @returns {HTMLElement} - 按钮元素
 */
function createPaymentButton(paymentType, text, color, icon) {
  const button = document.createElement('div');
  button.id = `${paymentType}-button`;
  button.className = 'special-payment-button';
  button.style = `width: 100%; height: 50px; border-radius: 5px; background-color: ${color}; display: flex; justify-content: center; align-items: center; color: white; margin-bottom: 20px; cursor: pointer;`;
  button.innerHTML = `<i class="${icon}" style="margin-right: 10px;"></i> ${text}`;
  
  return button;
}

/**
 * 设置按钮加载状态
 * @param {HTMLElement} button - 按钮元素
 * @param {boolean} isLoading - 是否加载中
 * @param {string} loadingText - 加载中文本
 * @param {string} originalText - 原始文本
 * @param {string} icon - 图标类名
 */
function setButtonLoading(button, isLoading, loadingText, originalText, icon) {
  if (!button) return;
  
  if (isLoading) {
    button.disabled = true;
    button.innerHTML = `<i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i> ${loadingText}`;
  } else {
    button.disabled = false;
    button.innerHTML = `<i class="${icon}" style="margin-right: 10px;"></i> ${originalText}`;
  }
}

/**
 * 初始化支付宝支付界面
 * @param {Function} onSubmit - 提交回调
 * @returns {HTMLElement} - 支付宝按钮
 */
function setupAlipayUI(onSubmit) {
  const container = document.getElementById('alipay-form');
  if (!container) return null;
  
  // 创建按钮
  const button = createPaymentButton('alipay', '支付宝支付', '#1677FF', 'fab fa-alipay');
  
  // 绑定点击事件
  button.addEventListener('click', async () => {
    try {
      setButtonLoading(button, true, '正在连接支付宝...', '支付宝支付', 'fab fa-alipay');
      await onSubmit();
    } catch (error) {
      setButtonLoading(button, false, '', '支付宝支付', 'fab fa-alipay');
      console.error('支付宝支付出错:', error);
    }
  });
  
  // 添加到容器
  const formGroup = container.querySelector('.form-group');
  if (formGroup) {
    formGroup.appendChild(button);
  } else {
    container.appendChild(button);
  }
  
  return button;
}

/**
 * 初始化微信支付界面
 * @param {Function} onSubmit - 提交回调
 * @returns {HTMLElement} - 微信按钮
 */
function setupWeChatUI(onSubmit) {
  const container = document.getElementById('wechat-form');
  if (!container) return null;
  
  // 创建二维码容器
  const qrcodeContainer = document.createElement('div');
  qrcodeContainer.id = 'wechat-qrcode';
  qrcodeContainer.style = 'width: 200px; height: 200px; background-color: #f5f5f5; margin: 0 auto; border: 1px solid #ddd; display: flex; justify-content: center; align-items: center; margin-bottom: 15px; display: none;';
  qrcodeContainer.innerHTML = '<div style="color: #999;">二维码将在此处显示</div>';
  
  // 创建按钮
  const button = createPaymentButton('wechat', '微信扫码支付', '#07C160', 'fab fa-weixin');
  
  // 绑定点击事件
  button.addEventListener('click', async () => {
    try {
      setButtonLoading(button, true, '正在生成二维码...', '微信扫码支付', 'fab fa-weixin');
      await onSubmit();
      // 按钮状态由外部控制
    } catch (error) {
      setButtonLoading(button, false, '', '微信扫码支付', 'fab fa-weixin');
      console.error('微信支付出错:', error);
    }
  });
  
  // 添加到容器
  const formGroup = container.querySelector('.form-group');
  if (formGroup) {
    formGroup.appendChild(qrcodeContainer);
    formGroup.appendChild(button);
  } else {
    container.appendChild(qrcodeContainer);
    container.appendChild(button);
  }
  
  return button;
}

/**
 * 初始化PayPal支付界面
 * @param {Function} onSubmit - 提交回调
 * @returns {HTMLElement} - PayPal按钮
 */
function setupPayPalUI(onSubmit) {
  const container = document.getElementById('paypal-button-container');
  if (!container) return null;
  
  // 创建按钮
  const button = createPaymentButton('paypal', 'PayPal 支付', '#0070BA', 'fab fa-paypal');
  
  // 绑定点击事件
  button.addEventListener('click', async () => {
    try {
      setButtonLoading(button, true, '正在连接PayPal...', 'PayPal 支付', 'fab fa-paypal');
      await onSubmit();
    } catch (error) {
      setButtonLoading(button, false, '', 'PayPal 支付', 'fab fa-paypal');
      console.error('PayPal支付出错:', error);
    }
  });
  
  // 添加到容器
  container.innerHTML = '';
  container.appendChild(button);
  
  return button;
}

/**
 * 初始化银联支付界面
 * @param {Function} onSubmit - 提交回调
 * @returns {HTMLElement} - 银联按钮
 */
function setupUnionPayUI(onSubmit) {
  const container = document.getElementById('unionpay-form');
  if (!container) return null;
  
  // 创建按钮
  const button = createPaymentButton('unionpay', '银联支付', '#CF2D28', 'fas fa-credit-card');
  
  // 绑定点击事件
  button.addEventListener('click', async () => {
    try {
      setButtonLoading(button, true, '正在连接银联支付...', '银联支付', 'fas fa-credit-card');
      await onSubmit();
    } catch (error) {
      setButtonLoading(button, false, '', '银联支付', 'fas fa-credit-card');
      console.error('银联支付出错:', error);
    }
  });
  
  // 添加到容器
  const formGroup = container.querySelector('.form-group');
  if (formGroup) {
    formGroup.appendChild(button);
  } else {
    container.appendChild(button);
  }
  
  return button;
}

/**
 * 初始化Apple Pay支付界面
 * @param {Function} onSubmit - 提交回调
 * @returns {HTMLElement} - Apple Pay按钮
 */
function setupApplePayUI(onSubmit) {
  const button = document.getElementById('apple-pay-button');
  if (!button) return null;
  
  // 绑定点击事件
  button.addEventListener('click', async () => {
    try {
      const originalHTML = button.innerHTML;
      button.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i> 处理中...';
      await onSubmit();
      button.innerHTML = originalHTML;
    } catch (error) {
      button.innerHTML = '<i class="fab fa-apple" style="margin-right: 10px;"></i> Apple Pay';
      console.error('Apple Pay支付出错:', error);
    }
  });
  
  return button;
}

/**
 * 初始化Google Pay支付界面
 * @param {Function} onSubmit - 提交回调
 * @returns {HTMLElement} - Google Pay按钮
 */
function setupGooglePayUI(onSubmit) {
  const button = document.getElementById('google-pay-button');
  if (!button) return null;
  
  // 绑定点击事件
  button.addEventListener('click', async () => {
    try {
      const originalHTML = button.innerHTML;
      button.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i> 处理中...';
      await onSubmit();
      button.innerHTML = originalHTML;
    } catch (error) {
      button.innerHTML = '<i class="fab fa-google" style="margin-right: 10px; color: #4285F4;"></i> Google Pay';
      console.error('Google Pay支付出错:', error);
    }
  });
  
  return button;
}

/**
 * 格式化信用卡输入
 */
function setupCardInputFormatting() {
  // 卡号格式化
  const cardNumberInput = document.getElementById('card-number');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function() {
      let value = this.value.replace(/\D/g, '');
      let formattedValue = '';
      
      for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formattedValue += ' ';
        }
        formattedValue += value[i];
      }
      
      this.value = formattedValue;
      
      // 更新卡品牌图标
      updateCardBrandIcon(value);
    });
  }
  
  // 有效期格式化
  const cardExpiryInput = document.getElementById('card-expiry');
  if (cardExpiryInput) {
    cardExpiryInput.addEventListener('input', function() {
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

/**
 * 更新卡品牌图标
 * @param {string} cardNumber - 卡号
 */
function updateCardBrandIcon(cardNumber) {
  const brandElement = document.querySelector('.card-brand');
  if (!brandElement) return;
  
  let brandIcon = '<i class="far fa-credit-card" style="color: #6B7280;"></i>';
  
  // 根据卡号前缀判断卡品牌
  if (/^4/.test(cardNumber)) {
    brandIcon = '<i class="fab fa-cc-visa" style="color: #1A1F71;"></i>';
  } else if (/^5[1-5]/.test(cardNumber)) {
    brandIcon = '<i class="fab fa-cc-mastercard" style="color: #EB001B;"></i>';
  } else if (/^3[47]/.test(cardNumber)) {
    brandIcon = '<i class="fab fa-cc-amex" style="color: #006FCF;"></i>';
  } else if (/^6(?:011|5)/.test(cardNumber)) {
    brandIcon = '<i class="fab fa-cc-discover" style="color: #FF6000;"></i>';
  } else if (/^35/.test(cardNumber)) {
    brandIcon = '<i class="fab fa-cc-jcb" style="color: #0B4EA2;"></i>';
  } else if (/^(62|88)/.test(cardNumber)) {
    brandIcon = '<i class="fas fa-credit-card" style="color: #CF2D28;"></i>'; // UnionPay
  }
  
  brandElement.innerHTML = brandIcon;
}

// 导出模块函数
export {
  setupAlipayUI,
  setupWeChatUI,
  setupPayPalUI,
  setupUnionPayUI,
  setupApplePayUI,
  setupGooglePayUI,
  setupCardInputFormatting
}; 