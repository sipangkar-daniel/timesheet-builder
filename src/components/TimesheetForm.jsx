import { useState } from 'react';
import { parseJiraCSV, parseJiraJSON } from '../utils/csvParser';
import { MultiDatePicker } from './MultiDatePicker';
import { MonthYearPicker } from './MonthYearPicker';
import { Upload, FileText, RefreshCw, Calendar, FileJson } from 'lucide-react';
import { getWeekendsInMonth } from '../utils/dateHelpers';
import { PLACEHOLDERS } from '../utils/constants';

export const TimesheetForm = ({ 
  state, 
  setState, 
  defaultActivities,
  setDefaultActivities,
  hourOfDefaultActivities,
  setHourOfDefaultActivities,
  tickets,
  onClearTickets,
  onTicketsParsed, 
  onTicketsParseError,
  personnel,
  setPersonnel
}) => {
  const [jsonText, setJsonText] = useState('');
  const [showJsonInput, setShowJsonInput] = useState(false);
  const [csvFileName, setCsvFileName] = useState('');

  const handlePersonnelChange = (field, value) => {
    setPersonnel(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle interactive calendar changes
  const handleCalendarChange = ({ weekendDays, holidayDays, leaveDays, workedHolidayDays }) => {
    setState(prev => ({
      ...prev,
      weekendDays,
      holidayDays,
      leaveDays,
      workedHolidayDays
    }));
  };

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
          onTicketsParseError("No valid tickets found in CSV. Row count is empty.");
          return;
        }
        onTicketsParsed(parsed);
      } catch (err) {
        onTicketsParseError(err.message);
      }
    };
    reader.readAsText(file);
  };

  // Parse and load JSON
  const handleJsonSubmit = () => {
    if (!jsonText.trim()) return;
    try {
      const parsed = parseJiraJSON(jsonText);
      if (parsed.length === 0) {
        onTicketsParseError("No valid tickets found in JSON. Array count is empty.");
        return;
      }
      onTicketsParsed(parsed);
      setShowJsonInput(false);
      setJsonText('');
    } catch (err) {
      onTicketsParseError(err.message);
    }
  };


  return (
    <div className="space-y-6">
      {/* Employee & Role Information */}
      <div className="glass-panel rounded-2xl p-5 shadow-lg space-y-4">
        <h3 className="text-base font-bold text-mandiri-blue dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center gap-2">
          <FileText className="w-5 h-5" /> Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Employee Name
            </label>
            <input 
              type="text" 
              value={personnel.employeeName}
              placeholder={PLACEHOLDERS.EMPLOYEE_NAME}
              onChange={e => handlePersonnelChange('employeeName', e.target.value)}
              className="w-full text-sm rounded-lg px-3 py-2 bg-white/70 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 text-gray-800 dark:text-white focus:ring-2 focus:ring-mandiri-blue focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Role
            </label>
            <input 
              type="text" 
              value={personnel.roleName}
              placeholder={PLACEHOLDERS.ROLE}
              onChange={e => handlePersonnelChange('roleName', e.target.value)}
              className="w-full text-sm rounded-lg px-3 py-2 bg-white/70 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 text-gray-800 dark:text-white focus:ring-2 focus:ring-mandiri-blue focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Department Head Name
            </label>
            <input 
              type="text" 
              value={personnel.departmentHeadName}
              placeholder={PLACEHOLDERS.DEPARTMENT_HEAD_NAME}
              onChange={e => handlePersonnelChange('departmentHeadName', e.target.value)}
              className="w-full text-sm rounded-lg px-3 py-2 bg-white/70 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 text-gray-800 dark:text-white focus:ring-2 focus:ring-mandiri-blue focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Supervisor Name
            </label>
            <input 
              type="text" 
              value={personnel.supervisorName}
              placeholder={PLACEHOLDERS.SUPERVISOR_NAME}
              onChange={e => handlePersonnelChange('supervisorName', e.target.value)}
              className="w-full text-sm rounded-lg px-3 py-2 bg-white/70 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 text-gray-800 dark:text-white focus:ring-2 focus:ring-mandiri-blue focus:outline-none"
            />
          </div>
        </div>

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

        {/* CSV Import (Swapped from Bottom) */}
        <div className="pt-2 border-t border-gray-150/60 dark:border-gray-800/80 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">JIRA CSV Export / JSON Issues</span>
            <div className="flex items-center gap-3">
              {tickets && tickets.length > 0 && (
                <button
                  type="button"
                  onClick={onClearTickets}
                  className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 font-medium hover:underline flex items-center gap-1"
                >
                  Clear Tickets
                </button>
              )}
              <button 
                type="button"
                onClick={() => setShowJsonInput(!showJsonInput)}
                className="text-xs text-mandiri-blue dark:text-cyan-400 font-medium hover:underline flex items-center gap-1"
              >
                {showJsonInput ? <FileText className="w-3.5 h-3.5" /> : <FileJson className="w-3.5 h-3.5" />}
                {showJsonInput ? "Switch to CSV upload" : "Paste JSON instead"}
              </button>
            </div>
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
      </div>

      {/* Date & Baseline Configuration */}
      <div className="glass-panel rounded-2xl p-5 shadow-lg space-y-4">
        <h3 className="text-base font-bold text-mandiri-blue dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center gap-2">
          <Calendar className="w-5 h-5" /> Timesheet Date Rules
        </h3>

        <div className="mt-4">
          <MonthYearPicker
              year={state.year}
              month={state.month}
              onChange={(y, m) => {
                const newWeekends = getWeekendsInMonth(y, m);
                setState(prev => ({
                  ...prev,
                  year: y,
                  month: m,
                  weekendDays: newWeekends,
                  holidayDays: [],
                  leaveDays: []
                }));
              }}
          />
        </div>

        {/* Multi-DatePicker Calendar View */}
        <MultiDatePicker
          year={state.year}
          month={state.month}
          weekendDays={state.weekendDays}
          holidayDays={state.holidayDays}
          leaveDays={state.leaveDays}
          workedHolidayDays={state.workedHolidayDays}
          onChange={handleCalendarChange}
        />
      </div>


    </div>
  );
};
