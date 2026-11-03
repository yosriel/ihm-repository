import type { Address } from "./types";
export function validateAddress(address: Address, districts: string[]) {
  const errors: Record<string, string> = {};
  if (!districts.includes(address.district.trim()))
    errors.district = "Selecciona un distrito disponible.";
  if (
    (address.street.match(/\p{L}/gu)?.length || 0) < 5 ||
    address.street.length > 160
  )
    errors.street =
      "Escribe una calle o avenida con al menos cinco letras (máximo 160 caracteres).";
  if (
    !address.noNumber &&
    (!/^\d{1,6}$/.test(address.number.trim()) || Number(address.number) < 1)
  )
    errors.number =
      "Escribe un número entre 1 y 999999 o marca Dirección sin número.";
  if (address.reference.length > 200)
    errors.reference = "La referencia puede tener hasta 200 caracteres.";
  return errors;
}
