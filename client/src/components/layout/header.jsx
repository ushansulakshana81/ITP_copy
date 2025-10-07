import { Bell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header({ title, description }) {
  const navigate = useNavigate();
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900" data-testid="page-title">{title}</h2>
          <p className="text-slate-600" data-testid="page-description">{description}</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-slate-600 hover:text-slate-900" data-testid="button-notifications">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          
          <div
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80"
            onClick={() => navigate("/users")}
          >
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-slate-600" />
            </div>
            <span className="text-sm font-medium text-slate-900" data-testid="text-username">John Manager</span>
          </div>
        </div>
      </div>
    </header>
  );
}
