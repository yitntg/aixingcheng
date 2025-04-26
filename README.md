# 智慧旅行 - AI旅行规划支付系统

这是一个基于Airwallex支付的旅行规划网站，提供AI驱动的旅行计划订阅服务。

## 项目特点

- **现代响应式界面**：完全响应式设计，适配各种设备尺寸
- **真实支付功能**：集成Airwallex支付SDK，支持信用卡支付
- **订阅计划**：提供多种灵活的订阅方案
- **Serverless API**：使用Cloudflare Functions处理支付请求
- **完整的支付流程**：包含支付成功和失败页面

## 技术栈

- HTML5 + CSS3
- 原生JavaScript
- Airwallex支付SDK
- Cloudflare Functions (Serverless)
- RemixIcon图标库

## 项目结构

```
根目录
├── index.html          # 主页
├── payment-success.html # 支付成功页面
├── payment-failed.html  # 支付失败页面
├── css_new/            # CSS样式目录
│   └── styles.css      # 主样式文件
├── js_new/             # JavaScript目录
│   └── script.js       # 主脚本文件
└── functions/          # Cloudflare Functions
    └── api/
        └── create-payment-intent.js # 创建支付意图API
```

## 部署说明

1. **前端部署**：
   - 将所有静态文件（HTML、CSS、JS）上传到您的Web服务器或静态托管服务
   
2. **Serverless函数部署**：
   - 部署到Cloudflare Pages或类似的Serverless平台
   - 设置环境变量：
     - `AIRWALLEX_CLIENT_ID`：您的Airwallex客户端ID
     - `AIRWALLEX_API_KEY`：您的Airwallex API密钥
     - `AIRWALLEX_API_BASE`：Airwallex API基础URL (默认是https://api-demo.airwallex.com)

## 本地开发

1. 克隆仓库
2. 使用本地HTTP服务器运行项目，例如：
   ```
   npx serve
   ```
3. 使用ngrok等工具进行本地Serverless函数测试

## 测试支付

在测试环境中，可以使用以下测试卡信息：
- 卡号：4000 0000 0000 0002
- 有效期：任何未来日期
- CVC：任何3位数字
- 持卡人姓名：任何名称

## 贡献指南

欢迎提交Issues和Pull Requests来改进这个项目。

## 许可证

MIT 