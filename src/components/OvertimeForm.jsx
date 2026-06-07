import React, { useState } from 'react';
import { Plus, Trash2, Calendar, FileText, UserCheck, Upload } from 'lucide-react';
import { formatDateString } from '../utils/dateHelpers';

export const OvertimeForm = ({ 
  state, 
  setState, 
  onLogoUpdated 
}) => {

  const handleInputChange = (field, value) => {
    setState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add a new row to the overtime array
  const handleAddRow = () => {
    const todayStr = formatDateString(new Date());
    const newRow = {
      id: Date.now().toString(),
      overtimeDate: todayStr,
      overtimeHours: 4,
      isWeekend: false,
      isWeekday: true,
      isHoliday: false,
      timeRange: '17:00 - 21:00',
      task: 'Support deployment and hotfix monitoring'
    };

    setState(prev => ({
      ...prev,
      overtimeList: [...prev.overtimeList, newRow]
    }));
  };

  // Delete an overtime row
  const handleDeleteRow = (id) => {
    setState(prev => ({
      ...prev,
      overtimeList: prev.overtimeList.filter(row => row.id !== id)
    }));
  };

  // Update a field inside a specific overtime row
  const handleRowChange = (id, field, value) => {
    setState(prev => {
      const newList = prev.overtimeList.map(row => {
        if (row.id !== id) return row;

        const updated = { ...row, [field]: value };

        // Automation rules:
        if (field === 'isWeekend' && value === true) {
          updated.isWeekday = false;
          updated.isHoliday = false;
          updated.timeRange = '09:00 - 16:00';
        } else if (field === 'isHoliday' && value === true) {
          updated.isWeekday = false;
          updated.isWeekend = false;
          updated.timeRange = '09:00 - 16:00';
        } else if (field === 'isWeekday' && value === true) {
          updated.isWeekend = false;
          updated.isHoliday = false;
          updated.timeRange = '17:00 - 21:00';
        }

        return updated;
      });

      return {
        ...prev,
        overtimeList: newList
      };
    });
  };

  // Handle logo files for overtime company logo
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const logoUrl = URL.createObjectURL(file);
    onLogoUpdated('overtimeCompany', logoUrl);
  };

  return (
    <div className="space-y-6 max-h-[82vh] overflow-y-auto pr-2">
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
              value={state.employeeName}
              onChange={e => handleInputChange('employeeName', e.target.value)}
              className="w-full text-sm rounded-lg px-3 py-2 bg-white/70 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 text-gray-800 dark:text-white focus:ring-2 focus:ring-mandiri-blue focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Employee Role / Unit Kerja
            </label>
            <input 
              type="text" 
              value={state.roleName}
              onChange={e => handleInputChange('roleName', e.target.value)}
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
              value={state.supervisorName}
              onChange={e => handleInputChange('supervisorName', e.target.value)}
              className="w-full text-sm rounded-lg px-3 py-2 bg-white/70 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 text-gray-800 dark:text-white focus:ring-2 focus:ring-mandiri-blue focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Supervisor Role / Jabatan
            </label>
            <input 
              type="text" 
              value={state.supervisorRole}
              onChange={e => handleInputChange('supervisorRole', e.target.value)}
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

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Company Logo Override
          </label>
          <input 
            type="file" 
            accept="image/*"
            onChange={handleLogoUpload}
            className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-mandiri-blue/10 file:text-mandiri-blue dark:file:bg-gray-800 dark:file:text-gray-300 hover:file:bg-mandiri-blue/20"
          />
        </div>
      </div>

      {/* Dynamic Overtime List Builder */}
      <div className="glass-panel rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
          <h3 className="text-base font-bold text-mandiri-blue dark:text-gray-200 flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Overtime Schedule
          </h3>
          <button 
            type="button"
            onClick={handleAddRow}
            className="text-xs font-semibold bg-mandiri-blue text-white dark:bg-mandiri-yellow dark:text-gray-900 px-3 py-1.5 rounded-lg hover:scale-105 active:scale-95 transition-all shadow-md flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Overtime Row
          </button>
        </div>

        {/* Row List */}
        <div className="space-y-4">
          {state.overtimeList.length === 0 ? (
            <p className="text-center text-xs py-6 text-gray-400">No overtime scheduled yet. Click Add Row above.</p>
          ) : (
            state.overtimeList.map((row, idx) => (
              <div 
                key={row.id} 
                className="p-3 rounded-xl border border-gray-200 dark:border-gray-800/80 bg-white/40 dark:bg-gray-900/20 space-y-3 relative group"
              >
                {/* Delete button */}
                <button 
                  type="button"
                  onClick={() => handleDeleteRow(row.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors p-1"
                  title="Remove this row"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                  <span>Row #{idx + 1}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Date */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">Date</label>
                    <input 
                      type="date"
                      value={row.overtimeDate}
                      onChange={e => handleRowChange(row.id, 'overtimeDate', e.target.value)}
                      className="w-full text-xs rounded-lg px-2.5 py-1.5 bg-white/70 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  {/* Overtime Hours */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">Hours Count</label>
                    <input 
                      type="number"
                      min="1"
                      max="24"
                      value={row.overtimeHours}
                      onChange={e => handleRowChange(row.id, 'overtimeHours', Number(e.target.value))}
                      className="w-full text-xs rounded-lg px-2.5 py-1.5 bg-white/70 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  {/* Time Range */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">Time Range (Waktu Lembur)</label>
                    <input 
                      type="text"
                      value={row.timeRange}
                      onChange={e => handleRowChange(row.id, 'timeRange', e.target.value)}
                      className="w-full text-xs rounded-lg px-2.5 py-1.5 bg-white/70 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Day Toggles */}
                <div className="flex flex-wrap gap-4 pt-1">
                  <span className="text-[10px] font-bold text-gray-400 self-center">Day Classification:</span>
                  <label className="inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name={`day-type-${row.id}`}
                      checked={row.isWeekday}
                      onChange={() => handleRowChange(row.id, 'isWeekday', true)}
                      className="text-mandiri-blue focus:ring-0"
                    />
                    <span>Weekday (17:00-21:00)</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name={`day-type-${row.id}`}
                      checked={row.isWeekend}
                      onChange={() => handleRowChange(row.id, 'isWeekend', true)}
                      className="text-mandiri-blue focus:ring-0"
                    />
                    <span>Weekend (9:00-16:00)</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name={`day-type-${row.id}`}
                      checked={row.isHoliday}
                      onChange={() => handleRowChange(row.id, 'isHoliday', true)}
                      className="text-mandiri-blue focus:ring-0"
                    />
                    <span>Holiday (9:00-16:00)</span>
                  </label>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">Task / Job description</label>
                  <input 
                    type="text"
                    value={row.task}
                    onChange={e => handleRowChange(row.id, 'task', e.target.value)}
                    className="w-full text-xs rounded-lg px-2.5 py-1.5 bg-white/70 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 text-gray-800 dark:text-white focus:outline-none"
                    placeholder="Describe tasks done..."
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
