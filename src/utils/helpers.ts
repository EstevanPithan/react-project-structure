import { AxiosError } from "axios";
import { AUTH_TOKEN } from "./constants";
import { getStorageItem } from "./storage";
import { PDFDocument } from "pdf-lib";
import { z } from "zod";

interface DecodedToken {
  exp: number;
}

export function jwtDecoder(token: string): DecodedToken {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(c => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join(""),
  );
  return JSON.parse(jsonPayload) as DecodedToken;
}

export const isValidToken = (accessToken: string) => {
  if (!accessToken) return;
  const decoded = jwtDecoder(accessToken);
  const currentTime = Math.floor(Date.now() / 1000);
  const isExpired = decoded.exp <= currentTime;
  return isExpired ? null : accessToken;
};

export function getAuthToken() {
  const token = getStorageItem(AUTH_TOKEN);
  if (!token) return;
  return isValidToken(token);
}

export function convertImageToBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

export function makeRandomHash(length: number) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export function formatDate({ date, shouldShowTime = false }: { date: string | Date; shouldShowTime?: boolean }) {
  return `${new Date(date).toLocaleDateString("pt-br")}` + shouldShowTime
    ? `Às ${new Date(date).toLocaleTimeString("pt-br")}`
    : null;
}

export function getErrorMessage({ defaultMessage, error }: { defaultMessage: string; error: unknown }) {
  const err = error as AxiosError;
  if (err?.response && typeof err.response.data === "string" && err.response.data.length > 0) {
    return err.response.data;
  }
  return defaultMessage;
}

export function downloadFile(href: string, fileName: string) {
  const anchorElement = document.createElement("a");

  anchorElement.href = href;
  anchorElement.download = fileName;

  document.body.appendChild(anchorElement);
  anchorElement.click();

  document.body.removeChild(anchorElement);
  window.URL.revokeObjectURL(href);
}

export function calculateDateBack(days: number): string {
  const today = new Date();
  const pastDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
  return pastDate.toISOString().split("T")[0];
}

export function setLastDayOfMonth(date: Date) {
  date.setMonth(date.getMonth() + 1);
  date.setDate(0);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function setFirstDayOfMonth(date: Date) {
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function toPrecisionLocale(num: number, digits: number) {
  return (num / 10 ** digits).toLocaleString("pt-BR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

export function dateDiffInDays(a: Date, b: Date) {
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

function base64ToArrayBuffer(base64: string) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

async function mergePdfs(base64Pdfs: string[]) {
  const mergedPdf = await PDFDocument.create();

  for (const base64Pdf of base64Pdfs) {
    const pdfBytes = base64ToArrayBuffer(base64Pdf);

    const pdfDoc = await PDFDocument.load(pdfBytes);

    const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    copiedPages.forEach(page => {
      mergedPdf.addPage(page);
    });
  }

  return await mergedPdf.saveAsBase64();
}

export async function mergePdfsAndDownload(base64Pdfs: string[], fileName: string) {
  const mergedPdfBase64 = await mergePdfs(base64Pdfs);
  const linkSource = `data:application/pdf;base64,${mergedPdfBase64}`;
  const downloadLink = document.createElement("a");

  downloadLink.href = linkSource;
  downloadLink.download = `${fileName}.pdf`;

  downloadLink.click();
}

export function parseSimpleDateAndTimeToDate(customString: string): Date {
  const day = parseInt(customString.substring(0, 2), 10);
  const month = parseInt(customString.substring(3, 5), 10) - 1;
  const year = parseInt(customString.substring(6, 10), 10);
  const hours = parseInt(customString.substring(11, 13), 10);
  const minutes = parseInt(customString.substring(14, 16), 10);
  const date = new Date(year, month, day, hours, minutes);
  return date;
}

export function parseCustomStringToDate(customString: string): Date {
  const year = parseInt(customString.substring(0, 4), 10);
  const month = parseInt(customString.substring(4, 6), 10) - 1;
  const day = parseInt(customString.substring(6, 8), 10);
  const hours = parseInt(customString.substring(9, 11), 10);
  const minutes = parseInt(customString.substring(11, 13), 10);
  const seconds = parseInt(customString.substring(13, 15), 10);

  return new Date(year, month, day, hours, minutes, seconds);
}

export function zodEnumFromObjKeys<K extends string>(obj: Record<K, any>): z.ZodEnum<[K, ...K[]]> {
  const [firstKey, ...otherKeys] = Object.keys(obj) as K[];
  return z.enum([firstKey, ...otherKeys]);
}
