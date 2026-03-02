import { useState, useEffect } from 'react';
import { getFrenchName } from '../utils/pokemon';

export default function PokemonCard({ pokemon, onClick }) {
    const [frenchName, setFrenchName] = useState(null);

    useEffect(() => {
        const loadName = async () => {
            try {
                const name = await getFrenchName(pokemon.id);
                setFrenchName(name);
            } catch {
                setFrenchName(null);
            }
        };

        loadName();
    }, [pokemon.id]);

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
            <div className="font-bold text-lg capitalize mb-1">
                {(frenchName || pokemon.name).toUpperCase()}
            </div>
            <div className="text-gray-500 text-sm">
                #{pokemon.id.toString().padStart(3, "0")}
            </div>
            <div className="text-gray-700 text-sm mt-1 capitalize">
                Types: {pokemon.types.join(", ")}
            </div>
        </div>
    );
}
