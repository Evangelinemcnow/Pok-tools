export default function Header({ menuOpen, setMenuOpen }) {
    return (
        <header className="bg-gray-800 text-white shadow-md p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button
                    id="menuBtn"
                    className="text-2xl font-bold hover:text-gray-300 cursor-pointer"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? "✕" : "☰"}
                </button>
                <h1 className="text-xl font-bold">Poké Tools</h1>
            </div>
        </header>
    );
}
