import React, { useState } from 'react';
import { getDaysInMonth, getDayAbbreviation, getMonthNameId } from '../utils/dateHelpers';
import { PreviewActionPanel, PreviewViewport, PreviewBrandingHeader } from './PreviewShared';
import { PLACEHOLDERS, TEXTS } from '../utils/constants';

export const TimesheetPreview = ({ 
  state, 
  tickets, 
  defaultActivities,
  hourOfDefaultActivities,
  hoursOverrides, 
  onCellEdit, 
  onResetOverrides,
  onGeneratePdf,
  companyLogoUrl,
  vendorLogoUrl,
  signatureEmployeeUrl,
  personnel
}) => {
  const [zoom, setZoom] = useState(1.0);
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2.0));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleZoomReset = () => setZoom(1.0);

  const { 
    employeeName, 
    roleName, 
    departmentHeadName, 
    supervisorName 
  } = personnel;

  const { 
    year, 
    month, 
    weekendDays, 
    holidayDays, 
    leaveDays,
    workedHolidayDays = []
  } = state;

  const totalDays = getDaysInMonth(year, month);
  const monthName = getMonthNameId(month);
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Helper to format date string for state lookup
  const getDateKey = (day) => {
    const dStr = String(day).padStart(2, '0');
    const mStr = String(month).padStart(2, '0');
    return `${year}-${mStr}-${dStr}`;
  };

  // Check if a specific day is a Weekend, Holiday, or Leave day
  const isDaySpecial = (day) => {
    const key = getDateKey(day);
    return weekendDays.includes(key) || 
           (holidayDays.includes(key) && !workedHolidayDays.includes(key)) || 
           leaveDays.includes(key);
  };

  // Get vertical label text for merged special day columns
  const getVerticalTextForDay = (day) => {
    const key = getDateKey(day);
    if (holidayDays.includes(key)) return "Libur Nasional-Cuti Bersama";
    if (weekendDays.includes(key)) return "Weekend";
    if (leaveDays.includes(key)) return "Cuti Pribadi";
    return "";
  };

  // Determine date column background color
  const getColColorClass = (day) => {
    const key = getDateKey(day);
    if (holidayDays.includes(key)) return 'bg-holiday-purple/35 text-white pdf-bg-purple';
    if (weekendDays.includes(key)) return 'bg-weekend-blue/30 text-gray-800 pdf-bg-blue';
    if (leaveDays.includes(key)) return 'bg-leave-orange/30 text-gray-800 pdf-bg-orange';
    return '';
  };

  // Get cell value for the default activities row
  const getDefaultRowValue = (day) => {
    if (tickets.length === 0) return 0;
    const key = getDateKey(day);
    if (hoursOverrides['default'] && hoursOverrides['default'][day] !== undefined) {
      return hoursOverrides['default'][day];
    }
    const isSpecial = weekendDays.includes(key) || 
                      (holidayDays.includes(key) && !workedHolidayDays.includes(key)) || 
                      leaveDays.includes(key);
    return isSpecial ? 0 : hourOfDefaultActivities;
  };

  // Calculate sum of hours for default row
  const calculateDefaultRowSum = () => {
    let sum = 0;
    for (let d = 1; d <= totalDays; d++) {
      sum += Number(getDefaultRowValue(d) || 0);
    }
    return sum;
  };

  // Get cell value for a ticket row
  const getTicketRowValue = (ticketKey, day) => {
    if (hoursOverrides[ticketKey] && hoursOverrides[ticketKey][day] !== undefined) {
      return hoursOverrides[ticketKey][day];
    }
    return 0;
  };

  // Calculate sum of hours for a ticket row
  const calculateTicketRowSum = (ticketKey) => {
    let sum = 0;
    for (let d = 1; d <= totalDays; d++) {
      sum += Number(getTicketRowValue(ticketKey, d) || 0);
    }
    return sum;
  };

  // Calculate column sum for a specific day
  const calculateDaySum = (day) => {
    let total = Number(getDefaultRowValue(day) || 0);
    tickets.forEach(ticket => {
      total += Number(getTicketRowValue(ticket.id || ticket.ticketNumber, day) || 0);
    });
    return total;
  };

  // Calculate grand total of all hours
  const calculateGrandTotal = () => {
    let total = calculateDefaultRowSum();
    tickets.forEach(ticket => {
      total += calculateTicketRowSum(ticket.id || ticket.ticketNumber);
    });
    return total;
  };

  // Number of content rows = default row (1) + JIRA ticket rows (tickets.length)
  const totalContentRows = tickets.length === 0 ? 1 : 1 + tickets.length;

  // ── CSS Grid Layout ───────────────────────────────────────────────────────
  // Fixed pixel widths for the non-day columns (matching the original design)
  const GW_NO  = 72;
  const GW_ACT = 240;
  const GW_SUM = 40;
  const GW_CS  = 70;
  const GW_SIG = 70;

  // Column template: fixed px for static cols, equal 1fr for each day col.
  // Using 1fr instead of a computed px value so the grid fills the container
  // regardless of month length, and html2canvas scales it correctly.
  const gridTemplateCols = `${GW_NO}px ${GW_ACT}px repeat(${totalDays}, 1fr) ${GW_SUM}px ${GW_CS}px ${GW_SIG}px`;

  // CSS Grid column indices (1-based)
  const GC_NO  = 1;
  const GC_ACT = 2;
  const gcDay  = (day) => 2 + day;        // day 1 → col 3, day 31 → col 33
  const GC_SUM = 2 + totalDays + 1;
  const GC_CS  = 2 + totalDays + 2;
  const GC_SIG = 2 + totalDays + 3;

  // CSS Grid row indices (1-based)
  const GR_HDR1  = 1;
  const GR_HDR2  = 2;
  const GR_DEF   = 3;                           // default activities row
  const grTicket = (i) => GR_DEF + 1 + i;      // ticket[0] → row 4, [1] → 5 …
  const GR_TOTAL = GR_DEF + totalContentRows;   // row after the last content row

  // Returns the minimal inline style needed to place a cell in the grid.
  // The .sheet-cell class supplies borders, display:flex, alignment, etc.
  const cellPos = (col, row, { colSpan, rowSpan } = {}) => ({
    gridColumn: colSpan ? `${col} / span ${colSpan}` : String(col),
    gridRow:    rowSpan ? `${row} / span ${rowSpan}` : String(row),
  });

  // Returns the solid background color for special-day columns as a direct hex
  // string. Inline styles are captured reliably by html2canvas; Tailwind opacity
  // shorthands (e.g. bg-holiday-purple/35) are not always preserved.
  const getDayBg = (day) => {
    const key = getDateKey(day);
    if (workedHolidayDays.includes(key)) return null;
    if (holidayDays.includes(key)) return '#e8dbf2';
    if (weekendDays.includes(key)) return '#d8eff5';
    if (leaveDays.includes(key))   return '#fce8d7';
    return null;
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <PreviewActionPanel 
        onExportPdf={onGeneratePdf}
        exportLabel="Export Timesheet PDF"
        onResetEdits={onResetOverrides}
        resetLabel="Reset Edits"
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
      />

      <PreviewViewport>
        {/* Spreadsheet Frame (Target of PDF generation) */}
        <div 
          id="timesheet-pdf-area" 
          className="print-area font-sans text-black w-[1080px] mx-auto bg-white p-4"
          style={{ zoom: zoom }}
        >
          <PreviewBrandingHeader 
            type="timesheet"
            companyLogoUrl={companyLogoUrl}
            vendorLogoUrl={vendorLogoUrl}
          />

          {/* Metadata Block: CSS Grid replaces <table> to prevent html2canvas border-collapse bold lines */}
          <div
            className="sheet-grid text-center text-[9px] mb-4 select-none"
            style={{ display: 'grid', gridTemplateColumns: '72px 240px 80px 80px 68px 1fr 140px', width: '100%' }}
          >
            {/* Header Row */}
            <div className="sheet-cell font-bold bg-white" style={{ minHeight: '20px', padding: '4px' }}>{TEXTS.ROLE}</div>
            <div className="sheet-cell font-bold bg-white" style={{ minHeight: '20px', padding: '4px' }}>{TEXTS.NAME}</div>
            <div className="sheet-cell font-bold bg-white" style={{ minHeight: '20px', padding: '4px' }}>{TEXTS.SIGNATURE}</div>
            <div className="sheet-cell font-bold bg-white" style={{ minHeight: '20px', padding: '4px' }}>{TEXTS.MONTH}</div>
            <div className="sheet-cell font-bold bg-white" style={{ minHeight: '20px', padding: '4px' }}>{TEXTS.YEAR}</div>
            <div className="sheet-cell font-bold bg-white" style={{ minHeight: '20px', padding: '4px' }}>{TEXTS.DEPARTMENT_HEAD}</div>
            <div className="sheet-cell font-bold bg-white" style={{ minHeight: '20px', padding: '4px' }}>{TEXTS.SIGNATURE}</div>

            {/* Value Row */}
            <div className="sheet-cell text-center text-gray-800" style={{ minHeight: '34px', padding: '4px' }}>{roleName || PLACEHOLDERS.ROLE}</div>
            <div className="sheet-cell text-center font-bold text-gray-800" style={{ minHeight: '34px', padding: '4px' }}>{employeeName || PLACEHOLDERS.EMPLOYEE_NAME}</div>
            <div className="sheet-cell bg-white" style={{ minHeight: '34px', padding: '4px' }}>
              <div className="flex items-center justify-center min-h-[30px]">
                {signatureEmployeeUrl ? (
                  <img src={signatureEmployeeUrl} alt="Employee Signature" className="max-h-6 object-contain" />
                ) : null}
              </div>
            </div>
            <div className="sheet-cell text-center text-gray-800" style={{ minHeight: '34px', padding: '4px' }}>{monthName}</div>
            <div className="sheet-cell text-center text-gray-800" style={{ minHeight: '34px', padding: '4px' }}>{year}</div>
            <div className="sheet-cell text-center text-gray-800" style={{ minHeight: '34px', padding: '4px' }}>{departmentHeadName || PLACEHOLDERS.DEPARTMENT_HEAD_NAME}</div>
            <div className="sheet-cell bg-white" style={{ minHeight: '34px', padding: '4px' }}>
              <div className="flex items-center justify-center min-h-[22px]">
                {/* DepartementHead signature remains blank */}
              </div>
            </div>
          </div>

          {/* Main Timesheet – CSS Grid replaces the HTML <table>.
              CSS Grid grid-column/grid-row spanning is correctly captured by
              html2canvas (unlike table rowspan/colspan with border-collapse).
              Vertical text uses character-by-character flex stacking because
              html2canvas does not support CSS writing-mode. */}
          <div
            className="sheet-grid select-none"
            style={{ display: 'grid', gridTemplateColumns: gridTemplateCols, width: '100%' }}
          >

            {/* ── HEADER ROW 1: column labels ─────────────────────────── */}

            {/* "No" spans both header rows */}
            <div className="sheet-cell font-bold" style={cellPos(GC_NO, GR_HDR1, { rowSpan: 2 })}>{TEXTS.NO}</div>

            {/* "Project Name / Activity Description" spans both header rows */}
            <div className="sheet-cell font-bold text-center" style={{ ...cellPos(GC_ACT, GR_HDR1, { rowSpan: 2 }), lineHeight: '1.3' }}>
              Project Name<br />Activity Description
            </div>

            {/* Day abbreviations */}
            {daysArray.map(day => {
              const bg = getDayBg(day);
              return (
                <div
                  key={`abbrev-${day}`}
                  className="sheet-cell font-bold"
                  style={{ ...cellPos(gcDay(day), GR_HDR1), fontSize: '7px', ...(bg ? { backgroundColor: bg } : {}) }}
                >
                  {getDayAbbreviation(year, month, day)}
                </div>
              );
            })}

            {/* "Sum (hrs)" spans both header rows */}
            <div className="sheet-cell font-bold text-center" style={{ ...cellPos(GC_SUM, GR_HDR1, { rowSpan: 2 }), fontSize: '8px', lineHeight: '1.3' }}>
              Sum<br />(hrs)
            </div>

            {/* "Supervisor Name" spans both header rows */}
            <div className="sheet-cell font-bold text-center" style={{ ...cellPos(GC_CS, GR_HDR1, { rowSpan: 2 }), fontSize: '8px', lineHeight: '1.3' }}>
              {TEXTS.SUPERVISOR_NAME}
            </div>

            {/* "Signature" spans both header rows */}
            <div className="sheet-cell font-bold text-center" style={{ ...cellPos(GC_SIG, GR_HDR1, { rowSpan: 2 }), fontSize: '8px' }}>
              {TEXTS.SIGNATURE}
            </div>

            {/* ── HEADER ROW 2: day numbers ─────────────────────────────── */}

            {daysArray.map(day => {
              const bg = getDayBg(day);
              return (
                <div
                  key={`num-${day}`}
                  className="sheet-cell font-bold"
                  style={{ ...cellPos(gcDay(day), GR_HDR2), fontSize: '8px', ...(bg ? { backgroundColor: bg } : {}) }}
                >
                  {day}
                </div>
              );
            })}

            {/* ── CONTENT ROWS (unified: default row at index 0, tickets follow) ─── */}
            {/* All rows are built from a single allRows array so they render
                identically. Index 0 comes from defaultActivities; subsequent
                entries come from timesheetTickets. */}

            {tickets.length === 0 && (
              <div 
                className="sheet-cell italic text-gray-400"
                style={{ ...cellPos(GC_NO, GR_DEF, { colSpan: GC_SUM }), minHeight: '34px', padding: '8px', justifyContent: 'center' }}
              >
                {TEXTS.EMPTY_TIMESHEET}
              </div>
            )}

            {(() => {
              // Build unified rows – index 0 is the default/general task,
              // followed by individual ticket rows.
              const allRows = tickets.length === 0 ? [] : [
                {
                  key:      'default',
                  label:    defaultActivities,
                  getValue: (day) => getDefaultRowValue(day),
                  getSum:   ()    => calculateDefaultRowSum(),
                },
                ...tickets.map(t => ({
                  key:      t.id || t.ticketNumber,
                  label:    `${t.ticketNumber} - ${t.title}`,
                  getValue: (day) => getTicketRowValue(t.id || t.ticketNumber, day),
                  getSum:   ()    => calculateTicketRowSum(t.id || t.ticketNumber),
                })),
              ];

              return allRows.map((row, index) => {
                const rowIdx = GR_DEF + index; // row 3 for index 0, row 4 for index 1, …
                const isFirstRow = index === 0;

                return (
                  <React.Fragment key={row.key}>
                    {/* No */}
                    <div className="sheet-cell" style={cellPos(GC_NO, rowIdx)}>{index + 1}</div>

                    {/* Activity / ticket label */}
                    <div
                      className="sheet-cell"
                      style={{ ...cellPos(GC_ACT, rowIdx), justifyContent: 'flex-start', textAlign: 'left', padding: '2px 6px', fontSize: '8px', wordBreak: 'break-word' }}
                    >
                      {row.label}
                    </div>

                    {/* Day cells */}
                    {daysArray.map(day => {
                      const isSpecial = isDaySpecial(day);
                      const bg        = getDayBg(day);

                      if (isSpecial) {
                        // Only the first row renders the spanning special-day cell.
                        // Subsequent rows omit it – the span from row 0 covers them.
                        if (!isFirstRow) return null;

                        const label = getVerticalTextForDay(day);
                        return (
                          <div
                            key={`special-${day}`}
                            className="sheet-cell"
                            style={{ ...cellPos(gcDay(day), GR_DEF, { rowSpan: totalContentRows }), flexDirection: 'column', ...(bg ? { backgroundColor: bg } : {}) }}
                          >
                            {label.split('').map((char, idx) => (
                              <span key={idx} style={{ display: 'block', fontSize: '8px', fontWeight: 700, color: '#1e293b', lineHeight: '1.35' }}>
                                {char === ' ' ? '\u00A0' : char}
                              </span>
                            ))}
                          </div>
                        );
                      }

                      // Editable numeric cell.
                      // Bug fix: html2canvas reads the DOM "value" attribute, not the
                      // React-controlled .value property. We add a hidden .pdf-value-overlay
                      // span that becomes visible in pdf-render-mode so the correct number
                      // appears in the exported PDF.
                      const val = row.getValue(day);
                      const displayVal = val === 0 ? '' : String(val);
                      return (
                        <div
                          key={`${row.key}-day-${day}`}
                          className="sheet-cell"
                          style={{ ...cellPos(gcDay(day), rowIdx), padding: 0, position: 'relative' }}
                        >
                          <input
                            type="number"
                            min="0"
                            max="24"
                            value={displayVal}
                            onChange={e => onCellEdit(row.key, day, e.target.value === '' ? 0 : Number(e.target.value))}
                            className="excel-cell-input focus:bg-yellow-50 pdf-hide-input"
                            style={{ width: '100%', minHeight: '22px', textAlign: 'center', border: 'none', background: 'transparent', fontSize: '9px', outline: 'none', padding: '4px 0', color: '#374151' }}
                          />
                          <span className="pdf-value-overlay">{displayVal}</span>
                        </div>
                      );
                    })}

                    {/* Row sum */}
                    <div className="sheet-cell" style={cellPos(GC_SUM, rowIdx)}>{row.getSum()}</div>
                  </React.Fragment>
                );
              });
            })()}

            {/* Counter Sign + Signature: spanning cells placed outside the loop */}
            <div
              className="sheet-cell font-bold"
              style={{ ...cellPos(GC_CS, GR_DEF, { rowSpan: totalContentRows + 1 }), textAlign: 'center', padding: '4px 6px', wordBreak: 'break-word' }}
            >
              {supervisorName || PLACEHOLDERS.SUPERVISOR_NAME}
            </div>
            <div className="sheet-cell" style={cellPos(GC_SIG, GR_DEF, { rowSpan: totalContentRows + 1 })} />

            {/* ── TOTAL ROW ────────────────────────────────────────────── */}

            {/* "TOTAL" label spans the No + Activity columns */}
            <div className="sheet-cell font-bold" style={cellPos(GC_NO, GR_TOTAL, { colSpan: 2 })}>{TEXTS.TOTAL}</div>

            {daysArray.map(day => {
              const s  = calculateDaySum(day);
              const bg = getDayBg(day);
              return (
                <div
                  key={`total-${day}`}
                  className="sheet-cell font-bold"
                  style={{ ...cellPos(gcDay(day), GR_TOTAL), ...(bg ? { backgroundColor: bg } : {}) }}
                >
                  {s === 0 ? '' : s}
                </div>
              );
            })}

            <div className="sheet-cell font-bold" style={cellPos(GC_SUM, GR_TOTAL)}>
              {calculateGrandTotal()}
            </div>

            {/* Counter Sign + Signature: covered by rowSpan from GR_DEF – omit */}
          </div>

        </div>

      </PreviewViewport>
    </div>
  );
};
