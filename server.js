/**
 * AI行程 - 支付系统主服务器入口
 * 此文件负责加载并启动实际的服务器实现
 */

// 导入核心依赖
const express = require('express');
const cors = require('cors');
const path = require('path');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3001;

// 输出环境变量状态（不显示实际值，只显示是否存在）
console.log('环境变量状态:');
console.log('- AIRWALLEX_CLIENT_ID:', process.env.AIRWALLEX_CLIENT_ID ? '已设置' : '未设置');
console.log('- AIRWALLEX_API_KEY:', process.env.AIRWALLEX_API_KEY ? '已设置' : '未设置');
console.log('- AIRWALLEX_API_BASE:', process.env.AIRWALLEX_API_BASE || 'https://api.airwallex.com');

// Airwallex API配置 - 使用环境变量
const AIRWALLEX_API = {
  CLIENT_ID: process.env.AIRWALLEX_CLIENT_ID || '', // 从环境变量获取
  API_KEY: process.env.AIRWALLEX_API_KEY || '', // 从环境变量获取
  API_BASE: process.env.AIRWALLEX_API_BASE || 'https://api.airwallex.com', // 生产环境API地址
};

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.'))); // 提供静态文件

// 添加请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 导入Airwallex支付处理逻辑
const { getApiToken, createPaymentIntent, getPaymentIntent, confirmPaymentIntent } = require('./server/payment-logic');

// 环境变量检查
app.get('/api/test-env', (req, res) => {
  try {
    // 检查必要的API配置
    const hasClientId = !!process.env.AIRWALLEX_CLIENT_ID;
    const hasApiKey = !!process.env.AIRWALLEX_API_KEY;
    const apiBase = process.env.AIRWALLEX_API_BASE || 'https://api.airwallex.com';
    
    // 返回检查结果（不返回实际值，只返回状态）
    res.json({
      has_client_id: hasClientId,
      has_api_key: hasApiKey,
      api_base: apiBase,
      environment: process.env.NODE_ENV || 'development',
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('环境变量检查失败:', error);
    res.status(500).json({
      error: '环境变量检查失败',
      message: error.message
    });
  }
});

// API路由 - 创建支付意图
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    // 检查API配置
    if (!AIRWALLEX_API.CLIENT_ID || !AIRWALLEX_API.API_KEY) {
      throw new Error('API凭证未配置，请在环境变量中设置AIRWALLEX_CLIENT_ID和AIRWALLEX_API_KEY');
    }
    
    const paymentData = req.body;
    console.log('收到创建支付意图请求:', JSON.stringify(paymentData));
    
    const paymentIntent = await createPaymentIntent(paymentData, AIRWALLEX_API);
    console.log('支付意图创建成功:', paymentIntent.id);
    
    res.json(paymentIntent);
  } catch (error) {
    console.error('API错误 - 创建支付意图:', error.message);
    res.status(500).json({ 
      error: '创建支付意图失败', 
      message: error.message 
    });
  }
});

// API路由 - 确认支付
app.post('/api/confirm-payment', async (req, res) => {
  try {
    // 检查API配置
    if (!AIRWALLEX_API.CLIENT_ID || !AIRWALLEX_API.API_KEY) {
      throw new Error('API凭证未配置，请在环境变量中设置AIRWALLEX_CLIENT_ID和AIRWALLEX_API_KEY');
    }
    
    const paymentData = req.body;
    console.log('收到确认支付请求:', JSON.stringify(paymentData));
    
    const result = await confirmPaymentIntent(paymentData, AIRWALLEX_API);
    console.log('支付确认结果:', result.status);
    
    res.json(result);
  } catch (error) {
    console.error('API错误 - 确认支付:', error.message);
    res.status(500).json({ 
      error: '确认支付失败', 
      message: error.message 
    });
  }
});

// API路由 - 查询支付意图
app.get('/api/payment-intent/:id', async (req, res) => {
  try {
    // 检查API配置
    if (!AIRWALLEX_API.CLIENT_ID || !AIRWALLEX_API.API_KEY) {
      throw new Error('API凭证未配置，请在环境变量中设置AIRWALLEX_CLIENT_ID和AIRWALLEX_API_KEY');
    }
    
    const intentId = req.params.id;
    console.log('收到查询支付意图请求:', intentId);
    
    const paymentIntent = await getPaymentIntent(intentId, AIRWALLEX_API);
    console.log('支付意图查询结果:', paymentIntent.status);
    
    res.json(paymentIntent);
  } catch (error) {
    console.error('API错误 - 查询支付意图:', error.message);
    res.status(500).json({ 
      error: '查询支付意图失败', 
      message: error.message 
    });
  }
});

// 通用路由 - 将所有其他请求重定向到前端应用
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    error: '服务器错误',
    message: err.message
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
=================================================
  AI行程支付服务已启动！
  http://localhost:${PORT}
=================================================
  
  API端点:
  - 创建支付意图: POST http://localhost:${PORT}/api/create-payment-intent
  - 确认支付: POST http://localhost:${PORT}/api/confirm-payment
  - 查询支付意图: GET http://localhost:${PORT}/api/payment-intent/:id
  - 测试环境变量: GET http://localhost:${PORT}/api/test-env
  
  使用 Ctrl+C 停止服务器
=================================================
`);
}); 