import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { MONTHS } from '../utils/dateHelpers';

export const MonthYearPicker = ({ year, month, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempYear, setTempYear] = useState(year);
  const dropdownRef = useRef(null);

  // Sync tempYear when year prop changes
  useEffect(() => {
    setTempYear(year);
  }, [year]);

  // Click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMonthSelect = (selectedMonthNum) => {
    onChange(tempYear, selectedMonthNum);
    setIsOpen(false);
  };

  const handlePrevYear = (e) => {
    e.stopPropagation();
    setTempYear(prev => prev - 1);
  };

  const handleNextYear = (e) => {
    e.stopPropagation();
    setTempYear(prev => prev + 1);
  };

  // Find currently selected month name
  const currentMonthName = MONTHS.find(m => m.value === month)?.nameId || '';

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-semibold text-gray-500 mb-1">
        Month & Year
      </label>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-sm rounded-lg px-3 py-2 bg-white/70 border border-gray-200 text-gray-800 focus:ring-2 focus:ring-mandiri-blue focus:outline-none flex items-center justify-between shadow-sm hover:bg-gray-50 transition-all"
      >
        <span className="font-semibold">{`${currentMonthName} ${year}`}</span>
        <CalendarIcon className="w-4 h-4 text-gray-400" />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-xl z-50 animate-fade-in">
          
          {/* Year selector header */}
          <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
            <button
              type="button"
              onClick={handlePrevYear}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-extrabold text-mandiri-blue">
              {tempYear}
            </span>
            <button
              type="button"
              onClick={handleNextYear}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-3 gap-1">
            {MONTHS.map(m => {
              const isSelected = m.value === month && tempYear === year;
              
              let btnClass = "py-1.5 px-1 text-xs font-medium rounded-lg transition-all duration-150 text-center select-none ";
              if (isSelected) {
                btnClass += "bg-mandiri-blue text-white shadow-md scale-105 animate-[pop-bounce-circle_0.3s_cubic-bezier(0.175,0.885,0.32,1.35)]";
              } else {
                btnClass += "text-gray-700 hover:bg-gray-100 hover:text-mandiri-blue";
              }

              return (
                <button
                  type="button"
                  key={m.value}
                  onClick={() => handleMonthSelect(m.value)}
                  className={btnClass}
                >
                  {m.nameId.substring(0, 3)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
