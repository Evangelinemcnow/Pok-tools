import { Link } from 'react-router-dom';

export default function SideMenu({ menuOpen, setMenuOpen }) {
    const handleLinkClick = () => {
        setMenuOpen(false);
    };

    return (
        <>
            {/* Menu Overlay */}
            {menuOpen && (
                <div
                    id="menuOverlay"
                    className="fixed inset-0 bg-black/50 z-30"
                    onClick={() => setMenuOpen(false)}
                />
            )}

            {/* Side Menu */}
            <nav
                id="sideMenu"
                className={`fixed left-0 top-0 h-full w-64 bg-gray-900 text-white transform transition-transform duration-300 z-40 ${menuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <ul className="flex flex-col mt-6 gap-4 p-4">
                    <li>
                        <Link
                            to="/"
                            className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded"
                            onClick={handleLinkClick}
                        >
                            <img
                                src="/Images/Pokecenter54x41.png"
                                alt="Pokécenter"
                                className="w-10 h-10"
                            />
                            Accueil
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/pokebuilder"
                            className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded"
                            onClick={handleLinkClick}
                        >
                            <img
                                src="/Images/Togepi54x54.png"
                                alt="Togepi"
                                className="w-10 h-10"
                            />
                            Pokébuilder
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/codex"
                            className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded"
                            onClick={handleLinkClick}
                        >
                            <img
                                src="/Images/Pokedex-54x41.png"
                                alt="Pokedex"
                                className="w-10 h-10"
                            />
                            Codex
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/damage-calc"
                            className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded"
                            onClick={handleLinkClick}
                        >
                            <img
                                src="/Images/Porygon2-54x53.png"
                                alt="Porygon2"
                                className="w-10 h-10"
                            />
                            Damage Calculator
                        </Link>
                    </li>
                </ul>
            </nav>
        </>
    );
}
