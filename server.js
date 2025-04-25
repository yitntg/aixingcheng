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

// Airwallex API配置 - 直接在此文件中配置，避免需要.env文件
const AIRWALLEX_API = {
  CLIENT_ID: process.env.AIRWALLEX_CLIENT_ID || 'C8VXbgIDQO-i8Cr8G3IiFQ', // 测试环境使用
  API_KEY: process.env.AIRWALLEX_API_KEY || '48b84e7457422b80c3972c3ca4703a1c8321a87176399c131234605b0fcae53a616df1da5f6c8637c0a51551a6ede541', // 真实API密钥
  API_BASE: process.env.AIRWALLEX_API_BASE || 'https://api-demo.airwallex.com', // 演示环境
};

// 中间件
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// 导入Airwallex支付处理逻辑
const { getApiToken, createPaymentIntent, getPaymentIntent } = require('./server/payment-logic');

// API路由 - 创建支付意图
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const paymentData = req.body;
    const paymentIntent = await createPaymentIntent(paymentData, AIRWALLEX_API);
    res.json(paymentIntent);
  } catch (error) {
    console.error('API错误 - 创建支付意图:', error.message);
    res.status(500).json({ 
      error: '创建支付意图失败', 
      message: error.message 
    });
  }
});

// API路由 - 查询支付意图
app.get('/api/payment-intent/:id', async (req, res) => {
  try {
    const intentId = req.params.id;
    const paymentIntent = await getPaymentIntent(intentId, AIRWALLEX_API);
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

// 启动服务器
app.listen(PORT, () => {
  console.log(`
=================================================
  AI行程支付服务已启动！
  http://localhost:${PORT}
=================================================
  
  API端点:
  - 创建支付意图: POST http://localhost:${PORT}/api/create-payment-intent
  - 查询支付意图: GET http://localhost:${PORT}/api/payment-intent/:id
  
  使用 Ctrl+C 停止服务器
=================================================
`);
}); 