'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface AirwallexPaymentProps {
  amount: number;
  currency: string;
  onSuccess: () => void;
  productName: string;
}

const AirwallexPayment = ({ amount, currency, onSuccess, productName }: AirwallexPaymentProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    // 在实际项目中，你需要添加Airwallex的JS SDK
    const loadAirwallexScript = () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.airwallex.com/assets/elements.bundle.min.js';
      script.async = true;
      document.body.appendChild(script);
      
      return script;
    };
    
    const script = loadAirwallexScript();
    
    return () => {
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 注意：在实际生产环境中，应该在服务器端创建paymentIntent
        // 这里仅作为前端示例
        // 正常情况下，这个请求应该发送到您的后端服务器
        const response = await axios.post('/api/create-payment-intent', {
          amount,
          currency,
          productName
        });
        
        const { id, client_secret } = response.data;
        setPaymentIntentId(id);
        setClientSecret(client_secret);
        initializePaymentElement(id, client_secret);
      } catch (err) {
        console.error('创建支付意图失败:', err);
        setError('创建支付请求失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    if (amount > 0) {
      createPaymentIntent();
    }
  }, [amount, currency, productName]);

  const initializePaymentElement = (intentId: string, secret: string) => {
    if (typeof window === 'undefined' || !window.Airwallex) {
      console.warn('Airwallex SDK 尚未加载');
      return;
    }
    
    const Airwallex = window.Airwallex;
    
    Airwallex.init({
      env: 'demo', // 在生产环境中改为 'prod'
      origin: window.location.origin,
    });
    
    const element = Airwallex.createElement('card', {
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
          iconColor: '#fa755a',
        },
      },
    });
    
    element.mount('airwallex-card-element');
    
    const form = document.getElementById('payment-form');
    if (form) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        try {
          setLoading(true);
          const { result } = await Airwallex.confirmPaymentIntent({
            element,
            id: intentId,
            client_secret: secret,
          });
          
          if (result.status === 'SUCCEEDED') {
            onSuccess();
          } else {
            setError(`支付失败: ${result.status}`);
          }
        } catch (err: any) {
          setError(`支付处理错误: ${err.message || '未知错误'}`);
        } finally {
          setLoading(false);
        }
      });
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <form id="payment-form" className="mb-4">
        <div className="mb-4">
          <label className="block mb-2 text-gray-700">信用卡信息</label>
          <div 
            id="airwallex-card-element" 
            className="p-3 border border-gray-300 rounded-md"
          >
            {/* Airwallex Card元素将在这里渲染 */}
            {loading && !clientSecret && <div className="text-center">加载中...</div>}
          </div>
        </div>
        
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading || !clientSecret}
        >
          {loading ? '处理中...' : `支付 ${currency} ${amount}`}
        </button>
      </form>
      
      <div className="text-sm text-gray-500">
        <p>这是一个演示环境。您可以使用以下测试卡号:</p>
        <p className="font-mono mt-1">4000 0000 0000 0002</p>
        <p className="mt-2">任何有效的未来日期，任何3位数CVC。</p>
      </div>
    </div>
  );
};

export default AirwallexPayment;

// 为TypeScript添加Airwallex全局类型
declare global {
  interface Window {
    Airwallex?: any;
  }
} 