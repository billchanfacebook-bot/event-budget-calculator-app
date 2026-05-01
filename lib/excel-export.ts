import ExcelJS from "exceljs";
import { buildCategoryComparisonData } from "@/lib/events";
import type { EventWithItemsRecord } from "@/types";

const currencyFormat = '$#,##0.00;[Red]-$#,##0.00';
const dateFormat = "yyyy-mm-dd";
const headerFill = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FF18212F" } };
const accentFill = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFD0672F" } };
const softFill = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFF5EEE5" } };
const mossFill = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FF71816D" } };
const whiteFont = { color: { argb: "FFFFFFFF" }, bold: true };

function applySheetTitle(worksheet: ExcelJS.Worksheet, title: string, subtitle: string) {
  worksheet.mergeCells("A1:F1");
  worksheet.getCell("A1").value = title;
  worksheet.getCell("A1").font = { size: 20, bold: true, color: { argb: "FF18212F" } };
  worksheet.getCell("A2").value = subtitle;
  worksheet.getCell("A2").font = { size: 11, color: { argb: "FF6B7280" } };
}

function styleHeaderRow(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = whiteFont;
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin", color: { argb: "FFE5E7EB" } },
      left: { style: "thin", color: { argb: "FFE5E7EB" } },
      bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
      right: { style: "thin", color: { argb: "FFE5E7EB" } }
    };
  });
}

function styleDataGrid(worksheet: ExcelJS.Worksheet, startRow: number, endRow: number, columns: number[]) {
  for (let rowIndex = startRow; rowIndex <= endRow; rowIndex += 1) {
    const row = worksheet.getRow(rowIndex);
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE5E7EB" } },
        left: { style: "thin", color: { argb: "FFE5E7EB" } },
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
        right: { style: "thin", color: { argb: "FFE5E7EB" } }
      };
      if (columns.includes(colNumber)) {
        cell.numFmt = currencyFormat;
      }
    });
  }
}

function createSummarySheet(workbook: ExcelJS.Workbook, event: EventWithItemsRecord) {
  const worksheet = workbook.addWorksheet("Event Summary", {
    views: [{ state: "frozen", ySplit: 6 }]
  });

  applySheetTitle(
    worksheet,
    `${event.name} Budget Workbook`,
    "Summary of event details, budget cap, and current budget performance."
  );

  worksheet.columns = [
    { width: 24 },
    { width: 18 },
    { width: 24 },
    { width: 18 },
    { width: 24 },
    { width: 18 }
  ];

  const metadataRows = [
    ["Event Name", event.name, "Date", event.date, "Venue", event.location],
    ["Attendees", event.attendeeCount, "Currency", event.currency, "Status", event.status]
  ];

  metadataRows.forEach((values, index) => {
    const row = worksheet.getRow(4 + index);
    row.values = values;
    row.eachCell((cell, columnNumber) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE5E7EB" } },
        left: { style: "thin", color: { argb: "FFE5E7EB" } },
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
        right: { style: "thin", color: { argb: "FFE5E7EB" } }
      };
      if (columnNumber % 2 === 1) {
        cell.fill = softFill;
        cell.font = { bold: true, color: { argb: "FF18212F" } };
      }
    });
  });

  const detailSheetName = `'Budget Breakdown'`;
  const firstDataRow = 12;
  const lastDataRow = Math.max(firstDataRow, event.items.length + firstDataRow - 1);
  const amountRange = `$E$${firstDataRow}:$E$${lastDataRow}`;
  const actualRange = `$F$${firstDataRow}:$F$${lastDataRow}`;
  const statusRange = `$G$${firstDataRow}:$G$${lastDataRow}`;

  worksheet.getCell("A8").value = "Budget Overview";
  worksheet.getCell("A8").font = { size: 14, bold: true, color: { argb: "FF18212F" } };

  const metrics = [
    ["Budget cap", event.budgetCap],
    ["Estimated items", { formula: `SUM(${detailSheetName}!${amountRange})` }],
    ["Actual", { formula: `SUM(${detailSheetName}!${actualRange})` }],
    ["Remaining", { formula: "B11-B13" }],
    ["Paid", { formula: `SUMIFS(${detailSheetName}!${actualRange},${detailSheetName}!${statusRange},"paid")` }],
    [
      "Pending",
      {
        formula: `SUMIFS(${detailSheetName}!${actualRange},${detailSheetName}!${statusRange},"pending")+SUMIFS(${detailSheetName}!${actualRange},${detailSheetName}!${statusRange},"partially_paid")`
      }
    ],
    ["Variance", { formula: "B13-B11" }]
  ];

  metrics.forEach(([label, value], index) => {
    const rowNumber = 10 + index;
    worksheet.getCell(`A${rowNumber}`).value = label;
    worksheet.getCell(`A${rowNumber}`).fill = index === 0 ? accentFill : softFill;
    worksheet.getCell(`A${rowNumber}`).font =
      index === 0 ? whiteFont : { bold: true, color: { argb: "FF18212F" } };
    worksheet.getCell(`B${rowNumber}`).value = value as ExcelJS.CellValue;
    worksheet.getCell(`B${rowNumber}`).numFmt = currencyFormat;
    ["A", "B"].forEach((column) => {
      const cell = worksheet.getCell(`${column}${rowNumber}`);
      cell.border = {
        top: { style: "thin", color: { argb: "FFE5E7EB" } },
        left: { style: "thin", color: { argb: "FFE5E7EB" } },
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
        right: { style: "thin", color: { argb: "FFE5E7EB" } }
      };
    });
  });

  worksheet.getCell("D8").value = "Budget health";
  worksheet.getCell("D8").font = { size: 14, bold: true, color: { argb: "FF18212F" } };
  worksheet.getCell("D10").value = "How to read this workbook";
  worksheet.getCell("D10").fill = mossFill;
  worksheet.getCell("D10").font = whiteFont;
  worksheet.mergeCells("D11:F16");
  worksheet.getCell("D11").value =
    "Budget cap is your manual event limit. Estimated items and Actual are summed from the Budget Breakdown sheet. The Analytics sheet groups category totals so you can compare estimate versus spend quickly.";
  worksheet.getCell("D11").alignment = { wrapText: true, vertical: "top" };
  worksheet.getCell("D11").border = {
    top: { style: "thin", color: { argb: "FFE5E7EB" } },
    left: { style: "thin", color: { argb: "FFE5E7EB" } },
    bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
    right: { style: "thin", color: { argb: "FFE5E7EB" } }
  };

  return worksheet;
}

