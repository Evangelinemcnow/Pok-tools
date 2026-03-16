import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import SideMenu from './components/SideMenu';
import Footer from './components/Footer';
import Home from './pages/Home';
import Codex from './pages/Codex';
import DamageCalculator from './pages/DamageCalculator';
import PokeBuilder from './pages/PokeBuilder';
import './index.css';

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Router>
      <div className="bg-[#0A0908] text-gray-900 min-h-screen flex flex-col">
        <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <SideMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

        <main
          id="mainContent"
          className={`transition-transform duration-300 p-6 flex-1 ${menuOpen ? 'ml-64' : 'ml-0'}`}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/codex" element={<Codex />} />
            <Route path="/damage-calc" element={<DamageCalculator />} />
            <Route path="/pokebuilder" element={<PokeBuilder />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
