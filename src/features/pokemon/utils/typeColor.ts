import { PokemonType } from '../types/pokemon.types'

export const TYPE_COLORS: Record<PokemonType, { bg: string; border: string; text: string; hex: string }> = {
  normal: { hex: '#A8A878', bg: 'bg-[#A8A878]', border: 'border-[#A8A878]', text: 'text-white' },
  fighting: { hex: '#C03028', bg: 'bg-[#C03028]', border: 'border-[#C03028]', text: 'text-white' },
  flying: { hex: '#A890F0', bg: 'bg-[#A890F0]', border: 'border-[#A890F0]', text: 'text-white' },
  poison: { hex: '#A040A0', bg: 'bg-[#A040A0]', border: 'border-[#A040A0]', text: 'text-white' },
  ground: { hex: '#E0C068', bg: 'bg-[#E0C068]', border: 'border-[#E0C068]', text: 'text-gray-900' },
  rock: { hex: '#B8A038', bg: 'bg-[#B8A038]', border: 'border-[#B8A038]', text: 'text-white' },
  bug: { hex: '#A8B820', bg: 'bg-[#A8B820]', border: 'border-[#A8B820]', text: 'text-white' },
  ghost: { hex: '#705898', bg: 'bg-[#705898]', border: 'border-[#705898]', text: 'text-white' },
  steel: { hex: '#B8B8D0', bg: 'bg-[#B8B8D0]', border: 'border-[#B8B8D0]', text: 'text-gray-900' },
  fire: { hex: '#F08030', bg: 'bg-[#F08030]', border: 'border-[#F08030]', text: 'text-white' },
  water: { hex: '#6890F0', bg: 'bg-[#6890F0]', border: 'border-[#6890F0]', text: 'text-white' },
  grass: { hex: '#78C850', bg: 'bg-[#78C850]', border: 'border-[#78C850]', text: 'text-white' },
  electric: { hex: '#F8D030', bg: 'bg-[#F8D030]', border: 'border-[#F8D030]', text: 'text-gray-900' },
  psychic: { hex: '#F85888', bg: 'bg-[#F85888]', border: 'border-[#F85888]', text: 'text-white' },
  ice: { hex: '#98D8D8', bg: 'bg-[#98D8D8]', border: 'border-[#98D8D8]', text: 'text-gray-900' },
  dragon: { hex: '#7038F8', bg: 'bg-[#7038F8]', border: 'border-[#7038F8]', text: 'text-white' },
  dark: { hex: '#705848', bg: 'bg-[#705848]', border: 'border-[#705848]', text: 'text-white' },
  fairy: { hex: '#F0B6D0', bg: 'bg-[#F0B6D0]', border: 'border-[#F0B6D0]', text: 'text-gray-900' },
}

export function getTypeColor(type: PokemonType) {
  return TYPE_COLORS[type] || TYPE_COLORS.normal
}
