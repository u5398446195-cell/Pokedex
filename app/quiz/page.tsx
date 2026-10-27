"use client";

import { useEffect, useState } from 'react';
import { fetchPokemonDetails } from "../lib/pokeapi";
import Image from "next/image";
import  Menu  from "../components/Menu.jsx";

// Définition des générations
const GENERATIONS = [
    { labelFr: "Toutes les générations", labelEn: "All Generations", min: 1, max: 1010 },
    { labelFr: "1ère Génération (Kanto)", labelEn: "1st Gen (Kanto)", min: 1, max: 151 },
    { labelFr: "2ème Génération (Johto)", labelEn: "2nd Gen (Johto)", min: 152, max: 251 },
    { labelFr: "3ème Génération (Hoenn)", labelEn: "3rd Gen (Hoenn)", min: 252, max: 386 },
    { labelFr: "4ème Génération (Sinnoh)", labelEn: "4th Gen (Sinnoh)", min: 387, max: 493 },
    { labelFr: "5ème Génération (Unys)", labelEn: "5th Gen (Unova)", min: 494, max: 649 },
    { labelFr: "6ème Génération (Kalos)", labelEn: "6th Gen (Kalos)", min: 650, max: 721 },
    { labelFr: "7ème Génération (Alola)", labelEn: "7th Gen (Alola)", min: 722, max: 809 },
    { labelFr: "8ème Génération (Galar)", labelEn: "8th Gen (Galar)", min: 810, max: 905 },
    { labelFr: "9ème Génération (Paldea)", labelEn: "9th Gen (Paldea)", min: 906, max: 1010 },
];

