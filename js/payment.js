// 初始化Airwallex
document.addEventListener('DOMContentLoaded', function() {
  // 在这里替换为您的Airwallex账户密钥
  const clientId = 'YOUR_CLIENT_ID';
  const apiKey = 'YOUR_API_KEY';
  
  let intent; // 存储支付意图
  let elements; // 存储Airwallex元素实例
  
  // 初始化Airwallex SDK
  const initAirwallex = async () => {
    try {
      // 加载Airwallex SDK
      await Airwallex.loadAirwallex({
        env: 'demo', // 环境：'demo'或'prod'
        locale: 'zh', // 语言设置
        origin: window.location.origin, // 当前网站的域名
      });
      
      // 初始化元素
      elements = Airwallex.createElement('element', {
        ...getElementOptions(),
      });
      
      // 创建支付意图
      await createPaymentIntent();
      
      // 挂载卡片元素
      mountCardElement();
      
      // 设置支付按钮事件监听器
      setupPaymentButton();
      
    } catch (error) {
      console.error('初始化Airwallex失败:', error);
      showError('初始化支付系统失败，请稍后再试');
    }
  };
  
  // 获取元素选项
  const getElementOptions = () => {
    return {
      style: {
        base: {
          fontSize: '16px',
          color: '#32325d',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
        invalid: {
          color: '#fa755a',
        },
      },
    };
  };
  
  // 创建支付意图
  const createPaymentIntent = async () => {
    try {
      // 注意：在实际应用中，应该从您的服务器获取支付意图
      // 这里仅作为示例，实际应用中不要在前端创建支付意图
      
      // 模拟从服务器获取支付意图
      intent = {
        id: 'mock_intent_id',
        client_secret: 'mock_client_secret',
        amount: 100,
        currency: 'CNY',
      };
      
      // 实际使用中，应该通过API请求创建支付意图
      /*
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 100,
          currency: 'CNY',
        }),
      });
      
      if (!response.ok) {
        throw new Error('创建支付意图失败');
      }
      
      intent = await response.json();
      */
      
    } catch (error) {
      console.error('创建支付意图失败:', error);
      showError('创建支付失败，请稍后再试');
    }
  };
  
  // 挂载卡片元素
  const mountCardElement = () => {
    const cardElement = document.getElementById('card-element');
    if (cardElement) {
      elements.mount('card', cardElement);
    }
  };
  
  // 设置支付按钮事件监听器
  const setupPaymentButton = () => {
    const paymentButton = document.getElementById('payment-button');
    if (paymentButton) {
      paymentButton.addEventListener('click', handlePayment);
    }
  };
  
  // 处理支付
  const handlePayment = async () => {
    const paymentButton = document.getElementById('payment-button');
    paymentButton.disabled = true;
    
    try {
      // 确认支付
      const { id, client_secret } = intent;
      
      const confirmResult = await Airwallex.confirmPaymentIntent({
        element: elements,
        id,
        client_secret,
      });
      
      if (confirmResult && confirmResult.status === 'SUCCEEDED') {
        // 支付成功，跳转到成功页面，并传递交易ID
        window.location.href = `/payment-success.html?txn_id=${id}`;
      } else {
        // 支付处理中或需要其他操作
        handlePaymentStatus(confirmResult);
      }
    } catch (error) {
      console.error('支付失败:', error);
      showError('支付过程中发生错误，请重试');
      
      // 跳转到支付失败页面，并传递错误信息
      let errorMessage = '支付处理失败';
      let errorCode = 'UNKNOWN';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      if (error.code) {
        errorCode = error.code;
      }
      
      setTimeout(() => {
        window.location.href = `/payment-failed.html?error_message=${encodeURIComponent(errorMessage)}&error_code=${encodeURIComponent(errorCode)}`;
      }, 1500); // 延迟1.5秒，让用户看到错误信息
    } finally {
      paymentButton.disabled = false;
    }
  };
  
  // 处理不同的支付状态
  const handlePaymentStatus = (result) => {
    if (result) {
      switch (result.status) {
        case 'PROCESSING':
          showError('支付处理中，请稍候...');
          // 可以实现轮询查询支付状态的逻辑
          break;
        case 'REQUIRES_ACTION':
          // 需要额外的验证操作
          Airwallex.handleNextAction({
            intent: intent,
          });
          break;
        default:
          showError(`支付状态: ${result.status}`);
          // 对于未知或失败的状态，跳转到失败页面
          setTimeout(() => {
            window.location.href = `/payment-failed.html?error_message=${encodeURIComponent('支付未完成')}&error_code=${encodeURIComponent(result.status)}`;
          }, 1500);
      }
    }
  };
  
  // 显示错误信息
  const showError = (message) => {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  };
  
  // 初始化
  initAirwallex();
}); 