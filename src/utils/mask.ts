import { formatCurrency, parseCurrency } from "@brazilian-utils/brazilian-utils";

export function maskPhone(value: string | undefined) {
  if (!value) return "";
  return value
    .replace(/[\D]/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})(\d+?)/, "$1");
}

export function normalizeCnpj(value: string | undefined) {
  if (!value) return "";
  return value
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .replace(/(-\d{2})(\d+?)/, "$1")
    .substring(0, 18);
}

export function normalizeCep(value: string | undefined) {
  if (!value) return "";

  return value
    .replace(/\D/g, "")
    .replace(/^(\d{5})(\d)/, "$1-$2")
    .substring(0, 9);
}

export function normalizeWeight(value: number | undefined) {
  if (!value) return "";
  return `${value.toLocaleString("pt-BR")} Kg`;
}

export function removeNormalizeCurrency(value: string | undefined) {
  if (!value) return "";
  return value.replace(/\D/g, "").replace(/(\d+?)(\d{2}$)/, "$1.$2");
}

export function normalizeOnlyNumber(value: string | undefined) {
  if (!value) return "";
  return value.replace(/\D/g, "");
}

export function normalizeOnlyString(value: string | undefined) {
  if (!value) return "";
  return value.replace(/[^a-zA-ZÀ-ü ]+/g, "");
}

export function normalizeNfNumber(value: string | undefined) {
  if (!value) return "";
  return value.replace(/\D/g, "").substring(0, 9);
}

export function removeSpecialChars(value: string | undefined) {
  if (!value) return "";
  return value.replace(/[^a-zA-Z0-9 ]/g, "");
}

export function unmask(value: string) {
  return value.replace(/\D/g, "");
}

export function removeWhitespaces(value: string) {
  return value.replace(/\s/g, "");
}

export function normalizePercentage(value: string, allowDecimal?: "allowDecimal") {
  const onlyNumbers = normalizeOnlyNumber(value);
  if (allowDecimal) {
    const value = formatCurrency(parseCurrency(onlyNumbers.length ? onlyNumbers : "0"));
    return Number(parseCurrency(value)) > 100 ? "100,00" : value;
  }
  const numberValue = parseInt(onlyNumbers.length ? onlyNumbers : "0");
  return (numberValue > 100 ? 100 : numberValue).toString();
}

export function handleNormalizeNumbers(event: any, limit?: number) {
  const { value } = event.target;
  event.target.value = normalizeOnlyNumber(limit ? value.substring(0, limit) : value);
}

export function handleRemoveWhitespaces(event: any) {
  const { value } = event.target;
  event.target.value = removeWhitespaces(value);
}
