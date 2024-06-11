import * as XLSX from "xlsx-js-style";

export function exportToExcel(
  dataList: Record<string, any>[],
  outputFileName: string,
  customHeaders: Record<string, string> | null,
  rowColors: Record<number, string> | null,
): void {
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataList);
  const range = XLSX.utils.decode_range(ws["!ref"] || "");
  if (customHeaders != null) {
    const headerRange = XLSX.utils.decode_range(ws["!ref"] || "");
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRange.s.r, c: col });
      const originalHeader = ws[cellAddress].v;
      ws[cellAddress].v = customHeaders[originalHeader] || originalHeader;
    }
  }
  let columnWidths: number[] = [];
  const headerColor = "0314B2";
  const evenRowColor = "EAF3FF";
  const oddRowColor = "FFFFFF";
  const headerFill = { fgColor: { rgb: headerColor }, bgColor: { rgb: headerColor }, patternType: "solid" };
  for (let row = 0; row <= dataList.length; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row + range.s.r, c: col });
      ws[cellAddress] = ws[cellAddress] || { v: undefined, s: {} };
      const contentLength = (ws[cellAddress].v || "").length || 0;
      if (row === 0) {
        ws[cellAddress].s = {
          fill: headerFill,
          font: { color: { rgb: "FFFFFF" }, bold: true },
          alignment: { vertical: "center", horizontal: "center" },
        };
        columnWidths.push(contentLength);
      } else {
        const color = rowColors != null && rowColors[row] ? rowColors[row] : row % 2 === 0 ? evenRowColor : oddRowColor;
        ws[cellAddress].s = {
          fill: { fgColor: { rgb: color }, bgColor: { rgb: color }, patternType: "solid" },
          alignment: { vertical: "center", horizontal: "center" },
        };
        columnWidths[col] = Math.max(columnWidths[col] || 0, contentLength);
      }
    }
  }
  ws["!cols"] = columnWidths.map(width => ({ width: width + 5 }));
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet 1");
  XLSX.writeFile(wb, outputFileName);
}
