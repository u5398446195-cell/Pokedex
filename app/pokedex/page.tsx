
"use client";
import Image from "next/image";
import ParticleAnimation from "../components/Fontanime1.jsx";
import  Menu  from "../components/Menu.jsx";
import {useState} from 'react';
import Card from "../components/card.jsx";

import Region from './Region.jsx';

export default function HomePage() {

    const [openMenu, setOpenMenu] = useState(false);

  return (
    <div className="bg-slate-100 relative h-screen overflow-y-auto flex flex-col items-center">
  <Menu openMenu={openMenu} setOpenMenu={setOpenMenu}/> 

<div className="w-full fixed opacity-30 bottom-1 overflow-hidden leading-none">
    <svg 
      className="relative block w-full h-[60px] sm:h-[100px] text-blue-900 fill-current" 
      viewBox="0 0 1200 120" 
      preserveAspectRatio="none"
    >
      <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
    </svg>
  </div>



      <div className="w-full h-15 flex items-center justify-end px-4 shadow-md"><button
        type="button"
        className=" bg-black/20 hover:bg-black border border-white/10 w-10 h-10 flex items-center justify-center rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg"
        onClick={() => setOpenMenu(true)}
      >
        <Image src="/hamburger-svgrepo-com.svg" width={20} height={20} alt="menu" />
      </button>
      </div>

<h1 className="h-30 shrink-0 flex items-center text-2xl  text-black">Choose a region  </h1>

<div className="space-y-4  ">
    
<Region link="/pokedex/kanto" name="Kanto" image="/KantoPIC.avif" alt="kanto"/>
<Region link="/pokedex/johto" name="Johto" image="/JohtoPIC.webp" alt="johto"/>
<Region link="/pokedex/Hoenn" name="Hoenn" image="/HoennPIC.webp" alt="Hoenn"/>
     
</div>

    </div>
    

  
  )
}
