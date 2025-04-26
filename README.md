# AI行程 Airwallex 支付系统

这是一个基于Next.js和Airwallex API构建的支付系统，专为AI行程规划服务设计。该项目展示了如何集成Airwallex支付功能到您的Web应用程序中。

## 功能特点

- 响应式现代UI设计
- 支持信用卡、借记卡支付
- 国际支付解决方案
- 多种货币支持
- 实时交易记录
- 安全的支付处理
- 多种订阅计划展示（月度、年度、高级）
- 支付成功和失败页面
- 订单信息展示

## 技术栈

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Airwallex API

## 开始使用

### 前提条件

- Node.js 18.0.0 或更高版本
- npm 或 yarn
- Airwallex 开发者账户和API密钥

### 安装

1. 克隆仓库

```bash
git clone https://github.com/yitntg/aixingcheng.git
cd aixingcheng
```

2. 安装依赖

```bash
npm install
# 或
yarn install
```

3. 创建环境变量文件

创建一个名为`.env.local`的文件，并添加以下内容：

```
AIRWALLEX_API_KEY=your_airwallex_api_key
AIRWALLEX_CLIENT_ID=your_airwallex_client_id
AIRWALLEX_ENVIRONMENT=demo  # 可选值: 'demo' 或 'prod'
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用程序。

## 项目结构

```
payment-system/
├── app/                  # Next.js 应用程序目录
│   ├── api/              # API 路由
│   ├── checkout/         # 结账页面
│   ├── success/          # 支付成功页面
│   ├── globals.css       # 全局样式
│   ├── layout.tsx        # 主布局组件
│   └── page.tsx          # 主页
├── components/           # React 组件
│   ├── AirwallexPayment.tsx  # Airwallex 支付组件
│   ├── Footer.tsx        # 页脚组件
│   └── Header.tsx        # 页眉组件
├── public/               # 静态资源
├── .env.local            # 环境变量（不要提交到版本控制）
├── next.config.js        # Next.js 配置
├── tailwind.config.js    # Tailwind CSS 配置
└── tsconfig.json         # TypeScript 配置
```

## 生产环境部署

1. 构建生产版本

```bash
npm run build
# 或
yarn build
```

2. 启动生产服务器

```bash
npm run start
# 或
yarn start
```

## 注意事项

- 在生产环境中使用时，请确保您的Airwallex API密钥安全，不要将其暴露在客户端代码中。
- 在实际应用程序中，您应该在服务器端创建支付意图，而不是在客户端。
- 请参阅[Airwallex API文档](https://www.airwallex.com/docs/api)获取更多详细信息。
- 支付功能需要Airwallex账户和相应的API凭证
- 在生产环境中，请确保使用HTTPS协议

## 常见问题

**问题**: 支付按钮点击后没有反应  
**解决**: 检查浏览器控制台是否有JavaScript错误，确保API凭证配置正确

**问题**: API请求报错  
**解决**: 检查环境变量是否正确配置，API密钥是否有效

## 许可证

MIT
