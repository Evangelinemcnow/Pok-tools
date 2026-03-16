import { useEffect, useMemo, useState } from 'react';
import { usePokemon } from '../hooks/usePokemon';
import { getPokemonFullDetails } from '../utils/pokemon';
import PokemonCard from '../components/PokemonCard';
import PokemonModal from '../components/PokemonModal';

const PAGE_SIZE = 20;

function normalizeText(value) {
    return (value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function debounce(fn, delay = 200) {
    let timerId;

    const debounced = (...args) => {
        clearTimeout(timerId);
        timerId = setTimeout(() => fn(...args), delay);
    };

    debounced.cancel = () => {
        clearTimeout(timerId);
    };

    return debounced;
}

export default function Codex() {
    const { allPokemons, loading, error: initialError } = usePokemon();
    const [searchQuery, setSearchQuery] = useState(() => localStorage.getItem("pokedexSearch") || "");
    const [currentPage, setCurrentPage] = useState(1);
    const [pokemonDetails, setPokemonDetails] = useState(null);
    const trimmedQuery = searchQuery.trim();

    const debouncedSearchPersist = useMemo(
        () => debounce((value) => {
            localStorage.setItem("pokedexSearch", value);
            setCurrentPage(1);
        }),
        []
    );

    useEffect(() => {
        return () => {
            debouncedSearchPersist.cancel();
        };
    }, [debouncedSearchPersist]);

    const normalizedQuery = useMemo(
        () => normalizeText(trimmedQuery),
        [trimmedQuery]
    );

    const filteredPokemons = useMemo(() => {
        if (trimmedQuery === "") {
            return allPokemons;
        }

        return allPokemons.filter((pokemon) => (
            normalizeText(pokemon.name).includes(normalizedQuery)
            || normalizeText(pokemon.nameFr).includes(normalizedQuery)
            || normalizeText(pokemon.nameEn).includes(normalizedQuery)
            || normalizeText(pokemon.slug).includes(normalizedQuery)
            || String(pokemon.id) === trimmedQuery
        ));
    }, [allPokemons, normalizedQuery, trimmedQuery]);

    const { paginatedPokemons, hasMore } = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        const end = currentPage * PAGE_SIZE;

        return {
            paginatedPokemons: filteredPokemons.slice(start, end),
            hasMore: end < filteredPokemons.length
        };
    }, [currentPage, filteredPokemons]);

    const handleSearchChange = (e) => {
        const { value } = e.target;
        setSearchQuery(value);
        debouncedSearchPersist(value);
    };

    const handleCardClick = async (pokemon) => {
        try {
            const fullDetails = await getPokemonFullDetails(pokemon.id);
            setPokemonDetails(fullDetails);
        } catch (err) {
            console.error("Error fetching Pokemon details:", err);
            setPokemonDetails({
                ...pokemon,
                nameFr: pokemon.nameFr,
                nameEn: pokemon.nameEn,
                description: "Erreur lors du chargement des détails.",
            });
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-white">Codex</h2>

            <section className="codex-container space-y-4">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <label htmlFor="searchPokemon" className="font-medium text-white">
                        Rechercher un Pokémon
                    </label>
                    <input
                        type="search"
                        id="searchPokemon"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="border border-gray-300 bg-white text-black rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Nom ou n°"
                    />
                </div>

                <p className="text-sm text-gray-400">
                    Source des donnees: Tyradex. Recherche par nom FR, nom EN, slug ou numero.
                </p>

                {loading && (
                    <div className="text-gray-400">Chargement des Pokémon...</div>
                )}

                {initialError && (
                    <div className="text-red-500">{initialError}</div>
                )}

                <div id="pokedexGrid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {paginatedPokemons.map(p => (
                        <PokemonCard
                            key={p.id}
                            pokemon={p}
                            onClick={() => handleCardClick(p)}
                        />
                    ))}
                </div>

                {!loading && filteredPokemons.length === 0 && (
                    <p className="text-gray-500">Aucun Pokémon trouvé.</p>
                )}

                {hasMore && (
                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="mt-4 mx-auto block bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded cursor-pointer"
                    >
                        Load More
                    </button>
                )}
            </section>

            {pokemonDetails && (
                <PokemonModal
                    pokemon={pokemonDetails}
                    onClose={() => {
                        setPokemonDetails(null);
                    }}
                />
            )}
        </div>
    );
}
