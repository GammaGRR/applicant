import { Link } from 'react-router-dom';
import { AuthText } from '../components/authText';
import { AuthForm } from '../components/authForm';

export const Login = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <AuthText />
        <AuthForm />
        <p className="mt-6 text-center text-sm text-gray-500">
          <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
            Статистика по специальностям
          </Link>
        </p>
      </div>
    </div>
  );
};