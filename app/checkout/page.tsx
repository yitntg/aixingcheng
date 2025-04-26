'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AirwallexPayment from '../../components/AirwallexPayment';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
}

const products: Product[] = [
  {
    id: 'prod_001',
    name: '高级商务套餐',
    price: 999,
    description: '包含全球支付、多币种账户、外汇服务等所有功能',
    image: '/images/product1.jpg'
  },
  {
    id: 'prod_002',
    name: '标准商务套餐',
    price: 499,
    description: '包含基础支付、外汇转换等核心功能',
    image: '/images/product2.jpg'
  },
  {
    id: 'prod_003',
    name: '初创企业套餐',
    price: 199,
    description: '适合小型企业的基础支付解决方案',
    image: '/images/product3.jpg'
  }
];

export default function Checkout() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const router = useRouter();

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setShowPayment(false);
  };

  const handleProceedToPayment = () => {
    if (selectedProduct) {
      setShowPayment(true);
    }
  };

  const handlePaymentSuccess = () => {
    // 这里可以处理付款成功的逻辑
    router.push('/success');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">选择支付套餐</h1>
      
      {!showPayment ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {products.map((product) => (
              <div 
                key={product.id} 
                className={`card cursor-pointer transition-all ${
                  selectedProduct?.id === product.id 
                    ? 'border-2 border-primary-500 shadow-lg' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleProductSelect(product)}
              >
                <div className="h-40 bg-gray-200 mb-4 flex items-center justify-center">
                  <span className="text-gray-500">产品图片</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <p className="text-2xl font-bold text-primary-600">¥{product.price}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <button 
              className={`btn ${selectedProduct ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'} px-8 py-3 text-lg`}
              onClick={handleProceedToPayment}
              disabled={!selectedProduct}
            >
              {selectedProduct 
                ? `支付 ¥${selectedProduct.price}` 
                : '请选择套餐'}
            </button>
          </div>
        </>
      ) : (
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">完成支付</h2>
          <div className="card mb-6">
            <h3 className="text-lg font-semibold">{selectedProduct?.name}</h3>
            <p className="text-xl font-bold text-primary-600">¥{selectedProduct?.price}</p>
          </div>
          
          <AirwallexPayment 
            amount={selectedProduct?.price || 0}
            currency="CNY"
            onSuccess={handlePaymentSuccess}
            productName={selectedProduct?.name || ''}
          />
        </div>
      )}
    </div>
  );
} 