# AI行程订阅支付系统

这是一个基于Airwallex支付API的订阅支付系统，专为AI行程规划服务设计。系统使用CloudFlare Pages Functions作为后端，提供完整的支付流程和订阅管理功能。

## 主要功能

- 多种订阅计划展示（月度、年度、高级）
- 集成Airwallex支付API进行支付处理
- 响应式设计，适配各种设备
- 支付成功和失败页面
- 订单信息展示

## 技术栈

- 前端：HTML, CSS, JavaScript
- 样式：Bootstrap 5
- 图标：Font Awesome
- 支付处理：Airwallex JavaScript SDK
- 后端API：CloudFlare Pages Functions
- API集成：Airwallex Payment API

## 项目结构

```
/
├── index.html               # 主页面，包含产品展示和订阅表单
├── payment-success.html     # 支付成功页面
├── payment-failed.html      # 支付失败页面
├── css/
│   └── styles.css           # 主样式表
├── js/
│   └── payment.js           # 支付处理逻辑
└── functions/
    └── api/
        ├── get-api-token.js # 获取Airwallex API令牌的CloudFlare Function
        └── create-payment-intent.js # 创建支付意图的CloudFlare Function
```

## 部署

本项目设计为在CloudFlare Pages上部署，需要配置以下环境变量：

- `AIRWALLEX_CLIENT_ID`: Airwallex API的客户端ID
- `AIRWALLEX_API_KEY`: Airwallex API的密钥

## 本地开发

1. 克隆仓库：
   ```
   git clone https://github.com/your-username/ai-travel-payment-system.git
   cd ai-travel-payment-system
   ```

2. 使用本地HTTP服务器启动项目：
   ```
   # 使用Python 3自带的HTTP服务器
   python -m http.server 8000
   
   # 或使用Node.js的http-server
   npx http-server
   ```

3. 浏览器访问：`http://localhost:8000`

## 注意事项

- 支付功能需要Airwallex账户和相应的API凭证
- 在生产环境中，请确保使用HTTPS协议
- 当前实现使用的是Airwallex的测试环境，切换到生产环境需修改`payment.js`中的`env`参数

## 常见问题

**问题**: 支付按钮点击后没有反应
**解决**: 检查浏览器控制台是否有JavaScript错误，确保API凭证配置正确

**问题**: CloudFlare Functions报错
**解决**: 检查环境变量是否正确配置，API密钥是否有效

## 许可

本项目采用MIT许可证 - 详情请参阅LICENSE文件

## 联系方式

如有任何问题或需要支持，请联系：support@aitravel.com 