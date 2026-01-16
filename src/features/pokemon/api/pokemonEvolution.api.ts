export async function fetchPokemonEvolutionChain(pokemonId: number) {
  const speciesRes = await fetch(
    `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`
  )
  const species = await speciesRes.json()

  const evoRes = await fetch(species.evolution_chain.url)
  const evoData = await evoRes.json()

  const chain: { id: number; name: string }[] = []

  function traverse(node: any) {
    const id = Number(
      node.species.url.split('/').filter(Boolean).pop()
    )

    chain.push({
      id,
      name: node.species.name,
    })

    node.evolves_to.forEach(traverse)
  }

  traverse(evoData.chain)
  return chain
}
