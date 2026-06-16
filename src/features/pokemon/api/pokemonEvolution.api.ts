interface NamedAPIResource {
  name: string
  url: string
}

interface EvolutionDetail {
  trigger?: NamedAPIResource | null
  min_level?: number | null
  item?: NamedAPIResource | null
  held_item?: NamedAPIResource | null
  location?: NamedAPIResource | null
  time_of_day?: string
  min_happiness?: number | null
  min_beauty?: number | null
  min_affection?: number | null
  known_move?: NamedAPIResource | null
  gender?: number | null
}

interface ChainLink {
  species: NamedAPIResource
  evolution_details: EvolutionDetail[]
  evolves_to: ChainLink[]
}

function formatEvolutionDetail(detail: EvolutionDetail) {
  const parts: string[] = []

  if (detail.trigger?.name) {
    parts.push(
      detail.trigger.name === 'level-up'
        ? 'Level up'
        : detail.trigger.name.replace('-', ' ')
    )
  }

  if (detail.min_level) {
    parts.push(`Level ${detail.min_level}`)
  }

  if (detail.item) {
    parts.push(`Use ${detail.item.name.replace('-', ' ')}`)
  }

  if (detail.held_item) {
    parts.push(`Holding ${detail.held_item.name.replace('-', ' ')}`)
  }

  if (detail.location) {
    parts.push(`At ${detail.location.name.replace('-', ' ')}`)
  }

  if (detail.time_of_day) {
    parts.push(`At ${detail.time_of_day}`)
  }

  if (detail.min_happiness) {
    parts.push(`Happiness ${detail.min_happiness}+`)
  }

  if (detail.min_beauty) {
    parts.push(`Beauty ${detail.min_beauty}+`)
  }

  if (detail.min_affection) {
    parts.push(`Affection ${detail.min_affection}+`)
  }

  if (detail.known_move) {
    parts.push(`Know ${detail.known_move.name.replace('-', ' ')}`)
  }

  if (detail.gender !== null && detail.gender !== undefined) {
    const genderLabel = detail.gender === 1 ? 'Female' : 'Male'
    parts.push(genderLabel)
  }

  return parts.join(' • ')
}

export async function fetchPokemonEvolutionChain(pokemonKey: number | string) {
  // pokemonKey can be "venusaur" or 3 or "deoxys-attack"
  const key = String(pokemonKey)
  const speciesKey = key.includes('-') ? key.split('-')[0] : key

  const speciesRes = await fetch(
    `https://pokeapi.co/api/v2/pokemon-species/${speciesKey}/`
  )

  if (!speciesRes.ok) {
    throw new Error(`Species not found for: ${speciesKey}`)
  }

  const species = await speciesRes.json()

  const evoUrl: string | undefined = species?.evolution_chain?.url
  if (!evoUrl) return []

  const evoRes = await fetch(evoUrl)

  if (!evoRes.ok) {
    throw new Error(`Evolution chain fetch failed for: ${speciesKey}`)
  }

  const evoData = await evoRes.json()

  const chain: { id: number; name: string; details: string }[] = []

  function traverse(node: ChainLink) {
    const id = Number(node.species.url.split('/').filter(Boolean).pop())

    const details =
      node.evolution_details?.length
        ? formatEvolutionDetail(node.evolution_details[0])
        : 'Base form'

    chain.push({
      id,
      name: node.species.name,
      details,
    })

    node.evolves_to.forEach(traverse)
  }

  traverse(evoData.chain)
  return chain
}
