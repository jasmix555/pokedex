export type Language = 'en' | 'jp'

export const translations: Record<Language, Record<string, string>> = {
  en: {
    'pokedex': 'Pokédex',
    'browse': 'Browse Pokémon from the PokeAPI',
    'search': 'Search Pokémon...',
    'no-results': 'No Pokémon found',
    'similar-finds': 'Similar Finds',
    'does-not-evolve': 'This Pokémon does not evolve',
    'view-details': 'View details, stats, and the evolution path for this Pokémon.',
    'stats': 'Stats',
    'evolution': 'Evolution',
    'loading': 'Loading...',
    'current': 'Current',
    'language': 'Language',
  },
  jp: {
    'pokedex': 'ポケモン図鑑',
    'browse': 'PokeAPI からポケモンを閲覧します',
    'search': 'ポケモンを検索...',
    'no-results': 'ポケモンが見つかりません',
    'similar-finds': '類似する検索結果',
    'does-not-evolve': 'このポケモンは進化しません',
    'view-details': 'このポケモンの詳細、ステータス、進化経路を表示します。',
    'stats': 'ステータス',
    'evolution': '進化',
    'loading': 'ロード中...',
    'current': '現在',
    'language': '言語',
  },
}

export function t(key: string, language: Language): string {
  return translations[language][key] || translations.en[key] || key
}
