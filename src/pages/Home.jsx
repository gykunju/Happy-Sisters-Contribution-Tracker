import React from "react";
import Contributions from "./Contributions";
import MonthlyBreakdown from "../components/MonthlyBreakdown";
import {
  MdPersonOutline,
  MdLogout,
  MdKeyboardArrowDown,
  MdDashboard,
  MdBarChart,
} from "react-icons/md";
import { FaMoneyBillWheat } from "react-icons/fa6";
import { LuWallet } from "react-icons/lu";
import { GrMoney } from "react-icons/gr";
import { TbMoneybag } from "react-icons/tb";
import { BsPeople } from "react-icons/bs";
import { IoSettings } from "react-icons/io5";
import { useState, useEffect, useRef } from "react";
import { useUser } from "../context/UserContext";

function Home() {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' or 'monthly'
  const {
    signOut,
    userRole,
    transactions,
    members,
    currentUser,
    isLoading,
    getVisibleTransactions,
    getStatsTransactions,
  } = useUser();
  const dropdownRef = useRef(null);

  // Calculate dynamic stats from actual data (role-based)
  const calculateStats = () => {
    // Use getStatsTransactions for stats so members can see group overview
    const statsTransactions = getStatsTransactions();

    if (!statsTransactions || statsTransactions.length === 0) {
      return {
        currentBalance: 0,
        userContributions: 0,
        totalContributions: 0,
        totalMembers: members ? members.length : 0,
      };
    }

    // Calculate totals from all transactions for stats display
    const totalContributions = statsTransactions
      .filter((t) => t.type.toLowerCase() === "contribution")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalWithdrawals = statsTransactions
      .filter((t) => t.type.toLowerCase() === "withdrawal")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // Current balance = total contributions - total withdrawals
    const currentBalance = totalContributions - totalWithdrawals;

    // Calculate user's personal contributions
    let userContributions = 0;
    const currentUserName = localStorage.getItem("user") || "";
    userContributions = statsTransactions
      .filter(
        (t) =>
          t.type.toLowerCase() === "contribution" &&
          t.member.toLowerCase() === currentUserName.toLowerCase()
      )
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return {
      currentBalance,
      userContributions,
      totalContributions,
      totalMembers: members ? members.length : 0,
    };
  };

  const stats = calculateStats();

  const handleSignOut = () => {
    signOut();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-slate-100 min-h-screen font-sans text-zinc-600 text-lg">
      {/* Header with safe spacing */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30">
        <div className="mobile-safe-area py-4">
          <nav className="flex justify-between items-center">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <FaMoneyBillWheat size={24} className="text-blue-600" />
              <h1 className="text-lg sm:text-xl">Happy Sisters</h1>
            </div>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-2 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors duration-200 touch-target"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <MdPersonOutline size={16} className="text-white" />
                </div>
                <span className="text-sm font-medium text-slate-700 max-w-20 truncate hidden sm:block">
                  {localStorage.getItem("user") || "User"}
                </span>
                <MdKeyboardArrowDown
                  size={14}
                  className="text-slate-500 hidden sm:block"
                />
              </button>

              {/* Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900">
                      {localStorage.getItem("user") || "User"}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      {userRole || localStorage.getItem("userRole") || "Member"}
                    </p>
                  </div>
                  <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <IoSettings size={16} />
                    Settings
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <MdLogout size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Main content with proper mobile spacing */}
      <div className="mobile-safe-area py-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === "dashboard"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <MdDashboard size={18} />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab("monthly")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === "monthly"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <MdBarChart size={18} />
              <span>Monthly Analysis</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "dashboard" ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Current Balance Card */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex justify-between items-center hover:shadow-sm transition-shadow">
                <div className="flex flex-col">
                  <h4 className="font-medium text-xs text-green-600 mb-1">
                    {userRole === "admin" ? "Group Balance" : "Your Balance"}
                  </h4>
                  {isLoading ? (
                    <div className="w-20 h-6 bg-green-200 rounded animate-pulse"></div>
                  ) : (
                    <h1 className="text-xl font-bold text-green-800">
                      KES {stats.currentBalance.toLocaleString()}
                    </h1>
                  )}
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <LuWallet size={24} className="text-green-600" />
                </div>
              </div>

              {/* User Contributions Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex justify-between items-center hover:shadow-sm transition-shadow">
                <div className="flex flex-col">
                  <h4 className="font-medium text-xs text-blue-600 mb-1">
                    Your Contributions
                  </h4>
                  {isLoading ? (
                    <div className="w-20 h-6 bg-blue-200 rounded animate-pulse"></div>
                  ) : (
                    <h1 className="text-xl font-bold text-blue-800">
                      KES {stats.userContributions.toLocaleString()}
                    </h1>
                  )}
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <GrMoney size={24} className="text-blue-600" />
                </div>
              </div>

              {/* Total Contributions Card */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex justify-between items-center hover:shadow-sm transition-shadow">
                <div className="flex flex-col">
                  <h4 className="font-medium text-xs text-purple-600 mb-1">
                    {userRole === "admin"
                      ? "Total Contributions"
                      : "Total Contributed"}
                  </h4>
                  {isLoading ? (
                    <div className="w-20 h-6 bg-purple-200 rounded animate-pulse"></div>
                  ) : (
                    <h1 className="text-xl font-bold text-purple-800">
                      KES {stats.totalContributions.toLocaleString()}
                    </h1>
                  )}
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TbMoneybag size={24} className="text-purple-600" />
                </div>
              </div>

              {/* Total Members Card */}
              {userRole === "admin" && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex justify-between items-center hover:shadow-sm transition-shadow">
                  <div className="flex flex-col">
                    <h4 className="font-medium text-xs text-orange-600 mb-1">
                      Total Members
                    </h4>
                    {isLoading ? (
                      <div className="w-12 h-6 bg-orange-200 rounded animate-pulse"></div>
                    ) : (
                      <h1 className="text-xl font-bold text-orange-800">
                        {stats.totalMembers}
                      </h1>
                    )}
                  </div>
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <BsPeople size={24} className="text-orange-600" />
                  </div>
                </div>
              )}
            </div>

            {/* Transactions Section */}
            <main className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
              <Contributions />
            </main>
          </>
        ) : (
          /* Monthly Analysis Tab */
          <MonthlyBreakdown />
        )}
      </div>
    </div>
  );
}

export default Home;
