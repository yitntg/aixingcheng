# AI行程支付系统

## 环境变量配置

系统需要以下环境变量才能正常工作：

### 必要环境变量
- `AIRWALLEX_CLIENT_ID` - Airwallex API的客户端ID
- `AIRWALLEX_API_KEY` - Airwallex API的密钥

### 可选环境变量
- `AIRWALLEX_API_BASE` - Airwallex API的基础URL，默认为 `https://api.airwallex.com`

## CloudFlare Pages 部署说明

由于CloudFlare Pages支付环境变量但无法直接在前端代码中访问，需要进行如下配置：

1. 在CloudFlare Pages项目设置中添加环境变量：
   - `AIRWALLEX_CLIENT_ID`
   - `AIRWALLEX_API_KEY`
   - `AIRWALLEX_API_BASE` (可选)

2. 确保在"构建和部署"设置中，环境变量包含在"生产"和"预览"环境中

3. 配置CloudFlare Pages的Functions功能，以便API请求能够访问环境变量

## 本地开发说明

1. 创建`.env`文件，添加必要的环境变量：
```
AIRWALLEX_CLIENT_ID=your_client_id
AIRWALLEX_API_KEY=your_api_key
AIRWALLEX_API_BASE=https://api-demo.airwallex.com  # 开发环境使用演示API
```

2. 安装依赖：
```
npm install
```

3. 启动开发服务器：
```
npm run dev
```

## 故障排除

如果支付按钮点击后无反应或支付失败，请检查：

1. 浏览器控制台是否有JavaScript错误
2. 服务器日志中API请求是否成功
3. 环境变量是否正确配置
4. 网络请求是否被跨域策略(CORS)阻止

通过API端点 `/api/test-env` 可以检查环境变量状态。
