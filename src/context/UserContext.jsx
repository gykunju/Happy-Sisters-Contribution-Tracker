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

  const navigate = useNavigate();
  const location = useLocation();

  async function fetchTransactions() {
    const { data, error } = await supabase.from("transaction").select();
    return { data, error };
  }

  async function fetchMembers() {
    const { data, error } = await supabase.from("members").select();
    return { data, error };
  }

  async function getData() {
    const { data: transactionData, error: transactionError } =
      await fetchTransactions();
    const { data: membersData, error: membersError } = await fetchMembers();

    if (transactionData && membersData) {
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
    // Optionally update state here
  }

  async function checkSession() {
    const { data, error } = await supabase.auth.getSession();
    if (!data.session) {
      setIsLoggedIn(false);

      if (location.pathname !== "/signin" && location.pathname !== "/signup") {
        navigate("/signin");
      }
    } else {
      setIsLoggedIn(true);
    }
    if (error) throw new Error(error);
  }

  useEffect(() => {
    checkSession();
    getData();
  }, []);


  async function signUp(formData){
    const { data, error } = await supabase.auth.signUp(formData)

    if(data && !error){
        console.log(data)
        setIsLoggedIn(true)
        navigate('/')
    } else {
        throw new Error(error)
    }
  }

  async function signIn(formData){
    const { data, error } = await supabase.auth.signInWithPassword(formData);

    if (data && !error) {
      console.log(data);
      setIsLoggedIn(true);
      navigate("/");
    } else {
      throw new Error(error);
    }
  }

  return (
    <userContext.Provider
      value={{
        filteredTransactions,
        setFilteredTransactions,
        signUp,
        signIn
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
