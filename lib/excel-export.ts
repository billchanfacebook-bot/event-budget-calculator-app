import ExcelJS from "exceljs";
import type { EventWithItemsRecord } from "@/types";

const currencyFormat = '$#,##0.00;[Red]-$#,##0.00';
const dateFormat = "yyyy-mm-dd";
const percentFormat = "0.0%";
const headerFill = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FF18212F" } };
const accentFill = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFD0672F" } };
const softFill = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFF5EEE5" } };
const mossFill = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FF71816D" } };
const whiteFont = { color: { argb: "FFFFFFFF" }, bold: true };

type BreakdownLayout = {
  categoryNames: string[];
  detailHeaderRow: number;
  detailStartRow: number;
  detailEndRow: number;
};

function applySheetTitle(worksheet: ExcelJS.Worksheet, title: string, subtitle: string) {
  worksheet.mergeCells("A1:F1");
  worksheet.getCell("A1").value = title;
  worksheet.getCell("A1").font = { size: 20, bold: true, color: { argb: "FF18212F" } };
  worksheet.getCell("A2").value = subtitle;
  worksheet.getCell("A2").font = { size: 11, color: { argb: "FF6B7280" } };
}

function applyCellBorder(cell: ExcelJS.Cell) {
  cell.border = {
    top: { style: "thin", color: { argb: "FFE5E7EB" } },
    left: { style: "thin", color: { argb: "FFE5E7EB" } },
    bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
    right: { style: "thin", color: { argb: "FFE5E7EB" } }
  };
}

function styleHeaderRow(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = whiteFont;
    cell.alignment = { vertical: "middle", horizontal: "center" };
    applyCellBorder(cell);
  });
}

function styleDataGrid(worksheet: ExcelJS.Worksheet, startRow: number, endRow: number, currencyColumns: number[]) {
  for (let rowIndex = startRow; rowIndex <= endRow; rowIndex += 1) {
    const row = worksheet.getRow(rowIndex);
    row.eachCell((cell, colNumber) => {
      applyCellBorder(cell);
      if (currencyColumns.includes(colNumber)) {
        cell.numFmt = currencyFormat;
      }
    });
  }
}

function createBreakdownSheet(workbook: ExcelJS.Workbook, event: EventWithItemsRecord): BreakdownLayout {
  const worksheet = workbook.addWorksheet("Budget Breakdown", {
    views: [{ state: "frozen", ySplit: 11 }]
  });

  applySheetTitle(
    worksheet,
    "Budget Breakdown",
    "Detailed line items with category subtotals and editable estimated/actual values."
  );

  const categoryNames = Array.from(new Set(event.items.map((item) => item.categoryName))).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );

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

  worksheet.getCell("A4").value = "Category subtotals";
  worksheet.getCell("A4").font = { size: 14, bold: true, color: { argb: "FF18212F" } };
  worksheet.getRow(5).values = ["Category", "Estimated total", "Actual total", "Variance"];
  styleHeaderRow(worksheet.getRow(5));

  const subtotalStartRow = 6;
  categoryNames.forEach((name, index) => {
    worksheet.getCell(`A${subtotalStartRow + index}`).value = name;
  });

  const detailHeaderRow = subtotalStartRow + Math.max(categoryNames.length, 1) + 3;
  const detailStartRow = detailHeaderRow + 1;
  const detailEndRow = Math.max(detailStartRow, detailStartRow + event.items.length - 1);
  const categoryRange = `$A$${detailStartRow}:$A$${detailEndRow}`;
  const estimatedRange = `$D$${detailStartRow}:$D$${detailEndRow}`;
  const actualRange = `$E$${detailStartRow}:$E$${detailEndRow}`;

  categoryNames.forEach((name, index) => {
    const rowNumber = subtotalStartRow + index;
    worksheet.getCell(`B${rowNumber}`).value = {
      formula: `SUMIF(${categoryRange},A${rowNumber},${estimatedRange})`
    };
    worksheet.getCell(`C${rowNumber}`).value = {
      formula: `SUMIF(${categoryRange},A${rowNumber},${actualRange})`
    };
    worksheet.getCell(`D${rowNumber}`).value = {
      formula: `C${rowNumber}-B${rowNumber}`
    };
  });
  styleDataGrid(
    worksheet,
    subtotalStartRow,
    Math.max(subtotalStartRow, subtotalStartRow + categoryNames.length - 1),
    [2, 3, 4]
  );

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
    const rowNumber = detailStartRow + index;
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
    worksheet.getCell(`D${rowNumber}`).numFmt = currencyFormat;
    worksheet.getCell(`E${rowNumber}`).numFmt = currencyFormat;
    if (item.dueDate !== "TBC") {
      worksheet.getCell(`G${rowNumber}`).numFmt = dateFormat;
    }
  });

  worksheet.autoFilter = {
    from: `A${detailHeaderRow}`,
    to: `H${detailEndRow}`
  };
  styleDataGrid(worksheet, detailStartRow, detailEndRow, [4, 5]);

  return {
    categoryNames,
    detailHeaderRow,
    detailStartRow,
    detailEndRow
  };
}

