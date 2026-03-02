export default function Home() {
    return (
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
            <img src="/Images/Accueil.poketools.png" alt="Accueil" className="w-64 h-auto" />

            <div className="w-full bg-gray-800 border border-gray-300 rounded text-white p-6 text-center whitespace-pre-line focus:outline-none focus:ring-2 focus:ring-yellow-400">
                Bienvenue sur cette première version de Poké Tools
                Je vais utiliser ce site pour centraliser tous mes outils pour Pokémon.
                Le site est fait par une fan et n'a aucun lien avec Pokémon Company ni Nintendo.
                Si vous avez une question ou que vous trouvez un bug, contactez-moi sur
                <a href="https://github.com/Evangelinemcnow" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline ml-1">Github</a>.
                Merci d'utiliser Poké Tools. J'espère pouvoir ajouter de nouveaux outils très bientôt.
                — Evangéline
            </div>
        </div>
    );
}
