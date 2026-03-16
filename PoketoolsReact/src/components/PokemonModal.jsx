import { useEffect } from 'react';
import { translateType, getPokemonFormLabel } from '../utils/pokemon';

const statNames = {
    hp: 'PV',
    attack: 'Attaque',
    defense: 'Défense',
    'special-attack': 'Atq. Spé.',
    'special-defense': 'Déf. Spé.',
    speed: 'Vitesse'
};

const STAT_BAR_STYLES = {
    hp: { backgroundColor: '#8dd86a', borderColor: '#2f4f2f' },
    attack: { backgroundColor: '#f3e37c', borderColor: '#6b5f14' },
    defense: { backgroundColor: '#f5b277', borderColor: '#7a4d20' },
    'special-attack': { backgroundColor: '#82cfd6', borderColor: '#28565c' },
    'special-defense': { backgroundColor: '#8aa2e0', borderColor: '#314a87' },
    speed: { backgroundColor: '#bc83de', borderColor: '#5a2f73' }
};

const STAT_LEVELS = [50, 100];

function hasItems(list) {
    return Array.isArray(list) && list.length > 0;
}

function getResistanceTone(multiplier) {
    if (multiplier > 1) {
        return 'bg-red-700 text-white';
    }

    if (multiplier < 1) {
        return 'bg-emerald-700 text-white';
    }

    return 'bg-gray-700 text-gray-200';
}

function handleEvolutionSpriteError(event) {
    event.currentTarget.style.display = 'none';
}

function getFormKey(form) {
    return form.id ?? `${form.slug}-${form.region ?? 'default'}`;
}

function getMegaKey(megaEvolution) {
    return megaEvolution.key ?? megaEvolution.orb ?? megaEvolution.name;
}

function formatRegionLabel(region) {
    if (!region) {
        return '';
    }

    return region.charAt(0).toUpperCase() + region.slice(1);
}

function getStatBarStyle(statName) {
    return STAT_BAR_STYLES[statName] || { backgroundColor: '#60a5fa', borderColor: '#1d4ed8' };
}

function calculateHpStat(baseStat, level, iv = 31, ev = 0) {
    return Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
}

function calculateOtherStat(baseStat, level, nature = 1, iv = 31, ev = 0) {
    const rawStat = Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100) + 5;
    return Math.floor(rawStat * nature);
}

function getCalculatedStatRanges(stat) {
    if (stat.name === 'hp') {
        return STAT_LEVELS.map((level) => ({
            level,
            minMinus: calculateHpStat(stat.value, level, 31, 0),
            min: null,
            max: calculateHpStat(stat.value, level, 31, 252),
            maxPlus: null
        }));
    }

    return STAT_LEVELS.map((level) => ({
        level,
        minMinus: calculateOtherStat(stat.value, level, 0.9, 31, 0),
        min: calculateOtherStat(stat.value, level, 1, 31, 0),
        max: calculateOtherStat(stat.value, level, 1, 31, 252),
        maxPlus: calculateOtherStat(stat.value, level, 1.1, 31, 252)
    }));
}

function formatCalculatedValue(value) {
    return value == null ? '—' : value;
}

function getBaseStatAverage(stats) {
    if (!hasItems(stats)) {
        return null;
    }

    const total = stats.reduce((sum, stat) => sum + stat.value, 0);
    return (total / stats.length).toFixed(2).replace('.', ',');
}

