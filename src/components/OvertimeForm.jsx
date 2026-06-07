import React, { useState } from 'react';
import { Calendar, FileText, UserCheck, ChevronDown } from 'lucide-react';
import { PLACEHOLDERS } from '../utils/constants';

export const OvertimeForm = ({ 
  state, 
  setState,
  personnel,
  setPersonnel
}) => {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const handleInputChange = (field, value) => {
    setState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePersonnelChange = (field, value) => {
    setPersonnel(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Update a field inside a specific overtime row
  const handleRowChange = (id, field, value) => {
    setState(prev => {
      const newList = prev.overtimeList.map(row => {
        if (row.id !== id) return row;
        return { ...row, [field]: value };
      });

      return {
        ...prev,
        overtimeList: newList
      };
    });
  };



  return (
    <div className="space-y-6">
      {/* Employee & Supervisor Information */}
      <div className="glass-panel rounded-2xl p-5 shadow-lg space-y-4">
        <h3 className="text-base font-bold text-mandiri-blue dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center gap-2">
          <UserCheck className="w-5 h-5" /> Signatures & Personnel
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
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Supervisor Role / Jabatan
            </label>
            <input 
              type="text" 
              value={personnel.supervisorRole}
              placeholder={PLACEHOLDERS.SUPERVISOR_ROLE}
              onChange={e => handlePersonnelChange('supervisorRole', e.target.value)}
              className="w-full text-sm rounded-lg px-3 py-2 bg-white/70 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 text-gray-800 dark:text-white focus:ring-2 focus:ring-mandiri-blue focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Form Texts & Branding */}
      <div className="glass-panel rounded-2xl p-5 shadow-lg space-y-4">
        <h3 className="text-base font-bold text-mandiri-blue dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center gap-2">
          <FileText className="w-5 h-5" /> Form Content & Branding
        </h3>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Form Title
          </label>
          <input 
            type="text" 
            value={state.formTitle}
            onChange={e => handleInputChange('formTitle', e.target.value)}
            className="w-full text-sm rounded-lg px-3 py-2 bg-white/70 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 text-gray-800 dark:text-white focus:ring-2 focus:ring-mandiri-blue focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Mandiri Form Description / Opening Statement
          </label>
          <textarea 
            rows="3"
            value={state.formDescription}
            onChange={e => handleInputChange('formDescription', e.target.value)}
            className="w-full text-sm rounded-lg px-3 py-2 bg-white/70 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 text-gray-800 dark:text-white focus:ring-2 focus:ring-mandiri-blue focus:outline-none resize-none"
          />
        </div>


      </div>

      {/* Derived Overtime List Builder (Collapsible Accordion) */}
      <div className="glass-panel rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
        <button
          type="button"
          onClick={() => setIsScheduleOpen(!isScheduleOpen)}
          className="w-full flex justify-between items-center p-5 font-bold text-mandiri-blue dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 bg-slate-50/50 hover:bg-slate-100/50 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <span>Overtime Details ({state.overtimeList?.length || 0} Days)</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isScheduleOpen ? 'rotate-180' : ''}`} />
        </button>

        <div className={`grid transition-all duration-300 ease-in-out ${isScheduleOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden p-5 space-y-4">
            
            {/* Job Description Mode Selectors */}
            <div className="space-y-2 select-none">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">
                Job Description Mode
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange('isDescriptionSame', !state.isDescriptionSame)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    state.isDescriptionSame ? 'bg-mandiri-blue' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                  role="switch"
                  aria-checked={state.isDescriptionSame}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      state.isDescriptionSame ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs font-medium text-gray-750 dark:text-gray-300">
                  {state.isDescriptionSame ? 'Gunakan detail yang sama untuk semua overtime' : 'Berbeda per Hari'}
                </span>
              </div>
            </div>

            {/* If same: Show Global Job Description */}
            {state.isDescriptionSame && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Job Description
                </label>
                <textarea 
                  rows="2"
                  value={state.globalDescription || ''}
                  onChange={e => handleInputChange('globalDescription', e.target.value)}
                  className="w-full text-sm rounded-lg px-3 py-2 bg-white/70 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-mandiri-blue resize-none"
                  placeholder="Describe tasks done for all overtime schedule..."
                />
              </div>
            )}

            {/* List of derived rows */}
            <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800/80">
              {(!state.overtimeList || state.overtimeList.length === 0) ? (
                <p className="text-center text-xs py-4 text-gray-400">
                  Belum ada jadwal lembur yang terdeteksi di Timesheet.
                </p>
              ) : (
                state.overtimeList.map((row, idx) => (
                  <div 
                    key={row.id} 
                    className="p-3 rounded-xl border border-gray-200 dark:border-gray-800/80 bg-white/40 dark:bg-gray-900/20 space-y-3"
                  >
                    <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                      <span>Row #{idx + 1} ({row.isWeekend ? 'Weekend' : row.isHoliday ? 'Holiday' : 'Weekday'})</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Date (Derived, Disabled) */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Date</label>
                        <input 
                          type="date"
                          value={row.overtimeDate}
                          disabled
                          className="w-full text-xs rounded-lg px-2.5 py-1.5 bg-gray-150/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed font-medium"
                        />
                      </div>

                      {/* Overtime Hours (Derived, Disabled) */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Hours Count</label>
                        <input 
                          type="number"
                          value={row.overtimeHours}
                          disabled
                          className="w-full text-xs rounded-lg px-2.5 py-1.5 bg-gray-150/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed font-medium"
                        />
                      </div>

                      {/* Time Range (Editable) */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Time Range</label>
                        <input 
                          type="text"
                          value={row.timeRange}
                          onChange={e => handleRowChange(row.id, 'timeRange', e.target.value)}
                          className="w-full text-xs rounded-lg px-2.5 py-1.5 bg-white/70 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-mandiri-blue"
                        />
                      </div>
                    </div>

                    {/* Job description (If mode is different, it is editable here. If same, it shows global description) */}
                    {!state.isDescriptionSame && (
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Task / Job description</label>
                        <input 
                          type="text"
                          value={row.task}
                          onChange={e => handleRowChange(row.id, 'task', e.target.value)}
                          className="w-full text-xs rounded-lg px-2.5 py-1.5 bg-white/70 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-mandiri-blue"
                          placeholder="Describe tasks done..."
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
