// Utility functions for Pokemon API

const API_URL = "https://pokeapi.co/api/v2/pokemon?limit=1025";

// Helper function to batch process promises
async function batchProcess(items, batchSize, processor) {
    const results = [];
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(processor));
        results.push(...batchResults);
        // Small delay to avoid rate limiting
        if (i + batchSize < items.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    return results;
}

export async function fetchAllPokemons() {
    try {
        const listRes = await fetch(API_URL);
        if (!listRes.ok) throw new Error("Impossible de récupérer la liste.");

        const listData = await listRes.json();

        // Process in batches of 50 to avoid overwhelming the API
        const details = await batchProcess(
            listData.results,
            50,
            async (p) => {
                const res = await fetch(p.url);
                if (!res.ok) throw new Error("Erreur de détails pour " + p.name);
                return res.json();
            }
        );

        return details.map(d => ({
            id: d.id,
            name: d.name,
            sprite: d.sprites?.other?.["official-artwork"]?.front_default
                || d.sprites?.front_default
                || "",
            types: d.types.map(t => t.type.name)
        }));
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function getFrenchName(pokemonId) {
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

export async function getFrenchDescription(pokemonId) {
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