export default function PokemonModal({ pokemon, onClose }) {
    const formLabel = getPokemonFormLabel(pokemon.slug);
    const baseStatTotal = hasItems(pokemon.stats)
        ? pokemon.stats.reduce((sum, stat) => sum + stat.value, 0)
        : null;
    const baseStatAverage = getBaseStatAverage(pokemon.stats);

    // Fermer le modal avec la touche Échap
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 bg-slate-700/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-gray-900 text-gray-200 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold cursor-pointer z-10"
                >
                    ×
                </button>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Section Image */}
                    <div className="md:w-1/3 flex-shrink-0">
                        <img
                            src={pokemon.sprite}
                            alt={pokemon.name}
                            className="w-full h-auto object-contain rounded-lg bg-gray-800 p-4"
                        />

                        {pokemon.shinySprite && (
                            <div className="mt-4 rounded-lg bg-gray-800 p-3">
                                <p className="text-sm font-semibold text-gray-400 mb-2">Sprite shiny</p>
                                <img
                                    src={pokemon.shinySprite}
                                    alt={`${pokemon.name} shiny`}
                                    className="mx-auto h-24 w-24 object-contain"
                                />
                            </div>
                        )}

                        <div className="flex gap-2 mt-3 justify-center">
                            {formLabel && (
                                <span className="bg-slate-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                                    Forme: {formLabel}
                                </span>
                            )}
                            {pokemon.generation && (
                                <span className="bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-bold">
                                    {pokemon.generation}
                                </span>
                            )}
                            {pokemon.category && (
                                <span className="bg-gray-700 text-white px-3 py-1 rounded-full text-xs font-bold text-center">
                                    {pokemon.category}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Section Informations */}
                    <div className="flex-1 flex flex-col gap-4">
                        {/* En-tête */}
                        <div>
                            <h2 className="text-3xl font-bold text-white uppercase mb-1">
                                {pokemon.name}
                            </h2>
                            <p className="text-gray-400 text-sm">
                                #{pokemon.id.toString().padStart(3, "0")}
                            </p>
                            <p className="text-gray-500 text-sm">
                                Nom EN: {pokemon.nameEn || pokemon.name}
                            </p>
                        </div>

                        {/* Types */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 mb-2">Types</h3>
                            <div className="flex gap-2">
                                {pokemon.types.map(type => (
                                    <span
                                        key={type}
                                        className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm capitalize"
                                    >
                                        {translateType(type)}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 mb-2">Categorie</h3>
                            <p className="text-gray-200 text-sm leading-relaxed">
                                {pokemon.description}
                            </p>
                        </div>

                        {/* Caractéristiques physiques */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 mb-1">Taille</h3>
                                <p className="text-white text-lg">{pokemon.height ?? 'N/A'} m</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 mb-1">Poids</h3>
                                <p className="text-white text-lg">{pokemon.weight ?? 'N/A'} kg</p>
                            </div>
                        </div>

                        {pokemon.sex && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 mb-1">Male</h3>
                                    <p className="text-white text-lg">{pokemon.sex.male ?? 'N/A'}%</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 mb-1">Femelle</h3>
                                    <p className="text-white text-lg">{pokemon.sex.female ?? 'N/A'}%</p>
                                </div>
                            </div>
                        )}

                        {/* Capacités */}
                        {hasItems(pokemon.abilities) && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 mb-2">Capacités</h3>
                                <div className="flex flex-wrap gap-2">
                                    {pokemon.abilities.map((ability) => (
                                        <span
                                            key={ability.name}
                                            className={`px-3 py-1 rounded-full text-sm ${ability.isHidden
                                                ? 'bg-purple-700 text-white'
                                                : 'bg-gray-700 text-gray-200'
                                                }`}
                                        >
                                            {ability.name}
                                            {ability.isHidden && ' (Cachée)'}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stats */}
                        {hasItems(pokemon.stats) && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 mb-3">Statistiques de Base</h3>
                                <div className="space-y-2">
                                    {pokemon.stats.map((stat) => (
                                        <div key={stat.name}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-300">
                                                    {statNames[stat.name] || stat.name}
                                                </span>
                                                <span className="text-white font-semibold">{stat.value}</span>
                                            </div>
                                            <div className="w-full bg-gray-700 rounded-sm h-4 px-1 flex items-center">
                                                <div
                                                    className="h-3 border transition-all"
                                                    style={{
                                                        ...getStatBarStyle(stat.name),
                                                        width: `${Math.min((stat.value / 255) * 100, 100)}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-5 space-y-3 rounded-2xl border border-slate-700 bg-slate-950/80 p-3 shadow-[0_16px_40px_rgba(0,0,0,0.28)]">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {pokemon.stats.map((stat) => {
                                            const [level50, level100] = getCalculatedStatRanges(stat);

                                            return (
                                                <div key={`calc-${stat.name}`} className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div>
                                                            <p className="text-base font-semibold text-sky-300">{statNames[stat.name] || stat.name}</p>
                                                            <p className="text-sm text-slate-400">Stat de base: <span className="font-bold text-white">{stat.value}</span></p>
                                                        </div>
                                                        <span
                                                            className="inline-block h-4 border rounded-sm"
                                                            style={{
                                                                ...getStatBarStyle(stat.name),
                                                                width: `${Math.max(52, Math.min((stat.value / 255) * 120, 120))}px`
                                                            }}
                                                        ></span>
                                                    </div>

                                                    <div className="mt-3 flex flex-col gap-2">
                                                        <div className="rounded-lg bg-slate-950/70 p-3">
                                                            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300">Niveau 50</p>
                                                            <div className="grid grid-cols-4 gap-1 text-center text-sm">
                                                                <span className="rounded bg-slate-800 px-2 py-1.5 text-slate-400">Min-</span>
                                                                <span className="rounded bg-slate-800 px-2 py-1.5 text-slate-400">Min</span>
                                                                <span className="rounded bg-slate-800 px-2 py-1.5 text-slate-400">Max</span>
                                                                <span className="rounded bg-slate-800 px-2 py-1.5 text-slate-400">Max+</span>
                                                                <span className="rounded bg-slate-900 px-2 py-1.5 text-slate-100">{formatCalculatedValue(level50.minMinus)}</span>
                                                                <span className="rounded bg-slate-900 px-2 py-1.5 text-slate-100">{formatCalculatedValue(level50.min)}</span>
                                                                <span className="rounded bg-slate-900 px-2 py-1.5 text-slate-100">{formatCalculatedValue(level50.max)}</span>
                                                                <span className="rounded bg-sky-950 px-2 py-1.5 font-semibold text-sky-200">{formatCalculatedValue(level50.maxPlus)}</span>
                                                            </div>
                                                        </div>

                                                        <div className="rounded-lg bg-slate-950/70 p-3">
                                                            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300">Niveau 100</p>
                                                            <div className="grid grid-cols-4 gap-1 text-center text-sm">
                                                                <span className="rounded bg-slate-800 px-2 py-1.5 text-slate-400">Min-</span>
                                                                <span className="rounded bg-slate-800 px-2 py-1.5 text-slate-400">Min</span>
                                                                <span className="rounded bg-slate-800 px-2 py-1.5 text-slate-400">Max</span>
                                                                <span className="rounded bg-slate-800 px-2 py-1.5 text-slate-400">Max+</span>
                                                                <span className="rounded bg-slate-900 px-2 py-1.5 text-slate-100">{formatCalculatedValue(level100.minMinus)}</span>
                                                                <span className="rounded bg-slate-900 px-2 py-1.5 text-slate-100">{formatCalculatedValue(level100.min)}</span>
                                                                <span className="rounded bg-slate-900 px-2 py-1.5 text-slate-100">{formatCalculatedValue(level100.max)}</span>
                                                                <span className="rounded bg-sky-950 px-2 py-1.5 font-semibold text-sky-200">{formatCalculatedValue(level100.maxPlus)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {baseStatTotal !== null && (
                                            <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Somme des stats de base</p>
                                                <p className="mt-1 text-2xl font-bold text-sky-300">{baseStatTotal}</p>
                                            </div>
                                        )}

                                        {baseStatAverage !== null && (
                                            <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Moyenne des stats de base</p>
                                                <p className="mt-1 text-2xl font-bold text-sky-300">{baseStatAverage}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 text-xs leading-relaxed text-slate-300">
                                    <p className="font-semibold uppercase tracking-wide text-slate-200">Hypotheses de calcul</p>
                                    <p className="mt-2">• Les colonnes Min-, Min, Max et Max+ suivent l'usage competitif classique avec IV fixes a 31.</p>
                                    <p>• Pour les stats hors PV: Min- = 0 EV avec nature defavorable, Min = 0 EV neutre, Max = 252 EV neutre, Max+ = 252 EV avec nature favorable.</p>
                                    <p>• Pour les PV, la nature n'a pas d'effet: les colonnes non applicables sont laissees vides.</p>
                                </div>
                            </div>
                        )}

                        {/* Évolutions */}
                        {hasItems(pokemon.evolutions) && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 mb-3">Évolutions</h3>
                                <div className="space-y-3">
                                    {pokemon.evolutions.map((evolution) => (
                                        <div key={evolution.id} className="bg-gray-800 rounded-lg p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-16 bg-gray-700 p-2 rounded flex items-center justify-center">
                                                    <img
                                                        src={evolution.sprite}
                                                        alt={evolution.name}
                                                        className="w-16 h-16 object-contain"
                                                        onError={handleEvolutionSpriteError}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-white">
                                                        {evolution.name} <span className="text-gray-400 text-sm">#{evolution.id}</span>
                                                    </p>
                                                    {hasItems(evolution.details) && (
                                                        <ul className="text-xs text-gray-300 mt-1 space-y-1">
                                                            {evolution.details.map((detail) => (
                                                                <li key={detail} className="flex items-center gap-1">
                                                                    <span className="text-blue-400">→</span> {detail}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {hasItems(pokemon.resistances) && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 mb-3">Resistances</h3>
                                <div className="flex flex-wrap gap-2">
                                    {pokemon.resistances.map((resistance) => (
                                        <span
                                            key={`${resistance.name}-${resistance.multiplier}`}
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getResistanceTone(resistance.multiplier)}`}
                                        >
                                            {resistance.name} x{resistance.multiplier}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {hasItems(pokemon.megaEvolutions) && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 mb-3">Méga-Évolutions</h3>
                                <div className="grid gap-3 md:grid-cols-2">
                                    {pokemon.megaEvolutions.map((megaEvolution) => (
                                        <div key={getMegaKey(megaEvolution)} className="rounded-xl border border-slate-700 bg-slate-900/90 p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-semibold text-white">{megaEvolution.name}</p>
                                                    {megaEvolution.orb && (
                                                        <p className="mt-1 text-sm text-sky-300">Orbe: {megaEvolution.orb}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                <div className="rounded-lg bg-slate-950/70 p-3 text-center">
                                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Sprite normal</p>
                                                    {megaEvolution.sprite ? (
                                                        <img
                                                            src={megaEvolution.sprite}
                                                            alt={megaEvolution.name}
                                                            className="mx-auto h-24 w-24 object-contain"
                                                        />
                                                    ) : (
                                                        <p className="text-xs text-slate-500">Non fourni</p>
                                                    )}
                                                </div>

                                                <div className="rounded-lg bg-slate-950/70 p-3 text-center">
                                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Sprite shiny</p>
                                                    {megaEvolution.shinySprite ? (
                                                        <img
                                                            src={megaEvolution.shinySprite}
                                                            alt={`${megaEvolution.name} shiny`}
                                                            className="mx-auto h-24 w-24 object-contain"
                                                        />
                                                    ) : (
                                                        <p className="text-xs text-slate-500">Non fourni</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Stats et talents</p>
                                                <p className="mt-2 text-sm text-slate-300">
                                                    Tyradex fournit ici les sprites et l'orbe de mega-evolution, mais pas les stats ni les talents detailles.
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Formes alternatives */}
                        {hasItems(pokemon.alternativeForms) && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 mb-3">Formes Alternatives</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {pokemon.alternativeForms.map((form) => (
                                        <div
                                            key={getFormKey(form)}
                                            className={`rounded-lg p-3 text-center border ${form.sprite ? 'bg-gray-800 border-gray-700' : 'bg-gray-800/70 border-dashed border-gray-600'}`}
                                        >
                                            <div className="w-full h-24 bg-gray-700 p-2 rounded flex items-center justify-center mb-2 overflow-hidden">
                                                {form.sprite ? (
                                                    <img
                                                        src={form.sprite}
                                                        alt={form.name}
                                                        className="w-20 h-20 object-contain"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1 text-gray-400">
                                                        <span className="text-2xl font-bold">?</span>
                                                        <span className="text-xs">Sprite non fourni</span>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="font-semibold text-white text-xs">{form.name}</p>
                                            {form.region && (
                                                <div className="mt-2">
                                                    <span className="rounded-full bg-slate-700 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-200">
                                                        Region {formatRegionLabel(form.region)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex gap-1 mt-2 justify-center flex-wrap">
                                                {hasItems(form.types) && form.types.map(type => (
                                                    <span
                                                        key={type}
                                                        className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs capitalize"
                                                    >
                                                        {translateType(type)}
                                                    </span>
                                                ))}
                                            </div>
                                            {!hasItems(form.types) && (
                                                <p className="mt-2 text-xs text-gray-500">
                                                    Tyradex ne fournit pas encore les types detailles pour cette forme.
                                                </p>
                                            )}
                                            {!form.id && (
                                                <p className="mt-2 text-[11px] text-gray-500">
                                                    Forme partielle exposee par l'API
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Informations additionnelles */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {pokemon.captureRate !== undefined && (
                                <div>
                                    <h3 className="text-gray-400 mb-1">Taux de capture</h3>
                                    <p className="text-white">{pokemon.captureRate}</p>
                                </div>
                            )}
                            {pokemon.eggGroups && (
                                <div>
                                    <h3 className="text-gray-400 mb-1">Groupe d'œufs</h3>
                                    <p className="text-white">{pokemon.eggGroups}</p>
                                </div>
                            )}
                            {pokemon.level100 !== undefined && pokemon.level100 !== null && (
                                <div>
                                    <h3 className="text-gray-400 mb-1">XP niveau 100</h3>
                                    <p className="text-white">{pokemon.level100}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
