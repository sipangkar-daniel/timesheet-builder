import { useState } from 'react';
import { parseJiraCSV, parseJiraJSON } from '../utils/csvParser';
import { Upload, FileText, RefreshCw, FileJson } from 'lucide-react';
import { PLACEHOLDERS } from '../utils/constants';

export const UploadTicketForm = ({
  defaultActivities,
  setDefaultActivities,
  hourOfDefaultActivities,
  setHourOfDefaultActivities,
  tickets,
  onClearTickets,
  onTicketsParsed,
  onTicketsParseError,
  isAutoGenerate,
  setIsAutoGenerate,
  weekdayHour,
  setWeekdayHour,
  weekendHour,
  setWeekendHour
}) => {
  const [jsonText, setJsonText] = useState('');
  const [showJsonInput, setShowJsonInput] = useState(false);
  const [csvFileName, setCsvFileName] = useState('');

  // Parse and load CSV
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      try {
        const parsed = parseJiraCSV(text);
        if (parsed.length === 0) {
          onTicketsParseError("No valid tickets found in CSV. Row count is empty.\n" +
              "Make sure column in csv have: Issue key, Summary");
          setCsvFileName('')
          return;
        }
        onTicketsParsed(parsed);
      } catch (err) {
        onTicketsParseError(err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Reset file input value so onChange can trigger again for the same file
  };

  // Parse and load JSON
  const handleJsonSubmit = () => {
    if (!jsonText.trim()) return;
    try {
      let parsed;
      try {
        parsed = parseJiraJSON(jsonText);
      } catch (syntaxErr) {
        throw new Error(
          `Format JSON tidak valid. Pastikan tidak ada tanda koma yang salah atau kurung yang kurang.\n\nContoh format yang benar:|[CODE]{\n  "ticket": [\n    {\n      "issueKey": "TICKET-123",\n      "summary": "Deskripsi Pekerjaan"\n    }\n  ]\n}`,
          { cause: syntaxErr }
        );
      }

      if (!parsed || parsed.length === 0) {
        throw new Error(
          `Struktur JSON tidak dikenal. Sistem tidak menemukan data tiket.\n\nContoh format yang didukung:|[CODE]{\n  "ticket": [\n    {\n      "issueKey": "TICKET-123",\n      "summary": "Deskripsi Pekerjaan"\n    }\n  ]\n}`
        );
      }
      
      onTicketsParsed(parsed);
      setShowJsonInput(false);
      setJsonText('');
    } catch (err) {
      setJsonText('');
      onTicketsParseError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Ticket Section */}
      <div className="space-y-4">
        {/* CSV Import */}
        {(!tickets || tickets.length === 0) ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">JIRA CSV Export / JSON Issues</span>
              <button 
                type="button"
                onClick={() => setShowJsonInput(!showJsonInput)}
                className="text-xs text-mandiri-blue dark:text-cyan-400 font-medium hover:underline flex items-center gap-1"
              >
                {showJsonInput ? <FileText className="w-3.5 h-3.5" /> : <FileJson className="w-3.5 h-3.5" />}
                {showJsonInput ? "Switch to CSV upload" : "Paste JSON instead"}
              </button>
            </div>

            {!showJsonInput ? (
              <div className="relative border-2 border-dashed border-gray-200 dark:border-gray-700/60 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900/10 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-all duration-200">
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold">
                  {csvFileName || "Click or Drag CSV file here"}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">Make sure column in csv have: Issue key, Summary</p>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea 
                  rows="4"
                  placeholder='{"ticket": [{"issueKey": "TICKET-NUMBER", "summary": "Create Feature Login"}]}'
                  value={jsonText}
                  onChange={e => setJsonText(e.target.value)}
                  className="w-full font-mono text-xs rounded-lg p-2 bg-white/70 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-mandiri-blue resize-y"
                />
                <button 
                  type="button"
                  onClick={handleJsonSubmit}
                  className="w-full text-xs font-semibold bg-mandiri-blue text-white rounded-lg py-2 hover:bg-mandiri-blue/90 shadow-md flex items-center justify-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Parse and Apply JSON
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-between items-center p-3 bg-green-50/50 dark:bg-green-950/10 border border-green-150 dark:border-green-900/50 rounded-xl shadow-sm animate-fade-in">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-green-700 dark:text-green-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> Loaded {tickets.length} Tickets
              </span>
              <span className="text-[10px] text-gray-400">File: {csvFileName || 'Imported via JSON'}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClearTickets();
                setCsvFileName('');
              }}
              className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 font-bold hover:underline"
            >
              Clear Tickets
            </button>
          </div>
        )}

        {/* Conditional Configuration Section: Only appears when tickets exist */}
        {tickets && tickets.length > 0 && (
          <div className="pt-4 border-t border-gray-150/60 dark:border-gray-800/80 space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Default Activity Description (used for first ticket only)
                </label>
                <textarea
                    rows={1}
                    value={defaultActivities}
                    onChange={e => setDefaultActivities(e.target.value)}
                    placeholder={PLACEHOLDERS.DEFAULT_ACTIVITIES}
                    className="w-full text-sm rounded-lg px-3 py-2 bg-white/70 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 text-gray-800 dark:text-white focus:ring-2 focus:ring-mandiri-blue focus:outline-none resize-none"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Hours
                </label>
                <input
                    type="number"
                    min="0"
                    max="24"
                    value={hourOfDefaultActivities}
                    onChange={e => setHourOfDefaultActivities(Number(e.target.value))}
                    placeholder={PLACEHOLDERS.DEFAULT_BASELINE_HOURS}
                    className="w-full text-sm rounded-lg px-3 py-2 bg-white/70 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 text-gray-800 dark:text-white focus:ring-2 focus:ring-mandiri-blue focus:outline-none"
                />
              </div>
            </div>

            {/* Toggle Switch for Auto Generate Hour */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-900/40 border border-slate-150 dark:border-gray-850 rounded-xl shadow-sm">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Auto Generate Hour</span>
                <span className="text-[10px] text-gray-400">Distribute JIRA tickets automatically across active days</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={isAutoGenerate} 
                  onChange={e => setIsAutoGenerate(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 dark:bg-gray-800 peer-focus:outline-none rounded-full peer peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-mandiri-blue dark:peer-checked:bg-mandiri-yellow"></div>
              </label>
            </div>

            {/* Weekday / Weekend Hour Configuration (Only visible when Auto Generate is ON) */}
            {isAutoGenerate && (
              <div className="grid grid-cols-2 gap-4 pt-2 animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Weekday Hour
                  </label>
                  <input 
                    type="number"
                    min="0"
                    max="24"
                    value={weekdayHour}
                    onChange={e => setWeekdayHour(Number(e.target.value))}
                    className="w-full text-sm rounded-lg px-3 py-2 bg-white/70 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 text-gray-800 dark:text-white focus:ring-2 focus:ring-mandiri-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Weekend Hour
                  </label>
                  <input 
                    type="number"
                    min="0"
                    max="24"
                    value={weekendHour}
                    onChange={e => setWeekendHour(Number(e.target.value))}
                    className="w-full text-sm rounded-lg px-3 py-2 bg-white/70 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 text-gray-800 dark:text-white focus:ring-2 focus:ring-mandiri-blue focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
