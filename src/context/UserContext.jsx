import { useContext, createContext, useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { useNavigate, useLocation } from "react-router-dom";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("supabase key and or url missing");
}

const supabase = createClient(supabaseUrl, supabaseKey);
const userContext = createContext();

export function UserProvider({ children }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [members, setMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  async function fetchTransactions() {
    const { data, error } = await supabase.from("transaction").select();
    return { data, error };
  }

  async function fetchMembers() {
    const { data, error } = await supabase.from("members").select("*");
    return { data, error };
  }

  const userDetails = async () => {
    const { data } = await supabase.auth.getUser();
    return data.user;
  };

  async function getData() {
    try {
      setIsLoading(true);

      const { data: transactionData, error: transactionError } =
        await fetchTransactions();
      const { data: membersData, error: membersError } = await fetchMembers();

      if (transactionError) {
        console.error("Error fetching transactions:", transactionError);
        return;
      }

      if (membersError) {
        console.error("Error fetching members:", membersError);
        return;
      }

      if (transactionData && membersData) {
        // Store members for dropdown
        setMembers(membersData);
        localStorage.setItem("members", JSON.stringify(membersData));

        // Create a map for quick member lookup
        const memberMap = membersData.reduce((acc, member) => {
          acc[member.id] = member.name;
          return acc;
        }, {});

        // Map transactions to include member name
        const transactionsWithMember = transactionData.map((tx) => ({
          ...tx,
          member: memberMap[tx.member_id] || "Unknown",
        }));

        setTransactions(transactionsWithMember);
        setFilteredTransactions(transactionsWithMember);
        localStorage.setItem(
          "transactions",
          JSON.stringify(transactionsWithMember)
        );
      }
    } catch (error) {
      console.error("Error in getData:", error);
      // Fall back to localStorage if Supabase fails
      const localTransactions = JSON.parse(
        localStorage.getItem("transactions") || "[]"
      );
      const localMembers = JSON.parse(localStorage.getItem("members") || "[]");
      setTransactions(localTransactions);
      setFilteredTransactions(localTransactions);
      setMembers(localMembers);
    } finally {
      setIsLoading(false);
    }
  }
  async function checkSession() {
    const { data, error } = await supabase.auth.getSession();
    if (!data.session || !(await userDetails())) {
      setIsLoggedIn(false);

      if (location.pathname !== "/signin" && location.pathname !== "/signup") {
        navigate("/signin");
      }
    } else {
      const user = data.session.user;
      setCurrentUser(user);
      localStorage.setItem(
        "user",
        `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
      );

      // Get user role from members table
      const { data: memberData, error: memberError } = await supabase
        .from("members")
        .select("role")
        .eq("id", user.id)
        .single();

      if (memberData && !memberError) {
        setUserRole(memberData.role);
        localStorage.setItem("userRole", memberData.role);
      }

      setIsLoggedIn(true);

      // Fetch transactions and members data after session validation
      await getData();

      navigate("/");
    }
    if (error) throw new Error(error);
  }

  useEffect(() => {
    checkSession();
    // getData() is now called within checkSession() after authentication
  }, []);

  async function signUp(formData) {
    const { data, error } = await supabase.auth.signUp(formData);

    if (data && !error) {
      const memberData = {
        id: data.user.id,
        name:
          data.user.user_metadata.first_name +
          " " +
          data.user.user_metadata.last_name,
        role: "member", // Default role for new users
      };
      const { error: insertError } = await supabase
        .from("members")
        .insert(memberData);
      if (insertError) throw insertError;

      // Set user data in localStorage
      const user = data.user;
      setCurrentUser(user);
      localStorage.setItem(
        "user",
        `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
      );
      localStorage.setItem("userRole", "member");
      setUserRole("member");

      setIsLoggedIn(true);

      // Fetch transactions and members data after successful signup
      await getData();

      navigate("/");
    } else {
      throw error || new Error("Failed to create account");
    }
  }

  async function signIn(formData) {
    const { data, error } = await supabase.auth.signInWithPassword(formData);

    if (data && !error) {
      // Set user data in localStorage
      const user = data.user;
      setCurrentUser(user);
      localStorage.setItem(
        "user",
        `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
      );

      // Get user role from members table
      const { data: memberData, error: memberError } = await supabase
        .from("members")
        .select("role")
        .eq("id", user.id)
        .single();

      if (memberData && !memberError) {
        setUserRole(memberData.role);
        localStorage.setItem("userRole", memberData.role);
      }

      setIsLoggedIn(true);

      // Fetch transactions and members data after successful login
      await getData();

      navigate("/");
    } else {
      throw error || new Error("Failed to sign in");
    }
  }

  // Add new transaction function
  async function addTransaction(transaction) {
    try {
      // First, check if user is admin
      const currentUserRole = localStorage.getItem("userRole") || userRole;
      if (currentUserRole !== "admin") {
        throw new Error("Only admin users can add transactions");
      }

      // Get the current user to associate with the transaction
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        throw new Error("User not authenticated");
      }

      // Get the selected member's name for display
      const selectedMember = members.find(
        (m) => m.id === transaction.member_id
      );
      const memberName = selectedMember ? selectedMember.name : "Unknown";

      // Prepare transaction data for Supabase
      const transactionData = {
        member_id: transaction.member_id, // Use the selected member's ID
        amount: parseFloat(transaction.amount),
        type: transaction.type,
        description: transaction.description,
        date: transaction.date || new Date().toISOString().split("T")[0],
        created_at: new Date().toISOString(),
      };

      // Insert into Supabase
      const { data, error } = await supabase
        .from("transaction")
        .insert(transactionData)
        .select()
        .single();

      if (error) {
        console.error("Error adding transaction to Supabase:", error);
        throw new Error(error.message);
      }

      // Also update localStorage for offline functionality
      const currentTransactions = JSON.parse(
        localStorage.getItem("transactions") || "[]"
      );

      // Add the new transaction with the returned ID and member name
      const newTransaction = {
        ...transaction,
        id: data.id,
        member: memberName,
        member_id: transaction.member_id,
        created_at: data.created_at,
      };

      currentTransactions.push(newTransaction);
      localStorage.setItem("transactions", JSON.stringify(currentTransactions));

      // Update both states
      setTransactions(currentTransactions);
      setFilteredTransactions(currentTransactions);

      return { success: true, data: newTransaction };
    } catch (error) {
      console.error("Error in addTransaction:", error);
      return { success: false, error: error.message };
    }
  }

  // Delete transaction function
  async function deleteTransaction(transactionId) {
    try {
      // First, check if user is admin
      const currentUserRole = localStorage.getItem("userRole") || userRole;
      if (currentUserRole !== "admin") {
        throw new Error("Only admin users can delete transactions");
      }

      // Delete from Supabase
      const { error } = await supabase
        .from("transaction")
        .delete()
        .eq("id", transactionId);

      if (error) {
        console.error("Error deleting transaction from Supabase:", error);
        throw new Error(error.message);
      }

      // Update localStorage
      const currentTransactions = JSON.parse(
        localStorage.getItem("transactions") || "[]"
      );
      const updatedTransactions = currentTransactions.filter(
        (tx) => tx.id !== transactionId
      );
      localStorage.setItem("transactions", JSON.stringify(updatedTransactions));

      // Update both states
      setTransactions(updatedTransactions);
      setFilteredTransactions(updatedTransactions);

      return { success: true };
    } catch (error) {
      console.error("Error in deleteTransaction:", error);
      return { success: false, error: error.message };
    }
  }

  // Sign out function
  async function signOut() {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    localStorage.removeItem("transactions");
    setIsLoggedIn(false);
    navigate("/signin");
  }

  // Filter transactions based on user role (for transaction listing)
  const getVisibleTransactions = () => {
    if (!transactions || transactions.length === 0) return [];

    const currentUserName = localStorage.getItem("user") || "";
    const currentRole =
      userRole || localStorage.getItem("userRole") || "member";

    if (currentRole === "admin") {
      // Admin can see all transactions
      return transactions;
    } else {
      // Members can only see their own transactions
      return transactions.filter(
        (t) =>
          t.member && t.member.toLowerCase() === currentUserName.toLowerCase()
      );
    }
  };

  // Get all transactions for statistics (members can see group stats)
  const getStatsTransactions = () => {
    if (!transactions || transactions.length === 0) return [];
    // Both admin and members can see all transactions for stats
    return transactions;
  };

  // Get monthly breakdown of contributions with filter option
  const getMonthlyBreakdown = (filterType = "visible") => {
    let targetTransactions;

    if (filterType === "personal") {
      // Always show only current user's transactions
      const currentUserName = localStorage.getItem("user") || "";
      targetTransactions = transactions.filter(
        (t) =>
          t.member && t.member.toLowerCase() === currentUserName.toLowerCase()
      );
    } else if (filterType === "group") {
      // Always show all transactions (for group analysis)
      targetTransactions = transactions || [];
    } else {
      // Default: use stats-based visibility (all transactions for stats)
      targetTransactions = getStatsTransactions();
    }

    const monthlyData = {};

    targetTransactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      const monthName = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          contributions: 0,
          withdrawals: 0,
          transactionCount: 0,
          members: new Set(),
        };
      }

      if (transaction.type.toLowerCase() === "contribution") {
        monthlyData[monthKey].contributions += parseFloat(transaction.amount);
      } else if (transaction.type.toLowerCase() === "withdrawal") {
        monthlyData[monthKey].withdrawals += parseFloat(transaction.amount);
      }

      monthlyData[monthKey].transactionCount += 1;
      monthlyData[monthKey].members.add(transaction.member);
    });

    // Convert Set to array for member count and sort by date
    return Object.keys(monthlyData)
      .sort((a, b) => new Date(b) - new Date(a))
      .map((key) => ({
        ...monthlyData[key],
        memberCount: monthlyData[key].members.size,
        members: Array.from(monthlyData[key].members),
        net: monthlyData[key].contributions - monthlyData[key].withdrawals,
      }));
  };

  // Refresh transactions from Supabase
  async function refreshTransactions() {
    await getData();
  }

  return (
    <userContext.Provider
      value={{
        filteredTransactions,
        setFilteredTransactions,
        transactions,
        getVisibleTransactions,
        getStatsTransactions,
        getMonthlyBreakdown,
        signUp,
        signIn,
        errors,
        addTransaction,
        deleteTransaction,
        signOut,
        refreshTransactions,
        members,
        userRole,
        currentUser,
        isLoading,
        getData,
      }}
    >
      {children}
    </userContext.Provider>
  );
}

export function useUser() {
  const context = useContext(userContext);

  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}
