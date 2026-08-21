import { useRef, useState } from "react";
import { Upload, X, FileSpreadsheet, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

export interface ImportColumn<T> {
  key: keyof T;
  label: string;
  required?: boolean;
  // Alternate header spellings a spreadsheet might use — matched case- and
  // separator-insensitively against `label` and each of these.
  aliases?: string[];
  // Converts the raw cell text into the field's real shape (number, string[], …).
  // Absent means "use the trimmed cell text as-is."
  parse?: (raw: string) => T[keyof T];
}

interface ParsedRow<T> {
  data: Partial<T>;
  errors: string[];
}

interface Props<T> {
  title: string;
  entityLabelSingular: string;
  entityLabelPlural: string;
  columns: ImportColumn<T>[];
  onImport: (rows: T[]) => void;
  onClose: () => void;
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[\s_-]+/g, " ");
}

function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === "") return true;
  if (typeof value === "number") return Number.isNaN(value);
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

// Generic "pick a spreadsheet, preview the parsed rows, import the valid ones"
// modal — shared by the Students and Tutors rosters rather than duplicating the
// file-reading/preview/validation logic per entity, since it's identical either way.
export default function ImportModal<T extends Record<string, unknown>>({
  title, entityLabelSingular, entityLabelPlural, columns, onImport, onClose,
}: Props<T>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [rows, setRows] = useState<ParsedRow<T>[] | null>(null);
  const [imported, setImported] = useState(false);

  const validRows = rows?.filter((r) => r.errors.length === 0) ?? [];
  const invalidCount = (rows?.length ?? 0) - validRows.length;

  const handleFile = async (file: File) => {
    setParsing(true);
    setParseError("");
    setRows(null);
    setFileName(file.name);
    try {
      const [XLSX, buffer] = await Promise.all([import("xlsx"), file.arrayBuffer()]);
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) throw new Error("That file has no sheets.");
      const sheet = workbook.Sheets[sheetName];
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      if (raw.length === 0) throw new Error("No rows found in the first sheet.");

      // Match each expected column to whichever source header spells it closest.
      const sourceHeaders = Object.keys(raw[0]);
      const headerMap = new Map<keyof T, string>();
      columns.forEach((col) => {
        const candidates = [col.label, ...(col.aliases ?? [])].map(normalizeHeader);
        const match = sourceHeaders.find((h) => candidates.includes(normalizeHeader(h)));
        if (match) headerMap.set(col.key, match);
      });

      const parsed: ParsedRow<T>[] = raw.map((sourceRow) => {
        const data: Partial<T> = {};
        const errors: string[] = [];
        columns.forEach((col) => {
          const sourceKey = headerMap.get(col.key);
          const rawValue = sourceKey !== undefined ? String(sourceRow[sourceKey] ?? "").trim() : "";
          if (!rawValue) {
            if (col.required) errors.push(`Missing ${col.label}`);
            return;
          }
          const value = col.parse ? col.parse(rawValue) : (rawValue as unknown as T[keyof T]);
          if (col.required && isEmptyValue(value)) {
            errors.push(`Invalid ${col.label}: "${rawValue}"`);
            return;
          }
          data[col.key] = value;
        });
        return { data, errors };
      });

      setRows(parsed);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Couldn't read that file.");
    } finally {
      setParsing(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleImport = () => {
    onImport(validRows.map((r) => r.data as T));
    setImported(true);
  };

  const reset = () => {
    setFileName("");
    setRows(null);
    setParseError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
          <div>
            <h2 className="font-display font-semibold text-foreground text-lg leading-none">{title}</h2>
            <p className="text-[11px] font-mono text-muted-foreground mt-1">Import {entityLabelPlural} from an Excel or CSV file</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {imported ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12 px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base">Import Complete</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {validRows.length} {validRows.length === 1 ? entityLabelSingular : entityLabelPlural} added to the roster.
              </p>
            </div>
            <button onClick={onClose} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">Done</button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 scrollbar-hide">
              {!rows && (
                <div className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-xl py-10 px-6 text-center">
                  <FileSpreadsheet className="w-8 h-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Choose a spreadsheet to import</p>
                    <p className="text-xs text-muted-foreground mt-1">.xlsx, .xls, or .csv — first row should be column headers</p>
                  </div>
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={parsing}
                    className="mt-1 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
                    {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {parsing ? "Reading file…" : "Choose File"}
                  </button>
                  <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onFileInputChange} />
                  {parseError && (
                    <p className="text-xs text-red-600 flex items-center gap-1.5 mt-1">
                      <AlertTriangle className="w-3.5 h-3.5" />{parseError}
                    </p>
                  )}
                  <div className="text-left w-full mt-2 pt-3 border-t border-border">
                    <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-1.5">Expected columns</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {columns.map((c) => `${c.label}${c.required ? " *" : ""}`).join(" · ")}
                    </p>
                  </div>
                </div>
              )}

              {rows && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileSpreadsheet className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-foreground truncate">{fileName}</span>
                    </div>
                    <button type="button" onClick={reset} className="text-xs text-muted-foreground hover:text-foreground underline flex-shrink-0">
                      Choose a different file
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-xs flex-wrap">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />{validRows.length} ready to import
                    </span>
                    {invalidCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5" />{invalidCount} skipped — missing or invalid fields
                      </span>
                    )}
                  </div>

                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto max-h-72 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-muted/60">
                          <tr>
                            {columns.map((c) => (
                              <th key={String(c.key)} className="text-left px-3 py-2 text-[11px] font-mono text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                                {c.label}
                              </th>
                            ))}
                            <th className="text-left px-3 py-2 text-[11px] font-mono text-muted-foreground uppercase tracking-wide">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {rows.map((r, i) => (
                            <tr key={i} className={r.errors.length ? "bg-red-50/50" : ""}>
                              {columns.map((c) => (
                                <td key={String(c.key)} className="px-3 py-2 text-xs text-foreground whitespace-nowrap">
                                  {Array.isArray(r.data[c.key]) ? (r.data[c.key] as unknown[]).join(", ") : String(r.data[c.key] ?? "—")}
                                </td>
                              ))}
                              <td className="px-3 py-2 text-xs">
                                {r.errors.length ? (
                                  <span className="text-red-600">{r.errors.join("; ")}</span>
                                ) : (
                                  <span className="text-emerald-600">OK</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border flex-shrink-0">
              <button type="button" onClick={onClose} className="px-4 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors font-medium">Cancel</button>
              <button type="button" onClick={handleImport} disabled={validRows.length === 0}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none">
                <Upload className="w-4 h-4" />
                Import{validRows.length > 0 ? ` ${validRows.length}` : ""} {validRows.length === 1 ? entityLabelSingular : entityLabelPlural}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
