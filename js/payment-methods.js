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
  try {
    setupPaymentMethodSwitcher();
    setupTestData();
    setupApplePayButton();
    setupGooglePayButton();
    // 支付按钮由airwallex-integration.js处理
    // setupPaymentButton();
    console.log('payment-methods.js: 所有初始化函数执行完成');
  } catch (error) {
    console.error('payment-methods.js: 初始化过程中发生错误:', error);
  }
});

/**
 * 设置支付方式切换
 */
function setupPaymentMethodSwitcher() {
  console.log('payment-methods.js: 设置支付方式切换');
  const paymentMethods = document.querySelectorAll('.payment-method');
  const paymentForms = document.querySelectorAll('.payment-method-form');
  
  console.log(`找到${paymentMethods.length}个支付方式和${paymentForms.length}个支付表单`);
  
  if (paymentMethods.length === 0) {
    console.error('payment-methods.js: 未找到任何支付方式元素，选择器可能不正确');
    return;
  }
  
  if (paymentForms.length === 0) {
    console.error('payment-methods.js: 未找到任何支付表单元素，选择器可能不正确');
    return;
  }
  
  // 记录所有支付方式和表单ID，以便调试
  console.log('支付方式元素:');
  paymentMethods.forEach(method => {
    const methodType = method.getAttribute('data-method');
    console.log(`- 方式: ${methodType}, ID: ${method.id}, 类名: ${method.className}`);
  });
  
  console.log('支付表单元素:');
  paymentForms.forEach(form => {
    console.log(`- 表单ID: ${form.id}, 类名: ${form.className}`);
  });
  
  paymentMethods.forEach(method => {
    const methodType = method.getAttribute('data-method');
    console.log(`为支付方式 ${methodType} 绑定点击事件`);
    
    method.addEventListener('click', function() {
      console.log(`支付方式 ${methodType} 被点击`);
      
      try {
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
          console.log(`正在尝试查找其他可能的表单ID格式...`);
          
          // 尝试其他可能的表单ID格式
          const alternativeFormId = `${currentPaymentMethod.replace('-', '_')}-form`;
          const alternativeForm = document.getElementById(alternativeFormId);
          
          if (alternativeForm) {
            console.log(`找到了替代表单ID: ${alternativeFormId}`);
            alternativeForm.classList.remove('hidden');
          } else {
            console.error(`无法找到任何匹配的表单，可能的表单ID: ${formId}, ${alternativeFormId}`);
            
            // 列出所有可用的表单ID进行调试
            console.log('所有可用的表单ID:');
            document.querySelectorAll('form, div[id$="-form"]').forEach(el => {
              console.log(`- ${el.id}`);
            });
          }
        }
        
        // 更新按钮文本
        updatePaymentButtonText();

        // 处理特殊支付方式的UI显示/隐藏
        handleSpecialPaymentMethods(currentPaymentMethod);
        
        // 触发自定义事件，通知其他模块支付方式已更改
        const event = new CustomEvent('payment-method-change', {
          detail: { method: currentPaymentMethod }
        });
        document.dispatchEvent(event);
        console.log(`已触发支付方式更改事件: payment-method-change (${currentPaymentMethod})`);
      } catch (error) {
        console.error(`支付方式切换过程中发生错误:`, error);
      }
    });
  });
}

/**
 * 处理特殊支付方式的UI显示/隐藏
 * @param {string} method - 当前选择的支付方式
 */
