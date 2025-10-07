import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Building2, 
  ArrowRightLeft, 
  Settings,
  Truck,
  Tag
} from "lucide-react";
import { cn } from "../../lib/utils.js";

const navigationItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/inventory", label: "Inventory", icon: Package },
  { path: "/categories", label: "Categories", icon: Tag },
  { path: "/reports", label: "Reports", icon: FileText },
  { path: "/suppliers", label: "Suppliers", icon: Building2 },
  { path: "/movements", label: "Movements", icon: ArrowRightLeft },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 sidebar-transition">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">HevySync</h1>
        </div>
      </div>
      
      <nav className="px-6 pb-6">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <li key={item.path}>
                <Link href={item.path}>
                  <span
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
