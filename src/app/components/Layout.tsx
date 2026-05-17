import { Outlet, NavLink } from "react-router-dom";
import { Heart, LayoutDashboard, Utensils, BookOpen, FileDown, Baby } from "lucide-react";
import imgImage8 from "../../imports/Heart/edbe587244b11aa5490269df39a1dec1a2e383ec.png";
import imgProfile from "../../assets/hera/profile.jpeg";
import imgCASG from "../../assets/hera/osg.png";

export function Layout() {
	return (
		<div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#f5f0e8" }}>
			{/* Left Sidebar */}
			<div
				style={{
					width: 260,
					flexShrink: 0,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					padding: "24px 16px 20px",
					borderRight: "1px solid #e2dbd0",
					background: "#f5f0e8",
				}}
			>
				{/* Logo */}
				<div className="flex flex-col items-center pt-2 pb-3">
					<img src={imgImage8} alt="HeraHeart Logo" className="w-[70px] h-[70px] mb-2 object-contain" />
					<h1 className="font-['Montserrat'] font-bold text-[22px] text-[#172e54] tracking-[0.66px]">HeraHeart</h1>
				</div>

				{/* User Profile */}
				<div className="flex flex-col items-center py-4 px-3">
					<img
						src={imgProfile}
						alt="Josephine B"
						className="w-[90px] h-[90px] rounded-full object-cover mb-2"
						style={{ border: "2.5px solid rgba(232,121,106,0.35)", boxShadow: "0 2px 10px rgba(0,0,0,0.12)" }}
					/>
					<p className="font-['Poppins'] font-medium text-[14px] text-[#172e54]">Josephine B</p>
					<p className="font-['Poppins'] font-medium text-[12px] text-[#e8796a]">Irvine, CA</p>
				</div>

				{/* Navigation — untouched */}
				<nav className="flex-1 px-3 space-y-1">
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

					<NavLink
						to="/export"
						className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-['Montserrat'] font-semibold text-[16px] tracking-[0.48px] text-[#bd8e84] hover:bg-[#f3efe7]/50 transition-colors w-full text-left"
					>
						<FileDown size={18} />
						Export Report
					</NavLink>
				</nav>

				{/* CA Surgeon General logo */}
				<div className="w-full pt-3">
					<div className="bg-white rounded-xl px-3 py-2 border border-[#e8e0d4] flex items-center justify-center">
						<img src={imgCASG} alt="Office of the California Surgeon General" className="w-full max-w-[170px] h-auto object-contain" />
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
				<Outlet />
			</div>
		</div>
	);
}
