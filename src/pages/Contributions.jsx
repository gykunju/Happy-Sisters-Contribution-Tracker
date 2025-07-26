import { LuSearch } from "react-icons/lu";
import { IoEyeOutline } from "react-icons/io5";
import { FaArrowTrendUp } from "react-icons/fa6";
import { FaArrowTrendDown } from "react-icons/fa6";
import { useState, useEffect } from "react";
import {useUser} from '../context/UserContext'

function Contributions() {

  const [searchTerm, setSearchTerm] = useState("");

  const { filteredTransactions, setFilteredTransactions } = useUser();

  async function fetchTransactions() {
    const { data, error } = await supabase.from("transaction").select();
    return { data, error };
  }

  async function fetchMembers() {
    const { data, error } = await supabase.from("members").select();
    return { data, error };
  }

  useEffect(() => {
    const stored = localStorage.getItem("transactions");
    const transactions = stored ? JSON.parse(stored) : [];
    setFilteredTransactions(
      transactions.filter(
        (p) =>
          p.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm]);

  return (
    <div class="flex flex-col gap-5">
      <h1 class="">Transactions</h1>

      <div class="rounded-xl flex flex-col justify-between lg:flex-row gap-4 p-5 bg-white border border-zinc-300 shadow-lg">
        <div class="relative w-full">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <LuSearch />
          </span>
          <input
            placeholder="Search transactions..."
            class="border border-zinc-300 rounded-lg p-3 pl-10 w-full"
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
        </div>

        <button class="border min-w-fit text-md p-3 rounded-lg border-zinc-300 flex items-center gap-2">
          <span>
            <IoEyeOutline size={20} />
          </span>
          Show Filters
        </button>
      </div>

      <div class="rounded-xl bg-white shadow-xl">
        <div class="p-4">
          <h1 class="font-medium">
            {filteredTransactions.length} Transactions
          </h1>
        </div>

        <div class="">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} class="p-4 border-t border-zinc-200">
                <div class=" flex justify-between gap-6">
                  <div class="flex items-center gap-4">
                    {transaction.type == "contribution" ? (
                      <FaArrowTrendUp
                        size={35}
                        class="text-green-600 bg-green-100 rounded-3xl p-2"
                      />
                    ) : (
                      <FaArrowTrendDown
                        size={35}
                        class="text-red-600 bg-red-100 rounded-3xl p-2"
                      />
                    )}
                    <div>
                      <div class="flex gap-2 items-center">
                        <h3 class="font-medium text-zinc-800">
                          {transaction.member}
                        </h3>
                        <p
                          class={`rounded-2xl py-1 px-2 ${
                            transaction.type
                              .toLowerCase()
                              .includes("contribution")
                              ? "bg-green-100 text-green-700 text-xs"
                              : "bg-red-100 text-red-700 text-xs"
                          }`}
                        >
                          {transaction.type}
                        </p>
                      </div>
                      <h3 class="text-sm text-zinc-500">
                        {transaction.description}
                      </h3>
                    </div>
                  </div>
                  <div class="flex flex-col items-end">
                    <h2
                      class={`font-medium text-green-600 ${
                        transaction.type.toLowerCase() == "contribution"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type.toLowerCase() == "contribution"
                        ? "+"
                        : "-"}
                      KES {transaction.amount}
                    </h2>
                    <h2 class="text-sm text-zinc-500">{transaction.date}</h2>
                  </div>
                </div>
                <div></div>
              </div>
            ))
          ) : (
            <div class="p-4">
              <h3 class="text-center font-bold">No Transactions Present</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Contributions;
