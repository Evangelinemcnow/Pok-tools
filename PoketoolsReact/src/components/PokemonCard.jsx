import { translateType } from '../utils/pokemon';

export default function PokemonCard({ pokemon, onClick }) {
    return (
        <div
            className="bg-sky-200 rounded-lg shadow-md p-2 flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
            onClick={onClick}
        >
            <img
                src={pokemon.sprite}
                alt={pokemon.name}
                className="w-24 h-24 object-contain mb-2"
            />
            <div className="font-bold text-lg mb-1 text-center">
                {pokemon.name}
            </div>
            <div className="text-gray-500 text-sm">
                #{pokemon.id.toString().padStart(3, "0")}
            </div>
            {pokemon.category && (
                <div className="text-gray-600 text-xs mt-1 text-center">
                    {pokemon.category}
                </div>
            )}
            <div className="text-gray-700 text-sm mt-1 capitalize">
                Types: {pokemon.types.map(type => translateType(type)).join(", ")}
            </div>
        </div>
    );
}
