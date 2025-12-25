"use strict";
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
var XLSX = require("xlsx");
// ---------- PATHS ----------
var XLSX_PATH = path_1.default.join(process.cwd(), "forward_filled_timetable.xlsx");
var OUTPUT_PATH = path_1.default.join(process.cwd(), "lib/data/exams.json");
// ---------- READ EXCEL ----------
var workbook = XLSX.readFile(XLSX_PATH);
var sheetName = workbook.SheetNames[0];
var sheet = workbook.Sheets[sheetName];
var rows = XLSX.utils.sheet_to_json(sheet);
// ---------- BUILD EXAMS ----------
var exams = {};
for (var _i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
    var row = rows_1[_i];
    var courseCode = (_a = row["COURSE NO."]) === null || _a === void 0 ? void 0 : _a.trim();
    if (!courseCode || exams[courseCode])
        continue;
    exams[courseCode] = {
        courseTitle: String((_b = row["COURSE TITLE"]) !== null && _b !== void 0 ? _b : "").trim(),
        midsem: String((_c = row["MIDSEM"]) !== null && _c !== void 0 ? _c : "").trim(),
        endsem: String((_d = row["ENDSEM"]) !== null && _d !== void 0 ? _d : "").trim(),
    };
}
// ---------- WRITE JSON ----------
fs_1.default.mkdirSync(path_1.default.dirname(OUTPUT_PATH), { recursive: true });
fs_1.default.writeFileSync(OUTPUT_PATH, JSON.stringify(exams, null, 2));
console.log("✅ exams.json generated successfully");
