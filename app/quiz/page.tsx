"use client";

import { useEffect, useState } from 'react';
import { fetchPokemonDetails } from "../lib/pokeapi";
import RetroHeader from "../components/RetroHeader.jsx";
import RetroFooter from "../components/RetroFooter.jsx";

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

    const t = {
        fr: {
            title: "Quel est ce pokemon ?",
            current: "Série",
            record: "Record",
            score: "Score",
            fails: "Erreurs",
            placeholder: "Nom du Pokémon...",
            hint: "Qui est-ce ? Écris son nom ci-dessous.",
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
            hint: "Who is it? Type its name below.",
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
        <main className={`gb gb-quiz ${isDark ? "is-night" : ""}`}>
            <RetroHeader title="QUIZ" />

            <div className="gb-quiz-wrap">
                {/* Réglages : jour/nuit + langue */}
                <div className="gb-quiz-options">
                    <button
                        type="button"
                        onClick={() => setTheme(isDark ? "light" : "dark")}
                        className="gb-pill px-frame"
                    >
                        {isDark ? "☀ JOUR" : "☾ NUIT"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setLanguage("fr")}
                        className={`gb-pill px-frame ${language === "fr" ? "is-on" : ""}`}
                        aria-pressed={language === "fr"}
                    >
                        FR
                    </button>
                    <button
                        type="button"
                        onClick={() => setLanguage("en")}
                        className={`gb-pill px-frame ${language === "en" ? "is-on" : ""}`}
                        aria-pressed={language === "en"}
                    >
                        EN
                    </button>
                </div>

                <div className="gb-quiz-grid">
                    {/* Générations + score */}
                    <aside className="gb-quiz-side">
                        <div className="gb-quiz-win px-frame">
                            <p className="gb-quiz-label">GÉNÉRATION</p>
                            <div className="gb-gen-grid">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setSelectedGen(num)}
                                        className={`gb-gen ${selectedGen === num ? "is-on" : ""}`}
                                        aria-pressed={selectedGen === num}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedGen(0)}
                                className={`gb-gen gb-gen-all ${selectedGen === 0 ? "is-on" : ""}`}
                                aria-pressed={selectedGen === 0}
                            >
                                {t.allGen}
                            </button>
                        </div>

                        <div className="gb-quiz-win px-frame">
                            <p className="gb-quiz-label">STATS</p>
                            <p className="gb-quiz-stat"><span>{t.score}</span><strong>{score}</strong></p>
                            <p className="gb-quiz-stat"><span>{t.fails}</span><strong className="is-red">{fails}</strong></p>
                            <p className="gb-quiz-stat"><span>{t.current}</span><strong>{streak}</strong></p>
                            <p className="gb-quiz-stat"><span>{t.record}</span><strong className="is-gold">{bestStreak}</strong></p>
                        </div>
                    </aside>

                    {/* Écran de jeu */}
                    <section className="gb-quiz-main">
                        <h1 className="gb-quiz-title">{t.title}</h1>

                        <div className="gb-quiz-screen" onContextMenu={(e) => e.preventDefault()}>
                            <div className="gb-who-rays" aria-hidden="true" />
                            {!loading && pokemonPic && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={pokemonPic}
                                    alt={hasGuessed ? pokemonName : "Pokémon mystère"}
                                    draggable={false}
                                    className={`gb-quiz-mon ${hasGuessed ? "is-revealed" : ""}`}
                                />
                            )}
                            {loading && <p className="gb-quiz-loading">...</p>}
                        </div>

                        <div className="gb-dialog px-frame gb-quiz-dialog" aria-live="polite">
                            {result === true && <p className="is-good">{t.true}</p>}
                            {result === false && <p className="is-bad">{t.false(pokemonName)}</p>}
                            {result === null && <p>{t.hint}</p>}
                        </div>

                        {isMounted &&
                            (!hasGuessed ? (
                                <div className="gb-quiz-form">
                                    <div className="gb-quiz-row">
                                        <input
                                            className="gb-input px-frame"
                                            onChange={(e) => setGuess(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && Guesscheck()}
                                            value={guess}
                                            type="text"
                                            placeholder={t.placeholder}
                                            aria-label={t.placeholder}
                                            autoFocus
                                        />
                                        <button type="button" onClick={Guesscheck} className="gb-btn px-frame">
                                            ▶ {t.submit}
                                        </button>
                                    </div>
                                    <div className="gb-quiz-links">
                                        <button type="button" onClick={() => setGuess("")}>
                                            EFFACER
                                        </button>
                                        <button type="button" onClick={chooseRandomPokemon}>
                                            {t.pass} ▶
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button type="button" onClick={chooseRandomPokemon} className="gb-btn px-frame gb-quiz-next">
                                    ▶ {t.next}
                                </button>
                            ))}
                    </section>
                </div>
            </div>

            <RetroFooter />
        </main>
    );
}
