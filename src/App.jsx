import React, { useState, useEffect, useRef } from 'react';
import { TimesheetForm } from './components/TimesheetForm';
import { TimesheetPreview } from './components/TimesheetPreview';
import { OvertimeForm } from './components/OvertimeForm';
import { OvertimePreview } from './components/OvertimePreview';
import { getWeekendsInMonth, getMonthNameId, getDaysInMonth } from './utils/dateHelpers';
import { exportToPdf } from './utils/pdfExporter';
import { Calendar, FileText, Sparkles, Loader2, CheckCircle2, ChevronDown, Upload } from 'lucide-react';
import defaultSignature from './assets/images/default-signature.png';
import { TEXTS } from './utils/constants';

function App() {
  // Accordion open/close states
  const [isTimesheetFormOpen, setIsTimesheetFormOpen] = useState(false);
  const [isOvertimeFormOpen, setIsOvertimeFormOpen] = useState(false);
  const [isAssetsFormOpen, setIsAssetsFormOpen] = useState(false);

  // DRAGGABLE LAYOUT RESIZER STATE
  const [leftWidth, setLeftWidth] = useState(40); // default 40%
  const [isDragging, setIsDragging] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
        if (newWidth >= 20 && newWidth <= 65) {
          setLeftWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleDoubleClick = () => {
    setLeftWidth(40); // Reset to default 40%
  };

  // ==========================================
  // STATE FOR FEATURE 1: TIMESHEET BUILDER
  // ==========================================
  const [personnelState, setPersonnelState] = useState({
    employeeName: "",
    roleName: "",
    supervisorName: "",
    supervisorRole: "",
    departmentHeadName: ""
  });

  // ==========================================
  // STATE FOR FEATURE 1: TIMESHEET BUILDER
  // ==========================================
  const [timesheetState, setTimesheetState] = useState({
    year: 2026,
    month: 5,
    weekendDays: getWeekendsInMonth(2026, 5),
    holidayDays: [],
    leaveDays: [],
    workedHolidayDays: []
  });

  const [defaultActivities, setDefaultActivities] = useState(TEXTS.DEFAULT_ACTIVITIES);
  const [hourOfDefaultActivities, setHourOfDefaultActivities] = useState(1);

  const [timesheetTickets, setTimesheetTickets] = useState([]);
  const [mergedRowGroups, setMergedRowGroups] = useState([]);

  const [timesheetHoursOverrides, setTimesheetHoursOverrides] = useState({});
  const [globalLogos, setGlobalLogos] = useState({
    companyLogo: null,
    vendorLogo: null,
    signatureEmployee: defaultSignature
  });

  // ==========================================
  // STATE FOR FEATURE 2: OVERTIME BUILDER
  // ==========================================
  const [overtimeState, setOvertimeState] = useState({
    formTitle: "SURAT KETERANGAN KERJA LEMBUR",
    formDescription: "Sehubungan dengan adanya pekerjaan yang tidak dapat ditangguhkan penyelesaiannya, maka dengan ini saya meminta kepada karyawan tersebut di bawah ini untuk melakukan kerja lembur pada hari dan waktu sebagaimana tercantum dalam daftar lembur di bawah ini:",
    isDescriptionSame: true,
    globalDescription: TEXTS.DEFAULT_GLOBAL_DESCRIPTION,
    overtimeList: []
  });

  // ==========================================
  // PDF EXPORT & IMPORT POPUP MODAL STATE
  // ==========================================
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [exportedFilename, setExportedFilename] = useState('');

  const [showImportSuccess, setShowImportSuccess] = useState(false);
  const [showImportError, setShowImportError] = useState(false);
  const [importSuccessCount, setImportSuccessCount] = useState(0);
  const [importErrorMsg, setImportErrorMsg] = useState('');



  // ==========================================
  // AUTOMATIC OVERTIME SCHEDULE DERIVATION
  // ==========================================
  useEffect(() => {
    const totalDays = getDaysInMonth(timesheetState.year, timesheetState.month);
    const qualifying = [];

    for (let day = 1; day <= totalDays; day++) {
      const dStr = String(day).padStart(2, '0');
      const mStr = String(timesheetState.month).padStart(2, '0');
      const dateKey = `${timesheetState.year}-${mStr}-${dStr}`;

      // Calculate total daily hours from Timesheet
      let defVal = timesheetTickets.length === 0 ? 0 : hourOfDefaultActivities;
      const isSpecial = timesheetState.weekendDays.includes(dateKey) || 
                        (timesheetState.holidayDays.includes(dateKey) && !timesheetState.workedHolidayDays?.includes(dateKey)) || 
                        timesheetState.leaveDays.includes(dateKey);
      
      if (isSpecial) defVal = 0;
      if (timesheetHoursOverrides['default'] && timesheetHoursOverrides['default'][day] !== undefined) {
        defVal = timesheetHoursOverrides['default'][day];
      }

      let daySum = Number(defVal || 0);
      timesheetTickets.forEach(ticket => {
        let ticketVal = 0;
        const ticketKey = ticket.id || ticket.ticketNumber;
        if (timesheetHoursOverrides[ticketKey] && timesheetHoursOverrides[ticketKey][day] !== undefined) {
          ticketVal = timesheetHoursOverrides[ticketKey][day];
        }
        daySum += Number(ticketVal || 0);
      });

      if (daySum > 0) {
        const isWeekend = timesheetState.weekendDays.includes(dateKey);
        const isWorkedHoliday = timesheetState.workedHolidayDays?.includes(dateKey);

        if (isWeekend) {
          qualifying.push({
            date: dateKey,
            hours: daySum,
            isWeekend: true,
            isWeekday: false,
            isHoliday: false
          });
        } else if (isWorkedHoliday) {
          qualifying.push({
            date: dateKey,
            hours: daySum,
            isWeekend: false,
            isWeekday: false,
            isHoliday: true
          });
        } else {
          // Weekday
          if (daySum > 9) {
            qualifying.push({
              date: dateKey,
              hours: daySum - 9,
              isWeekend: false,
              isWeekday: true,
              isHoliday: false
            });
          }
        }
      }
    }

    const newOvertimeList = qualifying.map(q => {
      const existing = overtimeState.overtimeList.find(item => item.overtimeDate === q.date);

      // Determine starting hour: Weekday is 17:00 (5 PM), Weekend/Holiday is 09:00 (9 AM)
      const startHour = q.isWeekday ? 17 : 9;
      
      // If startHour + hours goes past 24:00 (midnight), cap at 24:00 and adjust the hours count
      let displayHours = q.hours;
      if (startHour + q.hours > 24) {
        displayHours = 24 - startHour;
      }

      const formatTime = (h) => `${String(h).padStart(2, '0')}:00`;
      const defaultTimeRange = `${formatTime(startHour)} - ${formatTime(startHour + displayHours)}`;

      // Sync/re-derive the time range if the calculated hours changed
      const hoursChanged = existing ? existing.overtimeHours !== displayHours : false;

      let timeRange = defaultTimeRange;
      if (existing && !hoursChanged) {
        timeRange = existing.timeRange;
      }

      const taskText = overtimeState.isDescriptionSame
        ? (overtimeState.globalDescription || '')
        : (existing ? existing.task : TEXTS.DEFAULT_GLOBAL_DESCRIPTION);

      return {
        id: existing ? existing.id : q.date,
        overtimeDate: q.date,
        overtimeHours: displayHours,
        timeRange: timeRange,
        isWeekend: q.isWeekend,
        isWeekday: q.isWeekday,
        isHoliday: q.isHoliday,
        task: taskText
      };
    });

    if (overtimeState.isDescriptionSame) {
      newOvertimeList.forEach(item => {
        item.task = overtimeState.globalDescription || '';
      });
    }

    const isDifferent = JSON.stringify(overtimeState.overtimeList) !== JSON.stringify(newOvertimeList);
    if (isDifferent) {
      setOvertimeState(prev => ({
        ...prev,
        overtimeList: newOvertimeList
      }));
    }
  }, [
    timesheetState.year,
    timesheetState.month,
    timesheetState.weekendDays,
    timesheetState.holidayDays,
    timesheetState.workedHolidayDays,
    timesheetHoursOverrides,
    timesheetTickets,
    hourOfDefaultActivities,
    overtimeState.isDescriptionSame,
    overtimeState.globalDescription
  ]);

  // ==========================================
  // HANDLERS & ACTIONS
  // ==========================================
  const handleTicketsParsed = (newTickets) => {
    const ticketsWithIds = newTickets.map((t, idx) => ({
      ...t,
      id: `${t.ticketNumber}-${idx}-${Date.now()}`
    }));
    setTimesheetTickets(ticketsWithIds);
    setTimesheetHoursOverrides(prev => {
      const copy = { ...prev };
      ticketsWithIds.forEach(t => {
        delete copy[t.id];
      });
      return copy;
    });
    setMergedRowGroups([]);
    setImportSuccessCount(newTickets.length);
    setShowImportSuccess(true);
  };

  const handleTicketsParseError = (errorMsg) => {
    setImportErrorMsg(errorMsg);
    setShowImportError(true);
  };

  const handleLogoUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) {
      setGlobalLogos(prev => ({
        ...prev,
        [type]: null
      }));
      return;
    }
    
    const logoUrl = URL.createObjectURL(file);
    setGlobalLogos(prev => ({
      ...prev,
      [type]: logoUrl
    }));
  };

  const handleCellEdit = (rowId, day, value) => {
    setTimesheetHoursOverrides(prev => {
      const rowOverrides = prev[rowId] ? { ...prev[rowId] } : {};
      rowOverrides[day] = value;
      return {
        ...prev,
        [rowId]: rowOverrides
      };
    });
  };

  const handleResetOverrides = () => {
    if (window.confirm("Are you sure you want to reset all manual cell edits?")) {
      setTimesheetHoursOverrides({});
      setMergedRowGroups([]);
    }
  };

  // PDF Export triggers with asynchronous loaders
  const handleGenerateTimesheetPdf = () => {
    const filename = `Timesheet_${personnelState.employeeName.replace(/\s+/g, '_')}_${getMonthNameId(timesheetState.month)}_${timesheetState.year}.pdf`;
    
    setIsGenerating(true);
    setExportedFilename(filename);

    setTimeout(() => {
      exportToPdf('timesheet-pdf-area', {
        filename,
        orientation: 'landscape',
        margin: 4
      })
      .then(() => {
        setIsGenerating(false);
        setShowSuccessModal(true);
      })
      .catch((err) => {
        setIsGenerating(false);
        alert("Failed to export Timesheet PDF: " + err);
      });
    }, 350);
  };

  const handleGenerateOvertimePdf = () => {
    const filename = `Overtime_${personnelState.employeeName.replace(/\s+/g, '_')}.pdf`;
    
    setIsGenerating(true);
    setExportedFilename(filename);

    setTimeout(() => {
      exportToPdf('overtime-pdf-area', {
        filename,
        orientation: 'portrait',
        margin: 10
      })
      .then(() => {
        setIsGenerating(false);
        setShowSuccessModal(true);
      })
      .catch((err) => {
        setIsGenerating(false);
        alert("Failed to export Overtime PDF: " + err);
      });
    }, 350);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/40 text-gray-800 transition-colors duration-300 font-sans flex flex-col ${isDragging ? 'select-none' : ''}`}>
      
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 glass-panel border-b border-gray-200/50 no-print">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo Title */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-mandiri-blue to-cyan-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight tracking-wide text-mandiri-blue">
                Timesheet & Overtime Builder
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* SPLIT LAYOUT VIEWER */}
      <main 
        ref={containerRef}
        className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col lg:flex-row gap-0 min-h-0 relative"
      >
        
        {/* LEFT COLUMN: Input Accordion Forms */}
        <section 
          className="flex flex-col no-print min-w-0 overflow-y-auto h-full pr-1 pb-6 space-y-4"
          style={{ width: isLargeScreen ? `${leftWidth}%` : '100%', flexShrink: 0 }}
        >
          {/* Accordion 1: Timesheet Form */}
          <div className="glass-panel rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800/80 overflow-hidden">
            <button
              onClick={() => setIsTimesheetFormOpen(!isTimesheetFormOpen)}
              className="w-full flex justify-between items-center p-4 font-bold text-mandiri-blue dark:text-gray-200 border-b border-gray-150 dark:border-gray-800 bg-slate-50/50 hover:bg-slate-100/50 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>Timesheet Form Editor</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isTimesheetFormOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${isTimesheetFormOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden p-4">
                <TimesheetForm 
                  state={timesheetState}
                  setState={setTimesheetState}
                  defaultActivities={defaultActivities}
                  setDefaultActivities={setDefaultActivities}
                  hourOfDefaultActivities={hourOfDefaultActivities}
                  setHourOfDefaultActivities={setHourOfDefaultActivities}
                  tickets={timesheetTickets}
                  onClearTickets={() => {
                    setTimesheetTickets([]);
                    setMergedRowGroups([]);
                  }}
                  onTicketsParsed={handleTicketsParsed}
                  onTicketsParseError={handleTicketsParseError}
                  personnel={personnelState}
                  setPersonnel={setPersonnelState}
                />
              </div>
            </div>
          </div>

          {/* Accordion 2: Overtime Form */}
          <div className="glass-panel rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800/80 overflow-hidden">
            <button
              onClick={() => setIsOvertimeFormOpen(!isOvertimeFormOpen)}
              className="w-full flex justify-between items-center p-4 font-bold text-mandiri-blue dark:text-gray-200 border-b border-gray-150 dark:border-gray-800 bg-slate-50/50 hover:bg-slate-100/50 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <span>Overtime Form Editor</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOvertimeFormOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${isOvertimeFormOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden p-4">
                <OvertimeForm 
                  state={overtimeState}
                  setState={setOvertimeState}
                  personnel={personnelState}
                  setPersonnel={setPersonnelState}
                />
              </div>
            </div>
          </div>

          {/* Accordion 3: Import & Logo Assets */}
          <div className="glass-panel rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800/80 overflow-hidden">
            <button
              onClick={() => setIsAssetsFormOpen(!isAssetsFormOpen)}
              className="w-full flex justify-between items-center p-4 font-bold text-mandiri-blue dark:text-gray-200 border-b border-gray-150 dark:border-gray-800 bg-slate-50/50 hover:bg-slate-100/50 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                <span>Import & Logo Assets</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isAssetsFormOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${isAssetsFormOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden p-4 space-y-4">
                {/* Logo File Selectors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Company Logo (Override)
                    </label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => handleLogoUpload(e, 'companyLogo')}
                      className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-mandiri-blue/10 file:text-mandiri-blue dark:file:bg-gray-800 dark:file:text-gray-300 hover:file:bg-mandiri-blue/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Vendor Logo (Override)
                    </label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => handleLogoUpload(e, 'vendorLogo')}
                      className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-mandiri-blue/10 file:text-mandiri-blue dark:file:bg-gray-800 dark:file:text-gray-300 hover:file:bg-mandiri-blue/20"
                    />
                  </div>
                </div>

                {/* Employee Signature File Upload */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Employee Signature Image
                  </label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => handleLogoUpload(e, 'signatureEmployee')}
                    className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-mandiri-blue/10 file:text-mandiri-blue dark:file:bg-gray-800 dark:file:text-gray-300 hover:file:bg-mandiri-blue/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DRAGGABLE SPLITTER DIVIDER BAR */}
        <div 
          className="hidden lg:flex items-center justify-center w-6 cursor-col-resize select-none no-print group relative"
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
        >
          <div className="w-[1.5px] h-full bg-slate-200 group-hover:bg-mandiri-blue group-active:bg-mandiri-blue transition-colors"></div>
          <div className="absolute top-1/2 -translate-y-1/2 w-4 h-8 bg-white border border-slate-200 shadow-md rounded-md flex flex-col items-center justify-center gap-0.5 group-hover:border-mandiri-blue group-active:border-mandiri-blue transition-colors">
            <span className="w-1.5 h-0.5 bg-slate-400 group-hover:bg-mandiri-blue rounded-full"></span>
            <span className="w-1.5 h-0.5 bg-slate-400 group-hover:bg-mandiri-blue rounded-full"></span>
            <span className="w-1.5 h-0.5 bg-slate-400 group-hover:bg-mandiri-blue rounded-full"></span>
          </div>
        </div>

        {/* RIGHT COLUMN: Stacked Previews */}
        <section 
          className="flex flex-col min-w-0 h-full overflow-hidden"
          style={{ flex: isLargeScreen ? '1 1 0%' : 'none' }}
        >
          <div className="flex-1 overflow-y-auto space-y-6 pr-2 pb-6">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 select-none">Timesheet Preview</h4>
              <TimesheetPreview 
                state={timesheetState}
                tickets={timesheetTickets}
                defaultActivities={defaultActivities}
                hourOfDefaultActivities={hourOfDefaultActivities}
                hoursOverrides={timesheetHoursOverrides}
                onCellEdit={handleCellEdit}
                onResetOverrides={handleResetOverrides}
                onGeneratePdf={handleGenerateTimesheetPdf}
                companyLogoUrl={globalLogos.companyLogo}
                vendorLogoUrl={globalLogos.vendorLogo}
                signatureEmployeeUrl={globalLogos.signatureEmployee}
                personnel={personnelState}
                mergedRowGroups={mergedRowGroups}
                setMergedRowGroups={setMergedRowGroups}
              />
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 select-none">Overtime Preview</h4>
              <OvertimePreview 
                state={overtimeState}
                onGeneratePdf={handleGenerateOvertimePdf}
                companyLogoUrl={globalLogos.companyLogo}
                signatureEmployeeUrl={globalLogos.signatureEmployee}
                personnel={personnelState}
              />
            </div>
          </div>
        </section>

      </main>

      {/* ==========================================
         MODAL POP-UPS (LOADING & CONFIRMATION)
         ========================================== */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md transition-all duration-300">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl flex flex-col items-center border border-slate-100 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-mandiri-blue/10 flex items-center justify-center text-mandiri-blue mb-4">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Generating Compliance PDF</h3>
            <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
              We are compiling the document and scaling the Excel layouts. Please do not close the tab or reload.
            </p>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center border border-slate-100 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-1">PDF Export Complete</h3>
            <p className="text-xs text-gray-500 mb-4 max-w-xs leading-normal">
              Your file has been generated successfully.
            </p>

            <div className="w-full bg-slate-50 border border-slate-150 rounded-xl p-3 mb-5 text-left font-mono">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Filename</div>
              <div className="text-xs font-semibold text-mandiri-blue truncate" title={exportedFilename}>
                {exportedFilename}
              </div>
            </div>

            <button 
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-2.5 bg-mandiri-blue hover:bg-mandiri-blue/90 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Okay, got it!
            </button>
          </div>
        </div>
      )}

      {showImportSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center border border-slate-100 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-1">Import Successful</h3>
            <p className="text-xs text-gray-500 mb-4 max-w-xs leading-normal">
              Successfully parsed and loaded JIRA tickets.
            </p>

            <div className="w-full bg-slate-50 border border-slate-150 rounded-xl p-3 mb-5 text-left">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Tickets Loaded</div>
              <div className="text-sm font-extrabold text-mandiri-blue">
                {importSuccessCount} Issues
              </div>
            </div>

            <button 
              onClick={() => setShowImportSuccess(false)}
              className="w-full py-2.5 bg-mandiri-blue hover:bg-mandiri-blue/90 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showImportError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center border border-slate-100 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-lg font-extrabold text-red-600 mb-1">Jira Import Failed</h3>
            <p className="text-xs text-gray-500 mb-4 max-w-xs leading-normal">
              An error occurred during file parsing.
            </p>

            <div className="w-full bg-red-50/55 border border-red-100 rounded-xl p-3 mb-5 text-left font-mono">
              <div className="text-[10px] text-red-500 font-bold uppercase tracking-wider mb-0.5">Error Message</div>
              <div className="text-xs font-semibold text-red-700 leading-normal">
                {importErrorMsg}
              </div>
            </div>

            <button 
              onClick={() => setShowImportError(false)}
              className="w-full py-2.5 bg-red-650 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
