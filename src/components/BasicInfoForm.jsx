import { PLACEHOLDERS } from '../utils/constants';

export const BasicInfoForm = ({ personnel, setPersonnel }) => {
  const handlePersonnelChange = (field, value) => {
    setPersonnel(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-300 mb-1">
            Employee Name
          </label>
          <input 
            type="text" 
            value={personnel.employeeName || ''}
            placeholder={PLACEHOLDERS.EMPLOYEE_NAME}
            onChange={e => handlePersonnelChange('employeeName', e.target.value)}
            className="w-full text-sm rounded-lg px-3 py-2 bg-white/70 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 text-gray-800 dark:text-white focus:ring-2 focus:ring-mandiri-blue focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-300 mb-1">
            Role
          </label>
          <input 
            type="text" 
            value={personnel.roleName || ''}
            placeholder={PLACEHOLDERS.ROLE}
            onChange={e => handlePersonnelChange('roleName', e.target.value)}
            className="w-full text-sm rounded-lg px-3 py-2 bg-white/70 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 text-gray-800 dark:text-white focus:ring-2 focus:ring-mandiri-blue focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-300 mb-1">
            DepartmentName (Unit Kerja)
          </label>
          <input 
            type="text" 
            value={personnel.departmentName || ''}
            placeholder={PLACEHOLDERS.DEPARTMENT_NAME}
            onChange={e => handlePersonnelChange('departmentName', e.target.value)}
            className="w-full text-sm rounded-lg px-3 py-2 bg-white/70 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 text-gray-800 dark:text-white focus:ring-2 focus:ring-mandiri-blue focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-300 mb-1">
            Department Head
          </label>
          <input 
            type="text" 
            value={personnel.departmentHeadName || ''}
            placeholder={PLACEHOLDERS.DEPARTMENT_HEAD_NAME}
            onChange={e => handlePersonnelChange('departmentHeadName', e.target.value)}
            className="w-full text-sm rounded-lg px-3 py-2 bg-white/70 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 text-gray-800 dark:text-white focus:ring-2 focus:ring-mandiri-blue focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-300 mb-1">
            Supervisor Name
          </label>
          <input 
            type="text" 
            value={personnel.supervisorName || ''}
            placeholder={PLACEHOLDERS.SUPERVISOR_NAME}
            onChange={e => handlePersonnelChange('supervisorName', e.target.value)}
            className="w-full text-sm rounded-lg px-3 py-2 bg-white/70 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 text-gray-800 dark:text-white focus:ring-2 focus:ring-mandiri-blue focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-300 mb-1">
            Supervisor Role / Jabatan
          </label>
          <input 
            type="text" 
            value={personnel.supervisorRole || ''}
            placeholder={PLACEHOLDERS.SUPERVISOR_ROLE}
            onChange={e => handlePersonnelChange('supervisorRole', e.target.value)}
            className="w-full text-sm rounded-lg px-3 py-2 bg-white/70 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 text-gray-800 dark:text-white focus:ring-2 focus:ring-mandiri-blue focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