function createSummarySheet(workbook: ExcelJS.Workbook, event: EventWithItemsRecord, layout: BreakdownLayout) {
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
      applyCellBorder(cell);
      if (columnNumber % 2 === 1) {
        cell.fill = softFill;
        cell.font = { bold: true, color: { argb: "FF18212F" } };
      }
    });
  });

  const detailSheetName = `'Budget Breakdown'`;
  const amountRange = `$D$${layout.detailStartRow}:$D$${layout.detailEndRow}`;
  const actualRange = `$E$${layout.detailStartRow}:$E$${layout.detailEndRow}`;
  const statusRange = `$F$${layout.detailStartRow}:$F$${layout.detailEndRow}`;

  worksheet.getCell("A8").value = "Budget Overview";
  worksheet.getCell("A8").font = { size: 14, bold: true, color: { argb: "FF18212F" } };

  const metrics = [
    ["Budget cap", event.budgetCap],
    ["Estimated items", { formula: `SUM(${detailSheetName}!${amountRange})` }],
    ["Actual", { formula: `SUM(${detailSheetName}!${actualRange})` }],
    ["Remaining", { formula: "B10-B12" }],
    ["Paid", { formula: `SUMIFS(${detailSheetName}!${actualRange},${detailSheetName}!${statusRange},"paid")` }],
    [
      "Pending",
      {
        formula: `SUMIFS(${detailSheetName}!${actualRange},${detailSheetName}!${statusRange},"pending")+SUMIFS(${detailSheetName}!${actualRange},${detailSheetName}!${statusRange},"partially_paid")`
      }
    ],
    ["Variance", { formula: "B12-B10" }]
  ];

  metrics.forEach(([label, value], index) => {
    const rowNumber = 10 + index;
    worksheet.getCell(`A${rowNumber}`).value = label;
    worksheet.getCell(`A${rowNumber}`).fill = index === 0 ? accentFill : softFill;
    worksheet.getCell(`A${rowNumber}`).font =
      index === 0 ? whiteFont : { bold: true, color: { argb: "FF18212F" } };
    worksheet.getCell(`B${rowNumber}`).value = value as ExcelJS.CellValue;
    worksheet.getCell(`B${rowNumber}`).numFmt = currencyFormat;
    ["A", "B"].forEach((column) => applyCellBorder(worksheet.getCell(`${column}${rowNumber}`)));
  });

  worksheet.getCell("D8").value = "Budget health";
  worksheet.getCell("D8").font = { size: 14, bold: true, color: { argb: "FF18212F" } };
  worksheet.getCell("D10").value = "How to read this workbook";
  worksheet.getCell("D10").fill = mossFill;
  worksheet.getCell("D10").font = whiteFont;
  worksheet.mergeCells("D11:F16");
  worksheet.getCell("D11").value =
    "Edit Estimated or Actual values in Budget Breakdown and Excel will recalculate Summary and Budget vs Actual automatically. Category subtotals and analytics are formula-driven from the detailed line items.";
  worksheet.getCell("D11").alignment = { wrapText: true, vertical: "top" };
  applyCellBorder(worksheet.getCell("D11"));

  return worksheet;
}

