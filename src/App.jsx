import React, { useState, useEffect, useRef } from 'react';
import { TimesheetForm } from './components/TimesheetForm';
import { TimesheetPreview } from './components/TimesheetPreview';
import { OvertimeForm } from './components/OvertimeForm';
import { OvertimePreview } from './components/OvertimePreview';
import { getWeekendsInMonth, getMonthNameId } from './utils/dateHelpers';
import { exportToPdf } from './utils/pdfExporter';
import { Calendar, FileText, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import defaultSignature from './assets/images/default-signature.png';

function App() {
  const [activeView, setActiveView] = useState('timesheet'); // 'timesheet' or 'overtime'
  
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
  const [timesheetState, setTimesheetState] = useState({
    employeeName: "Employee Name",
    roleName: "Software Developer",
    year: 2026,
    month: 5,
    departmentHeadName: "Dept Head Name",
    counterSignName: "Supervisor Name",
    defaultActivities: "Grooming / Support Integration / Support UAT",
    hourOfDefaultActivities: 1,
    weekendDays: getWeekendsInMonth(2026, 5),
    holidayDays: [],
    leaveDays: []
  });

  const [timesheetTickets, setTimesheetTickets] = useState([
    { ticketNumber: "EDBS-313333", title: "GET report/v2/audit-non-financial/transaction-log/pdf" },
    { ticketNumber: "EDBS-312683", title: "GET digital-channel/v1/mita/overview" }
  ]);

  const [timesheetHoursOverrides, setTimesheetHoursOverrides] = useState({});
  const [timesheetLogos, setTimesheetLogos] = useState({
    companyLogo: null,
    vendorLogo: null,
    signatureEmployee: defaultSignature
  });

  // ==========================================
  // STATE FOR FEATURE 2: OVERTIME BUILDER
  // ==========================================
  const [overtimeState, setOvertimeState] = useState({
    employeeName: "Daniel Sipangkar",
    roleName: "Software Developer",
    supervisorName: "Supervisor Name",
    supervisorRole: "Supervisor Role",
    formTitle: "SURAT KETERANGAN KERJA LEMBUR",
    formDescription: "Sehubungan dengan adanya pekerjaan yang tidak dapat ditangguhkan penyelesaiannya, maka dengan ini saya meminta kepada karyawan tersebut di bawah ini untuk melakukan kerja lembur pada hari dan waktu sebagaimana tercantum dalam daftar lembur di bawah ini:",
    overtimeList: [
      { 
        id: '1', 
        overtimeDate: '2026-05-12', 
        overtimeHours: 4, 
        isWeekend: false, 
        isWeekday: true, 
        isHoliday: false, 
        timeRange: '17:00 - 21:00', 
        task: 'Support release deployment and post-migration smoke test' 
      },
      { 
        id: '2', 
        overtimeDate: '2026-05-17', 
        overtimeHours: 7, 
        isWeekend: true, 
        isWeekday: false, 
        isHoliday: false, 
        timeRange: '09:00 - 16:00', 
        task: 'Weekend on-call support for integration verification' 
      }
    ]
  });

  const [overtimeLogos, setOvertimeLogos] = useState({
    overtimeCompanyLogo: null
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
  // HANDLERS & ACTIONS
  // ==========================================
  const handleTicketsParsed = (newTickets) => {
    setTimesheetTickets(newTickets);
    setTimesheetHoursOverrides(prev => {
      const copy = { ...prev };
      newTickets.forEach(t => {
        delete copy[t.ticketNumber];
      });
      return copy;
    });
    setImportSuccessCount(newTickets.length);
    setShowImportSuccess(true);
  };

  const handleTicketsParseError = (errorMsg) => {
    setImportErrorMsg(errorMsg);
    setShowImportError(true);
  };

  const handleTimesheetLogosUpdated = (type, url) => {
    setTimesheetLogos(prev => ({
      ...prev,
      [type]: url
    }));
  };

  const handleOvertimeLogoUpdated = (type, url) => {
    setOvertimeLogos({
      overtimeCompanyLogo: url
    });
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
    }
  };

  // PDF Export triggers with asynchronous loaders
  const handleGenerateTimesheetPdf = () => {
    const filename = `Timesheet_${timesheetState.employeeName.replace(/\s+/g, '_')}_${getMonthNameId(timesheetState.month)}_${timesheetState.year}.pdf`;
    
    setIsGenerating(true);
    setExportedFilename(filename);

    // Defer execution slightly to let React complete rendering the spinner
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
    const filename = `Overtime_${overtimeState.employeeName.replace(/\s+/g, '_')}.pdf`;
    
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
                Timesheet Builder
              </h1>
            </div>
          </div>

          {/* Nav Switcher */}
          <nav className="flex bg-gray-150 p-1 rounded-xl gap-1 shadow-inner">
            <button 
              onClick={() => setActiveView('timesheet')}
              className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                activeView === 'timesheet' 
                  ? 'bg-white text-mandiri-blue shadow-sm' 
                  : 'text-gray-500 hover:text-gray-850'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> Timesheet Builder
            </button>
            <button 
              onClick={() => setActiveView('overtime')}
              className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                activeView === 'overtime' 
                  ? 'bg-white text-mandiri-blue shadow-sm' 
                  : 'text-gray-500 hover:text-gray-850'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Overtime Form Builder
            </button>
          </nav>

          {/* Right side spacer */}
          <div className="w-9 h-9"></div>
        </div>
      </header>

      {/* SPLIT LAYOUT VIEWER */}
      <main 
        ref={containerRef}
        className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col lg:flex-row gap-0 min-h-0 relative"
      >
        
        {/* LEFT COLUMN: Input Form */}
        <section 
          className="flex flex-col no-print min-w-0"
          style={{ width: isLargeScreen ? `${leftWidth}%` : '100%', flexShrink: 0 }}
        >
          {activeView === 'timesheet' ? (
            <TimesheetForm 
              state={timesheetState}
              setState={setTimesheetState}
              onTicketsParsed={handleTicketsParsed}
              onLogosUpdated={handleTimesheetLogosUpdated}
              onTicketsParseError={handleTicketsParseError}
            />
          ) : (
            <OvertimeForm 
              state={overtimeState}
              setState={setOvertimeState}
              onLogoUpdated={handleOvertimeLogoUpdated}
            />
          )}
        </section>

        {/* DRAGGABLE SPLITTER DIVIDER BAR */}
        <div 
          className="hidden lg:flex items-center justify-center w-6 cursor-col-resize select-none no-print group relative"
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
        >
          {/* Vertical divider line */}
          <div className="w-[1.5px] h-full bg-slate-200 group-hover:bg-mandiri-blue group-active:bg-mandiri-blue transition-colors"></div>
          {/* Grab handle pill */}
          <div className="absolute top-1/2 -translate-y-1/2 w-4 h-8 bg-white border border-slate-200 shadow-md rounded-md flex flex-col items-center justify-center gap-0.5 group-hover:border-mandiri-blue group-active:border-mandiri-blue transition-colors">
            <span className="w-1.5 h-0.5 bg-slate-400 group-hover:bg-mandiri-blue rounded-full"></span>
            <span className="w-1.5 h-0.5 bg-slate-400 group-hover:bg-mandiri-blue rounded-full"></span>
            <span className="w-1.5 h-0.5 bg-slate-400 group-hover:bg-mandiri-blue rounded-full"></span>
          </div>
        </div>

        {/* RIGHT COLUMN: Excel Preview Grid */}
        <section 
          className="flex flex-col min-w-0 h-full overflow-hidden"
          style={{ flex: isLargeScreen ? '1 1 0%' : 'none' }}
        >
          {activeView === 'timesheet' ? (
            <TimesheetPreview 
              state={timesheetState}
              tickets={timesheetTickets}
              hoursOverrides={timesheetHoursOverrides}
              onCellEdit={handleCellEdit}
              onResetOverrides={handleResetOverrides}
              onGeneratePdf={handleGenerateTimesheetPdf}
              companyLogoUrl={timesheetLogos.companyLogo}
              vendorLogoUrl={timesheetLogos.vendorLogo}
              signatureEmployeeUrl={timesheetLogos.signatureEmployee}
            />
          ) : (
            <OvertimePreview 
              state={overtimeState}
              onGeneratePdf={handleGenerateOvertimePdf}
              companyLogoUrl={overtimeLogos.overtimeCompanyLogo}
            />
          )}
        </section>

      </main>

      {/* ==========================================
         MODAL POP-UPS (LOADING & CONFIRMATION)
         ========================================== */}

      {/* 1. LOADING POP-UP OVERLAY */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md transition-all duration-300">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl flex flex-col items-center border border-slate-100 animate-fade-in text-center">
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

      {/* 2. SUCCESS CONFIRMATION POP-UP */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center border border-slate-100 animate-fade-in text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-1">PDF Export Complete</h3>
            <p className="text-xs text-gray-500 mb-4 max-w-xs leading-normal">
              Your file has been generated successfully.
            </p>

            {/* Document details box */}
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

      {/* 3. JIRA IMPORT SUCCESS POP-UP */}
      {showImportSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-all duration-300 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center border border-slate-100 text-center">
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

      {/* 4. JIRA IMPORT ERROR POP-UP */}
      {showImportError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-all duration-300 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center border border-slate-100 text-center">
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
