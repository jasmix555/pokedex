export type PokemonType =
  | 'normal'
  | 'fire'
  | 'water'
  | 'electric'
  | 'grass'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy'

export interface PokemonStat {
  name: string
  value: number
}

export interface EvolutionNode {
  name: string
  id: number
}


export interface Pokemon {
  id: number
  name: string
  image: string
  sprite?: string
  femaleSprite?: string | null
  shinySprite?: string | null       // add
  shinyFemaleSprite?: string | null // add
  types: PokemonType[]
  stats: PokemonStat[]
  evolvesFrom?: EvolutionNode | null
  evolutions?: EvolutionNode[]
}