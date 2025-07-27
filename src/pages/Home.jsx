import react from 'react-dom'
import Contributions from './Contributions'
import { MdPersonOutline } from "react-icons/md";
import { FaMoneyBillWheat } from "react-icons/fa6";
import { LuWallet } from "react-icons/lu";
import { GrMoney } from "react-icons/gr";
import { TbMoneybag } from "react-icons/tb";
import { BsPeople } from "react-icons/bs";


function Home(){

    return (
      <div class="bg-slate-100 min-h-screen font-sans text-zinc-600 text-lg p-6 flex flex-col gap-5">
        <header class="flex flex-col p-2 bg-slate-200">
          <nav class="flex justify-between">
            <div class="flex items-center gap-2 font-bold">
              <FaMoneyBillWheat size={30} />
              <h1>Happy Sisters</h1>
            </div>

            <div>
              <div class="flex gap-2 items-center">
                <h3 class='font-medium'>{localStorage.getItem("user")}</h3>
                <MdPersonOutline size={25} class='rounded-full border bg-slate-300'/>
              </div>
            </div>
          </nav>
        </header>
        <div class="flex justify-between gap-4 flex-col lg:flex-row">
          <div class="bg-green-100 text-2xl text-green-800 font-bold border-2 border-green-300 rounded-xl p-5 w-full flex justify-between items-center">
            <div class="flex flex-col justify-between">
              <h4 class="font-medium text-sm text-green-600">
                Current Balance
              </h4>
              <h1>1,500</h1>
            </div>
            <LuWallet size={35} />
          </div>

          <div class="bg-blue-100 text-2xl text-blue-800 font-bold border-2 border-blue-300 rounded-xl p-5 w-full flex justify-between items-center">
            <div class="flex flex-col justify-between">
              <h4 class="font-medium text-sm text-blue-600">
                Your Contributions
              </h4>
              <h1>400</h1>
            </div>
            <GrMoney size={35} />
          </div>

          <div class="bg-purple-100 text-purple-800 text-2xl font-bold border-2 border-purple-300 rounded-xl p-5 w-full flex justify-between items-center">
            <div class="flex flex-col justify-between">
              <h4 class="font-medium text-sm text-purple-600">
                Total Contributions
              </h4>
              <h1>2,500</h1>
            </div>
            <TbMoneybag size={35} />
          </div>

          <div class="bg-orange-100 text-orange-800 font-bold border-2 text-2xl border-orange-300 rounded-xl p-5 w-full flex justify-between items-center">
            <div class=" flex flex-col justify-between">
              <h4 class="font-medium text-sm">Members</h4>
              <h1>10</h1>
            </div>
            <BsPeople size={35}/>
          </div>
        </div>
        <main>
            <Contributions/>
        </main>
      </div>
    );
}

export default Home