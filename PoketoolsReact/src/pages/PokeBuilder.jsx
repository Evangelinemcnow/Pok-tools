import { useEffect, useMemo, useState } from 'react';
import { usePokemon } from '../hooks/usePokemon';
import { getPokemonFullDetails } from '../utils/pokemon';

const SLOT_COUNT = 6;
const MOVE_SLOTS = 4;
const STORAGE_KEY = 'pokeBuilderTeamV1';

const TYPE_LABELS = {
    normal: 'Normal',
    fire: 'Feu',
    water: 'Eau',
    electric: 'Electrik',
    grass: 'Plante',
    ice: 'Glace',
    fighting: 'Combat',
    poison: 'Poison',
    ground: 'Sol',
    flying: 'Vol',
    psychic: 'Psy',
    bug: 'Insecte',
    rock: 'Roche',
    ghost: 'Spectre',
    dragon: 'Dragon',
    dark: 'Tenebres',
    steel: 'Acier',
    fairy: 'Fee'
};

const TYPE_KEYS = Object.keys(TYPE_LABELS);

const TYPE_ALIASES = {
    normal: 'normal',
    feu: 'fire',
    fire: 'fire',
    eau: 'water',
    water: 'water',
    electrik: 'electric',
    electric: 'electric',
    plante: 'grass',
    grass: 'grass',
    glace: 'ice',
    ice: 'ice',
    combat: 'fighting',
    fighting: 'fighting',
    poison: 'poison',
    sol: 'ground',
    ground: 'ground',
    vol: 'flying',
    flying: 'flying',
    psy: 'psychic',
    psychic: 'psychic',
    insecte: 'bug',
    bug: 'bug',
    roche: 'rock',
    rock: 'rock',
    spectre: 'ghost',
    ghost: 'ghost',
    dragon: 'dragon',
    tenebres: 'dark',
    dark: 'dark',
    acier: 'steel',
    steel: 'steel',
    fee: 'fairy',
    fairy: 'fairy'
};