export default function Quiz() {
    // État pour s'assurer que le rendu dynamique se fait uniquement côté client
    const [isMounted, setIsMounted] = useState(false);

    const [selectedGen, setSelectedGen] = useState(0);
    const [language, setLanguage] = useState<"fr" | "en">("fr");
    const [theme, setTheme] = useState<"light" | "dark">("light");
    
    // Valeur statique initiale pour éviter le mismatch SSR/Client
    const [pokemonId, setPokemonId] = useState<number>(1);
    const [pokemonName, setPokemonName] = useState("");
    const [loading, setLoading] = useState(true);
    const [pokemonPic, setPokemonPic] = useState("");
    
    const [guess, setGuess] = useState("");
    const [result, setResult] = useState<boolean | null>(null);
    const [hasGuessed, setHasGuessed] = useState(false);

    // Stats
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [fails, setFails] = useState(0);

    // Dictionnaire des textes (sans emojis)
    const t = {
        fr: {
            title: "Quel est ce pokemon ?",
            score: "Score",
            streak: "Série",
            fails: "Erreurs",
            placeholder: "Nom du Pokémon...",
            submit: "Valider",
            reset: "Effacer",
            next: "Pokémon suivant",
            pass: "Passer / Changer",
            restartAll: "Recommencer tout",
            true: "VRAI - Bien joué !",
            false: (name: string) => `Faux ! C'était ${name}`,
        },
        en: {
            title: "Who's That Pokémon ?",
            score: "Score",
            streak: "Streak",
            fails: "Misses",
            placeholder: "Pokémon name...",
            submit: "Submit",
            reset: "Reset",
            next: "Next Pokémon",
            pass: "Skip / Change",
            restartAll: "Reset All",
            true: "CORRECT - Well played!",
            false: (name: string) => `Wrong! It was ${name}`,
        }
    }[language];

    function getRandomId(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function chooseRandomPokemon() {
        const gen = GENERATIONS[selectedGen];
        const randomNum = getRandomId(gen.min, gen.max);
        setPokemonId(randomNum);
        setGuess("");
        setResult(null);
        setHasGuessed(false);
    }

    function resetAll() {
        setScore(0);
        setStreak(0);
        setFails(0);
        chooseRandomPokemon();
    }

    function Guesscheck() {
        if (!guess.trim() || hasGuessed) return;
        
        const formattedGuess = guess.trim().toUpperCase();
        const formattedName = pokemonName.trim().toUpperCase();
        
        const isCorrect = formattedGuess === formattedName;
        setResult(isCorrect);
        setHasGuessed(true);

        if (isCorrect) {
            setScore(prev => prev + 1);
            setStreak(prev => prev + 1);
        } else {
            setStreak(0);
            setFails(prev => prev + 1);
        }
    }

    // Montage initial côté client
    useEffect(() => {
        setIsMounted(true);
        chooseRandomPokemon();
    }, []);

    useEffect(() => {
        async function loadPokemon() {
            try {
                setLoading(true);
                const data = await fetchPokemonDetails(pokemonId);
                setPokemonName(language === "fr" ? data.frenchName : (data.englishName ));
                setPokemonPic(data.artwork);
            } catch (error) {
                console.error("Erreur:", error);
            } finally {
                setLoading(false);
            }
        }

        if (pokemonId) {
            loadPokemon();
        }
    }, [pokemonId, language]);

    useEffect(() => {
        if (isMounted) {
            chooseRandomPokemon();
        }
    }, [selectedGen]);

    const isDark = theme === "dark";

 const [openMenu, setOpenMenu] = useState(false);


    return (
        <div className={`min-h-screen w-screen flex flex-col justify-between p-4 md:p-8 transition-colors duration-200 ${isDark ? "bg-neutral-900 text-neutral-100" : "bg-gray-100 text-gray-900"}`}>
              <Menu openMenu={openMenu} setOpenMenu={setOpenMenu}/> 
            {/* Header : Titre & Filtres */}
<div className="w-full flex justify-end">
<button
        type="button"
        className=" bg-black/20 hover:bg-black border border-white/10 w-10 h-10 flex items-center justify-center rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg"
        onClick={() => setOpenMenu(true)}
      >
        <Image src="/hamburger-svgrepo-com.svg" width={20} height={20} alt="menu" />
</button>
</div>
            <header className="flex flex-col md:flex-row justify-between items-center w-full max-w-4xl mx-auto gap-4 py-2">
             

               
               <div className="relative h-fit w-fit flex items-center justify-center"> 
                <h1 className="text-sm md:text-base relative z-2 font-bold tracking-wider uppercase text-blue-500 text-center">
                    {t.title}
                </h1>
                <Image priority src="/pikachu-png-icon-8.png" alt="pika" width={140} height={80} draggable={false} className="absolute z-1 top-0 -mt-8 opacity-30 pointer-events-none brightness-20"/>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-2 w-full md:w-auto">
                    <select 
                        className={`border px-2.5 py-1 text-xs md:text-sm transition-colors focus:outline-none ${isDark ? "bg-neutral-800 border-neutral-700 text-neutral-200" : "bg-white border-gray-300 text-gray-800"}`}
                        value={selectedGen}
                        onChange={(e) => setSelectedGen(Number(e.target.value))}
                    >
                        {GENERATIONS.map((gen, index) => (
                            <option key={index} value={index}>
                                {language === "fr" ? gen.labelFr : gen.labelEn}
                            </option>
                        ))}
                    </select>

                    <select 
                        className={`border px-2.5 py-1 text-xs md:text-sm transition-colors focus:outline-none ${isDark ? "bg-neutral-800 border-neutral-700 text-neutral-200" : "bg-white border-gray-300 text-gray-800"}`}
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as "fr" | "en")}
                    >
                        <option value="fr">FR</option>
                        <option value="en">EN</option>
                    </select>

                    <button 
                        onClick={() => setTheme(isDark ? "light" : "dark")}
                        className={`px-3 py-1 border text-xs md:text-sm transition font-medium ${isDark ? "bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-200" : "bg-white border-gray-300 hover:bg-gray-50 text-gray-800"}`}
                        title="Changer de thème"
                    >
                        {isDark ? "Clair" : "Sombre"}
                    </button>
                </div>
            </header>

            {/* Corps du Quiz */}
            <main className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 w-full max-w-4xl mx-auto my-auto">
                
                {/* Bloc Stats & Bouton Recommencer */}
                <div className={`flex flex-col md:flex-col gap-3 md:gap-5 p-3 md:p-5 border w-full md:w-44 justify-between ${isDark ? "bg-neutral-800 border-neutral-700" : "bg-white border-gray-300"}`}>
                    <div className="flex flex-row md:flex-col gap-2 md:gap-5 justify-around w-full">
                        <div className="text-center">
                            <div className="text-[10px] md:text-xs uppercase tracking-wider text-neutral-400 font-semibold">{t.score}</div>
                            <div className="text-xl md:text-2xl font-bold text-blue-500">{score}</div>
                        </div>
                        <div className="hidden md:block w-full h-[1px] bg-neutral-700/50"></div>
                        <div className="text-center">
                            <div className="text-[10px] md:text-xs uppercase tracking-wider text-neutral-400 font-semibold">{t.streak}</div>
                            <div className="text-xl md:text-2xl font-bold text-orange-500">{streak}</div>
                        </div>
                        <div className="hidden md:block w-full h-[1px] bg-neutral-700/50"></div>
                        <div className="text-center">
                            <div className="text-[10px] md:text-xs uppercase tracking-wider text-neutral-400 font-semibold">{t.fails}</div>
                            <div className="text-xl md:text-2xl font-bold text-red-500">{fails}</div>
                        </div>
                    </div>

                    <div className="w-full pt-2 border-t border-neutral-700/50 hidden md:block">
                        <button 
                            onClick={resetAll}
                            className="w-full py-2 text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition shadow"
                        >
                            {t.restartAll}
                        </button>
                    </div>
                </div>

                {/* Bloc Central (Image + Réponse + Input) */}
                <div className={`flex flex-col items-center justify-center gap-4 p-4 md:p-6 border w-full max-w-md ${isDark ? "bg-neutral-800 border-neutral-700" : "bg-white border-gray-300"}`}>
                    
                    {/* Div image à taille fixe et protégée contre le vol/triche */}
                    <div 
                        onContextMenu={(e) => e.preventDefault()} 
                        className={`relative w-[220px] h-[220px] md:w-[240px] md:h-[240px] flex items-center justify-center border select-none overflow-hidden ${isDark ? "bg-neutral-900 border-neutral-700" : "bg-gray-50 border-gray-200"}`}
                    >
                        <div className="absolute inset-0 z-10 pointer-events-none"></div>

                        {!loading && pokemonPic && (
                            <Image 
                                src={pokemonPic} 
                                alt="pokemon mystère" 
                                width={180} 
                                height={180} 
                                priority
                                draggable={false}
                                className={`transition-all duration-300 object-contain pointer-events-none ${hasGuessed ? "brightness-100 scale-105" : "brightness-0"}`}  
                            />
                        )}
                    </div>

                    {/* Zone de Résultat */}
                    <div className="h-6 flex items-center justify-center text-sm font-bold">
                        {result === true && <span className="text-green-500">{t.true}</span>}
                        {result === false && <span className="text-red-500 text-center">{t.false(pokemonName)}</span>}
                        {result === null && <span className="text-neutral-400 font-normal">...</span>}
                    </div>

                    {/* Zone de saisie / Bouton Suivant */}
                    <div className="w-full">
                        {isMounted && (!hasGuessed ? (
                            <div className="flex flex-col gap-2">
                                <div className="flex space-x-2">
                                    <input 
                                        className={`border px-3 py-2 text-sm focus:outline-none w-full transition-colors ${isDark ? "bg-neutral-900 border-neutral-700 text-neutral-100 focus:border-neutral-500" : "bg-gray-50 border-gray-300 text-gray-900 focus:border-gray-500"}`} 
                                        onChange={(e) => setGuess(e.target.value)} 
                                        onKeyDown={(e) => e.key === 'Enter' && Guesscheck()}
                                        value={guess} 
                                        type="text"
                                        placeholder={t.placeholder}
                                    />

                                    <button 
                                        onClick={Guesscheck} 
                                        className="px-4 py-2 text-sm font-medium bg-green-700 hover:bg-green-500 text-white transition shadow"
                                    >
                                        {t.submit}
                                    </button>
                                </div>

                                <div className="flex justify-between items-center px-1 pt-1">
                                    <button 
                                        onClick={() => setGuess("")} 
                                        className="text-xs text-neutral-400 hover:text-neutral-200 transition"
                                    >
                                        {t.reset}
                                    </button>

                                    <button 
                                        onClick={chooseRandomPokemon}
                                        className="text-xs text-neutral-400 hover:text-red-400 transition underline"
                                    >
                                        {t.pass}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={chooseRandomPokemon}
                                className="w-full py-3 text-sm font-bold bg-green-500 hover:bg-green-600 text-white transition shadow"
                            >
                                {t.next}
                            </button>
                        ))}
                    </div>

                </div>

                {/* Bouton Recommencer tout visible uniquement sur mobile en bas */}
                <div className="w-full max-w-md md:hidden">
                    <button 
                        onClick={resetAll}
                        className="w-full py-2.5 text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition shadow"
                    >
                        {t.restartAll}
                    </button>
                </div>

            </main>

            {/* Footer discret */}
            <footer className="text-center text-xs text-neutral-500 py-2">
                Pokequiz !
            </footer>

        </div>
    );
}