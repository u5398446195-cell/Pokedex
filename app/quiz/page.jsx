"use client";

import { useEffect, useState } from 'react';
import { fetchPokemonDetails } from "../lib/pokeapi";
import Image from "next/image";

export default function Quiz() {
    const [pokemonName, setPokemonName] = useState("");
    const [loading, setLoading] = useState(true);
    const [pokemonPic, setPokemonPic] = useState("");
    
    const [guess, setGuess] = useState("");
    const [result, setResult] = useState(null); // null au début
    
    const [pokemonId, setPokemonId] = useState(Math.floor(Math.random() * 1000) + 1);

    function chooseRandomPokemon() {
        const randomNum = Math.floor(Math.random() * 1000) + 1;
        setPokemonId(randomNum);
        setGuess("");
        setResult(null);
    }

    function Guesscheck() {
        const formattedGuess = guess.trim().toUpperCase();
        const formattedName = pokemonName.trim().toUpperCase();
        
        if (formattedGuess === formattedName) {
            setResult(true);
        } else {
            setResult(false);
        }
    }

    useEffect(() => {
        async function loadPokemon() {
            try {
                setLoading(true);
                const data = await fetchPokemonDetails(pokemonId);
                setPokemonName(data.frenchName);
                setPokemonPic(data.artwork);
            } catch (error) {
                console.error("Erreur:", error);
            } finally {
                setLoading(false);
            }
        }

        loadPokemon();
    }, [pokemonId]);

    return (
        <div className="bg-slate-100 h-screen w-screen text-black flex flex-col items-center justify-center gap-4">
            
            {!loading && (
                <Image src={pokemonPic} alt="pokemon" width={220} height={220} className="brightness-0" />
            )}

            {result === true && <h1 className="text-green-600 font-bold">VRAI 🎉</h1>}
            {result === false && <h1 className="text-red-600 font-bold">Faux c&apos;était {pokemonName} ❌</h1>}

            <div className="space-x-3">
                <input 
                    className="text-black border px-2 py-1" 
                    onChange={(e) => setGuess(e.target.value)} 
                    value={guess} 
                    type="text"
                    placeholder="Votre réponse..."
                />

                <button onClick={Guesscheck} className="p-2 hover:bg-blue-900 bg-blue-500 text-white rounded">
                    Submit
                </button>
                <button onClick={() => { setGuess(""); setResult(null); }} className="p-2 hover:bg-red-900 bg-red-500 text-white rounded">
                    Reset
                </button>
            </div>

            <button 
                onClick={chooseRandomPokemon}
                className="border text-black px-4 py-2 rounded shadow hover:text-white hover:bg-red-500"
            >
                Changer de Pokémon
            </button>
        </div>
    );
}