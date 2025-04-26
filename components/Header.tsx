import Link from 'next/link';
import { FaUser, FaShoppingCart } from 'react-icons/fa';

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            Airwallex支付
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary-600">
              首页
            </Link>
            <Link href="/features" className="text-gray-700 hover:text-primary-600">
              功能
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-primary-600">
              价格
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-primary-600">
              关于我们
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Link href="/checkout" className="text-gray-700 hover:text-primary-600">
              <FaShoppingCart className="h-6 w-6" />
            </Link>
            <Link href="/account" className="text-gray-700 hover:text-primary-600">
              <FaUser className="h-6 w-6" />
            </Link>
            <Link href="/login" className="btn btn-primary">
              登录
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 