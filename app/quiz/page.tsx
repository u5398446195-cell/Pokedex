"use client";

import { useEffect, useState } from 'react';
import { fetchPokemonDetails } from "../lib/pokeapi";
import Image from "next/image";
import Menu from "../components/Menu.jsx";

const GENERATIONS = [
    { labelFr: "Toutes les générations", labelEn: "All Generations", min: 1, max: 1025 },
    { labelFr: "1ère Génération", labelEn: "1st Gen", min: 1, max: 151 },
    { labelFr: "2ème Génération", labelEn: "2nd Gen", min: 152, max: 251 },
    { labelFr: "3ème Génération", labelEn: "3rd Gen", min: 252, max: 386 },
    { labelFr: "4ème Génération", labelEn: "4th Gen", min: 387, max: 493 },
    { labelFr: "5ème Génération", labelEn: "5th Gen", min: 494, max: 649 },
    { labelFr: "6ème Génération", labelEn: "6th Gen", min: 650, max: 721 },
    { labelFr: "7ème Génération", labelEn: "7th Gen", min: 722, max: 809 },
    { labelFr: "8ème Génération", labelEn: "8th Gen", min: 810, max: 905 },
    { labelFr: "9ème Génération", labelEn: "9th Gen", min: 906, max: 1025 },
];

