import Link from 'next/link';
import { FaShoppingCart, FaCreditCard, FaHistory } from 'react-icons/fa';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Airwallex 支付系统</h1>
        <p className="text-xl text-gray-600 mb-8">安全、快速的国际支付解决方案</p>
        <div className="flex justify-center gap-4">
          <Link href="/checkout" className="btn btn-primary flex items-center gap-2">
            <FaShoppingCart /> 立即体验
          </Link>
          <Link href="/about" className="btn btn-secondary">
            了解更多
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="card text-center">
          <div className="text-4xl text-primary-600 mb-4 flex justify-center">
            <FaCreditCard />
          </div>
          <h2 className="text-2xl font-semibold mb-2">多种支付方式</h2>
          <p className="text-gray-600">
            支持信用卡、借记卡、微信支付、支付宝等多种支付方式，满足全球用户需求。
          </p>
        </div>
        
        <div className="card text-center">
          <div className="text-4xl text-primary-600 mb-4 flex justify-center">
            <FaHistory />
          </div>
          <h2 className="text-2xl font-semibold mb-2">实时交易记录</h2>
          <p className="text-gray-600">
            查看所有交易的实时状态和历史记录，轻松管理您的资金流动。
          </p>
        </div>
        
        <div className="card text-center">
          <div className="text-4xl text-primary-600 mb-4 flex justify-center">
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-14h2v7h-2zm0 8h2v2h-2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-2">安全保障</h2>
          <p className="text-gray-600">
            采用先进的加密技术和风险管理系统，确保您的资金和信息安全。
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">全球支付解决方案</h2>
        <div className="bg-gray-100 p-6 rounded-lg">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">支持 130+ 国家和地区</h3>
              <p className="text-gray-700 mb-4">
                Airwallex 支持全球 130 多个国家和地区的支付和收款，为您的国际业务提供便利。
              </p>
              <h3 className="text-xl font-semibold mb-3">11 种主要货币账户</h3>
              <p className="text-gray-700">
                开设 11 种主要货币的账户，包括美元、欧元、英镑、澳元、港币、新加坡元等。
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">低成本外汇转换</h3>
              <p className="text-gray-700 mb-4">
                比传统银行低 80% 的外汇成本，实时汇率透明可见。
              </p>
              <h3 className="text-xl font-semibold mb-3">简单易用的API</h3>
              <p className="text-gray-700">
                强大而灵活的 API，轻松集成到您现有的系统中，快速部署上线。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="text-center">
        <h2 className="text-3xl font-bold mb-6">准备好开始了吗？</h2>
        <Link href="/checkout" className="btn btn-primary px-8 py-3 text-lg">
          立即开始支付体验
        </Link>
      </section>
    </main>
  );
} 