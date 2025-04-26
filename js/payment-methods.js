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
  
  // 隐藏所有二维码显示
  const qrCodeElement = document.getElementById('wechat-qrcode');
  if (qrCodeElement) {
    qrCodeElement.style.display = 'none';
  }
  
  // 根据支付方式执行特殊逻辑
  switch(method) {
    case 'applepay':
      // Apple Pay接口处理
      if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
        console.log('设备支持Apple Pay');
        document.getElementById('apple-pay-button').style.display = 'flex';
        
        // 隐藏主支付按钮，使用Apple Pay按钮
        paymentButton.style.display = 'none';
      } else {
        console.log('设备不支持Apple Pay');
        // 在不支持的设备上显示提示信息
        showError('您的设备不支持Apple Pay，请选择其他支付方式');
        
        // 将支付方式切换回Card
        setTimeout(() => {
          const cardMethod = document.querySelector('.payment-method[data-method="card"]');
          if (cardMethod) {
            cardMethod.click();
          }
        }, 500);
      }
      break;
      
    case 'googlepay':
      // Google Pay接口处理
      if (window.google && window.google.payments) {
        console.log('设备支持Google Pay');
        document.getElementById('google-pay-button').style.display = 'flex';
        
        // 隐藏主支付按钮，使用Google Pay按钮
        paymentButton.style.display = 'none';
      } else {
        console.log('设备不支持Google Pay');
        // 在不支持的设备上显示提示信息
        showError('您的设备不支持Google Pay，请选择其他支付方式');
        
        // 将支付方式切换回Card
        setTimeout(() => {
          const cardMethod = document.querySelector('.payment-method[data-method="card"]');
          if (cardMethod) {
            cardMethod.click();
          }
        }, 500);
      }
      break;
      
    case 'paypal':
      // 使用Airwallex的PayPal集成
      // 创建PayPal按钮
      const paypalContainer = document.getElementById('paypal-button-container');
      if (paypalContainer) {
        paypalContainer.innerHTML = '<div id="paypal-button" style="width: 100%; height: 50px; border-radius: 5px; background-color: #0070BA; display: flex; justify-content: center; align-items: center; color: white; margin-bottom: 20px; cursor: pointer;"><i class="fab fa-paypal" style="margin-right: 10px;"></i> PayPal 支付</div>';
        
        // 绑定PayPal按钮点击事件
        const paypalButton = document.getElementById('paypal-button');
        if (paypalButton) {
          paypalButton.addEventListener('click', async function() {
            try {
              // 显示加载状态
              this.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i> 正在连接PayPal...';
              this.disabled = true;
              
              // 从全局payment.js中获取支付意图
              if (!window.paymentIntent) {
                throw new Error('支付意图尚未创建，请刷新页面重试');
              }
              
              // 使用Airwallex API进行PayPal支付
              const result = await window.confirmPayment({
                intent_id: window.paymentIntent.id,
                client_secret: window.paymentIntent.client_secret,
                payment_method: 'paypal',
                payment_method_options: {
                  paypal: {
                    return_url: window.location.origin + '/payment-return.html'
                  }
                }
              });
              
              console.log('PayPal支付结果:', result);
              
              if (result.status === 'SUCCEEDED') {
                showSuccess('PayPal支付成功！');
                setTimeout(() => {
                  window.location.href = '/payment-success.html?txn_id=' + window.paymentIntent.id;
                }, 2000);
              } else if (result.next_action && result.next_action.url) {
                // 需要重定向到PayPal付款页面
                window.location.href = result.next_action.url;
              } else {
                throw new Error(result.error || 'PayPal支付失败，请重试');
              }
            } catch (error) {
              console.error('PayPal支付错误:', error);
              showError(error.message || 'PayPal支付处理失败，请重试');
              
              // 恢复按钮状态
              this.innerHTML = '<i class="fab fa-paypal" style="margin-right: 10px;"></i> PayPal 支付';
              this.disabled = false;
            }
          });
        }
      }
      
      // 隐藏主支付按钮，使用PayPal按钮
      paymentButton.style.display = 'none';
      break;
      
    case 'wechat':
      // 使用Airwallex的微信支付集成
      const wechatForm = document.getElementById('wechat-form');
      if (wechatForm && !document.getElementById('wechat-pay-button')) {
        // 创建微信支付按钮
        const wechatButton = document.createElement('div');
        wechatButton.id = 'wechat-pay-button';
        wechatButton.style = 'width: 100%; height: 50px; border-radius: 5px; background-color: #07C160; display: flex; justify-content: center; align-items: center; color: white; margin-bottom: 20px; cursor: pointer;';
        wechatButton.innerHTML = '<i class="fab fa-weixin" style="margin-right: 10px;"></i> 微信扫码支付';
        
        // 创建二维码容器
        const qrCode = document.createElement('div');
        qrCode.style = 'width: 180px; height: 180px; background-color: #f5f5f5; margin: 0 auto; border: 1px solid #ddd; display: flex; justify-content: center; align-items: center; margin-bottom: 15px; display: none;';
        qrCode.innerHTML = '<i class="fas fa-qrcode" style="font-size: 100px; color: #666;"></i>';
        qrCode.id = 'wechat-qrcode';
        
        // 添加到DOM
        wechatForm.querySelector('.form-group').appendChild(qrCode);
        wechatForm.querySelector('.form-group').appendChild(wechatButton);
        
        // 绑定微信支付按钮点击事件
        wechatButton.addEventListener('click', async function() {
          try {
            // 显示加载状态
            this.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i> 正在生成支付二维码...';
            this.disabled = true;
            
            // 从全局payment.js中获取支付意图
            if (!window.paymentIntent) {
              throw new Error('支付意图尚未创建，请刷新页面重试');
            }
            
            // 使用Airwallex API进行微信支付
            const result = await window.confirmPayment({
              intent_id: window.paymentIntent.id,
              client_secret: window.paymentIntent.client_secret,
              payment_method: 'wechatpay',
              payment_method_options: {
                wechatpay: {
                  client_type: 'WEB'
                }
              }
            });
            
            console.log('微信支付结果:', result);
            
            if (result.next_action && result.next_action.wechat_pay_qrcode) {
              // 显示二维码
              const qrCode = document.getElementById('wechat-qrcode');
              if (qrCode) {
                qrCode.style.display = 'flex';
                
                // 设置微信支付二维码
                qrCode.innerHTML = '';
                const qrImg = document.createElement('img');
                qrImg.src = result.next_action.wechat_pay_qrcode;
                qrImg.alt = '微信支付二维码';
                qrImg.style.width = '100%';
                qrImg.style.height = '100%';
                qrCode.appendChild(qrImg);
                
                // 更新按钮文本
                this.innerHTML = '<i class="fab fa-weixin" style="margin-right: 10px;"></i> 请使用微信扫描二维码';
                this.disabled = true;
                
                // 添加状态检查
                startWechatPaymentStatusCheck(result.id);
              }
            } else {
              throw new Error(result.error || '无法生成微信支付二维码，请重试');
            }
          } catch (error) {
            console.error('微信支付错误:', error);
            showError(error.message || '微信支付处理失败，请重试');
            
            // 恢复按钮状态
            this.innerHTML = '<i class="fab fa-weixin" style="margin-right: 10px;"></i> 微信扫码支付';
            this.disabled = false;
          }
        });
      }
      
      // 隐藏主支付按钮，使用微信支付按钮
      paymentButton.style.display = 'none';
      break;
      
    case 'alipay':
      // 使用Airwallex的支付宝集成
      const alipayForm = document.getElementById('alipay-form');
      if (alipayForm && !document.getElementById('alipay-button')) {
        // 创建支付宝按钮
        const alipayButton = document.createElement('div');
        alipayButton.id = 'alipay-button';
        alipayButton.style = 'width: 100%; height: 50px; border-radius: 5px; background-color: #1677FF; display: flex; justify-content: center; align-items: center; color: white; margin-bottom: 20px; cursor: pointer;';
        alipayButton.innerHTML = '<i class="fab fa-alipay" style="margin-right: 10px;"></i> 支付宝支付';
        
        // 绑定支付宝按钮点击事件
        alipayButton.addEventListener('click', async function() {
          try {
            // 显示加载状态
            this.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i> 正在跳转至支付宝...';
            this.disabled = true;
            
            // 从全局payment.js中获取支付意图
            if (!window.paymentIntent) {
              throw new Error('支付意图尚未创建，请刷新页面重试');
            }
            
            // 使用Airwallex API进行支付宝支付
            const result = await window.confirmPayment({
              intent_id: window.paymentIntent.id,
              client_secret: window.paymentIntent.client_secret,
              payment_method: 'alipay',
              payment_method_options: {
                alipay: {
                  return_url: window.location.origin + '/payment-return.html'
                }
              }
            });
            
            console.log('支付宝支付结果:', result);
            
            if (result.status === 'SUCCEEDED') {
              showSuccess('支付宝支付成功！');
              setTimeout(() => {
                window.location.href = '/payment-success.html?txn_id=' + window.paymentIntent.id;
              }, 2000);
            } else if (result.next_action && result.next_action.url) {
              // 需要重定向到支付宝付款页面
              window.location.href = result.next_action.url;
            } else {
              throw new Error(result.error || '支付宝支付失败，请重试');
            }
          } catch (error) {
            console.error('支付宝支付错误:', error);
            showError(error.message || '支付宝支付处理失败，请重试');
            
            // 恢复按钮状态
            this.innerHTML = '<i class="fab fa-alipay" style="margin-right: 10px;"></i> 支付宝支付';
            this.disabled = false;
          }
        });
        
        // 添加到DOM
        alipayForm.querySelector('.form-group').appendChild(alipayButton);
      }
      
      // 隐藏主支付按钮，使用支付宝按钮
      paymentButton.style.display = 'none';
      break;
      
    case 'unionpay':
      // 使用Airwallex的银联支付集成
      const unionpayForm = document.getElementById('unionpay-form');
      if (unionpayForm && !document.getElementById('unionpay-button')) {
        // 创建银联支付按钮
        const unionpayButton = document.createElement('div');
        unionpayButton.id = 'unionpay-button';
        unionpayButton.style = 'width: 100%; height: 50px; border-radius: 5px; background-color: #CF2D28; display: flex; justify-content: center; align-items: center; color: white; margin-bottom: 20px; cursor: pointer;';
        unionpayButton.innerHTML = '<i class="fas fa-credit-card" style="margin-right: 10px;"></i> 银联支付';
        
        // 绑定银联支付按钮点击事件
        unionpayButton.addEventListener('click', async function() {
          try {
            // 显示加载状态
            this.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i> 正在连接银联支付...';
            this.disabled = true;
            
            // 从全局payment.js中获取支付意图
            if (!window.paymentIntent) {
              throw new Error('支付意图尚未创建，请刷新页面重试');
            }
            
            // 使用Airwallex API进行银联支付
            const result = await window.confirmPayment({
              intent_id: window.paymentIntent.id,
              client_secret: window.paymentIntent.client_secret,
              payment_method: 'union_pay',
              payment_method_options: {
                union_pay: {
                  return_url: window.location.origin + '/payment-return.html'
                }
              }
            });
            
            console.log('银联支付结果:', result);
            
            if (result.status === 'SUCCEEDED') {
              showSuccess('银联支付成功！');
              setTimeout(() => {
                window.location.href = '/payment-success.html?txn_id=' + window.paymentIntent.id;
              }, 2000);
            } else if (result.next_action && result.next_action.url) {
              // 需要重定向到银联付款页面
              window.location.href = result.next_action.url;
            } else {
              throw new Error(result.error || '银联支付失败，请重试');
            }
          } catch (error) {
            console.error('银联支付错误:', error);
            showError(error.message || '银联支付处理失败，请重试');
            
            // 恢复按钮状态
            this.innerHTML = '<i class="fas fa-credit-card" style="margin-right: 10px;"></i> 银联支付';
            this.disabled = false;
          }
        });
        
        // 添加到DOM
        unionpayForm.querySelector('.form-group').appendChild(unionpayButton);
      }
      
      // 隐藏主支付按钮，使用银联支付按钮
      paymentButton.style.display = 'none';
      break;
  }
}