export default function Quiz() {
    const [isMounted, setIsMounted] = useState(false);
    const [selectedGen, setSelectedGen] = useState(0); // 0 = Toutes les générations
    const [theme, setTheme] = useState<"light" | "dark">("dark");
    const [language, setLanguage] = useState<"fr" | "en">("fr");
    
    const [pokemonId, setPokemonId] = useState<number>(1);
    const [pokemonName, setPokemonName] = useState("");
    const [loading, setLoading] = useState(true);
    const [pokemonPic, setPokemonPic] = useState("");
    
    const [guess, setGuess] = useState("");
    const [result, setResult] = useState<boolean | null>(null);
    const [hasGuessed, setHasGuessed] = useState(false);

    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [fails, setFails] = useState(0);
    const [openMenu, setOpenMenu] = useState(false);

    const t = {
        fr: {
            title: "Quel est ce pokemon ?",
            current: "Série",
            record: "Record",
            score: "Score",
            fails: "Erreurs",
            placeholder: "Nom du Pokémon...",
            submit: "Valider",
            next: "Pokémon suivant",
            pass: "Passer / Changer",
            allGen: "Toutes les générations",
            true: "VRAI - Bien joué !",
            false: (name: string) => `Faux ! C'était ${name}`,
        },
        en: {
            title: "Who's That Pokémon ?",
            current: "Streak",
            record: "Record",
            score: "Score",
            fails: "Misses",
            placeholder: "Pokémon name...",
            submit: "Submit",
            next: "Next Pokémon",
            pass: "Skip / Change",
            allGen: "All Generations",
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

    function Guesscheck() {
        if (!guess.trim() || hasGuessed) return;
        
        const formattedGuess = guess.trim().toUpperCase();
        const formattedName = pokemonName.trim().toUpperCase();
        
        const isCorrect = formattedGuess === formattedName;
        setResult(isCorrect);
        setHasGuessed(true);

        if (isCorrect) {
            setScore(prev => prev + 1);
            setStreak(prev => {
                const newStreak = prev + 1;
                if (newStreak > bestStreak) setBestStreak(newStreak);
                return newStreak;
            });
        } else {
            setStreak(0);
            setFails(prev => prev + 1);
        }
    }

    useEffect(() => {
        setIsMounted(true);
        chooseRandomPokemon();
    }, []);

    useEffect(() => {
        async function loadPokemon() {
            try {
                setLoading(true);
                const data = await fetchPokemonDetails(pokemonId);
                setPokemonName(language === "fr" ? data.frenchName : data.englishName);
                setPokemonPic(data.artwork);
            } catch (error) {
                console.error("Erreur:", error);
            } finally {
                setLoading(false);
            }
        }
        if (pokemonId) loadPokemon();
    }, [pokemonId, language]);

    useEffect(() => {
        if (isMounted) chooseRandomPokemon();
    }, [selectedGen]);

    const isDark = theme === "dark";

    return (
        <div className={`min-h-screen w-screen flex flex-col justify-between p-4 md:p-8 transition-colors duration-200 select-none ${isDark ? "bg-neutral-900 text-neutral-100" : "bg-gray-100 text-gray-900"}`}>
            <Menu openMenu={openMenu} setOpenMenu={setOpenMenu} />

            {/* Header avec Thème/Drapeaux à gauche, Titre au milieu, Menu à droite */}
            <header className="flex justify-between items-center w-full max-w-4xl mx-auto py-3 gap-2">
                <div className="flex items-center gap-2 shrink-0 w-36 justify-start">
                    <button 
                        onClick={() => setTheme(isDark ? "light" : "dark")}
                        className={`px-3 py-1.5 border text-xs transition font-medium rounded-lg shadow-sm ${isDark ? "bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700" : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50"}`}
                    >
                        {isDark ? <Image src="/light-svgrepo-com.svg" alt="moon" width={18} height={18}/> : <Image src="/moon-svgrepo-com-2.svg"  alt="sun" width={18} height={18}/> }
                    </button>
                    <button 
                        onClick={() => setLanguage("en")} 
                        className={`px-2 py-1.5 text-xs rounded-lg border transition shadow-sm ${language === 'en' ? 'bg-blue-600 border-blue-500 text-white' : isDark ? 'bg-neutral-800 border-neutral-700 opacity-60' : 'bg-white border-gray-300 opacity-60'}`}
                        title="English"
                    >
                        🇬🇧
                    </button>
                    <button 
                        onClick={() => setLanguage("fr")} 
                        className={`px-2 py-1.5 text-xs rounded-lg border transition shadow-sm ${language === 'fr' ? 'bg-blue-600 border-blue-500 text-white' : isDark ? 'bg-neutral-800 border-neutral-700 opacity-60' : 'bg-white border-gray-300 opacity-60'}`}
                        title="Français"
                    >
                        🇫🇷
                    </button>
                </div>

                <div className="relativ hidden md:flex flex-1 flex items-center justify-center"> 
                    <h1 className="text-xs md:text-base relative z-2 font-extrabold tracking-wider uppercase text-blue-400 text-center truncate px-2">
                        {t.title}
                    </h1>
                    <Image priority src="/pikachu-png-icon-8.png" alt="pika" width={120} height={70} draggable={false} className="absolute z-1 top-0 -mt-6 opacity-30 pointer-events-none brightness-20"/>
                </div>

                <div className="w-36 flex justify-end">
                    <button
                        type="button"
                        className="bg-black/20 hover:bg-black/40 border border-white/10 w-11 h-11 flex items-center justify-center rounded-full transition-all shadow-lg shrink-0 cursor-pointer active:scale-95"
                        onClick={() => setOpenMenu(true)}
                    >
                        <Image src="/hamburger-svgrepo-com.svg" width={22} height={22} alt="menu" />
                    </button>
                </div>
            </header>

            {/* Corps Principal du Quiz */}
            <main className="flex flex-col md:flex-row items-center justify-center w-full max-w-4xl mx-auto my-auto gap-6">
                
                {/* Panneau Latéral Gauche : Générations & Stats */}
                <div className="flex flex-col gap-4 w-full md:w-52">
                    <div className={`p-3.5 rounded-2xl border shadow-md ${isDark ? "bg-neutral-800/90 border-neutral-700" : "bg-white border-gray-300"}`}>
                        <span className="text-xs font-bold uppercase tracking-wider block mb-2.5 text-center opacity-70">Generation</span>
                        
                        {/* Grille des générations 1 à 9 */}
                        <div className="grid grid-cols-3 gap-1.5 mb-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                                const isSelected = selectedGen === num;
                                return (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setSelectedGen(num)}
                                        className={`h-9 flex items-center justify-center text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 ${
                                            isSelected ? "bg-blue-600 text-white shadow-md scale-105" : isDark ? "bg-neutral-900 text-neutral-300 hover:bg-neutral-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                    >
                                        {num}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Bouton Toutes les générations en bas */}
                        <button
                            type="button"
                            onClick={() => setSelectedGen(0)}
                            className={`w-full py-2 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 shadow-sm ${
                                selectedGen === 0 
                                    ? "bg-blue-600 text-white shadow-md" 
                                    : isDark ? "bg-neutral-900 text-neutral-300 hover:bg-neutral-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            {t.allGen}
                        </button>
                    </div>

                    <div className={`p-3.5 rounded-2xl border shadow-md flex flex-col gap-2.5 ${isDark ? "bg-neutral-800/90 border-neutral-700" : "bg-white border-gray-300"}`}>
                        <span className="text-xs font-bold uppercase tracking-wider text-center opacity-70">Stats</span>
                        <div className="flex justify-between text-xs px-3 py-1.5 bg-black/10 rounded-xl font-medium">
                            <span>{t.score}:</span>
                            <span className="font-bold">{score}</span>
                        </div>
                        <div className="flex justify-between text-xs px-3 py-1.5 bg-black/10 rounded-xl font-medium">
                            <span>{t.fails}:</span>
                            <span className="font-bold text-red-500">{fails}</span>
                        </div>
                    </div>
                </div>

                {/* Bloc Central (Bleu) */}
                <div className="flex flex-col items-center justify-center gap-4 p-6 md:p-7 bg-blue-600 border border-blue-500 rounded-3xl w-full max-w-md shadow-2xl text-white">
                    
                    <div 
                        onContextMenu={(e) => e.preventDefault()} 
                        className="relative w-[220px] h-[220px] md:w-[250px] md:h-[250px] flex items-center justify-center bg-blue-900/40 border border-white/15 rounded-2xl select-none overflow-hidden shadow-inner"
                    >
                        {!loading && pokemonPic && (
                            <Image 
                                src={pokemonPic} 
                                alt="pokemon mystère" 
                                width={190} 
                                height={190} 
                                priority
                                draggable={false}
                                className={`transition-all duration-300 object-contain pointer-events-none ${hasGuessed ? "brightness-100 scale-105" : "brightness-0"}`}  
                            />
                        )}
                    </div>

                    <div className="h-6 flex items-center justify-center text-sm font-bold">
                        {result === true && <span className="text-green-300">{t.true}</span>}
                        {result === false && <span className="text-red-300 text-center">{t.false(pokemonName)}</span>}
                        {result === null && <span className="text-white/60 font-normal">...</span>}
                    </div>

                    <div className="w-full">
                        {isMounted && (!hasGuessed ? (
                            <div className="flex flex-col gap-2.5">
                                <div className="flex gap-2">
                                    <input 
                                        className="bg-white text-gray-900 border border-white/20 px-4 py-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 w-full shadow-inner placeholder-gray-400 font-medium" 
                                        onChange={(e) => setGuess(e.target.value)} 
                                        onKeyDown={(e) => e.key === 'Enter' && Guesscheck()}
                                        value={guess} 
                                        type="text"
                                        placeholder={t.placeholder}
                                        autoFocus
                                    />

                                    <button 
                                        onClick={Guesscheck} 
                                        className="px-5 py-3 text-sm font-bold bg-green-500 hover:bg-green-600 text-white rounded-xl transition shadow-md cursor-pointer active:scale-95 shrink-0"
                                    >
                                        {t.submit}
                                    </button>
                                </div>

                                <div className="flex justify-between items-center px-1 pt-0.5 text-xs">
                                    <button 
                                        onClick={() => setGuess("")} 
                                        className="text-white/80 hover:text-white transition cursor-pointer"
                                    >
                                        Effacer
                                    </button>

                                    <button 
                                        onClick={chooseRandomPokemon}
                                        className="text-white/80 hover:text-red-200 transition underline cursor-pointer"
                                    >
                                        {t.pass}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={chooseRandomPokemon}
                                className="w-full py-3.5 text-sm font-bold bg-green-500 hover:bg-green-600 text-white rounded-xl transition shadow-md cursor-pointer active:scale-95"
                            >
                                {t.next}
                            </button>
                        ))}
                    </div>

                </div>

                {/* Panneau Latéral Droit : Streak & Record */}
                <div className="flex flex-col gap-3 w-full md:w-36">
                    <div className={`p-3.5 rounded-2xl border text-center flex flex-col gap-2.5 shadow-md ${isDark ? "bg-neutral-800/90 border-neutral-700" : "bg-white border-gray-300"}`}>
                        <span className="text-xs font-bold uppercase tracking-wider opacity-70">Streak</span>
                        
                        <div className="bg-black/10 rounded-xl p-2.5 flex flex-col">
                            <span className="text-[10px] uppercase opacity-70 font-semibold">{t.current}</span>
                            <span className="text-xl font-black">{streak}</span>
                        </div>

                        <div className="bg-black/10 rounded-xl p-2.5 flex flex-col">
                            <span className="text-[10px] uppercase opacity-70 font-semibold">{t.record}</span>
                            <span className="text-xl font-black">{bestStreak}</span>
                        </div>
                    </div>
                </div>

            </main>

            <footer className="text-center text-xs text-neutral-500 py-2">
                Pokequiz !
            </footer>

        </div>
    );
}