// Tyradex data helpers

const TYRADEX_API = 'https://tyradex.app/api/v1';

export function translateType(type) {
    return type;
}

function toTitleCase(value) {
    return value
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

export function getPokemonFormLabel(pokemonName) {
    if (!pokemonName?.includes('-')) {
        return '';
    }

    const tokens = pokemonName.split('-').slice(1);
    if (tokens.length === 0) {
        return '';
    }

    return tokens.map(toTitleCase).join(' ');
}

function parseMetricValue(rawValue) {
    if (!rawValue || typeof rawValue !== 'string') {
        return null;
    }

    const normalized = rawValue.replace(',', '.').match(/[\d.]+/);
    return normalized ? Number.parseFloat(normalized[0]) : null;
}

function formatGeneration(value) {
    return Number.isFinite(value) ? `Generation ${value}` : null;
}

function formatSex(sexe) {
    if (!sexe) {
        return null;
    }

    return {
        male: sexe.male ?? null,
        female: sexe.female ?? null
    };
}

function mapStats(stats) {
    if (!stats) {
        return [];
    }

    return [
        { name: 'hp', value: stats.hp },
        { name: 'attack', value: stats.atk },
        { name: 'defense', value: stats.def },
        { name: 'special-attack', value: stats.spe_atk },
        { name: 'special-defense', value: stats.spe_def },
        { name: 'speed', value: stats.vit }
    ].filter((stat) => Number.isFinite(stat.value));
}

function getSpriteFromId(pokedexId) {
    if (!Number.isFinite(pokedexId)) {
        return '';
    }

    return `https://raw.githubusercontent.com/Yarkis01/TyraDex/images/sprites/${pokedexId}/regular.png`;
}

function getFallbackSlug(entry) {
    return (entry.name?.en || entry.name?.fr || `pokemon-${entry.pokedex_id}`).toLowerCase();
}

function toArray(value) {
    if (Array.isArray(value)) {
        return value;
    }

    return value ? [value] : [];
}

function mapEvolutions(pokemon) {
    const evolution = pokemon.evolution;
    if (!evolution) {
        return [];
    }

    const nextEvolutions = toArray(evolution.next);
    if (nextEvolutions.length > 0) {
        return nextEvolutions
            .filter((entry) => Number.isFinite(entry?.pokedex_id))
            .map((entry) => ({
                id: entry.pokedex_id,
                slug: (entry.name || `pokemon-${entry.pokedex_id}`).toLowerCase(),
                name: entry.name || `Pokemon ${entry.pokedex_id}`,
                sprite: getSpriteFromId(entry.pokedex_id),
                details: entry.condition ? [entry.condition] : []
            }));
    }

    const previousEvolutions = toArray(evolution.pre);
    return previousEvolutions
        .filter((entry) => Number.isFinite(entry?.pokedex_id))
        .map((entry) => ({
            id: entry.pokedex_id,
            slug: (entry.name || `pokemon-${entry.pokedex_id}`).toLowerCase(),
            name: entry.name || `Pokemon ${entry.pokedex_id}`,
            sprite: getSpriteFromId(entry.pokedex_id),
            details: entry.condition ? [entry.condition] : []
        }));
}

function mapAlternativeForms(formes) {
    const formsArray = toArray(formes);
    return formsArray
        .map((form) => ({
            id: Number.isFinite(form?.pokedex_id) ? form.pokedex_id : null,
            slug: (form.name?.en || form.name?.fr || form.region || `pokemon-form`).toLowerCase(),
            name: form.name?.fr || form.name?.en || form.region || 'Forme inconnue',
            region: form.region || null,
            sprite: form.sprites?.regular
                || (Number.isFinite(form?.pokedex_id) ? getSpriteFromId(form.pokedex_id) : ''),
            types: (form.types || []).map((type) => type.name)
        }));
}

function mapMegaEvolutions(pokemon) {
    const megaEvolutions = toArray(pokemon.evolution?.mega);
    const baseName = pokemon.name?.fr || pokemon.name?.en || 'Pokemon';

    return megaEvolutions.map((megaEvolution, index) => {
        const megaLabel = megaEvolution.orbe?.match(/\b([XY])\b/i)?.[1]?.toUpperCase();

        return {
            key: `${pokemon.pokedex_id}-mega-${index}`,
            name: megaLabel ? `${baseName} Mega-${megaLabel}` : `${baseName} Mega`,
            orb: megaEvolution.orbe || null,
            sprite: megaEvolution.sprites?.regular || '',
            shinySprite: megaEvolution.sprites?.shiny || ''
        };
    });
}

function mapListPokemon(entry) {
    const id = entry.pokedex_id;
    const displayName = entry.name?.fr || entry.name?.en || `Pokemon ${id}`;
    const slug = getFallbackSlug(entry);

    return {
        id,
        slug,
        name: displayName,
        nameFr: entry.name?.fr || displayName,
        nameEn: entry.name?.en || displayName,
        sprite: entry.sprites?.regular || getSpriteFromId(id),
        types: (entry.types || []).map((type) => type.name),
        generation: formatGeneration(entry.generation),
        category: entry.category || null
    };
}

export async function fetchAllPokemons() {
    const response = await fetch(`${TYRADEX_API}/pokemon`);
    if (!response.ok) {
        throw new Error('Impossible de récupérer la liste Tyradex.');
    }

    const allPokemons = await response.json();
    return allPokemons
        .filter((entry) => Number.isFinite(entry?.pokedex_id) && entry.pokedex_id > 0)
        .map(mapListPokemon);
}

export async function getPokemonFullDetails(pokemonId) {
    const response = await fetch(`${TYRADEX_API}/pokemon/${pokemonId}`);
    if (!response.ok) {
        throw new Error('Erreur lors de la récupération des détails du Pokémon.');
    }

    const pokemon = await response.json();
    const abilities = (pokemon.talents || []).map((talent) => ({
        name: talent.name,
        isHidden: Boolean(talent.tc)
    }));

    const height = parseMetricValue(pokemon.height);
    const weight = parseMetricValue(pokemon.weight);
    const displayName = pokemon.name?.fr || pokemon.name?.en || `Pokemon ${pokemon.pokedex_id}`;

    return {
        id: pokemon.pokedex_id,
        slug: getFallbackSlug(pokemon),
        name: displayName,
        nameFr: pokemon.name?.fr || displayName,
        nameEn: pokemon.name?.en || displayName,
        category: pokemon.category || null,
        description: pokemon.category || 'Description non disponible.',
        sprite: pokemon.sprites?.regular || getSpriteFromId(pokemon.pokedex_id),
        shinySprite: pokemon.sprites?.shiny || null,
        gmaxSprite: pokemon.sprites?.gmax || null,
        types: (pokemon.types || []).map((type) => type.name),
        height,
        weight,
        abilities,
        stats: mapStats(pokemon.stats),
        resistances: (pokemon.resistances || []).map((resistance) => ({
            name: resistance.name,
            multiplier: resistance.multiplier
        })),
        generation: formatGeneration(pokemon.generation),
        captureRate: pokemon.catch_rate,
        eggGroups: Array.isArray(pokemon.egg_groups) ? pokemon.egg_groups.join(', ') : null,
        sex: formatSex(pokemon.sexe),
        level100: pokemon.level_100 ?? null,
        evolutions: mapEvolutions(pokemon),
        megaEvolutions: mapMegaEvolutions(pokemon),
        alternativeForms: mapAlternativeForms(pokemon.formes)
    };
}
