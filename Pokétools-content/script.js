document.addEventListener("DOMContentLoaded", () => {
    // ---------- Menu ----------
    const menuBtn = document.getElementById("menuBtn");
    const sideMenu = document.getElementById("sideMenu");
    const menuOverlay = document.getElementById("menuOverlay");
    const mainContent = document.getElementById("mainContent");

    menuBtn.addEventListener("click", toggleMenu);
    menuOverlay.addEventListener("click", toggleMenu);

    function toggleMenu() {
        sideMenu.classList.toggle("-translate-x-full");
        menuOverlay.classList.toggle("hidden");

        if (!sideMenu.classList.contains("-translate-x-full")) {
            menuBtn.textContent = "✕";
            mainContent.classList.add("ml-64");
        } else {
            menuBtn.textContent = "☰";
            mainContent.classList.remove("ml-64");
        }
    }

    // ---------- Variables ----------
    const API_URL = "https://pokeapi.co/api/v2/pokemon?limit=1025";
    const searchInput = document.getElementById("searchPokemon");
    const statusEl = document.getElementById("codexStatus");
    const errorEl = document.getElementById("codexError");
    const pokedexGrid = document.getElementById("pokedexGrid");

    let allPokemons = [];
    const PAGE_SIZE = 20;
    let currentPage = 1;

    // ---------- Debounce ----------
    function debounce(fn, delay = 200) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    }

    // ---------- Fetch Pokémon ----------
    async function fetchPokemons() {
        try {
            statusEl.textContent = "Chargement des Pokémon...";
            errorEl.textContent = "";

            const listRes = await fetch(API_URL);
            if (!listRes.ok) throw new Error("Impossible de récupérer la liste.");

            const listData = await listRes.json();

            const detailsPromises = listData.results.map(p =>
                fetch(p.url).then(res => {
                    if (!res.ok) throw new Error("Erreur de détails pour " + p.name);
                    return res.json();
                })
            );

            const details = await Promise.all(detailsPromises);

            allPokemons = details.map(d => ({
                id: d.id,
                name: d.name,
                sprite: d.sprites?.other?.["official-artwork"]?.front_default
                    || d.sprites?.front_default
                    || "",
                types: d.types.map(t => t.type.name)
            }));

            statusEl.textContent = "";

            const savedSearch = localStorage.getItem("pokedexSearch");
            if (savedSearch) {
                searchInput.value = savedSearch;
                currentPage = 1;
                renderPokemons(filterPokemons(savedSearch), currentPage);
            } else {
                currentPage = 1;
                renderPokemons(allPokemons, currentPage);
            }
        } catch (err) {
            console.error(err);
            statusEl.textContent = "";
            errorEl.textContent = "Une erreur est survenue : " + err.message;
        }
    }

    // ---------- Render Pokémon ----------
    async function renderPokemons(list, page = 1) {
        // On ne vide le grid que si c'est la première page
        if (page === 1) {
            pokedexGrid.innerHTML = "";
        }

        if (!list.length) {
            pokedexGrid.innerHTML = "<p class='text-gray-500'>Aucun Pokémon trouvé.</p>";
            return;
        }

        const start = (page - 1) * PAGE_SIZE;
        const end = page * PAGE_SIZE;
        const paginatedList = list.slice(start, end);

        for (const p of paginatedList) {
            let frenchName;
            try {
                frenchName = await getFrenchName(p.id);
            } catch {
                frenchName = null;
            }

            const card = document.createElement("div");
            card.className = "bg-sky-200 rounded-lg shadow-md p-2 flex flex-col items-center cursor-pointer hover:scale-105 transition-transform";

            const img = document.createElement("img");
            img.src = p.sprite || "";
            img.alt = p.name;
            img.className = "w-24 h-24 object-contain mb-2";
            img.addEventListener("click", () => afficherDetailsPokemon(p));

            const name = document.createElement("div");
            name.className = "font-bold text-lg capitalize mb-1";
            name.textContent = (frenchName ? frenchName : p.name).toUpperCase();

            const id = document.createElement("div");
            id.className = "text-gray-500 text-sm";
            id.textContent = "#" + p.id.toString().padStart(3, "0");

            const types = document.createElement("div");
            types.className = "text-gray-700 text-sm mt-1 capitalize";
            types.textContent = "Types: " + p.types.join(", ");

            card.appendChild(img);
            card.appendChild(name);
            card.appendChild(id);
            card.appendChild(types);

            pokedexGrid.appendChild(card);
        }

        // ---------- Load More ----------
        let loadMoreBtn = document.getElementById("loadMoreBtn");
        if (end < list.length) {
            if (!loadMoreBtn) {
                loadMoreBtn = document.createElement("button");
                loadMoreBtn.id = "loadMoreBtn";
                loadMoreBtn.textContent = "Load More";
                loadMoreBtn.className = "mt-4 block bg-slate-500 hover:bg-slate-200 text-black font-bold py-2 px-4 rounded cursor-pointer mx-auto";
                loadMoreBtn.addEventListener("click", () => {
                    currentPage++;
                    renderPokemons(list, currentPage);
                });
                pokedexGrid.parentNode.appendChild(loadMoreBtn);
            }
        } else {
            if (loadMoreBtn) loadMoreBtn.remove();
        }
    }


    // ---------- Filter ----------
    function filterPokemons(query) {
        const q = query.trim().toLowerCase();
        if (!q) return allPokemons;
        return allPokemons.filter(p =>
            p.name.toLowerCase().includes(q) || String(p.id) === q
        );
    }

    const onSearch = debounce(() => {
        const q = searchInput.value;
        localStorage.setItem("pokedexSearch", q);
        currentPage = 1;
        renderPokemons(filterPokemons(q), currentPage);
    }, 150);

    searchInput.addEventListener("input", onSearch);

    // ---------- Modal ----------
    const modal = document.getElementById("Poke-modal");
    const modalPoster = document.getElementById("Poke-poster");
    const modalTitle = document.getElementById("Poke-title");
    const modalId = document.getElementById("modal-id");
    const modalTypes = document.getElementById("modal-types");
    const modalDescription = document.getElementById("modal-description");
    const modalClose = document.getElementById("close-modal");

    modalClose.addEventListener("click", () => modal.classList.add("hidden"));
    modal.addEventListener("click", e => {
        if (e.target === modal) modal.classList.add("hidden");
    });

    async function afficherDetailsPokemon(p) {
        const frenchName = await getFrenchName(p.id);
        const descFr = await getFrenchDescription(p.id);
        modalPoster.src = p.sprite;
        modalTitle.textContent = frenchName ? frenchName.toUpperCase() : p.name.toUpperCase();
        modalId.textContent = "ID: #" + p.id.toString().padStart(3, "0");
        modalTypes.textContent = "Types: " + p.types.join(", ");
        modalDescription.textContent = descFr ? descFr : "Description non disponible.";

        modal.classList.remove("hidden");
    }

    // ---------- Fetch nom en FR ----------
    async function getFrenchName(pokemonId) {
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
            const data = await res.json();
            const frenchNameObj = data.names.find(n => n.language.name === "fr");
            return frenchNameObj ? frenchNameObj.name : null;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    // ---------- Description en FR ----------
    async function getFrenchDescription(pokemonId) {
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
            if (!res.ok) throw new Error("Impossible de récupérer la description.");
            const data = await res.json();
            const frenchEntry = data.flavor_text_entries.find(entry => entry.language.name === "fr");
            return frenchEntry ? frenchEntry.flavor_text.replace(/\n|\f/g, " ") : "Description non disponible.";
        } catch (err) {
            console.error(err);
            return "Description non disponible.";
        }
    }

    // ---------- Launch ----------
    fetchPokemons();
});
