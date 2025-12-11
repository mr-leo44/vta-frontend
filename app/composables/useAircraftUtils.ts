/**
 * Composable pour les utilitaires liés aux aéronefs
 */
export const useAircraftUtils = () => {
  /**
   * Convertit un poids en kilogrammes en tonnes
   * @param kg - Poids en kilogrammes
   * @returns Poids formaté en tonnes (ex: "75 T")
   */
  const kgToTons = (kg: number | null | undefined): string => {
    if (!kg || kg === 0) return '0 T'
    return `${Math.ceil(kg / 1000)} T`
  }

  /**
   * Formate un poids avec séparateurs de milliers
   * @param kg - Poids en kilogrammes
   * @returns Poids formaté avec unité (ex: "79 000 kg")
   */
  const formatWeight = (kg: number | null | undefined): string => {
    if (!kg) return '—'
    return `${kg} kg`
  }

  return {
    kgToTons,
    formatWeight
  }
}