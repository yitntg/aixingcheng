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
  setupPaymentButton();
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
    });
  });
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
      paymentButton.textContent = '确认支付 ¥99.00';
      break;
    case 'alipay':
      paymentButton.textContent = '使用支付宝支付';
      break;
    case 'wechat':
      paymentButton.textContent = '使用微信支付';
      break;
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
function handlePayment() {
  const paymentButton = document.getElementById('payment-button');
  const errorMessage = document.getElementById('error-message');
  
  // 禁用按钮
  paymentButton.disabled = true;
  
  // 修改按钮文本和样式
  const originalButtonText = paymentButton.textContent;
  paymentButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 处理中...';
  
  // 显示处理中消息
  errorMessage.textContent = '正在处理您的支付请求...';
  errorMessage.style.display = 'block';
  errorMessage.style.backgroundColor = 'rgba(249, 250, 251, 0.5)';
  errorMessage.style.color = 'var(--secondary-color)';
  
  // 验证表单
  if (currentPaymentMethod === 'card') {
    const cardHolder = document.getElementById('card-holder');
    if (!cardHolder || !cardHolder.value) {
      showError('请输入持卡人姓名');
      paymentButton.disabled = false;
      paymentButton.innerHTML = originalButtonText;
      return;
    }
  }
  
  // 模拟处理时间
  setTimeout(() => {
    // 随机决定支付成功或失败
    const success = Math.random() > 0.3;
    
    if (success) {
      // 支付成功
      errorMessage.textContent = '支付成功！正在跳转...';
      errorMessage.style.backgroundColor = 'rgba(52, 211, 153, 0.1)';
      errorMessage.style.color = 'var(--success-color)';
      
      // 跳转到成功页面
      setTimeout(() => {
        const txnId = 'demo_' + Math.random().toString(36).substring(2, 15);
        window.location.href = `./payment-success.html?txn_id=${txnId}_${currentPaymentMethod}`;
      }, 1000);
    } else {
      // 支付失败
      const errorMessages = {
        card: '信用卡支付失败，请检查卡片信息后重试',
        alipay: '支付宝支付失败，请稍后重试',
        wechat: '微信支付失败，请稍后重试'
      };
      
      showError(errorMessages[currentPaymentMethod] || '支付失败');
      
      // 还原按钮
      paymentButton.disabled = false;
      paymentButton.innerHTML = originalButtonText;
      
      // 如果失败率高，跳转到失败页面
      if (Math.random() > 0.7) {
        setTimeout(() => {
          const errorCode = 'ERR_' + Math.random().toString(36).substring(2, 8).toUpperCase();
          window.location.href = `./payment-failed.html?error_message=${encodeURIComponent('支付处理失败')}&error_code=${errorCode}`;
        }, 1500);
      }
    }
  }, 2000);
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