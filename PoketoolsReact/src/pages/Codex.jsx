import { useState, useEffect } from 'react';
import { usePokemon } from '../hooks/usePokemon';
import { getFrenchName, getFrenchDescription } from '../utils/pokemon';
import PokemonCard from '../components/PokemonCard';
import PokemonModal from '../components/PokemonModal';

const PAGE_SIZE = 20;

function debounce(fn, delay = 200) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

export default function Codex() {
    const { allPokemons, loading, error: initialError } = usePokemon();
    const [searchQuery, setSearchQuery] = useState(() => localStorage.getItem("pokedexSearch") || "");
    const [currentPage, setCurrentPage] = useState(1);
    const [pokemonDetails, setPokemonDetails] = useState(null);
    const [error, setError] = useState(initialError);

    useEffect(() => {
        setError(initialError);
    }, [initialError]);

    const filteredPokemons = searchQuery.trim() === ""
        ? allPokemons
        : allPokemons.filter(p =>
            p.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
            String(p.id) === searchQuery.trim()
        );

    const handleSearch = debounce((value) => {
        localStorage.setItem("pokedexSearch", value);
        setCurrentPage(1);
    });

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        handleSearch(e.target.value);
    };

    const handleCardClick = async (pokemon) => {
        try {
            const frenchName = await getFrenchName(pokemon.id);
            const descFr = await getFrenchDescription(pokemon.id);
            setPokemonDetails({
                ...pokemon,
                frenchName: frenchName || pokemon.name,
                description: descFr,
            });
        } catch (err) {
            console.error("Error fetching Pokemon details:", err);
            setPokemonDetails({
                ...pokemon,
                frenchName: pokemon.name,
                description: "Description non disponible.",
            });
        }
    };

    const start = (currentPage - 1) * PAGE_SIZE;
    const end = currentPage * PAGE_SIZE;
    const paginatedPokemons = filteredPokemons.slice(start, end);
    const hasMore = end < filteredPokemons.length;

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

                {loading && (
                    <div className="text-gray-400">Chargement des Pokémon...</div>
                )}

                {error && (
                    <div className="text-red-500">{error}</div>
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
