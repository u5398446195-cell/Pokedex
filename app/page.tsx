"use client";
import Image from "next/image";
import ParticleAnimation from "./components/Fontanime1.jsx";
import  Menu  from "./components/Menu.jsx";
import {useState} from 'react';
import Card from "./components/card.jsx";
import Link from 'next/link';

export default function HomePage() {

    const [openMenu, setOpenMenu] = useState(false);

  return (
    <main className="min-h-screen relative bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 text-white overflow-x-hidden overflow-y-auto font-sans selection:bg-blue-600 selection:text-white">
  
  <Menu openMenu={openMenu} setOpenMenu={setOpenMenu}/> 

  {/* DÉCORATION 1 : CUBE NOIR AU FOND À DROITE */}

     <Image src="/pokeball-pokemon-svgrepo-com.svg" width={40} height={40} alt="menu" className="z-1 opacity-20 flex justify-center items-center absolute right-[-20px] bottom-24 w-56 h-56 rotate-12 backdrop-blur-3xl pointer-events-none z-0 hidden sm:block" />


  {/* DÉCORATION 2 : TRACES DE GRIFFES POKÉMON EN FOND */}
  <div className="absolute z-1 left-4 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none z-3 flex gap-3 rotate-[-25deg]">
    <div className="w-2 sm:w-3 h-64 sm:h-96 bg-gradient-to-b from-cyan-400 via-blue-500 to-transparent rounded-full blur-[1px]"></div>
    <div className="w-2 sm:w-3 h-72 sm:h-[420px] bg-gradient-to-b from-cyan-400 via-blue-500 to-transparent rounded-full blur-[1px]"></div>
    <div className="w-2 sm:w-3 h-60 sm:h-80 bg-gradient-to-b from-cyan-400 via-blue-500 to-transparent rounded-full blur-[1px]"></div>
  </div>

<div className="w-full absolute opacity-30 bottom-1 overflow-hidden leading-none">
    <svg 
      className="relative block w-full h-[60px] sm:h-[100px] text-blue-900 fill-current" 
      viewBox="0 0 1200 120" 
      preserveAspectRatio="none"
    >
      <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
    </svg>
  </div>





  {/* NAVBAR EN Z-30 AVEC BACKDROP BLUR CORRIGÉ */}
  <nav className="bg-slate-900/70 backdrop-blur-lg z-30 fixed top-0 left-0 flex justify-between items-center px-4 sm:px-8 w-full h-14 border-b border-white/10 shadow-md">
    <div className="flex items-center space-x-8">
     
     

      
    </div>

    {/* Recherche + Bouton Menu */}
    <div className="flex items-center space-x-3">

      <button
        type="button"
        className="bg-black/20 hover:bg-black border border-white/10 w-10 h-10 flex items-center justify-center rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg"
        onClick={() => setOpenMenu(true)}
      >
        <Image src="/hamburger-svgrepo-com.svg" width={20} height={20} alt="menu" />
      </button>
    </div>
  </nav>

  {/* BANNIÈRE HERO : IMAGE EN FOND PLEINE LARGEUR (ABSOLUTE TOP-0) */}
  <div className="relative w-full h-[400px] sm:h-[460px] pt-14 overflow-hidden flex items-center justify-start">
    
    {/* Image en fond absolute qui passe sous la navbar */}
    <Image
      src="/header-xxl-poketournament.jpg"
      alt="Lugia Banner"
      draggable={false}
      fill
      priority
      className="absolute inset-0 w-full h-full object-cover object-right z-0 opacity-60 scale-105 transition-transform duration-1000 hover:scale-100"
    />

    {/* Fondu de l'image d'origine qui rejoint le fond bleu slate-900 */}
    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/20 to-transparent z-0"></div>
    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-slate-900 z-0"></div>

    {/* Titre et boutons posés PAR-DESSUS l'image en z-10 */}
    <div className="relative z-10 max-w-2xl px-6 sm:px-12 space-y-3">
      
      <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] leading-tight">
        Explore. Découvre. <br />
        <span className="text-blue-400">Vis l'aventure.</span>
      </h2>
      
      <p className="text-slate-300 text-xs sm:text-sm max-w-md drop-shadow-md font-medium leading-relaxed">
        Attrapez, entraînez, et analysez toutes vos créatures. Tout l'univers Pokémon à portée de main.
      </p>

      {/* Boutons Hero */}
      <div className="flex flex-wrap gap-3 pt-2">
       

        <button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95">
          <Link href="/pokedex"><span>Explorer le Pokédex</span>
          <span>→</span></Link>
        </button>
        
        <button 
          onClick={() => alert("Fonctionnalité en cours de développement 🚀")}
          className="bg-slate-900/80 hover:bg-slate-800 border border-white/20 text-white font-medium text-xs px-5 py-3 rounded-xl transition-all active:scale-95 backdrop-blur-md"
        >
          Vérifier mon équipe
        </button>
      </div>
    </div>
  </div>

  {/* CONTENU PRINCIPAL */}
  <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10 py-6 relative z-10 pb-20">

    {/* ACCÈS RAPIDE (4 CARTES MAQUETTE) */}
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]"></span>
          ACCÈS RAPIDE
        </h3>
        <span className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer transition-colors">Afficher les statistiques &rarr;</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        

<Card link="/pokedex" text="Un pokedex en ligne fidèle à" header="Pokedex" src="/206263.png" alt='pokedex'></Card>
       

        {/* CARTE 2 : SIMULATE BATTLE */}
        <div 
          onClick={() => alert("Fonctionnalité en cours de développement 🚀")}
          className="group relative h-40 rounded-2xl overflow-hidden border border-white/10 bg-slate-900/80 p-4 flex flex-col justify-between shadow-xl hover:border-blue-500/50 hover:bg-slate-900 transition-all cursor-pointer backdrop-blur-md"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-10"></div>
          <Image src="/poketeam-card.webp" width={100} height={100} alt="pokedex" className="inset-0 w-full h-full absolute object-cover group-hover:scale-110 group-hover:opacity-40 transition-all duration-500" />
          <div className="relative z-20 space-y-1 mt-auto">
            <h4 className="text-sm font-black text-white tracking-wide group-hover:text-blue-400 transition-colors">Create Team</h4>
            <p className="text-[10px] text-slate-300">Testez la synergie et le niveau de votre équipe de combat.</p>
          </div>
        </div>

        {/* CARTE 4 : ABOUT */}
        <div 
          onClick={() => alert("Fonctionnalité en cours de développement 🚀")}
          className="group relative h-40 rounded-2xl overflow-hidden border border-white/10 bg-slate-900/80 p-4 flex flex-col justify-between shadow-xl hover:border-blue-500/50 hover:bg-slate-900 transition-all cursor-pointer backdrop-blur-md"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-10"></div>
          <Image src="/globe.svg" width={80} height={80} alt="about" className="absolute top-2 right-2 opacity-25 group-hover:scale-110 group-hover:opacity-40 transition-all duration-500" />
          <div className="relative z-20 space-y-1 mt-auto">
            <h4 className="text-sm font-black text-white tracking-wide group-hover:text-blue-400 transition-colors">Pokemon Quiz</h4>
            <p className="text-[10px] text-slate-300">Quiz pokemon</p>
          </div>
        </div>

      </div>
    </div>

 
       
    {/* FOOTER */}
    <footer className="pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 gap-4">
      <div className="flex items-center space-x-2">
        <span className="font-bold text-slate-200">Pokédex</span>
        <span className="text-slate-400 ml-2">Le guide complet pour dresseurs</span>
      </div>

    
    </footer>

  </div>
</main>
  
  )
}
