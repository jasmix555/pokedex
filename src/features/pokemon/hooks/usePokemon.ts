// usePokemonIndex.ts
'use client'

import { useEffect, useState } from 'react'

type PokemonIndexItem = {
  name: string
  url: string
}

export function usePokemonIndex() {
  const [index, setIndex] = useState<PokemonIndexItem[]>([])

  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=100000')
      .then(res => res.json())
      .then(data => setIndex(data.results))
  }, [])

  return index
}
