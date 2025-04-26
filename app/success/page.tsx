import Link from 'next/link';
import { FaCheckCircle } from 'react-icons/fa';

export default function SuccessPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto card">
        <div className="text-5xl text-green-500 mb-6 flex justify-center">
          <FaCheckCircle />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">支付成功!</h1>
        
        <p className="text-gray-600 mb-8">
          您的交易已成功处理。感谢您选择 Airwallex 支付系统。
        </p>
        
        <div className="bg-gray-100 rounded-md p-4 mb-8">
          <h2 className="text-lg font-semibold mb-2">交易详情</h2>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">交易编号:</span>
            <span className="font-medium">TXN{Math.floor(Math.random() * 10000000)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">交易时间:</span>
            <span className="font-medium">{new Date().toLocaleString('zh-CN')}</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <Link href="/" className="btn btn-primary block w-full">
            返回首页
          </Link>
          <Link href="/checkout" className="btn btn-secondary block w-full">
            再次购买
          </Link>
        </div>
      </div>
    </div>
  );
} 