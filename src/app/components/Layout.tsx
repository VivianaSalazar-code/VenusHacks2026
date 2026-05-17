import { Outlet, NavLink } from "react-router-dom";
import { Heart, LayoutDashboard, Utensils, BookOpen, FileDown, Baby} from "lucide-react";
import imgImage8 from "../../imports/Heart/edbe587244b11aa5490269df39a1dec1a2e383ec.png";

export function Layout() {
	return (
		<div className="flex h-screen bg-[#fffdf8]">
			{/* Left Sidebar */}
			<div className="w-[260px] border-r border-[#bd8e84] flex flex-col">
				{/* Logo */}
				<div className="flex flex-col items-center pt-4 pb-3">
					<img src={imgImage8} alt="HeartHealth Logo" className="w-[70px] h-[70px] mb-2" />
					<h1 className="font-['Montserrat'] font-bold text-[22px] text-[#172e54] tracking-[0.66px]">HeartHealth</h1>
				</div>

				{/* User Profile */}
				<div className="flex flex-col items-center py-4 px-3">
					<div className="w-[90px] h-[90px] rounded-full bg-gradient-to-br from-[#f79891] to-[#bd8e84] mb-2" />
					<p className="font-['Poppins'] font-medium text-[14px] text-[#172e54]">John Pork</p>
					<p className="font-['Poppins'] font-medium text-[12px] text-[#bd8e84]">Irvine, CA</p>
				</div>

				{/* Navigation */}
<nav className="flex-1 px-3 space-y-1">
    {/* 1. Dashboard Link */}
    <NavLink
        to="/"
        end
        className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2.5 rounded-lg font-['Montserrat'] font-semibold text-[16px] tracking-[0.48px] transition-colors ${
                isActive ? "text-[#172e54] bg-[#f3efe7]" : "text-[#bd8e84] hover:bg-[#f3efe7]/50"
            }`
        }
    >
        <LayoutDashboard size={18} />
        Dashboard
    </NavLink>

    {/* 2. Prenatal Hub Link */}
    <NavLink
        to="/prenatal"
        className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2.5 rounded-lg font-['Montserrat'] font-semibold text-[16px] tracking-[0.48px] transition-colors ${
                isActive ? "text-[#172e54] bg-[#f3efe7]" : "text-[#bd8e84] hover:bg-[#f3efe7]/50"
            }`
        }
    >
        <Baby size={18} />
        Prenatal Hub
    </NavLink>

    {/* 3. Meal Tracker Link */}
    <NavLink
        to="/meal-tracker"
        className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2.5 rounded-lg font-['Montserrat'] font-semibold text-[16px] tracking-[0.48px] transition-colors ${
                isActive ? "text-[#172e54] bg-[#f3efe7]" : "text-[#bd8e84] hover:bg-[#f3efe7]/50"
            }`
        }
    >
        <Utensils size={18} />
        Meal Tracker
    </NavLink>

    {/* 4. Resources Link */}
    <NavLink
        to="/resources"
        className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2.5 rounded-lg font-['Montserrat'] font-semibold text-[16px] tracking-[0.48px] transition-colors ${
                isActive ? "text-[#172e54] bg-[#f3efe7]" : "text-[#bd8e84] hover:bg-[#f3efe7]/50"
            }`
        }
    >
        <BookOpen size={18} />
        Resources
    </NavLink>

    {/* 5. Export Report Link */}
    <NavLink
        to="/export"
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-['Montserrat'] font-semibold text-[16px] tracking-[0.48px] text-[#bd8e84] hover:bg-[#f3efe7]/50 transition-colors w-full text-left"
    >
        <FileDown size={18} />
        Export Report
    </NavLink>
</nav>
			</div>

			{/* Main Content */}
			<div className="flex-1 overflow-auto">
				<Outlet />
			</div>
		</div>
	);
}
