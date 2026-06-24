import { Country } from 'country-state-city'

export function buildCountryOptions(locale: string) {
  try {
    const displayNames = new Intl.DisplayNames([locale], { type: 'region' })
    return Country.getAllCountries()
      .map(c => ({
        value: c.isoCode,
        label: displayNames.of(c.isoCode) || c.name,
        // c.name is always the English name from the package — used as fallback search term
        searchAlt: c.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, locale))
  } catch {
    return Country.getAllCountries()
      .map(c => ({ value: c.isoCode, label: c.name, searchAlt: c.name }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }
}
