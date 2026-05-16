import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Utensils, BookOpen, FileText, Settings } from "lucide-react";
import heartLogo from "@/assets/hera/edbe587244b11aa5490269df39a1dec1a2e383ec.png";
import { I18nProvider, useI18n } from "./i18n";

const NAV = [
  { to: "/", end: true, icon: LayoutDashboard, key: "dashboard" as const },
  { to: "/meal-tracker", icon: Utensils, key: "mealTracker" as const },
  { to: "/resources", icon: BookOpen, key: "resources" as const },
  { to: "/report", icon: FileText, key: "report" as const },
];

function SidebarInner() {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="w-[260px] border-r border-[#bd8e84]/40 flex flex-col bg-[#fffdf8]">
      <div className="flex flex-col items-center pt-5 pb-3">
        <img src={heartLogo} alt="HeraHealth" className="w-[70px] h-[70px] mb-2" />
        <h1 className="font-['Montserrat'] font-bold text-[22px] text-[#172e54] tracking-[0.66px]">
          {t("appName")}
        </h1>
      </div>
      <div className="flex flex-col items-center py-4 px-3">
        <div className="w-[88px] h-[88px] rounded-full bg-gradient-to-br from-[#f79891] to-[#bd8e84] mb-2" />
        <p className="font-['Poppins'] font-medium text-[14px] text-[#172e54]">Maria Santos</p>
        <p className="font-['Poppins'] font-medium text-[12px] text-[#bd8e84]">Irvine, CA</p>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {NAV.map(({ to, end, icon: Icon, key }) => {
          const active = end ? pathname === to : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-['Montserrat'] font-semibold text-[15px] tracking-[0.45px] transition-colors ${
                active ? "text-[#172e54] bg-[#f3efe7]" : "text-[#bd8e84] hover:bg-[#f3efe7]/60"
              }`}
            >
              <Icon size={18} />
              {t(key)}
            </Link>
          );
        })}
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-['Montserrat'] font-semibold text-[15px] tracking-[0.45px] text-[#bd8e84] hover:bg-[#f3efe7]/60 transition-colors w-full text-left">
          <Settings size={18} />
          {t("settings")}
        </button>
      </nav>
      <p className="px-4 pb-4 font-['Poppins'] text-[10px] text-[#bd8e84]/70 leading-tight">
        Endorsed by the California Office of the Surgeon General · osg.ca.gov
      </p>
    </div>
  );
}

export function AppLayout() {
  return (
    <I18nProvider>
      <div className="flex h-screen w-full bg-[#fffdf8]">
        <SidebarInner />
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </I18nProvider>
  );
}
