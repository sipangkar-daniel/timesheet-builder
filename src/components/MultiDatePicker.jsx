import { useState } from 'react';
import { getDaysInMonth } from '../utils/dateHelpers';

export const MultiDatePicker = ({ 
  year, 
  month, 
  weekendDays = [], 
  holidayDays = [], 
  leaveDays = [], 
  workedHolidayDays = [], 
  onChange 
}) => {
  const [activeBrush, setActiveBrush] = useState('weekend'); // default brush is weekend
  const totalDays = getDaysInMonth(year, month);
  
  // Helper to format date key YYYY-MM-DD
  const getDateKey = (day) => {
    const dStr = String(day).padStart(2, '0');
    const mStr = String(month).padStart(2, '0');
    return `${year}-${mStr}-${dStr}`;
  };

  // Determine classification of a day
  const getDayStatus = (day) => {
    const key = getDateKey(day);
    if (workedHolidayDays.includes(key)) return 'workedHoliday';
    if (holidayDays.includes(key)) return 'holiday';
    if (weekendDays.includes(key)) return 'weekend';
    if (leaveDays.includes(key)) return 'leave';
    return 'work';
  };

  // Apply brush to a clicked day
  const handleDayClick = (day) => {
    const key = getDateKey(day);
    const currentStatus = getDayStatus(day);
    
    let nextWeekend = [...weekendDays].filter(d => d !== key);
    let nextHoliday = [...holidayDays].filter(d => d !== key);
    let nextLeave = [...leaveDays].filter(d => d !== key);
    let nextWorkedHoliday = [...workedHolidayDays].filter(d => d !== key);

    // If day already has the active brush status, toggle it back to 'work'
    if (currentStatus !== activeBrush) {
      if (activeBrush === 'weekend') {
        nextWeekend.push(key);
      } else if (activeBrush === 'holiday') {
        nextHoliday.push(key);
      } else if (activeBrush === 'leave') {
        nextLeave.push(key);
      } else if (activeBrush === 'workedHoliday') {
        nextWorkedHoliday.push(key);
      }
      // 'work' brush just removes it from the other lists (already filtered above)
    }

    onChange({
      weekendDays: nextWeekend,
      holidayDays: nextHoliday,
      leaveDays: nextLeave,
      workedHolidayDays: nextWorkedHoliday
    });
  };

  const firstDayIndex = new Date(year, month - 1, 1).getDay();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const blanks = Array(firstDayIndex).fill(null);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  const gridCells = [...blanks, ...days];

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-md">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200">
          Interactive Month Calendar
        </h4>
      </div>

      {/* POPPING RADIO BUTTONS (Active Brush Selector) */}
      <div className="pop-radio-container mb-4">
        
        {/* Brush: Work Day */}
        <label className="pop-radio-label dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 text-slate-500 dark:text-slate-300" style={{ color: '#64748b' }}>
          <input 
            type="radio" 
            name="brushMode" 
            value="work" 
            checked={activeBrush === 'work'}
            onChange={() => setActiveBrush('work')}
            className="pop-radio-input"
          />
          <span className="pop-radio-indicator"></span>
          <span>Work Day</span>
        </label>

        {/* Brush: Weekend */}
        <label className="pop-radio-label dark:bg-gray-700 dark:border-gray-600 text-weekend-blue" style={{ color: '#4aacc7' }}>
          <input 
            type="radio" 
            name="brushMode" 
            value="weekend" 
            checked={activeBrush === 'weekend'}
            onChange={() => setActiveBrush('weekend')}
            className="pop-radio-input"
          />
          <span className="pop-radio-indicator"></span>
          <span>Weekend</span>
        </label>

        {/* Brush: Holiday */}
        <label className="pop-radio-label dark:bg-gray-700 dark:border-gray-600 text-holiday-purple" style={{ color: '#8165a2' }}>
          <input 
            type="radio" 
            name="brushMode" 
            value="holiday" 
            checked={activeBrush === 'holiday'}
            onChange={() => setActiveBrush('holiday')}
            className="pop-radio-input"
          />
          <span className="pop-radio-indicator"></span>
          <span>Holiday</span>
        </label>

        {/* Brush: Work at Holiday */}
        <label className="pop-radio-label dark:bg-gray-700 dark:border-gray-600 text-purple-600" style={{ color: '#7c3aed' }}>
          <input 
            type="radio" 
            name="brushMode" 
            value="workedHoliday" 
            checked={activeBrush === 'workedHoliday'}
            onChange={() => setActiveBrush('workedHoliday')}
            className="pop-radio-input"
          />
          <span className="pop-radio-indicator"></span>
          <span>Work at Holiday</span>
        </label>

        {/* Brush: Leave */}
        <label className="pop-radio-label dark:bg-gray-700 dark:border-gray-600 text-leave-orange" style={{ color: '#f79747' }}>
          <input 
            type="radio" 
            name="brushMode" 
            value="leave" 
            checked={activeBrush === 'leave'}
            onChange={() => setActiveBrush('leave')}
            className="pop-radio-input"
          />
          <span className="pop-radio-indicator"></span>
          <span>Leave Day</span>
        </label>

      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center border-t border-gray-100 dark:border-gray-700 pt-3">
        {weekDays.map(wd => (
          <div key={wd} className="text-[10px] font-bold py-1 text-gray-400 dark:text-gray-500">
            {wd}
          </div>
        ))}
        
        {gridCells.map((day, idx) => {
          if (day === null) {
            return <div key={`blank-${idx}`} className="p-2" />;
          }

          const status = getDayStatus(day);
          
          let cellClass = "cursor-pointer rounded-lg p-1.5 text-xs font-semibold transition-all duration-150 hover:scale-105 select-none ";
          if (status === 'work') {
            cellClass += "bg-slate-50 dark:bg-gray-700 text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-gray-600 hover:bg-slate-100 dark:hover:bg-gray-600";
          } else if (status === 'weekend') {
            cellClass += "bg-weekend-blue/20 dark:bg-weekend-blue/30 text-weekend-blue border border-weekend-blue/80 hover:bg-weekend-blue/30 dark:hover:bg-weekend-blue/40 shadow-sm";
          } else if (status === 'holiday') {
            cellClass += "bg-holiday-purple/20 dark:bg-holiday-purple/30 text-holiday-purple border border-holiday-purple/80 hover:bg-holiday-purple/30 dark:hover:bg-holiday-purple/40 shadow-sm";
          } else if (status === 'workedHoliday') {
            cellClass += "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border border-violet-400 hover:bg-violet-200 dark:hover:bg-violet-800/50 shadow-sm";
          } else if (status === 'leave') {
            cellClass += "bg-leave-orange/20 dark:bg-leave-orange/30 text-leave-orange border border-leave-orange/80 hover:bg-leave-orange/30 dark:hover:bg-leave-orange/40 shadow-sm";
          }

          return (
            <div 
              key={`day-${day}`} 
              onClick={() => handleDayClick(day)}
              className={cellClass}
              title={`Day ${day}: Click to paint`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};
