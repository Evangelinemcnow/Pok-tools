export default function PokemonModal({ pokemon, onClose }) {
    return (
        <div
            className="fixed inset-0 bg-slate-700/50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-gray-900 text-gray-200 rounded-2xl shadow-xl w-11/12 md:w-3/4 lg:w-1/2 max-h-[90vh] overflow-y-auto flex flex-col md:flex-row gap-6 p-6 relative"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold cursor-pointer"
                >
                    ×
                </button>
                <img
                    src={pokemon.sprite}
                    alt={pokemon.frenchName}
                    className="w-full md:w-1/3 h-auto object-contain rounded-lg bg-gray-800 p-2 flex-shrink-0"
                />
                <div className="flex-1 flex flex-col gap-2">
                    <h2 className="text-3xl font-bold text-white uppercase">
                        {pokemon.frenchName}
                    </h2>
                    <p className="text-white text-sm">
                        ID: #{pokemon.id.toString().padStart(3, "0")}
                    </p>
                    <p className="text-white">
                        Types: {pokemon.types.join(", ")}
                    </p>
                    <p className="text-gray-200 break-words">
                        {pokemon.description}
                    </p>
                </div>
            </div>
        </div>
    );
}