function createAnalyticsSheet(workbook: ExcelJS.Workbook, event: EventWithItemsRecord) {
  const worksheet = workbook.addWorksheet("Budget vs Actual", {
    views: [{ state: "frozen", ySplit: 5 }]
  });

  applySheetTitle(
    worksheet,
    "Budget vs Actual Analysis",
    "Category-level summary of estimated versus actual event spending."
  );

  const categories = buildCategoryComparisonData(event.items).sort(
    (left, right) => right.estimated + right.actual - (left.estimated + left.actual)
  );

  worksheet.columns = [
    { header: "Category", key: "category", width: 28 },
    { header: "Estimated", key: "estimated", width: 18 },
    { header: "Actual", key: "actual", width: 18 },
    { header: "Variance", key: "variance", width: 18 },
    { header: "% of Cap", key: "share", width: 18 }
  ];

  const headerRowNumber = 5;
  const headerRow = worksheet.getRow(headerRowNumber);
  headerRow.values = ["Category", "Estimated", "Actual", "Variance", "% of Cap"];
  styleHeaderRow(headerRow);

  categories.forEach((entry, index) => {
    const rowNumber = headerRowNumber + 1 + index;
    const variance = entry.actual - entry.estimated;
    const shareOfCap = event.budgetCap > 0 ? entry.actual / event.budgetCap : 0;
    worksheet.getRow(rowNumber).values = [
      entry.name,
      entry.estimated,
      entry.actual,
      variance,
      shareOfCap
    ];
  });

  const dataStart = headerRowNumber + 1;
  const dataEnd = Math.max(dataStart, headerRowNumber + categories.length);
  worksheet.autoFilter = {
    from: `A${headerRowNumber}`,
    to: `E${dataEnd}`
  };

  styleDataGrid(worksheet, dataStart, dataEnd, [2, 3, 4]);
  for (let rowIndex = dataStart; rowIndex <= dataEnd; rowIndex += 1) {
    worksheet.getCell(`E${rowIndex}`).numFmt = "0.0%";
  }

  const totalsRow = dataEnd + 2;
  worksheet.getCell(`A${totalsRow}`).value = "Totals";
  worksheet.getCell(`A${totalsRow}`).fill = accentFill;
  worksheet.getCell(`A${totalsRow}`).font = whiteFont;
  worksheet.getCell(`B${totalsRow}`).value = { formula: `SUM(B${dataStart}:B${dataEnd})` };
  worksheet.getCell(`C${totalsRow}`).value = { formula: `SUM(C${dataStart}:C${dataEnd})` };
  worksheet.getCell(`D${totalsRow}`).value = { formula: `SUM(D${dataStart}:D${dataEnd})` };
  worksheet.getCell(`E${totalsRow}`).value = event.budgetCap > 0 ? event.actualTotal / event.budgetCap : 0;
  ["B", "C", "D"].forEach((column) => {
    worksheet.getCell(`${column}${totalsRow}`).numFmt = currencyFormat;
  });
  worksheet.getCell(`E${totalsRow}`).numFmt = "0.0%";

  return worksheet;
}

