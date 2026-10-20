// ===== sortByDate =====
// Purpose: sort the result sheet by date (oldest first), so new rows do not stay at the end.
// Setup: Extensions > Apps Script, paste this code, add a time-driven trigger (daily, 1 to 2 am,
//        after the workflow has run). An "on edit" trigger does not fire for writes by n8n.

// --- Constants ---
const SHEET_NAME = 'Rechnungen 2026'; // name of the tab (German on purpose)
const DATE_COL = 3;                   // column C = Datum

function sortByDate() {
  // --- Sort everything below the header row ---
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const rows = sh.getLastRow() - 1;   // without the header row
  if (rows < 2) return;
  sh.getRange(2, 1, rows, sh.getLastColumn())
    .sort({ column: DATE_COL, ascending: true });
}
