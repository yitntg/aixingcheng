import Link from 'next/link';
import { FaTwitter, FaFacebook, FaLinkedin, FaWeibo } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Airwallex支付</h3>
            <p className="text-gray-300">
              安全、快速的国际支付解决方案，助力全球业务拓展。
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">产品</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/features" className="text-gray-300 hover:text-white">
                  支付功能
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-300 hover:text-white">
                  价格
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-gray-300 hover:text-white">
                  API文档
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">公司</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white">
                  关于我们
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-300 hover:text-white">
                  加入我们
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-white">
                  博客
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">联系我们</h3>
            <p className="text-gray-300 mb-4">
              邮箱: support@airwallex-example.com
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-300 hover:text-white">
                <FaTwitter />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white">
                <FaFacebook />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white">
                <FaLinkedin />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white">
                <FaWeibo />
              </Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} Airwallex支付系统. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 