function createAnalyticsSheet(workbook: ExcelJS.Workbook, layout: BreakdownLayout) {
  const worksheet = workbook.addWorksheet("Budget vs Actual", {
    views: [{ state: "frozen", ySplit: 5 }]
  });

  applySheetTitle(
    worksheet,
    "Budget vs Actual Analysis",
    "Category-level summary of estimated versus actual event spending."
  );

  worksheet.columns = [
    { header: "Category", key: "category", width: 28 },
    { header: "Estimated", key: "estimated", width: 18 },
    { header: "Actual", key: "actual", width: 18 },
    { header: "Variance", key: "variance", width: 18 },
    { header: "% of Cap", key: "share", width: 18 }
  ];

  const headerRowNumber = 5;
  worksheet.getRow(headerRowNumber).values = ["Category", "Estimated", "Actual", "Variance", "% of Cap"];
  styleHeaderRow(worksheet.getRow(headerRowNumber));

  const detailSheetName = `'Budget Breakdown'`;
  const categoryRange = `${detailSheetName}!$A$${layout.detailStartRow}:$A$${layout.detailEndRow}`;
  const estimatedRange = `${detailSheetName}!$D$${layout.detailStartRow}:$D$${layout.detailEndRow}`;
  const actualRange = `${detailSheetName}!$E$${layout.detailStartRow}:$E$${layout.detailEndRow}`;

  layout.categoryNames.forEach((name, index) => {
    const rowNumber = headerRowNumber + 1 + index;
    worksheet.getCell(`A${rowNumber}`).value = name;
    worksheet.getCell(`B${rowNumber}`).value = {
      formula: `SUMIF(${categoryRange},A${rowNumber},${estimatedRange})`
    };
    worksheet.getCell(`C${rowNumber}`).value = {
      formula: `SUMIF(${categoryRange},A${rowNumber},${actualRange})`
    };
    worksheet.getCell(`D${rowNumber}`).value = { formula: `C${rowNumber}-B${rowNumber}` };
    worksheet.getCell(`E${rowNumber}`).value = {
      formula: `IF('Event Summary'!$B$10=0,0,C${rowNumber}/'Event Summary'!$B$10)`
    };
  });

  const dataStart = headerRowNumber + 1;
  const dataEnd = Math.max(dataStart, headerRowNumber + layout.categoryNames.length);
  worksheet.autoFilter = {
    from: `A${headerRowNumber}`,
    to: `E${dataEnd}`
  };

  styleDataGrid(worksheet, dataStart, dataEnd, [2, 3, 4]);
  for (let rowIndex = dataStart; rowIndex <= dataEnd; rowIndex += 1) {
    worksheet.getCell(`E${rowIndex}`).numFmt = percentFormat;
  }

  const totalsRow = dataEnd + 2;
  worksheet.getCell(`A${totalsRow}`).value = "Totals";
  worksheet.getCell(`A${totalsRow}`).fill = accentFill;
  worksheet.getCell(`A${totalsRow}`).font = whiteFont;
  worksheet.getCell(`B${totalsRow}`).value = { formula: `SUM(B${dataStart}:B${dataEnd})` };
  worksheet.getCell(`C${totalsRow}`).value = { formula: `SUM(C${dataStart}:C${dataEnd})` };
  worksheet.getCell(`D${totalsRow}`).value = { formula: `SUM(D${dataStart}:D${dataEnd})` };
  worksheet.getCell(`E${totalsRow}`).value = {
    formula: `IF('Event Summary'!$B$10=0,0,C${totalsRow}/'Event Summary'!$B$10)`
  };
  ["B", "C", "D"].forEach((column) => {
    worksheet.getCell(`${column}${totalsRow}`).numFmt = currencyFormat;
  });
  worksheet.getCell(`E${totalsRow}`).numFmt = percentFormat;
  ["A", "B", "C", "D", "E"].forEach((column) => applyCellBorder(worksheet.getCell(`${column}${totalsRow}`)));

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
  workbook.calcProperties.fullCalcOnLoad = true;

  const layout = createBreakdownSheet(workbook, event);
  createSummarySheet(workbook, event, layout);
  createAnalyticsSheet(workbook, layout);

  return workbook.xlsx.writeBuffer();
}

export async function buildBudgetImportTemplateWorkbook(categories: string[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Budget Command";
  workbook.lastModifiedBy = "Budget Command";
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.company = "Budget Command";
  workbook.subject = "Budget item import template";
  workbook.title = "Budget Item Import Template";

  const worksheet = workbook.addWorksheet("Budget Import Template", {
    views: [{ state: "frozen", ySplit: 3 }]
  });

  applySheetTitle(
    worksheet,
    "Budget Item Import Template",
    "Fill one line per budget item, then upload the file back into the event."
  );

  worksheet.columns = [
    { width: 24 },
    { width: 20 },
    { width: 24 },
    { width: 14 },
    { width: 14 },
    { width: 18 },
    { width: 16 },
    { width: 28 }
  ];

  worksheet.getRow(4).values = [
    "Item",
    "Category",
    "Vendor",
    "Estimated",
    "Actual",
    "Status",
    "Due",
    "Notes"
  ];
  styleHeaderRow(worksheet.getRow(4));

  const exampleRows = [
    ["Venue deposit", categories[0] ?? "Venue", "Harbour Hall", 50000, 0, "pending", "2026-07-01", ""],
    ["Catering final bill", categories[1] ?? categories[0] ?? "Catering", "City Caterers", 120000, 0, "pending", "2026-07-10", ""]
  ];

  exampleRows.forEach((row, index) => {
    const rowNumber = 5 + index;
    worksheet.getRow(rowNumber).values = row;
    worksheet.getCell(`D${rowNumber}`).numFmt = currencyFormat;
    worksheet.getCell(`E${rowNumber}`).numFmt = currencyFormat;
    worksheet.getCell(`G${rowNumber}`).numFmt = dateFormat;
  });

  styleDataGrid(worksheet, 5, 6, [4, 5]);
  worksheet.autoFilter = {
    from: "A4",
    to: "H6"
  };

  worksheet.getCell("J4").value = "Allowed Categories";
  worksheet.getCell("J4").fill = mossFill;
  worksheet.getCell("J4").font = whiteFont;
  categories.forEach((category, index) => {
    worksheet.getCell(`J${5 + index}`).value = category;
    applyCellBorder(worksheet.getCell(`J${5 + index}`));
  });

  worksheet.getCell("L4").value = "Allowed Status";
  worksheet.getCell("L4").fill = mossFill;
  worksheet.getCell("L4").font = whiteFont;
  ["pending", "partially_paid", "paid", "cancelled"].forEach((status, index) => {
    worksheet.getCell(`L${5 + index}`).value = status;
    applyCellBorder(worksheet.getCell(`L${5 + index}`));
  });

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
