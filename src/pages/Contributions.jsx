import { LuSearch, LuArrowLeft } from "react-icons/lu";
import { IoEyeOutline, IoAdd, IoSettings } from "react-icons/io5";
import { FaArrowTrendUp, FaMoneyBillWheat } from "react-icons/fa6";
import { FaArrowTrendDown } from "react-icons/fa6";
import { MdDeleteOutline, MdPersonOutline } from "react-icons/md";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";

function Contributions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, contribution, withdrawal
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const {
    filteredTransactions,
    setFilteredTransactions,
    addTransaction,
    deleteTransaction,
    refreshTransactions,
    members,
    userRole,
    transactions,
    isLoading,
    getData,
    getVisibleTransactions,
  } = useUser();

  const handleDeleteTransaction = async (transactionId) => {
    const transaction = transactions.find((t) => t.id === transactionId);
    setTransactionToDelete(transaction);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;

    setDeletingId(transactionToDelete.id);
    setShowDeleteConfirm(false);

    try {
      const result = await deleteTransaction(transactionToDelete.id);

      if (result.success) {
        // Transaction deleted successfully
        await refreshTransactions();
      } else {
        // Handle error
        console.error("Failed to delete transaction:", result.error);
        alert("Failed to delete transaction: " + result.error);
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("An error occurred while deleting the transaction.");
    } finally {
      setDeletingId(null);
      setTransactionToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setTransactionToDelete(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    // Ensure data is loaded when component mounts
    if (!transactions || transactions.length === 0) {
      console.log("No transactions found, fetching data...");
      getData();
    }
  }, []);

  useEffect(() => {
    // Get role-based visible transactions
    const allTransactions = getVisibleTransactions();

    let filtered = allTransactions;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter((p) => p.type.toLowerCase() === filterType);
    }

    setFilteredTransactions(filtered);
  }, [searchTerm, filterType, transactions]);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target);
    const transaction = {
      member_id: formData.get("member_id"), // Use member_id instead of member name
      amount: formData.get("amount"),
      type: formData.get("type"),
      description: formData.get("description"),
      date: new Date().toISOString().split("T")[0],
    };

    try {
      const result = await addTransaction(transaction);

      if (result.success) {
        // Transaction added successfully
        setShowAddModal(false);
        e.target.reset();

        // Refresh the transactions from Supabase
        await refreshTransactions();
      } else {
        // Handle error
        console.error("Failed to add transaction:", result.error);
        alert("Failed to add transaction: " + result.error);
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("An error occurred while adding the transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="h-full flex flex-col">
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200 flex-shrink-0">
        <div className="mobile-safe-area py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            {/* Left side - Back button and title */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Link
                to="/"
                className="touch-target p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200 flex-shrink-0"
              >
                <LuArrowLeft size={20} className="text-slate-600" />
              </Link>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 text-responsive">
                  Transactions
                </h1>
                <p className="text-slate-500 text-xs hidden sm:block">
                  Monitor and manage financial activities
                </p>
              </div>
            </div>

            {/* Right side - Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {userRole === "admin" && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm font-medium text-sm touch-target"
                >
                  <IoAdd size={16} />
                  <span className="hidden xs:inline">Add</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mobile-safe-area py-4 sm:py-6 space-y-4 sm:space-y-6 flex-1 overflow-hidden flex flex-col">
        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 flex-shrink-0">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <LuSearch size={18} />
              </span>
              <input
                placeholder="Search transactions, members..."
                className="border border-slate-300 rounded-lg p-3 pl-12 w-full focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-colors text-sm bg-white"
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
              />
            </div>

            {/* Type Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm font-medium touch-target ${
                  filterType === "all"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-50 bg-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("contribution")}
                className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm font-medium touch-target ${
                  filterType === "contribution"
                    ? "bg-green-600 text-white shadow-sm"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-50 bg-white"
                }`}
              >
                Contributions
              </button>
              <button
                onClick={() => setFilterType("withdrawal")}
                className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm font-medium touch-target ${
                  filterType === "withdrawal"
                    ? "bg-red-600 text-white shadow-sm"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-50 bg-white"
                }`}
              >
                Withdrawals
              </button>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1 min-h-0">
          <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Transaction History ({filteredTransactions.length})
                </h2>
                <p className="text-sm text-slate-600">
                  {filterType === "all"
                    ? "All transactions"
                    : filterType === "contribution"
                    ? "Contribution records"
                    : "Withdrawal records"}
                </p>
              </div>
              <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded border">
                {filterType === "all"
                  ? "All Types"
                  : filterType === "contribution"
                  ? "Contributions"
                  : "Withdrawals"}
              </div>
            </div>
          </div>

          {/* Scrollable transactions container */}
          <div className="divide-y divide-slate-100 max-h-[600px] min-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
            {isLoading ? (
              <div className="p-8 sm:p-12 text-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Loading transactions...
                </h3>
                <p className="text-slate-600 text-sm">
                  Please wait while we fetch your data.
                </p>
              </div>
            ) : filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="group bg-white hover:bg-slate-50 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md rounded-lg border border-slate-200 mx-2 sm:mx-0 mb-3 sm:mb-0 sm:rounded-none sm:border-l-4 sm:border-r-0 sm:border-t-0 sm:border-b-0"
                  style={{
                    borderLeftColor:
                      transaction.type.toLowerCase() === "contribution"
                        ? "#16a34a"
                        : "#dc2626",
                  }}
                >
                  <div className="p-4 sm:p-6">
                    {/* Mobile Layout */}
                    <div className="block sm:hidden">
                      {/* Header with member info and action */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              transaction.type.toLowerCase() === "contribution"
                                ? "bg-green-50 border border-green-200"
                                : "bg-red-50 border border-red-200"
                            }`}
                          >
                            {transaction.type.toLowerCase() ===
                            "contribution" ? (
                              <FaArrowTrendUp
                                size={16}
                                className="text-green-600"
                              />
                            ) : (
                              <FaArrowTrendDown
                                size={16}
                                className="text-red-600"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 text-base leading-tight">
                              {transaction.member}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                transaction.type.toLowerCase() ===
                                "contribution"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {transaction.type}
                            </span>
                          </div>
                        </div>

                        {/* Mobile delete button */}
                        {userRole === "admin" && (
                          <button
                            onClick={() =>
                              handleDeleteTransaction(transaction.id)
                            }
                            disabled={deletingId === transaction.id}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 touch-target disabled:opacity-50 flex-shrink-0"
                            title="Delete transaction"
                          >
                            {deletingId === transaction.id ? (
                              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <MdDeleteOutline size={18} />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Amount and description in one section */}
                      <div className="space-y-2">
                        <p
                          className={`text-xl font-bold ${
                            transaction.type.toLowerCase() === "contribution"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type.toLowerCase() === "contribution"
                            ? "+"
                            : "-"}
                          KES {parseFloat(transaction.amount).toLocaleString()}
                        </p>

                        <p className="text-slate-600 text-sm leading-relaxed">
                          {transaction.description}
                        </p>

                        <div className="flex items-center text-xs text-slate-500 pt-1">
                          <svg
                            className="w-3.5 h-3.5 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{formatDate(transaction.date)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:flex items-center justify-between">
                      {/* Left section - Icon and main info */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                            transaction.type.toLowerCase() === "contribution"
                              ? "bg-green-50 border border-green-200"
                              : "bg-red-50 border border-red-200"
                          }`}
                        >
                          {transaction.type.toLowerCase() === "contribution" ? (
                            <FaArrowTrendUp
                              size={20}
                              className="text-green-600"
                            />
                          ) : (
                            <FaArrowTrendDown
                              size={20}
                              className="text-red-600"
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-900 text-lg truncate">
                              {transaction.member}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${
                                transaction.type.toLowerCase() ===
                                "contribution"
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : "bg-red-100 text-red-800 border border-red-200"
                              }`}
                            >
                              {transaction.type}
                            </span>
                          </div>

                          <p className="text-slate-600 text-sm mb-2 line-clamp-2">
                            {transaction.description}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {formatDate(transaction.date)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right section - Amount and actions */}
                      <div className="flex items-center gap-4 ml-4">
                        <div className="text-right">
                          <p
                            className={`text-2xl font-bold mb-1 ${
                              transaction.type.toLowerCase() === "contribution"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.type.toLowerCase() === "contribution"
                              ? "+"
                              : "-"}
                            KES{" "}
                            {parseFloat(transaction.amount).toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">
                            {transaction.type.toLowerCase() === "contribution"
                              ? "Income"
                              : "Expense"}
                          </p>
                        </div>

                        {/* Desktop delete button */}
                        {userRole === "admin" && (
                          <button
                            onClick={() =>
                              handleDeleteTransaction(transaction.id)
                            }
                            disabled={deletingId === transaction.id}
                            className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 touch-target disabled:opacity-50 disabled:cursor-not-allowed opacity-70 hover:opacity-100 group-hover:opacity-100"
                            title="Delete transaction"
                          >
                            {deletingId === transaction.id ? (
                              <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <MdDeleteOutline size={20} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 sm:p-12 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <LuSearch size={20} className="text-slate-400 sm:hidden" />
                  <LuSearch
                    size={24}
                    className="text-slate-400 hidden sm:block"
                  />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {searchTerm || filterType !== "all"
                    ? "No matching transactions found"
                    : "No transaction records"}
                </h3>
                <p className="text-slate-600 mb-6 text-sm max-w-md mx-auto text-responsive">
                  {searchTerm || filterType !== "all"
                    ? "Try adjusting your search criteria or filter settings to find the transactions you're looking for."
                    : "Begin tracking your group's financial activities by recording your first transaction."}
                </p>
                {!searchTerm &&
                  filterType === "all" &&
                  userRole === "admin" && (
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium touch-target"
                    >
                      Record First Transaction
                    </button>
                  )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Transaction Modal */}
      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  New Transaction
                </h2>
                <p className="text-sm text-slate-600">
                  Record a financial activity
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <span className="text-slate-600">✕</span>
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <MdPersonOutline size={16} />
                  Select Member
                </label>
                <select
                  name="member_id"
                  required
                  className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-colors text-sm bg-white"
                >
                  <option value="">Choose a member</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} {member.role === "admin" && "(Admin)"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <FaMoneyBillWheat size={16} />
                  Amount (KES)
                </label>
                <input
                  type="number"
                  name="amount"
                  required
                  min="0"
                  step="0.01"
                  className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-colors text-sm"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <IoSettings size={16} />
                  Transaction Type
                </label>
                <select
                  name="type"
                  required
                  className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-colors text-sm bg-white"
                >
                  <option value="contribution">Contribution</option>
                  <option value="withdrawal">Withdrawal</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <LuSearch size={16} />
                  Description
                </label>
                <textarea
                  name="description"
                  required
                  rows="3"
                  className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-colors resize-none text-sm"
                  placeholder="Enter transaction description"
                ></textarea>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full sm:flex-1 border border-slate-300 text-slate-700 py-3 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full sm:flex-1 py-3 rounded-lg transition-colors shadow-sm font-medium ${
                    isSubmitting
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white`}
                >
                  {isSubmitting ? "Saving..." : "Save Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && transactionToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-slate-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MdDeleteOutline size={24} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Delete Transaction
                </h2>
                <p className="text-sm text-slate-600">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    transactionToDelete.type.toLowerCase() === "contribution"
                      ? "bg-green-100 border border-green-200"
                      : "bg-red-100 border border-red-200"
                  }`}
                >
                  {transactionToDelete.type.toLowerCase() === "contribution" ? (
                    <FaArrowTrendUp size={14} className="text-green-600" />
                  ) : (
                    <FaArrowTrendDown size={14} className="text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {transactionToDelete.member}
                  </h3>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      transactionToDelete.type.toLowerCase() === "contribution"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {transactionToDelete.type}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p
                  className={`text-lg font-bold ${
                    transactionToDelete.type.toLowerCase() === "contribution"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transactionToDelete.type.toLowerCase() === "contribution"
                    ? "+"
                    : "-"}
                  KES {parseFloat(transactionToDelete.amount).toLocaleString()}
                </p>
                <p className="text-slate-600 text-sm">
                  {transactionToDelete.description}
                </p>
                <p className="text-xs text-slate-500">
                  {formatDate(transactionToDelete.date)}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={cancelDelete}
                className="w-full sm:flex-1 border border-slate-300 text-slate-700 py-3 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="w-full sm:flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition-colors shadow-sm font-medium flex items-center justify-center gap-2"
              >
                <MdDeleteOutline size={18} />
                Delete Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Contributions;
