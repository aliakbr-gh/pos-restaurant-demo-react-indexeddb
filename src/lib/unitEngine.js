export const WEIGHT_UNITS = {
  kg: { symbol: "kg", grams: 1000, decimals: 3 },
  g: { symbol: "g", grams: 1, decimals: 0 },
};

export function weightToKg(value, unit = "kg") {
  const definition = WEIGHT_UNITS[unit] || WEIGHT_UNITS.kg;
  return (Number(value) * definition.grams) / 1000;
}

export function kgToWeight(kilograms, unit = "kg") {
  const definition = WEIGHT_UNITS[unit] || WEIGHT_UNITS.kg;
  return (Number(kilograms) * 1000) / definition.grams;
}

export function amountFromWeight(pricePerKg, value, unit = "kg") {
  return Number(pricePerKg) * weightToKg(value, unit);
}

export function weightFromAmount(pricePerKg, amount, unit = "kg") {
  if (!Number(pricePerKg)) return 0;
  return kgToWeight(Number(amount) / Number(pricePerKg), unit);
}

export function formatWeight(kilograms) {
  if (kilograms < 1) return `${Math.round(kilograms * 1000)} g`;
  return `${Number(kilograms.toFixed(3))} kg`;
}

export function isWeightedItem(item) {
  return item.saleMode === "weight" || item.unit === "kg" || item.unit === "g";
}
