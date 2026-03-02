import { useState, useEffect } from 'react';
import { fetchAllPokemons } from '../utils/pokemon';

export function usePokemon() {
    const [allPokemons, setAllPokemons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadPokemons = async () => {
            setLoading(true);
            setError("");
            try {
                const pokemons = await fetchAllPokemons();
                setAllPokemons(pokemons);
                setError("");
            } catch (err) {
                console.error("Error loading pokemons:", err);
                setError("Erreur lors du chargement des Pokémon. Veuillez réessayer.");
            } finally {
                setLoading(false);
            }
        };

        loadPokemons();
    }, []);

    return { allPokemons, loading, error };
}
