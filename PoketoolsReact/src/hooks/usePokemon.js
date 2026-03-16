import { useState, useEffect } from 'react';
import { fetchAllPokemons } from '../utils/pokemon';

export function usePokemon() {
    const [allPokemons, setAllPokemons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        const loadPokemons = async () => {
            if (isMounted) {
                setLoading(true);
                setError("");
            }

            try {
                const pokemons = await fetchAllPokemons();
                if (isMounted) {
                    setAllPokemons(pokemons);
                }
            } catch (err) {
                console.error("Error loading pokemons:", err);
                if (isMounted) {
                    setError("Erreur lors du chargement des Pokémon. Veuillez réessayer.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadPokemons();

        return () => {
            isMounted = false;
        };
    }, []);

    return { allPokemons, loading, error };
}
