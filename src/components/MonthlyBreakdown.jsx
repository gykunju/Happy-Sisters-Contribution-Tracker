import { useState } from "react";
import { useUser } from "../context/UserContext";
import {
  MdCalendarToday,
  MdTrendingUp,
  MdTrendingDown,
  MdPeople,
  MdExpandMore,
  MdBarChart,
  MdShowChart,
  MdPerson,
  MdGroup,
} from "react-icons/md";
import { FaMoneyBillWave, FaChartLine } from "react-icons/fa";

function MonthlyBreakdown() {
  const {
    getMonthlyBreakdown,
    userRole,
    user,
    transactions,
    getData,
    refreshTransactions,
  } = useUser();
  const [expandedMonth, setExpandedMonth] = useState(null);
  const [viewMode, setViewMode] = useState("cards");
  const [analysisFilter, setAnalysisFilter] = useState("group");

  const monthlyData = getMonthlyBreakdown(analysisFilter);

  const maxAmount =
    monthlyData?.length > 0
      ? Math.max(
          ...monthlyData.map((m) => Math.max(m.contributions, m.withdrawals))
        )
      : 0;

  const toggleMonth = (monthIndex) => {
    setExpandedMonth(expandedMonth === monthIndex ? null : monthIndex);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-w-7xl mx-auto">
      {/* Clean Professional Header */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Title and Description */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FaChartLine size={16} className="text-white sm:w-5 sm:h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Monthly Analysis
              </h2>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm max-w-2xl">
              {analysisFilter === "personal"
                ? "Track your personal contribution progress and financial journey"
                : analysisFilter === "group"
                ? "Overview of group financial activities and member contributions"
                : "Financial insights based on your access level"}
            </p>
          </div>

          {/* Clean Controls Section - Mobile Optimized */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            {/* Analysis Filter */}
            <div className="flex flex-col gap-3">
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                Analysis Type:
              </span>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2 sm:w-auto">
                <button
                  onClick={() => setAnalysisFilter("personal")}
                  className={`px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    analysisFilter === "personal"
                      ? "bg-emerald-600 text-white shadow-md"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                  }`}
                >
                  <MdPerson size={16} className="sm:w-4 sm:h-4" />
                  Personal
                </button>

                <button
                  onClick={() => setAnalysisFilter("group")}
                  className={`px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    analysisFilter === "group"
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                >
                  <MdGroup size={16} className="sm:w-4 sm:h-4" />
                  Group
                </button>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-white rounded-lg border border-gray-200 p-1 self-start sm:self-auto">
              <button
                onClick={() => setViewMode("cards")}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1 sm:gap-2 ${
                  viewMode === "cards"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <MdBarChart size={14} className="sm:w-4 sm:h-4" />
                Cards
              </button>
              <button
                onClick={() => setViewMode("chart")}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1 sm:gap-2 ${
                  viewMode === "chart"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <MdShowChart size={14} className="sm:w-4 sm:h-4" />
                Charts
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Information - Mobile Optimized */}
      <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-amber-50 border-b border-amber-200">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
          <div className="text-xs sm:text-sm text-amber-800 break-words">
            <span className="font-medium">Status:</span> {analysisFilter} view •{" "}
            {monthlyData?.length || 0} months • {transactions?.length || 0}{" "}
            transactions • User: {user?.email || "Not signed in"}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => getData()}
              className="px-2 sm:px-3 py-1 sm:py-1.5 bg-amber-600 text-white rounded-md text-xs font-medium hover:bg-amber-700 transition-colors"
            >
              Reload Data
            </button>
            <button
              onClick={() => refreshTransactions()}
              className="px-2 sm:px-3 py-1 sm:py-1.5 bg-green-600 text-white rounded-md text-xs font-medium hover:bg-green-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-6 lg:p-8">
        {!monthlyData || monthlyData.length === 0 ? (
          /* Clean Empty State - Mobile Optimized */
          <div className="text-center py-8 sm:py-12 lg:py-16">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <MdBarChart
                size={32}
                className="text-gray-400 sm:w-10 sm:h-10 lg:w-12 lg:h-12"
              />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              No Data Available
            </h3>
            <p className="text-gray-600 text-sm sm:text-base max-w-lg mx-auto leading-relaxed mb-6 sm:mb-8 px-4">
              {analysisFilter === "personal"
                ? "You haven't made any transactions yet. Start by adding your first contribution to see personal analytics."
                : analysisFilter === "group"
                ? "No group transactions found. Add some contributions to see group analytics."
                : "No data available for the current view. Try switching to a different analysis type."}
            </p>

            {/* Suggestion Buttons - Mobile Responsive */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-3 px-4">
              {analysisFilter === "personal" && (
                <button
                  onClick={() => setAnalysisFilter("group")}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
                >
                  <MdGroup size={16} className="sm:w-4 sm:h-4" />
                  View Group Data
                </button>
              )}
              {analysisFilter === "group" && (
                <button
                  onClick={() => setAnalysisFilter("personal")}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
                >
                  <MdPerson size={16} className="sm:w-4 sm:h-4" />
                  View Personal Data
                </button>
              )}
              <button
                onClick={() => setAnalysisFilter("group")}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
              >
                <MdGroup size={16} className="sm:w-4 sm:h-4" />
                Group View
              </button>
            </div>
          </div>
        ) : /* Data Content */
        viewMode === "cards" ? (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {monthlyData.map((month, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Month Header - Mobile Optimized */}
                <button
                  onClick={() => toggleMonth(index)}
                  className="w-full p-3 sm:p-4 lg:p-6 bg-gray-50 hover:bg-gray-100 transition-all duration-200 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 flex-1 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MdCalendarToday
                          size={16}
                          className="text-white sm:w-5 sm:h-5 lg:w-5 lg:h-5"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg mb-1 sm:mb-2 truncate">
                          {month.month}
                        </h3>
                        <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 text-xs sm:text-sm flex-wrap">
                          <span className="flex items-center gap-1 bg-green-100 px-2 py-0.5 sm:px-3 sm:py-1 rounded-md">
                            <MdTrendingUp
                              size={12}
                              className="text-green-600 sm:w-3.5 sm:h-3.5"
                            />
                            <span className="font-medium text-green-800 whitespace-nowrap">
                              KES {month.contributions.toLocaleString()}
                            </span>
                          </span>
                          {month.withdrawals > 0 && (
                            <span className="flex items-center gap-1 bg-red-100 px-2 py-0.5 sm:px-3 sm:py-1 rounded-md">
                              <MdTrendingDown
                                size={12}
                                className="text-red-600 sm:w-3.5 sm:h-3.5"
                              />
                              <span className="font-medium text-red-800 whitespace-nowrap">
                                KES {month.withdrawals.toLocaleString()}
                              </span>
                            </span>
                          )}
                          <span className="flex items-center gap-1 bg-blue-100 px-2 py-0.5 sm:px-3 sm:py-1 rounded-md">
                            <MdPeople
                              size={12}
                              className="text-blue-600 sm:w-3.5 sm:h-3.5"
                            />
                            <span className="font-medium text-blue-800 whitespace-nowrap">
                              {month.memberCount} member
                              {month.memberCount !== 1 ? "s" : ""}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 flex-shrink-0">
                      <div className="text-right">
                        <p
                          className={`text-sm sm:text-lg lg:text-xl font-bold mb-0.5 sm:mb-1 ${
                            month.net >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {month.net >= 0 ? "+" : ""}KES{" "}
                          {month.net.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">
                          Net Amount
                        </p>
                      </div>

                      <div
                        className={`p-1.5 sm:p-2 rounded-lg transition-transform duration-200 ${
                          expandedMonth === index
                            ? "bg-blue-100 rotate-180"
                            : "bg-gray-100"
                        }`}
                      >
                        <MdExpandMore
                          size={16}
                          className="text-gray-600 sm:w-5 sm:h-5"
                        />
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expanded Details - Mobile Optimized */}
                {expandedMonth === index && (
                  <div className="p-3 sm:p-4 lg:p-6 border-t border-gray-200 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                      {/* Contributions Card */}
                      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                            <MdTrendingUp size={18} className="text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-green-900 text-base">
                              Contributions
                            </h4>
                            <p className="text-2xl font-bold text-green-700">
                              KES {month.contributions.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-green-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-700"
                            style={{
                              width: `${
                                (month.contributions / maxAmount) * 100
                              }%`,
                            }}
                          />
                        </div>
                        <p className="text-green-700 text-xs mt-2 font-medium">
                          {((month.contributions / maxAmount) * 100).toFixed(1)}
                          % of max
                        </p>
                      </div>

                      {/* Withdrawals Card */}
                      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                            <MdTrendingDown size={18} className="text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-red-900 text-base">
                              Withdrawals
                            </h4>
                            <p className="text-2xl font-bold text-red-700">
                              KES {month.withdrawals.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-red-200 rounded-full h-2">
                          <div
                            className="bg-red-600 h-2 rounded-full transition-all duration-700"
                            style={{
                              width: `${
                                (month.withdrawals / maxAmount) * 100
                              }%`,
                            }}
                          />
                        </div>
                        <p className="text-red-700 text-xs mt-2 font-medium">
                          {((month.withdrawals / maxAmount) * 100).toFixed(1)}%
                          of max
                        </p>
                      </div>

                      {/* Summary Card */}
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <FaMoneyBillWave size={18} className="text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-blue-900 text-base">
                              Summary
                            </h4>
                            <p
                              className={`text-2xl font-bold ${
                                month.net >= 0
                                  ? "text-blue-700"
                                  : "text-red-700"
                              }`}
                            >
                              {month.net >= 0 ? "+" : ""}KES{" "}
                              {month.net.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-blue-700 font-medium">
                              Transactions:
                            </span>
                            <span className="text-blue-900 font-bold">
                              {month.transactionCount}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-blue-700 font-medium">
                              Members:
                            </span>
                            <span className="text-blue-900 font-bold">
                              {month.memberCount}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-blue-700 font-medium">
                              Avg/Member:
                            </span>
                            <span className="text-blue-900 font-bold">
                              KES{" "}
                              {Math.round(
                                month.contributions / month.memberCount
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Member List - Mobile Optimized */}
                    {month.members && month.members.length > 0 && (
                      <div className="mt-3 sm:mt-4 lg:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200">
                        <h5 className="font-semibold sm:font-bold text-gray-900 mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                          <MdPeople
                            size={14}
                            className="sm:w-4 sm:h-4 text-blue-600"
                          />
                          Active Members ({month.members.length})
                        </h5>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {month.members.map((member, idx) => (
                            <span
                              key={idx}
                              className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs font-medium"
                            >
                              {member}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Chart View - Mobile Optimized */
          <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 border border-gray-200">
            <div className="text-center mb-4 sm:mb-6 lg:mb-8">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
                Monthly Trends
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Visual representation of monthly financial activity
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              {monthlyData.map((month, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                    <h4 className="font-semibold sm:font-bold text-gray-900 text-sm sm:text-base">
                      {month.month}
                    </h4>
                    <span
                      className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-medium ${
                        month.net >= 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      Net: {month.net >= 0 ? "+" : ""}KES{" "}
                      {month.net.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                    {/* Contributions Bar */}
                    <div>
                      <div className="flex justify-between items-center mb-1 sm:mb-2">
                        <span className="text-xs sm:text-sm font-medium text-green-700">
                          Contributions
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-green-800">
                          KES {month.contributions.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-green-100 rounded-full h-2 sm:h-3">
                        <div
                          className="bg-green-600 h-2 sm:h-3 rounded-full transition-all duration-1000"
                          style={{
                            width: `${
                              (month.contributions / maxAmount) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Withdrawals Bar */}
                    <div>
                      <div className="flex justify-between items-center mb-1 sm:mb-2">
                        <span className="text-xs sm:text-sm font-medium text-red-700">
                          Withdrawals
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-red-800">
                          KES {month.withdrawals.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-red-100 rounded-full h-2 sm:h-3">
                        <div
                          className="bg-red-600 h-2 sm:h-3 rounded-full transition-all duration-1000"
                          style={{
                            width: `${(month.withdrawals / maxAmount) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MonthlyBreakdown;
