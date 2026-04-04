import { LogOut, Users, ChartColumn, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ApplicantForm } from '../../components/ApplicantFormModal';
import { AdminRoute } from '../../components/AdminRoute';

type Props = {
  onApplicantCreated: () => void;
};

export function DashboardHeader({ onApplicantCreated }: Props) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login/auth');
  };

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4 sm:py-5">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-xl shadow-sm">
          <Users className="text-white" size={22} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">Панель управления</h1>
          <p className="text-xs sm:text-sm text-gray-500">Управление анкетами абитуриентов</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <AdminRoute>
          <Link
            to="/Admin"
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-sm"
          >
            <ShieldCheck size={14} /> Админ
          </Link>
        </AdminRoute>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-700 transition-colors shadow-sm"
        >
          <ChartColumn size={14} /> Статистика
        </Link>
        <ApplicantForm onCreated={onApplicantCreated} />
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-700 transition-colors shadow-sm"
        >
          <LogOut size={14} /> Выйти
        </button>
      </div>
    </header>
  );
}
