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
  const [isLoggedIn, setIsLoggedIn] = useState();
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
    console.log(data);
    return data.user;
  };

  async function getData() {
    try {
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
      setFilteredTransactions(localTransactions);
      setMembers(localMembers);
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
      navigate("/");
    }
    if (error) throw new Error(error);
  }

  useEffect(() => {
    checkSession();
    getData();
  }, []);

  async function signUp(formData) {
    const { data, error } = await supabase.auth.signUp(formData);

    if (data && !error) {
      console.log(data);
      const memberData = {
        id: data.user.id,
        name:
          data.user.user_metadata.first_name +
          " " +
          data.user.user_metadata.last_name,
        role: "member", // Default role
      };
      const { error: insertError } = await supabase
        .from("members")
        .insert(memberData);
      if (insertError) throw new Error(insertError);

      setIsLoggedIn(true);
      navigate("/");
    } else {
      throw new Error(error);
    }
  }

  async function signIn(formData) {
    const { data, error } = await supabase.auth.signInWithPassword(formData);

    if (data && !error) {
      console.log(data);
      setIsLoggedIn(true);
      navigate("/");
    } else {
      console.log(error);
      setErrors(error);
      console.log(errors);
      throw new Error(error);
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

      // Update the filtered transactions state
      setFilteredTransactions(currentTransactions);

      return { success: true, data: newTransaction };
    } catch (error) {
      console.error("Error in addTransaction:", error);
      return { success: false, error: error.message };
    }
  }

  // Sign out function
  async function signOut() {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    localStorage.removeItem("transactions");
    localStorage.removeItem("userRole");
    setIsLoggedIn(false);
    navigate("/signin");
  }

  // Refresh transactions from Supabase
  async function refreshTransactions() {
    await getData();
  }

  return (
    <userContext.Provider
      value={{
        filteredTransactions,
        setFilteredTransactions,
        signUp,
        signIn,
        errors,
        addTransaction,
        signOut,
        refreshTransactions,
        members,
        userRole,
        currentUser,
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
