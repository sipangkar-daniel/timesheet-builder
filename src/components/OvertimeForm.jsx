import { FileText } from 'lucide-react';

export const OvertimeForm = ({ 
  state, 
  setState
}) => {
  const handleInputChange = (field, value) => {
    setState(prev => ({
      ...prev,
      [field]: value
    }));
  };



  return (
    <div className="space-y-6">

      {/* Form Texts & Branding */}
      <div className="glass-panel rounded-2xl p-5 shadow-lg space-y-4">
        <h3 className="text-base font-bold text-mandiri-blue dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center gap-2">
          <FileText className="w-5 h-5" /> Form Content & Branding
        </h3>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-300 mb-1">
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
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-300 mb-1">
            Mandiri Form Description / Opening Statement
          </label>
          <textarea 
            rows="3"
            value={state.formDescription}
            onChange={e => handleInputChange('formDescription', e.target.value)}
            className="w-full text-sm rounded-lg px-3 py-2 bg-white/70 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 text-gray-800 dark:text-white focus:ring-2 focus:ring-mandiri-blue focus:outline-none resize-none"
          />
        </div>
        {/* Job Description Mode Toggle */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800/80 space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-900/40 border border-slate-150 dark:border-gray-850 rounded-xl shadow-sm">
            <div className="flex flex-col gap-0.5 select-none">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Gunakan Detail yang sama untuk semua overtime</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={state.isDescriptionSame} 
                onChange={e => handleInputChange('isDescriptionSame', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-gray-800 peer-focus:outline-none rounded-full peer peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-mandiri-blue dark:peer-checked:bg-mandiri-yellow"></div>
            </label>
          </div>

          {/* Job Description Input (Only visible when toggle is ON) */}
          {state.isDescriptionSame && (
            <div className="space-y-1 animate-fade-in">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-300">
                Default Job Description
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
        </div>
      </div>
    </div>
  );
};