function handleSpecialPaymentMethods(method) {
  console.log(`处理特殊支付方式: ${method}`);
  const paymentButton = document.getElementById('payment-button');
  
  if (!paymentButton) {
    console.error('未找到支付按钮元素，ID: payment-button');
  } else {
    console.log('找到支付按钮元素');
  }
  
  // 重置按钮可见性和其他元素
  paymentButton.style.display = 'block';
  
  // 隐藏所有特殊支付按钮
  const specialButtons = ['apple-pay-button', 'google-pay-button', 'wechat-pay-button', 'alipay-button', 'paypal-button', 'unionpay-button'];
  specialButtons.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = 'none';
      console.log(`隐藏特殊按钮: ${id}`);
    } else {
      console.log(`未找到特殊按钮元素: ${id}`);
    }
  });
  
  // 隐藏所有二维码显示
  const qrCodeElement = document.getElementById('wechat-qrcode');
  if (qrCodeElement) {
    qrCodeElement.style.display = 'none';
    console.log('隐藏微信支付二维码');
  }
  
  // 根据支付方式执行特殊逻辑
  switch(method) {
    case 'applepay':
      console.log('处理Apple Pay支付方式');
      // Apple Pay接口处理
      if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
        console.log('设备支持Apple Pay');
        const applePayButton = document.getElementById('apple-pay-button');
        if (applePayButton) {
          applePayButton.style.display = 'flex';
          console.log('显示Apple Pay按钮');
        } else {
          console.error('未找到Apple Pay按钮元素');
        }
        
        // 隐藏主支付按钮，使用Apple Pay按钮
        paymentButton.style.display = 'none';
      } else {
        console.log('设备不支持Apple Pay');
        // 在不支持的设备上显示提示信息
        showError('您的设备不支持Apple Pay，请选择其他支付方式');
        
        // 将支付方式切换回Card
        setTimeout(() => {
          console.log('尝试切换回信用卡支付方式');
          const cardMethod = document.querySelector('.payment-method[data-method="card"]');
          if (cardMethod) {
            console.log('找到信用卡支付方式元素，触发点击');
            cardMethod.click();
          } else {
            console.error('未找到信用卡支付方式元素');
          }
        }, 500);
      }
      break;
      
    case 'googlepay':
      console.log('处理Google Pay支付方式');
      // Google Pay接口处理
      if (window.google && window.google.payments) {
        console.log('设备支持Google Pay');
        const googlePayButton = document.getElementById('google-pay-button');
        if (googlePayButton) {
          googlePayButton.style.display = 'flex';
          console.log('显示Google Pay按钮');
        } else {
          console.error('未找到Google Pay按钮元素');
        }
        
        // 隐藏主支付按钮，使用Google Pay按钮
        paymentButton.style.display = 'none';
      } else {
        console.log('设备不支持Google Pay');
        // 在不支持的设备上显示提示信息
        showError('您的设备不支持Google Pay，请选择其他支付方式');
        
        // 将支付方式切换回Card
        setTimeout(() => {
          console.log('尝试切换回信用卡支付方式');
          const cardMethod = document.querySelector('.payment-method[data-method="card"]');
          if (cardMethod) {
            console.log('找到信用卡支付方式元素，触发点击');
            cardMethod.click();
          } else {
            console.error('未找到信用卡支付方式元素');
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
 * 设置测试数据 - 仅在开发环境和明确启用时使用
 * @param {boolean} forceEnable - 是否强制启用测试数据
 */
function setupTestData(forceEnable = false) {
  // 检查是否为开发环境
  const isDev = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' ||
                window.location.hostname.includes('.local');
  
  if (!isDev && !forceEnable) {
    console.log('非开发环境或未强制启用，跳过测试数据设置');
    return;
  }
  
  // 仅在开发环境或明确启用时设置测试数据
  if (forceEnable) {
    console.log('强制启用测试数据');
  } else {
    console.log('开发环境，设置测试数据');
  }
  
  // 设置测试数据
  const testCardInfo = {
    number: '4242424242424242',
    expiry: '12/25',
    cvc: '123',
    name: '测试用户'
  };
  
  // 填充信用卡表单
  const cardNumberInput = document.getElementById('card-number');
  const cardExpiryInput = document.getElementById('card-expiry');
  const cardCvcInput = document.getElementById('card-cvc');
  const cardNameInput = document.getElementById('card-name');
  
  if (cardNumberInput) {
    console.log('填充信用卡号测试数据');
    cardNumberInput.value = testCardInfo.number;
  }
  
  if (cardExpiryInput) {
    console.log('填充信用卡有效期测试数据');
    cardExpiryInput.value = testCardInfo.expiry;
  }
  
  if (cardCvcInput) {
    console.log('填充信用卡CVC测试数据');
    cardCvcInput.value = testCardInfo.cvc;
  }
  
  if (cardNameInput) {
    console.log('填充持卡人姓名测试数据');
    cardNameInput.value = testCardInfo.name;
  }
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
  console.log(`更新支付按钮文本，当前支付方式: ${currentPaymentMethod}`);
  const paymentButton = document.getElementById('payment-button');
  
  if (!paymentButton) {
    console.error('未找到支付按钮，无法更新文本');
    return;
  }
  
  let buttonText = '确认支付';
  
  // 根据支付方式设置不同的按钮文本
  switch(currentPaymentMethod) {
    case 'card':
      buttonText = '确认支付';
      break;
    case 'alipay':
      buttonText = '跳转到支付宝';
      break;
    case 'wechat':
      buttonText = '生成微信支付二维码';
      break;
    case 'unionpay':
      buttonText = '跳转到银联支付';
      break;
    case 'paypal':
      buttonText = '跳转到PayPal';
      break;
    default:
      buttonText = '确认支付';
  }
  
  console.log(`设置按钮文本为: "${buttonText}"`);
  paymentButton.textContent = buttonText;
}

/**
 * 显示错误信息
 * @param {string} message - 错误信息
 */
function showError(message) {
  console.error(`payment-methods.js: 显示错误: ${message}`);
  const errorElement = document.getElementById('payment-error');
  
  if (!errorElement) {
    console.error('未找到错误显示元素，无法显示错误信息');
    // 创建一个临时错误元素
    const tempError = document.createElement('div');
    tempError.id = 'payment-error';
    tempError.className = 'error-message';
    tempError.textContent = message;
    tempError.style.color = 'red';
    tempError.style.marginTop = '10px';
    
    // 尝试将错误信息添加到支付表单容器中
    const paymentContainer = document.querySelector('.payment-container');
    if (paymentContainer) {
      console.log('将临时错误元素添加到支付容器');
      paymentContainer.appendChild(tempError);
    } else {
      console.error('未找到支付容器，无法添加临时错误元素');
      // 最后尝试添加到body
      document.body.appendChild(tempError);
    }
    return;
  }
  
  errorElement.textContent = message;
  errorElement.classList.remove('hidden');
  errorElement.style.display = 'block';
  
  // 5秒后自动隐藏错误信息
  setTimeout(() => {
    console.log('自动隐藏错误信息');
    errorElement.classList.add('hidden');
    errorElement.style.display = 'none';
  }, 5000);
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
 * 设置Apple Pay按钮
 */
function setupApplePayButton() {
  console.log('设置Apple Pay按钮');
  const applePayButton = document.getElementById('apple-pay-button');
  
  if (!applePayButton) {
    console.error('未找到Apple Pay按钮元素');
    return;
  }
  
  // 检查浏览器是否支持Apple Pay
  if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
    console.log('浏览器支持Apple Pay');
    // 添加点击事件
    applePayButton.addEventListener('click', function() {
      console.log('Apple Pay按钮被点击');
      try {
        // 这里调用Apple Pay API，实际实现依赖于ApplePay集成
        processApplePayPayment();
      } catch (error) {
        console.error('启动Apple Pay支付失败:', error);
        showError('Apple Pay支付初始化失败，请稍后重试');
      }
    });
  } else {
    console.log('浏览器不支持Apple Pay，隐藏相关元素');
    // 隐藏Apple Pay选项
    const applePayMethod = document.querySelector('.payment-method[data-method="applepay"]');
    if (applePayMethod) {
      applePayMethod.style.display = 'none';
      console.log('隐藏Apple Pay支付方式选项');
    } else {
      console.warn('未找到Apple Pay支付方式元素');
    }
  }
}

/**
 * 设置Google Pay按钮
 */
function setupGooglePayButton() {
  console.log('设置Google Pay按钮');
  const googlePayButton = document.getElementById('google-pay-button');
  
  if (!googlePayButton) {
    console.error('未找到Google Pay按钮元素');
    return;
  }
  
  // 检查浏览器是否支持Google Pay
  if (window.google && window.google.payments) {
    console.log('浏览器支持Google Pay');
    // 添加点击事件
    googlePayButton.addEventListener('click', function() {
      console.log('Google Pay按钮被点击');
      try {
        // 这里调用Google Pay API，实际实现依赖于GooglePay集成
        processGooglePayPayment();
      } catch (error) {
        console.error('启动Google Pay支付失败:', error);
        showError('Google Pay支付初始化失败，请稍后重试');
      }
    });
  } else {
    console.log('浏览器不支持Google Pay，隐藏相关元素');
    // 隐藏Google Pay选项
    const googlePayMethod = document.querySelector('.payment-method[data-method="googlepay"]');
    if (googlePayMethod) {
      googlePayMethod.style.display = 'none';
      console.log('隐藏Google Pay支付方式选项');
    } else {
      console.warn('未找到Google Pay支付方式元素');
    }
  }
}

/**
 * 处理Apple Pay支付
 * @returns {Promise<Object>} 支付结果
 */
async function processApplePayPayment() {
  console.log('开始处理Apple Pay支付请求');
  
  try {
    // 检查Apple Pay支持状态
    if (!window.ApplePaySession || !ApplePaySession.canMakePayments()) {
      console.error('当前设备或浏览器不支持Apple Pay');
      showError('您的设备不支持Apple Pay，请选择其他支付方式');
      return { success: false, error: '设备不支持Apple Pay' };
    }
    
    // 获取订单金额
    const orderTotal = getOrderTotal();
    console.log(`订单总金额: ${orderTotal}`);
    
    // 创建Apple Pay会话请求
    const paymentRequest = {
      countryCode: 'CN',
      currencyCode: 'CNY',
      supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
      merchantCapabilities: ['supports3DS'],
      total: {
        label: 'AI行程订单',
        amount: orderTotal
      }
    };
    
    console.log('创建Apple Pay会话请求:', paymentRequest);
    
    // 创建Apple Pay会话
    const session = new ApplePaySession(3, paymentRequest);
    
    // 配置会话事件处理
    session.onvalidatemerchant = async (event) => {
      try {
        console.log('正在验证商户信息...');
        // 这里应调用后端API获取商户会话
        const merchantSession = await fetchMerchantValidation(event.validationURL);
        session.completeMerchantValidation(merchantSession);
      } catch (error) {
        console.error('商户验证失败:', error);
        session.abort();
      }
    };
    
    session.onpaymentauthorized = async (event) => {
      try {
        console.log('支付已授权，正在处理...');
        // 向后端发送支付信息进行处理
        const result = await processApplePayToken(event.payment.token);
        
        if (result.success) {
          session.completePayment(ApplePaySession.STATUS_SUCCESS);
          return { success: true, transactionId: result.transactionId };
        } else {
          session.completePayment(ApplePaySession.STATUS_FAILURE);
          return { success: false, error: result.error };
        }
      } catch (error) {
        console.error('处理Apple Pay支付时出错:', error);
        session.completePayment(ApplePaySession.STATUS_FAILURE);
        return { success: false, error: error.message };
      }
    };
    
    console.log('开始Apple Pay会话');
    session.begin();
    
    // 返回处理中的状态
    return { success: true, status: 'processing' };
  } catch (error) {
    console.error('Apple Pay支付流程出错:', error);
    showError('Apple Pay支付处理失败: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 处理Google Pay支付
 * @returns {Promise<Object>} 支付结果
 */
async function processGooglePayPayment() {
  console.log('开始处理Google Pay支付请求');
  
  try {
    // 检查Google Pay API是否可用
    if (!window.google || !window.google.payments || !window.google.payments.api) {
      console.error('Google Pay API不可用');
      showError('当前环境不支持Google Pay，请选择其他支付方式');
      return { success: false, error: 'Google Pay API不可用' };
    }
    
    const paymentsClient = new google.payments.api.PaymentsClient({
      environment: 'TEST' // 生产环境改为 'PRODUCTION'
    });
    
    // 获取订单金额
    const orderTotal = getOrderTotal();
    console.log(`订单总金额: ${orderTotal}`);
    
    // 构建支付请求
    const paymentDataRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [{
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER', 'JCB', 'UNIONPAY']
        },
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            'gateway': 'example',
            'gatewayMerchantId': 'exampleGatewayMerchantId'
          }
        }
      }],
      merchantInfo: {
        merchantId: '12345678901234567890',
        merchantName: 'AI行程'
      },
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPrice: orderTotal.toString(),
        currencyCode: 'CNY'
      }
    };
    
    console.log('创建Google Pay支付请求:', paymentDataRequest);
    
    // 加载Google Pay支付按钮
    const googlePayButton = document.getElementById('google-pay-button');
    if (!googlePayButton) {
      console.error('未找到Google Pay按钮元素');
      return { success: false, error: '无法初始化Google Pay按钮' };
    }
    
    // 检查Google Pay是否可用
    const isReadyToPayRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: paymentDataRequest.allowedPaymentMethods
    };
    
    const isReadyToPay = await paymentsClient.isReadyToPay(isReadyToPayRequest);
    if (!isReadyToPay) {
      console.error('Google Pay不可用');
      showError('您的设备不支持Google Pay，请选择其他支付方式');
      return { success: false, error: '设备不支持Google Pay' };
    }
    
    // 处理支付
    try {
      console.log('请求Google Pay支付...');
      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
      
      // 处理支付结果
      console.log('已获取Google Pay支付数据:', paymentData);
      
      // 发送到服务器进行处理
      const result = await processGooglePayToken(paymentData.paymentMethodData.tokenizationData.token);
      
      if (result.success) {
        return { success: true, transactionId: result.transactionId };
      } else {
        showError(result.error || 'Google Pay支付失败');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Google Pay支付请求失败:', error);
      
      if (error.statusCode === 'CANCELED') {
        console.log('用户取消了Google Pay支付');
        return { success: false, error: '支付已取消', canceled: true };
      } else {
        showError('Google Pay支付失败: ' + error.message);
        return { success: false, error: error.message };
      }
    }
  } catch (error) {
    console.error('Google Pay支付流程出错:', error);
    showError('Google Pay支付处理失败: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 获取订单总金额
 * @returns {number} 订单金额
 */
function getOrderTotal() {
  console.log('正在获取订单总金额...');
  
  try {
    const orderTotalElement = document.getElementById('order-total');
    if (!orderTotalElement) {
      console.error('未找到订单总金额元素');
      return 0;
    }
    
    // 从元素内容中提取价格（去除货币符号和格式）
    const priceText = orderTotalElement.textContent.trim();
    const priceMatch = priceText.match(/[\d.]+/);
    
    if (priceMatch) {
      const price = parseFloat(priceMatch[0]);
      console.log(`解析后的订单金额: ${price}`);
      return price;
    } else {
      console.error(`无法从文本中提取价格: "${priceText}"`);
      return 0;
    }
  } catch (error) {
    console.error('获取订单金额时出错:', error);
    return 0;
  }
}

/**
 * 获取当前选择的支付方式
 * @returns {string} 当前支付方式
 */
function getCurrentPaymentMethod() {
  console.log(`获取当前支付方式: ${currentPaymentMethod}`);
  return currentPaymentMethod;
}

// 暴露公共API
window.paymentMethods = {
  getCurrentMethod: getCurrentPaymentMethod,
  showError: showError
};

console.log('payment-methods.js 完全加载');

/**
 * 处理信用卡支付
 * @returns {Promise<void>}
 */
async function processCardPayment() {
  try {
    console.log('处理信用卡支付...');
    
    // 禁用支付按钮
    const payButton = document.getElementById('payment-button');
    if (payButton) {
      payButton.disabled = true;
      payButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 处理中...';
    }
    
    // 清除错误信息
    hideError();
    
    // 验证表单
    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const cardExpiry = document.getElementById('card-expiry').value.trim();
    const cardCvc = document.getElementById('card-cvc').value.trim();
    const cardHolder = document.getElementById('card-holder').value.trim();
    
    // 基础验证
    if (!cardNumber || cardNumber.length < 12) {
      throw new Error('请输入有效的信用卡号');
    }
    
    if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      throw new Error('请输入有效的到期日期 (MM/YY)');
    }
    
    if (!cardCvc || !/^\d{3,4}$/.test(cardCvc)) {
      throw new Error('请输入有效的安全码');
    }
    
    if (!cardHolder) {
      throw new Error('请输入持卡人姓名');
    }
    
    // 分解有效期
    const [expMonth, expYear] = cardExpiry.split('/');
    
    // 获取支付意图
    if (!window.paymentIntent || !window.paymentIntent.id) {
      throw new Error('支付初始化失败，请刷新页面重试');
    }
    
    // 构建支付请求参数
    const paymentParams = {
      intent_id: window.paymentIntent.id,
      client_secret: window.paymentIntent.client_secret,
      payment_method: 'card',
      payment_method_data: {
        card: {
          number: cardNumber,
          expiry_month: expMonth,
          expiry_year: expYear,
          cvc: cardCvc,
          name: cardHolder
        }
      }
    };
    
    console.log('发送信用卡支付请求...');
    
    // 调用API
    const response = await fetch('/api/confirm-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentParams)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '支付处理失败，请重试');
    }
    
    const result = await response.json();
    
    // 处理支付结果
    if (result.status === 'SUCCEEDED') {
      // 支付成功
      showSuccess('支付成功！正在跳转...');
      
      // 跳转到成功页面
      setTimeout(() => {
        window.location.href = `/payment-success.html?txn_id=${result.id}`;
      }, 2000);
    } else if (result.status === 'REQUIRES_ACTION' && result.next_action) {
      // 需要额外操作
      handleNextAction(result);
    } else {
      // 其他状态
      showSuccess('支付请求已提交，请查看结果');
      
      // 设置轮询检查支付状态
      startPaymentStatusCheck(result.id);
    }
  } catch (error) {
    console.error('信用卡支付失败:', error);
    showError(error.message || '支付处理失败，请重试');
    
    // 恢复按钮状态
    const payButton = document.getElementById('payment-button');
    if (payButton) {
      payButton.disabled = false;
      payButton.textContent = `确认支付 ¥${getOrderTotal()}`;
    }
  }
}

/**
 * 处理需要额外操作的支付
 * @param {Object} result - 支付结果
 */
function handleNextAction(result) {
  if (result.next_action.type === '3ds') {
    // 需要3DS验证
    window.location.href = result.next_action.url;
  } else if (result.next_action.type === 'redirect') {
    // 需要重定向到第三方页面
    window.location.href = result.next_action.url;
  } else if (result.next_action.type === 'qrcode') {
    // 需要显示二维码
    showQRCode(result.next_action.data);
  }
}

/**
 * 开始轮询检查支付状态
 * @param {string} intentId - 支付意图ID
 */
function startPaymentStatusCheck(intentId) {
  let checkCount = 0;
  const maxChecks = 10;
  
  const checkInterval = setInterval(async () => {
    try {
      checkCount++;
      console.log(`检查支付状态 (${checkCount}/${maxChecks})...`);
      
      const response = await fetch(`/api/payment-intent/${intentId}`);
      
      if (!response.ok) {
        throw new Error('查询支付状态失败');
      }
      
      const result = await response.json();
      
      if (result.status === 'SUCCEEDED') {
        // 支付成功
        clearInterval(checkInterval);
        showSuccess('支付成功！正在跳转...');
        
        setTimeout(() => {
          window.location.href = `/payment-success.html?txn_id=${intentId}`;
        }, 2000);
      } else if (result.status === 'FAILED') {
        // 支付失败
        clearInterval(checkInterval);
        showError('支付失败，请重试');
        
        // 恢复按钮状态
        const payButton = document.getElementById('payment-button');
        if (payButton) {
          payButton.disabled = false;
          payButton.textContent = `确认支付 ¥${getOrderTotal()}`;
        }
      } else if (checkCount >= maxChecks) {
        // 检查次数达到上限
        clearInterval(checkInterval);
        showError('支付状态未确认，请稍后查看订单');
        
        // 恢复按钮状态
        const payButton = document.getElementById('payment-button');
        if (payButton) {
          payButton.disabled = false;
          payButton.textContent = `确认支付 ¥${getOrderTotal()}`;
        }
      }
    } catch (error) {
      console.error('检查支付状态失败:', error);
      
      if (checkCount >= maxChecks) {
        clearInterval(checkInterval);
        showError('无法确认支付状态，请联系客服');
        
        // 恢复按钮状态
        const payButton = document.getElementById('payment-button');
        if (payButton) {
          payButton.disabled = false;
          payButton.textContent = `确认支付 ¥${getOrderTotal()}`;
        }
      }
    }
  }, 3000); // 每3秒检查一次
}

/**
 * 显示二维码
 * @param {string} qrcodeData - 二维码数据
 */
function showQRCode(qrcodeData) {
  // 获取或创建二维码容器
  let qrcodeContainer = document.getElementById('wechat-qrcode');
  
  if (!qrcodeContainer) {
    // 如果不存在，创建容器
    qrcodeContainer = document.createElement('div');
    qrcodeContainer.id = 'wechat-qrcode';
    qrcodeContainer.style.width = '200px';
    qrcodeContainer.style.height = '200px';
    qrcodeContainer.style.margin = '0 auto 20px auto';
    qrcodeContainer.style.backgroundColor = '#f8f9fa';
    qrcodeContainer.style.padding = '15px';
    qrcodeContainer.style.borderRadius = '8px';
    
    // 找到合适的位置插入二维码
    const wechatForm = document.getElementById('wechat-form');
    if (wechatForm) {
      const formGroup = wechatForm.querySelector('.form-group');
      if (formGroup) {
        formGroup.appendChild(qrcodeContainer);
      } else {
        wechatForm.prepend(qrcodeContainer);
      }
    } else {
      // 如果找不到微信表单，添加到错误消息元素前
      const errorElement = document.getElementById('error-message');
      errorElement.parentNode.insertBefore(qrcodeContainer, errorElement);
    }
  }
  
  // 清空容器
  qrcodeContainer.innerHTML = '';
  
  // 创建图片元素显示二维码
  const qrcodeImage = document.createElement('img');
  qrcodeImage.src = qrcodeData;
  qrcodeImage.alt = '微信支付二维码';
  qrcodeImage.style.width = '100%';
  qrcodeImage.style.height = '100%';
  qrcodeContainer.appendChild(qrcodeImage);
  
  // 显示扫码指引
  showSuccess('请使用微信扫描二维码完成支付');
  
  // 启动支付状态检查
  startWechatPaymentStatusCheck(paymentIntent.id);
}

/**
 * 处理支付宝支付
 * @returns {Promise<void>}
 */
async function processAlipayPayment() {
  try {
    console.log('处理支付宝支付...');
    
    // 禁用支付按钮
    const payButton = document.getElementById('payment-button');
    if (payButton) {
      payButton.disabled = true;
      payButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在跳转到支付宝...';
    }
    
    // 清除错误信息
    hideError();
    
    // 获取支付意图
    if (!window.paymentIntent || !window.paymentIntent.id) {
      throw new Error('支付初始化失败，请刷新页面重试');
    }
    
    // 构建支付请求参数
    const paymentParams = {
      intent_id: window.paymentIntent.id,
      payment_method: 'alipay',
      payment_method_data: {
        return_url: `${window.location.origin}/payment-return.html`
      }
    };
    
    console.log('发送支付宝支付请求...');
    
    // 调用API
    const response = await fetch('/api/confirm-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentParams)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '支付处理失败，请重试');
    }
    
    const result = await response.json();
    
    // 处理支付结果
    if (result.next_action && result.next_action.url) {
      // 需要重定向到支付宝
      showSuccess('正在跳转到支付宝...');
      window.location.href = result.next_action.url;
    } else {
      throw new Error('无法获取支付宝付款链接');
    }
  } catch (error) {
    console.error('支付宝支付失败:', error);
    showError(error.message || '支付处理失败，请重试');
    
    // 恢复按钮状态
    const payButton = document.getElementById('payment-button');
    if (payButton) {
      payButton.disabled = false;
      payButton.textContent = '使用支付宝支付';
    }
  }
}

/**
 * 处理微信支付
 * @returns {Promise<void>}
 */
async function processWeChatPayment() {
  try {
    console.log('处理微信支付...');
    
    // 禁用支付按钮
    const payButton = document.getElementById('payment-button');
    if (payButton) {
      payButton.disabled = true;
      payButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 生成支付二维码...';
    }
    
    // 清除错误信息
    hideError();
    
    // 获取支付意图
    if (!window.paymentIntent || !window.paymentIntent.id) {
      throw new Error('支付初始化失败，请刷新页面重试');
    }
    
    // 构建支付请求参数
    const paymentParams = {
      intent_id: window.paymentIntent.id,
      payment_method: 'wechat',
      payment_method_data: {
        return_url: `${window.location.origin}/payment-return.html`
      }
    };
    
    console.log('发送微信支付请求...');
    
    // 调用API
    const response = await fetch('/api/confirm-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentParams)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '支付处理失败，请重试');
    }
    
    const result = await response.json();
    
    // 处理支付结果
    if (result.next_action && result.next_action.type === 'qrcode') {
      // 显示二维码
      showQRCode(result.next_action.data);
      
      // 开始检查支付状态
      startWechatPaymentStatusCheck(window.paymentIntent.id);
    } else {
      throw new Error('无法获取微信支付二维码');
    }
  } catch (error) {
    console.error('微信支付失败:', error);
    showError(error.message || '支付处理失败，请重试');
    
    // 恢复按钮状态
    const payButton = document.getElementById('payment-button');
    if (payButton) {
      payButton.disabled = false;
      payButton.textContent = '使用微信支付';
    }
  }
}

/**
 * 显示微信支付二维码
 * @param {string} qrcodeData - 二维码数据
 */
function showQRCode(qrcodeData) {
  // 获取微信表单容器
  const wechatForm = document.getElementById('wechat-form');
  
  if (!wechatForm) {
    console.error('未找到微信表单容器');
    return;
  }
  
  // 检查是否已有二维码容器
  let qrcodeContainer = document.getElementById('wechat-qrcode');
  
  if (!qrcodeContainer) {
    // 创建二维码容器
    qrcodeContainer = document.createElement('div');
    qrcodeContainer.id = 'wechat-qrcode';
    qrcodeContainer.style.cssText = 'width: 200px; height: 200px; margin: 0 auto; background: #f8f9fa; border: 1px solid #ddd; padding: 10px; box-sizing: content-box;';
    
    // 插入表单容器
    wechatForm.querySelector('.form-group').appendChild(qrcodeContainer);
  }
  
  // 清空容器
  qrcodeContainer.innerHTML = '';
  
  // 创建图片元素
  const qrImage = document.createElement('img');
  qrImage.src = qrcodeData;
  qrImage.alt = '微信支付二维码';
  qrImage.style.cssText = 'width: 100%; height: 100%;';
  
  // 添加到容器
  qrcodeContainer.appendChild(qrImage);
  
  // 创建提示文本
  const helpText = document.createElement('p');
  helpText.textContent = '请使用微信扫描二维码完成支付';
  helpText.style.cssText = 'text-align: center; margin-top: 10px; color: #333;';
  
  // 添加到容器
  wechatForm.querySelector('.form-group').appendChild(helpText);
  
  // 隐藏支付按钮
  const payButton = document.getElementById('payment-button');
  if (payButton) {
    payButton.style.display = 'none';
  }
  
  // 创建关闭按钮
  const closeButton = document.createElement('button');
  closeButton.textContent = '取消支付';
  closeButton.className = 'payment-button';
  closeButton.style.cssText = 'background-color: #6c757d; margin-top: 15px;';
  closeButton.onclick = function() {
    // 隐藏二维码
    qrcodeContainer.style.display = 'none';
    helpText.style.display = 'none';
    closeButton.style.display = 'none';
    
    // 显示支付按钮
    if (payButton) {
      payButton.style.display = 'block';
      payButton.disabled = false;
      payButton.textContent = '使用微信支付';
    }
  };
  
  // 添加到容器
  wechatForm.querySelector('.form-group').appendChild(closeButton);
}

/**
 * 开始微信支付状态检查
 * @param {string} intentId - 支付意图ID
 */
function startWechatPaymentStatusCheck(intentId) {
  let checkCount = 0;
  const maxChecks = 30; // 最多检查30次，每次间隔2秒，总共最多检查60秒
  
  const statusCheckInterval = setInterval(async () => {
    try {
      checkCount++;
      console.log(`检查微信支付状态 (${checkCount}/${maxChecks})...`);
      
      // 调用API检查支付状态
      const response = await fetch(`/api/payment-intent/${intentId}`);
      
      if (!response.ok) {
        throw new Error('查询支付状态失败');
      }
      
      const result = await response.json();
      
      // 根据支付状态处理
      if (result.status === 'SUCCEEDED') {
        // 支付成功
        clearInterval(statusCheckInterval);
        showSuccess('支付成功！正在跳转...');
        
        // 跳转到成功页面
        setTimeout(() => {
          window.location.href = `/payment-success.html?txn_id=${intentId}`;
        }, 2000);
      } else if (result.status === 'FAILED') {
        // 支付失败
        clearInterval(statusCheckInterval);
        showError('支付失败，请重试');
        
        // 恢复UI
        document.getElementById('wechat-qrcode').style.display = 'none';
        const payButton = document.getElementById('payment-button');
        if (payButton) {
          payButton.style.display = 'block';
          payButton.disabled = false;
          payButton.textContent = '使用微信支付';
        }
      } else if (checkCount >= maxChecks) {
        // 超过最大检查次数
        clearInterval(statusCheckInterval);
        showError('支付未完成，请稍后查看订单状态');
      }
    } catch (error) {
      console.error('检查微信支付状态失败:', error);
      
      if (checkCount >= maxChecks) {
        clearInterval(statusCheckInterval);
      }
    }
  }, 2000); // 每2秒检查一次
} 