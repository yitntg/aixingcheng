// 基本脚本
document.addEventListener('DOMContentLoaded', function() {
  console.log('网站已加载完成！');
  
  // 测试函数
  function sayHello() {
    alert('欢迎访问我们的网站！');
  }
  
  // 为未来的按钮添加事件监听器
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('click', function() {
      console.log('按钮被点击了！');
    });
  });
});

// Airwallex支付功能实现
document.addEventListener('DOMContentLoaded', function() {
  // 定义Airwallex配置
  const AIRWALLEX_ENV = 'demo'; // 环境：'demo'或'prod'
  let airwallexInstance;
  let paymentIntentId = '';
  let clientSecret = '';
  
  // 获取DOM元素
  const subscribeButtons = document.querySelectorAll('.subscribe-btn');
  const paymentModal = document.getElementById('payment-modal');
  const closeModalButtons = document.querySelectorAll('.close-modal');
  const selectedPlanName = document.getElementById('selected-plan-name');
  const selectedPlanPrice = document.getElementById('selected-plan-price');
  const confirmPaymentButton = document.getElementById('confirm-payment');
  const paymentMethodButtons = document.querySelectorAll('.payment-method');
  const paymentForms = document.querySelectorAll('.payment-form');
  const paymentStatus = document.getElementById('payment-status');
  const successModal = document.getElementById('payment-success');
  const failedModal = document.getElementById('payment-failed');
  
  // 初始化Airwallex
  async function initAirwallex() {
    try {
      // 确保Airwallex已加载
      if (!window.Airwallex) {
        showPaymentStatus('无法加载Airwallex SDK。请刷新页面后重试。', 'error');
        return;
      }
      
      // 初始化Airwallex实例
      airwallexInstance = await window.Airwallex.init({
        env: AIRWALLEX_ENV,
        origin: window.location.origin,
      });
      
      console.log('Airwallex SDK 初始化成功');
    } catch (error) {
      console.error('初始化Airwallex出错:', error);
      showPaymentStatus('初始化支付系统时出错。请稍后再试。', 'error');
    }
  }
  
  // 创建支付意图
  async function createPaymentIntent(planType, amount, currency = 'CNY') {
    try {
      showPaymentStatus('正在创建支付...', 'processing');
      
      // 发送请求到后端API创建支付意图
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: planType,
          amount: amount,
          currency: currency,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '创建支付失败');
      }
      
      const data = await response.json();
      return {
        id: data.id,
        client_secret: data.client_secret,
      };
    } catch (error) {
      console.error('创建支付意图出错:', error);
      showPaymentStatus('创建支付时出错: ' + error.message, 'error');
      throw error;
    }
  }
  
  // 点击订阅按钮
  subscribeButtons.forEach(button => {
    button.addEventListener('click', async function() {
      try {
        const plan = this.getAttribute('data-plan');
        const price = this.getAttribute('data-price');
        const period = this.getAttribute('data-period');
        
        // 更新选择的套餐信息
        selectedPlanName.textContent = this.closest('.pricing-card').querySelector('h3').textContent;
        selectedPlanPrice.textContent = `¥${price}/${period === 'monthly' ? '月' : '年'}`;
        
        // 显示支付模态框
        paymentModal.classList.add('active');
        
        // 创建支付意图
        const paymentIntent = await createPaymentIntent(plan, parseFloat(price));
        paymentIntentId = paymentIntent.id;
        clientSecret = paymentIntent.client_secret;
        
        // 初始化卡表单
        initCardForm();
      } catch (error) {
        console.error('处理订阅按钮点击事件出错:', error);
      }
    });
  });
  
  // 初始化卡表单
  function initCardForm() {
    // 如果存在先前的卡表单，先销毁它
    const cardElement = document.getElementById('card-element');
    if (cardElement.children.length > 0) {
      cardElement.innerHTML = '';
    }
    
    try {
      // 创建卡元素
      const element = airwallexInstance.createElement('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#333',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
          invalid: {
            color: '#d73a49',
          },
        }
      });
      
      // 挂载卡组件
      element.mount('card-element');
      
      // 存储元素引用以便后续使用
      window.cardElement = element;
      
    } catch (error) {
      console.error('初始化卡表单出错:', error);
      showPaymentStatus('初始化支付表单时出错。请刷新页面后重试。', 'error');
    }
  }
  
  // 处理支付确认
  async function confirmPayment() {
    if (!window.cardElement || !paymentIntentId || !clientSecret) {
      showPaymentStatus('支付信息不完整，请重试。', 'error');
      return;
    }
    
    try {
      showPaymentStatus('正在处理您的支付...', 'processing');
      
      // 确认支付意图
      const confirmResult = await airwallexInstance.confirmPaymentIntent({
        element: window.cardElement,
        id: paymentIntentId,
        client_secret: clientSecret,
        payment_method_options: {
          card: {
            auto_capture: true
          }
        }
      });
      
      // 检查支付结果
      console.log('支付结果:', confirmResult);
      
      if (confirmResult.status === 'succeeded') {
        // 支付成功
        paymentModal.classList.remove('active');
        successModal.classList.add('active');
      } else {
        // 支付失败或处理中
        showPaymentStatus('支付未完成，状态: ' + confirmResult.status, 'error');
      }
    } catch (error) {
      console.error('确认支付时出错:', error);
      showPaymentStatus(error.message || '支付处理失败，请检查您的卡信息或尝试其他支付方式', 'error');
      
      // 显示失败模态框
      setTimeout(() => {
        paymentModal.classList.remove('active');
        failedModal.classList.add('active');
      }, 1500);
    }
  }
  
  // 确认支付按钮点击
  confirmPaymentButton.addEventListener('click', async function() {
    // 检查哪个支付表单是活跃的
    const activeForm = document.querySelector('.payment-form.active');
    
    if (activeForm.id === 'card-payment-form') {
      await confirmPayment();
    } else if (activeForm.id === 'alipay-payment-form') {
      showPaymentStatus('支付宝支付功能即将推出', 'info');
    } else if (activeForm.id === 'wechat-payment-form') {
      showPaymentStatus('微信支付功能即将推出', 'info');
    }
  });
  
  // 关闭模态框
  closeModalButtons.forEach(button => {
    button.addEventListener('click', function() {
      this.closest('.modal').classList.remove('active');
    });
  });
  
  // 切换支付方式
  paymentMethodButtons.forEach(button => {
    button.addEventListener('click', function() {
      // 移除所有支付方式的激活状态
      paymentMethodButtons.forEach(btn => btn.classList.remove('active'));
      // 激活当前选择的支付方式
      this.classList.add('active');
      
      // 隐藏所有支付表单
      paymentForms.forEach(form => form.classList.remove('active'));
      
      // 显示对应的支付表单
      const method = this.getAttribute('data-method');
      document.getElementById(`${method}-payment-form`).classList.add('active');
    });
  });
  
  // 支付成功后的按钮
  const closeSuccessButton = document.querySelector('.close-success');
  if (closeSuccessButton) {
    closeSuccessButton.addEventListener('click', function() {
      successModal.classList.remove('active');
    });
  }
  
  // 支付失败后的按钮
  const retryPaymentButton = document.querySelector('.retry-payment');
  if (retryPaymentButton) {
    retryPaymentButton.addEventListener('click', function() {
      failedModal.classList.remove('active');
      paymentModal.classList.add('active');
    });
  }
  
  const contactSupportButton = document.querySelector('.contact-support');
  if (contactSupportButton) {
    contactSupportButton.addEventListener('click', function() {
      failedModal.classList.remove('active');
      window.location.href = '#contact';
    });
  }
  
  // 显示支付状态信息
  function showPaymentStatus(message, type) {
    paymentStatus.textContent = message;
    paymentStatus.className = 'status-message';
    paymentStatus.classList.add(`status-${type}`);
    paymentStatus.style.display = 'block';
  }
  
  // FAQ手风琴效果
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', function() {
      item.classList.toggle('active');
    });
  });
  
  // 初始化Airwallex SDK
  initAirwallex();
});

// 测试文件 