const TYPE_CHART = {
    normal: { rock: 0.5, ghost: 0, steel: 0.5 },
    fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
    water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
    electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
    grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
    ice: { fire: 0.5, water: 0.5, grass: 2, ground: 2, flying: 2, dragon: 2, steel: 0.5, ice: 0.5 },
    fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
    poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
    ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
    flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
    psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
    bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
    rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
    ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
    dragon: { dragon: 2, steel: 0.5, fairy: 0 },
    dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
    steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
    fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

function normalizeTypeName(typeValue) {
    if (!typeValue) {
        return null;
    }

    const sanitized = typeValue
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    return TYPE_ALIASES[sanitized] || null;
}

function getTypeEffectiveness(attackType, defendType) {
    return TYPE_CHART[attackType]?.[defendType] ?? 1;
}

function createEmptySlot() {
    return {
        pokemonId: '',
        ability: '',
        item: '',
        moveTypes: Array(MOVE_SLOTS).fill('')
    };
}

function parseGeneration(generationText) {
    const value = Number.parseInt(String(generationText || '').replace(/\D/g, ''), 10);
    return Number.isFinite(value) ? value : null;
}

export default function PokeBuilder() {
    const { allPokemons, loading, error } = usePokemon();
    const [teamSlots, setTeamSlots] = useState(() => Array.from({ length: SLOT_COUNT }, createEmptySlot));
    const [pokemonDetailsById, setPokemonDetailsById] = useState({});
    const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
    const [selectedGenerationFilter, setSelectedGenerationFilter] = useState('all');

    const sortedPokemons = useMemo(
        () => [...allPokemons].sort((a, b) => a.id - b.id),
        [allPokemons]
    );

    const generationOptions = useMemo(() => {
        const allGenerations = new Set();

        for (const pokemon of sortedPokemons) {
            const generation = parseGeneration(pokemon.generation);
            if (generation !== null) {
                allGenerations.add(generation);
            }
        }

        return Array.from(allGenerations).sort((a, b) => a - b);
    }, [sortedPokemons]);

    const filteredPokemonOptions = useMemo(() => {
        return sortedPokemons.filter((pokemon) => {
            if (selectedTypeFilter !== 'all') {
                const normalizedTypes = (pokemon.types || []).map(normalizeTypeName).filter(Boolean);
                if (!normalizedTypes.includes(selectedTypeFilter)) {
                    return false;
                }
            }

            if (selectedGenerationFilter !== 'all') {
                const generation = parseGeneration(pokemon.generation);
                if (String(generation) !== selectedGenerationFilter) {
                    return false;
                }
            }

            return true;
        });
    }, [selectedGenerationFilter, selectedTypeFilter, sortedPokemons]);

    const teamMembers = useMemo(() => {
        return teamSlots
            .map((slot, index) => {
                const pokemonId = Number.parseInt(slot.pokemonId, 10);
                if (!Number.isFinite(pokemonId)) {
                    return null;
                }

                const pokemon = sortedPokemons.find((entry) => entry.id === pokemonId);
                if (!pokemon) {
                    return null;
                }

                return {
                    slotIndex: index,
                    slot,
                    pokemon,
                    details: pokemonDetailsById[pokemonId] || null
                };
            })
            .filter(Boolean);
    }, [teamSlots, sortedPokemons, pokemonDetailsById]);

    useEffect(() => {
        let cancelled = false;

        async function hydrateDetails() {
            const idsToLoad = teamSlots
                .map((slot) => Number.parseInt(slot.pokemonId, 10))
                .filter((id) => Number.isFinite(id) && !pokemonDetailsById[id]);

            if (idsToLoad.length === 0) {
                return;
            }

            for (const pokemonId of idsToLoad) {
                try {
                    const details = await getPokemonFullDetails(pokemonId);
                    if (cancelled) {
                        return;
                    }

                    setPokemonDetailsById((previous) => ({
                        ...previous,
                        [pokemonId]: details
                    }));
                } catch (loadError) {
                    console.error('Error loading details for builder slot:', loadError);
                }
            }
        }

        hydrateDetails();

        return () => {
            cancelled = true;
        };
    }, [teamSlots, pokemonDetailsById]);

    const defensiveMatrix = useMemo(() => {
        return TYPE_KEYS.map((attackType) => {
            let weak = 0;
            let resist = 0;
            let immune = 0;
            let neutral = 0;

            for (const member of teamMembers) {
                const normalizedTypes = (member.pokemon.types || [])
                    .map(normalizeTypeName)
                    .filter(Boolean);

                if (normalizedTypes.length === 0) {
                    continue;
                }

                const multiplier = normalizedTypes.reduce(
                    (value, defendType) => value * getTypeEffectiveness(attackType, defendType),
                    1
                );

                if (multiplier === 0) {
                    immune += 1;
                } else if (multiplier > 1) {
                    weak += 1;
                } else if (multiplier < 1) {
                    resist += 1;
                } else {
                    neutral += 1;
                }
            }

            return {
                attackType,
                weak,
                resist,
                immune,
                neutral
            };
        });
    }, [teamMembers]);

    const offensiveCoverage = useMemo(() => {
        const selectedMoveTypes = teamMembers
            .flatMap((member) => member.slot.moveTypes)
            .map(normalizeTypeName)
            .filter(Boolean);

        return TYPE_KEYS.map((defendType) => {
            if (selectedMoveTypes.length === 0) {
                return {
                    defendType,
                    bestMultiplier: 1,
                    covered: false
                };
            }

            const bestMultiplier = selectedMoveTypes.reduce((best, attackType) => {
                const currentMultiplier = getTypeEffectiveness(attackType, defendType);
                return Math.max(best, currentMultiplier);
            }, 0);

            return {
                defendType,
                bestMultiplier,
                covered: bestMultiplier > 1
            };
        });
    }, [teamMembers]);

    const missingCoverageTypes = useMemo(
        () => offensiveCoverage.filter((entry) => !entry.covered).map((entry) => entry.defendType),
        [offensiveCoverage]
    );

    const handleSlotChange = (slotIndex, field, value) => {
        setTeamSlots((previous) => {
            const updated = [...previous];
            const currentSlot = { ...updated[slotIndex] };

            if (field === 'pokemonId') {
                currentSlot.pokemonId = value;
                currentSlot.ability = '';
            } else {
                currentSlot[field] = value;
            }

            updated[slotIndex] = currentSlot;
            return updated;
        });
    };

    const handleMoveTypeChange = (slotIndex, moveIndex, value) => {
        setTeamSlots((previous) => {
            const updated = [...previous];
            const currentSlot = { ...updated[slotIndex] };
            const currentMoveTypes = [...currentSlot.moveTypes];
            currentMoveTypes[moveIndex] = value;
            currentSlot.moveTypes = currentMoveTypes;
            updated[slotIndex] = currentSlot;
            return updated;
        });
    };

    const saveTeam = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(teamSlots));
    };

    const loadTeam = () => {
        const rawValue = localStorage.getItem(STORAGE_KEY);
        if (!rawValue) {
            return;
        }

        try {
            const parsed = JSON.parse(rawValue);
            if (!Array.isArray(parsed)) {
                return;
            }

            const sanitized = Array.from({ length: SLOT_COUNT }, (_, index) => {
                const candidate = parsed[index];
                if (!candidate) {
                    return createEmptySlot();
                }

                return {
                    pokemonId: candidate.pokemonId || '',
                    ability: candidate.ability || '',
                    item: candidate.item || '',
                    moveTypes: Array.from({ length: MOVE_SLOTS }, (_, moveIndex) => candidate.moveTypes?.[moveIndex] || '')
                };
            });

            setTeamSlots(sanitized);
        } catch (parseError) {
            console.error('Failed to parse saved team:', parseError);
        }
    };

    const resetTeam = () => {
        setTeamSlots(Array.from({ length: SLOT_COUNT }, createEmptySlot));
    };

    const baseSelectClassName =
        'pokebuilder-select rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500';

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 text-slate-100">
            <div className="rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 p-6 shadow-[0_20px_50px_rgba(2,12,27,0.4)]">
                <h2 className="text-3xl font-black tracking-tight text-sky-200">PokeBuilder</h2>
                <p className="mt-2 max-w-3xl text-sm text-slate-300">
                    Cree ton equipe de 6 Pokemon avec un set rapide (talent, item, types de moves), puis analyse les points faibles defensifs
                    et la couverture offensive de ton equipe.
                </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                <section className="space-y-4 rounded-3xl border border-slate-700 bg-slate-900/80 p-5 shadow-[0_20px_50px_rgba(2,12,27,0.35)]">
                    <div className="flex flex-wrap items-end gap-3">
                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Filtre Type</label>
                            <select
                                value={selectedTypeFilter}
                                onChange={(event) => setSelectedTypeFilter(event.target.value)}
                                className={baseSelectClassName}
                            >
                                <option value="all">Tous les types</option>
                                {TYPE_KEYS.map((typeKey) => (
                                    <option key={`type-filter-${typeKey}`} value={typeKey}>{TYPE_LABELS[typeKey]}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Filtre Generation</label>
                            <select
                                value={selectedGenerationFilter}
                                onChange={(event) => setSelectedGenerationFilter(event.target.value)}
                                className={baseSelectClassName}
                            >
                                <option value="all">Toutes</option>
                                {generationOptions.map((generation) => (
                                    <option key={`gen-filter-${generation}`} value={String(generation)}>{`Gen ${generation}`}</option>
                                ))}
                            </select>
                        </div>

                        <button onClick={saveTeam} className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600">Sauvegarder</button>
                        <button onClick={loadTeam} className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600">Charger</button>
                        <button onClick={resetTeam} className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600">Reset</button>
                    </div>

                    {loading && <p className="text-sm text-slate-400">Chargement des donnees Pokemon...</p>}
                    {error && <p className="text-sm text-red-400">{error}</p>}

                    <div className="grid gap-4 md:grid-cols-2">
                        {teamSlots.map((slot, slotIndex) => {
                            const pokemonId = Number.parseInt(slot.pokemonId, 10);
                            const selectedPokemon = Number.isFinite(pokemonId)
                                ? sortedPokemons.find((entry) => entry.id === pokemonId)
                                : null;
                            const selectedDetails = Number.isFinite(pokemonId) ? pokemonDetailsById[pokemonId] : null;
                            const availableAbilities = selectedDetails?.abilities || [];

                            return (
                                <article key={`slot-${slotIndex}`} className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Slot {slotIndex + 1}</p>

                                    <label className="mb-1 block text-xs text-slate-400">Pokemon</label>
                                    <select
                                        value={slot.pokemonId}
                                        onChange={(event) => handleSlotChange(slotIndex, 'pokemonId', event.target.value)}
                                        className={`${baseSelectClassName} mb-3 w-full`}
                                    >
                                        <option value="">Choisir un Pokemon</option>
                                        {filteredPokemonOptions.map((pokemon) => (
                                            <option key={`slot-${slotIndex}-pokemon-${pokemon.id}`} value={String(pokemon.id)}>
                                                #{String(pokemon.id).padStart(3, '0')} - {pokemon.name}
                                            </option>
                                        ))}
                                    </select>

                                    {selectedPokemon && (
                                        <div className="mb-3 flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900/80 p-2">
                                            <img src={selectedPokemon.sprite} alt={selectedPokemon.name} className="h-16 w-16 rounded-md bg-slate-800 object-contain p-1" />
                                            <div>
                                                <p className="font-semibold text-slate-100">{selectedPokemon.name}</p>
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {(selectedPokemon.types || []).map((typeName) => (
                                                        <span key={`slot-${slotIndex}-type-${typeName}`} className="rounded-full bg-sky-900 px-2 py-0.5 text-xs text-sky-200">
                                                            {typeName}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <label className="mb-1 block text-xs text-slate-400">Talent</label>
                                    <select
                                        value={slot.ability}
                                        onChange={(event) => handleSlotChange(slotIndex, 'ability', event.target.value)}
                                        className={`${baseSelectClassName} mb-3 w-full disabled:bg-slate-200 disabled:text-slate-500`}
                                        disabled={availableAbilities.length === 0}
                                    >
                                        <option value="">Choisir un talent</option>
                                        {availableAbilities.map((ability) => (
                                            <option key={`slot-${slotIndex}-ability-${ability.name}`} value={ability.name}>
                                                {ability.name}{ability.isHidden ? ' (Cachee)' : ''}
                                            </option>
                                        ))}
                                    </select>

                                    <label className="mb-1 block text-xs text-slate-400">Item</label>
                                    <input
                                        value={slot.item}
                                        onChange={(event) => handleSlotChange(slotIndex, 'item', event.target.value)}
                                        placeholder="Ex: Restes"
                                        className="mb-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    />

                                    <p className="mb-1 text-xs text-slate-400">Types de moves (x4)</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {slot.moveTypes.map((moveType, moveIndex) => (
                                            <select
                                                key={`slot-${slotIndex}-move-${moveIndex}`}
                                                value={moveType}
                                                onChange={(event) => handleMoveTypeChange(slotIndex, moveIndex, event.target.value)}
                                                className="pokebuilder-select w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                            >
                                                <option value="">Move {moveIndex + 1}</option>
                                                {TYPE_KEYS.map((typeKey) => (
                                                    <option key={`slot-${slotIndex}-move-${moveIndex}-type-${typeKey}`} value={typeKey}>
                                                        {TYPE_LABELS[typeKey]}
                                                    </option>
                                                ))}
                                            </select>
                                        ))}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>

                <section className="space-y-4 rounded-3xl border border-slate-700 bg-slate-900/80 p-5 shadow-[0_20px_50px_rgba(2,12,27,0.35)]">
                    <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
                        <h3 className="text-lg font-bold text-sky-200">Team Defence</h3>
                        <p className="mt-1 text-xs text-slate-400">Pour chaque type offensif, nombre de Pokemon faibles, resistants et immunises.</p>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            {defensiveMatrix.map((entry) => (
                                <div key={`defense-${entry.attackType}`} className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-2">
                                    <p className="font-semibold text-slate-100">{TYPE_LABELS[entry.attackType]}</p>
                                    <p className="text-red-300">Weak: {entry.weak}</p>
                                    <p className="text-emerald-300">Resist: {entry.resist}</p>
                                    <p className="text-sky-300">Immune: {entry.immune}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
                        <h3 className="text-lg font-bold text-sky-200">Team Type Coverage</h3>
                        <p className="mt-1 text-xs text-slate-400">Meilleur multiplicateur obtenu avec les types de moves choisis.</p>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            {offensiveCoverage.map((entry) => (
                                <div key={`coverage-${entry.defendType}`} className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-2">
                                    <p className="font-semibold text-slate-100">{TYPE_LABELS[entry.defendType]}</p>
                                    <p className={entry.covered ? 'text-emerald-300' : 'text-amber-300'}>
                                        {entry.covered ? 'Covered' : 'No super-effective'}
                                    </p>
                                    <p className="text-slate-300">Best: x{entry.bestMultiplier}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/80 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Gaps principaux</p>
                            <p className="mt-1 text-sm text-slate-200">
                                {missingCoverageTypes.length > 0
                                    ? missingCoverageTypes.map((typeKey) => TYPE_LABELS[typeKey]).join(', ')
                                    : 'Aucun gap majeur detecte avec les moves renseignes.'}
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