/**
 * 检查微信支付状态
 * @param {string} intentId - 支付意图ID
 */
function startWechatPaymentStatusCheck(intentId) {
  if (!intentId) return;
  
  console.log('开始检查微信支付状态, ID:', intentId);
  
  // 添加状态提示
  const statusDiv = document.createElement('div');
  statusDiv.style = 'text-align: center; margin-top: 10px; color: #666;';
  statusDiv.id = 'wechat-status';
  statusDiv.innerHTML = '等待用户扫码支付...';
  
  const wechatForm = document.getElementById('wechat-form');
  if (wechatForm && !document.getElementById('wechat-status')) {
    wechatForm.querySelector('.form-group').insertBefore(statusDiv, document.getElementById('wechat-pay-button'));
  }
  
  // 定期检查支付状态
  const checkInterval = setInterval(async () => {
    try {
      // 检查支付状态
      const response = await fetch(`/api/check-payment-status?id=${intentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('检查支付状态失败');
      }
      
      const result = await response.json();
      console.log('支付状态检查结果:', result);
      
      if (result.status === 'SUCCEEDED') {
        // 支付成功
        clearInterval(checkInterval);
        
        // 更新状态显示
        const statusDiv = document.getElementById('wechat-status');
        if (statusDiv) {
          statusDiv.innerHTML = '<i class="fas fa-check-circle"></i> 支付成功！正在跳转...';
          statusDiv.style.color = '#07C160';
        }
        
        // 显示成功信息
        showSuccess('微信支付成功！正在为您处理订单...');
        
        // 跳转到成功页面
        setTimeout(() => {
          window.location.href = '/payment-success.html?txn_id=' + intentId;
        }, 2000);
      } else if (result.status === 'FAILED' || result.status === 'CANCELLED') {
        // 支付失败
        clearInterval(checkInterval);
        
        // 更新状态显示
        const statusDiv = document.getElementById('wechat-status');
        if (statusDiv) {
          statusDiv.innerHTML = '<i class="fas fa-times-circle"></i> 支付失败';
          statusDiv.style.color = '#e74c3c';
        }
        
        // 恢复按钮状态
        const wechatButton = document.getElementById('wechat-pay-button');
        if (wechatButton) {
          wechatButton.innerHTML = '<i class="fab fa-weixin" style="margin-right: 10px;"></i> 重新支付';
          wechatButton.disabled = false;
        }
        
        showError('微信支付失败或已取消，请重试');
      }
      // 其他状态继续等待
    } catch (error) {
      console.error('检查支付状态出错:', error);
    }
  }, 3000); // 每3秒检查一次
  
  // 60秒后停止检查，避免无限循环
  setTimeout(() => {
    clearInterval(checkInterval);
    
    // 检查最终状态
    const statusDiv = document.getElementById('wechat-status');
    if (statusDiv && statusDiv.textContent.indexOf('成功') === -1) {
      statusDiv.innerHTML = '支付超时，请重试或选择其他支付方式';
      statusDiv.style.color = '#e74c3c';
      
      // 恢复按钮状态
      const wechatButton = document.getElementById('wechat-pay-button');
      if (wechatButton) {
        wechatButton.innerHTML = '<i class="fab fa-weixin" style="margin-right: 10px;"></i> 重新支付';
        wechatButton.disabled = false;
      }
    }
  }, 60000); // 60秒超时
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