function createBreakdownSheet(workbook: ExcelJS.Workbook, event: EventWithItemsRecord) {
  const worksheet = workbook.addWorksheet("Budget Breakdown", {
    views: [{ state: "frozen", ySplit: 11 }]
  });

  applySheetTitle(
    worksheet,
    "Budget Breakdown",
    "Detailed line items with category subtotals and sortable cost columns."
  );

  const categoryTotals = buildCategoryComparisonData(event.items).sort((left, right) =>
    left.name.localeCompare(right.name, undefined, { sensitivity: "base" })
  );

  worksheet.getCell("A4").value = "Category subtotals";
  worksheet.getCell("A4").font = { size: 14, bold: true, color: { argb: "FF18212F" } };
  worksheet.getRow(5).values = ["Category", "Estimated total", "Actual total", "Variance"];
  styleHeaderRow(worksheet.getRow(5));

  categoryTotals.forEach((entry, index) => {
    const rowNumber = 6 + index;
    worksheet.getRow(rowNumber).values = [
      entry.name,
      entry.estimated,
      entry.actual,
      entry.actual - entry.estimated
    ];
  });
  const subtotalEnd = Math.max(6, 5 + categoryTotals.length);
  styleDataGrid(worksheet, 6, subtotalEnd, [2, 3, 4]);

  const detailHeaderRow = subtotalEnd + 3;
  worksheet.getCell(`A${detailHeaderRow - 1}`).value = "Line items";
  worksheet.getCell(`A${detailHeaderRow - 1}`).font = { size: 14, bold: true, color: { argb: "FF18212F" } };
  worksheet.getRow(detailHeaderRow).values = [
    "Category",
    "Item name",
    "Vendor",
    "Estimated",
    "Actual",
    "Payment status",
    "Due date",
    "Notes"
  ];
  styleHeaderRow(worksheet.getRow(detailHeaderRow));

  event.items.forEach((item, index) => {
    const rowNumber = detailHeaderRow + 1 + index;
    worksheet.getRow(rowNumber).values = [
      item.categoryName,
      item.itemName,
      item.vendor,
      item.estimatedCost,
      item.actualCost,
      item.paymentStatus,
      item.dueDate === "TBC" ? "" : item.dueDate,
      item.notes ?? ""
    ];
    if (item.dueDate !== "TBC") {
      worksheet.getCell(`G${rowNumber}`).numFmt = dateFormat;
    }
  });

  const detailStart = detailHeaderRow + 1;
  const detailEnd = Math.max(detailStart, detailHeaderRow + event.items.length);
  worksheet.autoFilter = {
    from: `A${detailHeaderRow}`,
    to: `H${detailEnd}`
  };
  styleDataGrid(worksheet, detailStart, detailEnd, [4, 5]);

  worksheet.columns = [
    { width: 22 },
    { width: 26 },
    { width: 24 },
    { width: 16 },
    { width: 16 },
    { width: 18 },
    { width: 16 },
    { width: 36 }
  ];

  return worksheet;
}

export async function buildEventBudgetWorkbook(event: EventWithItemsRecord) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Budget Command";
  workbook.lastModifiedBy = "Budget Command";
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.company = "Budget Command";
  workbook.subject = `${event.name} event budget export`;
  workbook.title = `${event.name} Budget Workbook`;

  createSummarySheet(workbook, event);
  createAnalyticsSheet(workbook, event);
  createBreakdownSheet(workbook, event);

  return workbook.xlsx.writeBuffer();
}

export function createXlsxResponse(filename: string, content: Buffer | Uint8Array | ArrayBuffer) {
  const body = content instanceof ArrayBuffer ? Buffer.from(content) : Buffer.from(content);

  return new Response(body, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store"
    }
  });
}
