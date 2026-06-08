import { MonthYearPicker } from './MonthYearPicker';
import { MultiDatePicker } from './MultiDatePicker';
import { getWeekendsInMonth } from '../utils/dateHelpers';

export const DateRulesForm = ({ state, setState }) => {
  const handleCalendarChange = ({ weekendDays, holidayDays, leaveDays, workedHolidayDays }) => {
    setState(prev => ({
      ...prev,
      weekendDays,
      holidayDays,
      leaveDays,
      workedHolidayDays
    }));
  };

  return (
    <div className="space-y-4">
      <div>
        <MonthYearPicker
          year={state.year}
          month={state.month}
          onChange={(y, m) => {
            const newWeekends = getWeekendsInMonth(y, m);
            setState(prev => ({
              ...prev,
              year: y,
              month: m,
              weekendDays: newWeekends,
              holidayDays: [],
              leaveDays: [],
              workedHolidayDays: []
            }));
          }}
        />
      </div>

      {/* Multi-DatePicker Calendar View */}
      <div className="pt-2 border-t border-gray-150/60 dark:border-gray-800/80">
        <MultiDatePicker
          year={state.year}
          month={state.month}
          weekendDays={state.weekendDays}
          holidayDays={state.holidayDays}
          leaveDays={state.leaveDays}
          workedHolidayDays={state.workedHolidayDays}
          onChange={handleCalendarChange}
        />
      </div>
    </div>
  );
};
