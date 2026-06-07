import React from 'react';
import { getDaysInMonth, getDayAbbreviation, getMonthNameId } from '../utils/dateHelpers';
import { MandiriLogo } from './Icons';
import { FileDown, RefreshCw } from 'lucide-react';

// Default compliance PNG logo assets imported
import defaultCompanyLogo from '../assets/images/company-logo.png';
import defaultVendorLogo from '../assets/images/vendor-logo.png';

export const TimesheetPreview = ({ 
  state, 
  tickets, 
  hoursOverrides, 
  onCellEdit, 
  onResetOverrides,
  onGeneratePdf,
  companyLogoUrl,
  vendorLogoUrl,
  signatureEmployeeUrl
}) => {
  const { 
    employeeName, 
    roleName, 
    year, 
    month, 
    departmentHeadName, 
    counterSignName, 
    defaultActivities, 
    hourOfDefaultActivities, 
    weekendDays, 
    holidayDays, 
    leaveDays 
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
    return weekendDays.includes(key) || holidayDays.includes(key) || leaveDays.includes(key);
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
    const key = getDateKey(day);
    if (hoursOverrides['default'] && hoursOverrides['default'][day] !== undefined) {
      return hoursOverrides['default'][day];
    }
    const isSpecial = weekendDays.includes(key) || holidayDays.includes(key) || leaveDays.includes(key);
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
      total += Number(getTicketRowValue(ticket.ticketNumber, day) || 0);
    });
    return total;
  };

  // Calculate grand total of all hours
  const calculateGrandTotal = () => {
    let total = calculateDefaultRowSum();
    tickets.forEach(ticket => {
      total += calculateTicketRowSum(ticket.ticketNumber);
    });
    return total;
  };

  // Number of content rows = default row (1) + JIRA ticket rows (tickets.length)
  const totalContentRows = 1 + tickets.length;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Action panel */}
      <div className="flex justify-between items-center bg-white/40 border border-gray-200 p-3 rounded-2xl backdrop-blur-md no-print">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500">Sheet Options:</span>
          <button 
            onClick={onResetOverrides}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-55 flex items-center gap-1.5 transition-all shadow-sm"
            title="Reset all edited spreadsheet cell hours"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Edits
          </button>
        </div>
        <button 
          onClick={onGeneratePdf}
          className="text-xs font-bold bg-mandiri-blue text-white px-4 py-2 rounded-xl hover:bg-mandiri-blue/90 flex items-center gap-1.5 transition-all shadow-md hover:scale-105 active:scale-95"
        >
          <FileDown className="w-4 h-4" /> Export Timesheet PDF
        </button>
      </div>

      {/* Excel Sheet Scroll Container */}
      <div className="flex-1 overflow-auto border border-gray-200 rounded-2xl bg-white p-6 shadow-xl relative min-w-0">
        
        {/* Spreadsheet Frame (Target of PDF generation) */}
        <div id="timesheet-pdf-area" className="print-area font-sans text-black w-[1080px] mx-auto bg-white p-4">
          
          {/* Print Style Injector for pdf rendering */}
          <style>{`
            .pdf-bg-purple { background-color: #e8dbf2 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .pdf-bg-blue { background-color: #d8eff5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .pdf-bg-orange { background-color: #fce8d7 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .excel-cell-input::-webkit-outer-spin-button,
            .excel-cell-input::-webkit-inner-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }
            .excel-cell-input {
              -moz-appearance: textfield;
            }
          `}</style>

          {/* Logos side-by-side at top left */}
          <div className="flex items-center gap-4 mb-3">
            {[
              { src: companyLogoUrl || defaultCompanyLogo, alt: "Company Logo" },
              { src: vendorLogoUrl || defaultVendorLogo, alt: "Vendor Logo" }
            ].map((logo, index) => (
              <img
                key={index}
                src={logo.src}
                alt={logo.alt}
                className="h-7 max-w-[120px] object-contain"
              />
            ))}
          </div>

          {/* Metadata Block: 7-Column Table */}
          <table className="w-full border-collapse border border-black text-center text-[9px] mb-4 excel-table select-none" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr className="bg-white font-bold border-b border-black">
                <th className="border border-black p-1" style={{ width: '72px' }}>Role</th>
                <th className="border border-black p-1" style={{ width: '240px' }}>Name</th>
                <th className="border border-black p-1" style={{ width: '80px' }}>Signature</th>
                <th className="border border-black p-1" style={{ width: '80px' }}>Month</th>
                <th className="border border-black p-1" style={{ width: '68px' }}>Year</th>
                <th className="border border-black p-1">Department Head</th>
                <th className="border border-black p-1" style={{ width: '140px' }}>Signature</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white font-normal text-gray-800">
                <td className="border border-black p-1.5 text-center" style={{ width: '72px', minWidth: '72px', maxWidth: '72px' }}>{roleName}</td>
                <td className="border border-black p-1.5 text-center font-bold" style={{ width: '240px', minWidth: '240px', maxWidth: '240px' }}>{employeeName}</td>
                <td className="border border-black p-1.5 bg-white">
                  <div className="flex items-center justify-center min-h-[30px]">
                    {signatureEmployeeUrl ? (
                      <img src={signatureEmployeeUrl} alt="Employee Signature" className="max-h-6 object-contain" />
                    ) : null}
                  </div>
                </td>
                <td className="border border-black p-1.5 text-center">{monthName}</td>
                <td className="border border-black p-1.5 text-center">{year}</td>
                <td className="border border-black p-1.5 text-center">{departmentHeadName}</td>
                <td className="border border-black p-1.5 bg-white">
                  <div className="flex items-center justify-center min-h-[22px]">
                    {/* DepartementHead signature remains blank */}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Main Excel-like Table */}
          <table className="w-full border-collapse border border-black text-center text-[9px] excel-table select-none" style={{ tableLayout: 'fixed' }}>
            <thead>
              {/* Row: Day Abbreviations */}
              <tr className="bg-white font-bold border-b border-black">
                <th className="border border-black p-1.5 text-center align-middle" rowSpan="2" style={{ width: '72px' }}>No</th>
                <th className="border border-black p-1.5 text-center align-middle" rowSpan="2" style={{ width: '240px' }}>
                  Project Name <br/> Activity Description
                </th>
                {daysArray.map(day => (
                  <th 
                    key={`abbrev-${day}`} 
                    className={`border border-black px-0 py-1 text-[7px] font-bold text-center leading-none ${getColColorClass(day)}`}
                  >
                    {getDayAbbreviation(year, month, day)}
                  </th>
                ))}
                <th className="border border-black p-1.5" rowSpan="2" style={{ width: '40px' }}>Sum (hrs)</th>
                <th className="border border-black p-1.5" rowSpan="2" style={{ width: '70px' }}>Counter Sign Name</th>
                <th className="border border-black p-1.5" rowSpan="2" style={{ width: '70px' }}>Signature</th>
              </tr>
              {/* Row: Day Numbers */}
              <tr className="bg-white font-bold border-b border-black">
                {daysArray.map(day => (
                  <th 
                    key={`num-${day}`} 
                    className={`border border-black px-0 py-1 text-[8px] font-bold text-center leading-none ${getColColorClass(day)}`}
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-black font-normal text-gray-850">
              {/* Row 0: Default Work Row (First content row) */}
              <tr className="hover:bg-gray-50/50">
                <td className="border border-black p-1.5 text-center" style={{ width: '72px', minWidth: '72px', maxWidth: '72px' }}>1</td>
                <td className="border border-black p-1.5 text-left max-w-xs break-words" style={{ width: '240px', minWidth: '240px', maxWidth: '240px' }}>
                  {defaultActivities}
                </td>
                
                {/* Day columns */}
                {daysArray.map(day => {
                  const isSpecial = isDaySpecial(day);
                  
                  if (isSpecial) {
                    // Render vertically merged cell spanning all content rows
                    return (
                      <td 
                        key={`merged-day-${day}`} 
                        rowSpan={totalContentRows} 
                        className={`border border-black p-0 align-middle ${getColColorClass(day)}`}
                      >
                        <div className="flex items-center justify-center py-4 w-full h-full">
                          <span className="vertical-text">
                            {getVerticalTextForDay(day)}
                          </span>
                        </div>
                      </td>
                    );
                  }

                  return (
                    <td key={`default-day-${day}`} className="border border-black p-0 text-center">
                      <input 
                        type="number"
                        min="0"
                        max="24"
                        value={getDefaultRowValue(day) === 0 ? "" : getDefaultRowValue(day)}
                        onChange={e => onCellEdit('default', day, e.target.value === "" ? 0 : Number(e.target.value))}
                        className="w-full text-center py-1.5 excel-cell-input focus:bg-yellow-50 focus:outline-none border-0 text-[9px] bg-transparent text-gray-800"
                      />
                    </td>
                  );
                })}

                {/* Sum (hours) per default row */}
                <td className="border border-black p-1.5 text-center bg-white">
                  {calculateDefaultRowSum()}
                </td>

                {/* Counter Sign Name - Vertically Merged cell spanning all content rows + TOTAL row */}
                <td 
                  rowSpan={totalContentRows + 1} 
                  className="border border-black p-2 font-bold align-middle bg-white text-center break-words min-w-[80px]"
                >
                  {counterSignName}
                </td>

                {/* Signature - Vertically Merged cell spanning all content rows + TOTAL row */}
                <td 
                  rowSpan={totalContentRows + 1} 
                  className="border border-black p-2 align-middle bg-white text-center"
                >
                  {/* Stamp space */}
                </td>
              </tr>

              {/* Parsed JIRA Tickets Rows (Subsequent content rows) */}
              {tickets.map((t, index) => (
                <tr key={t.ticketNumber} className="hover:bg-gray-50/50">
                  <td className="border border-black p-1.5 text-center" style={{ width: '72px', minWidth: '72px', maxWidth: '72px' }}>{index + 2}</td>
                  <td className="border border-black p-1.5 text-left max-w-xs break-words" style={{ width: '240px', minWidth: '240px', maxWidth: '240px' }}>
                    <span className="text-mandiri-blue">{t.ticketNumber}</span> - {t.title}
                  </td>

                  {/* Day input cells */}
                  {daysArray.map(day => {
                    // Skip rendering this cell if it's a weekend/holiday/leave day, 
                    // because it has already been vertically merged in the default row!
                    if (isDaySpecial(day)) return null;

                    return (
                      <td key={`${t.ticketNumber}-day-${day}`} className="border border-black p-0 text-center">
                        <input 
                          type="number"
                          min="0"
                          max="24"
                          value={getTicketRowValue(t.ticketNumber, day) === 0 ? "" : getTicketRowValue(t.ticketNumber, day)}
                          onChange={e => onCellEdit(t.ticketNumber, day, e.target.value === "" ? 0 : Number(e.target.value))}
                          className="w-full text-center py-1.5 excel-cell-input focus:bg-yellow-50 focus:outline-none border-0 text-[9px] bg-transparent text-gray-800"
                        />
                      </td>
                    );
                  })}

                  {/* Sum (hours) per ticket row */}
                  <td className="border border-black p-1.5 text-center bg-white">
                    {calculateTicketRowSum(t.ticketNumber)}
                  </td>

                  {/* Counter Sign and Signature cells are skipped here (already covered by rowSpan) */}
                </tr>
              ))}

              {/* Bottom Row: TOTAL */}
              <tr className="bg-white border-t border-black text-gray-850">
                <td className="border border-black p-2 text-center" colSpan="2" style={{ width: '312px', minWidth: '312px', maxWidth: '312px' }}>TOTAL</td>
                
                {/* Daily Vertical Sums */}
                {daysArray.map(day => {
                  const isSpecial = isDaySpecial(day);
                  if (isSpecial) {
                    // Since special day columns are merged vertically for content rows, 
                    // we still render a normal cell here for the TOTAL row
                    return (
                      <td key={`total-special-${day}`} className={`border border-black p-2 text-center ${getColColorClass(day)}`}>
                        {calculateDaySum(day) === 0 ? "" : calculateDaySum(day)}
                      </td>
                    );
                  }
                  
                  return (
                    <td key={`total-day-${day}`} className="border border-black p-1 text-center">
                      {calculateDaySum(day)}
                    </td>
                  );
                })}
 
                <td className="border border-black p-2 text-center bg-white">
                  {calculateGrandTotal()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
