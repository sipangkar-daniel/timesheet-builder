/**
 * Date Helpers for Mandiri Timesheet & Overtime Builder
 */

// Month names in Indonesian (compliance/common usage) and English
export const MONTHS = [
  { value: 1, nameId: 'Januari', nameEn: 'January' },
  { value: 2, nameId: 'Februari', nameEn: 'February' },
  { value: 3, nameId: 'Maret', nameEn: 'March' },
  { value: 4, nameId: 'April', nameEn: 'April' },
  { value: 5, nameId: 'Mei', nameEn: 'May' },
  { value: 6, nameId: 'Juni', nameEn: 'June' },
  { value: 7, nameId: 'Juli', nameEn: 'July' },
  { value: 8, nameId: 'Agustus', nameEn: 'August' },
  { value: 9, nameId: 'September', nameEn: 'September' },
  { value: 10, nameId: 'Oktobers', nameEn: 'October' }, // or Oktober
  { value: 11, nameId: 'November', nameEn: 'November' },
  { value: 12, nameId: 'Desember', nameEn: 'December' }
];

export const getMonthNameId = (monthNum) => {
  const m = MONTHS.find(x => x.value === parseInt(monthNum, 10));
  return m ? m.nameId : '';
};

/**
 * Get total days in a given month of a year
 * @param {number} year 
 * @param {number} month (1-indexed)
 * @returns {number}
 */
export const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

/**
 * Get abbreviation of the day name (e.g. "Sun", "Mon") for a specific date
 * @param {number} year 
 * @param {number} month (1-indexed)
 * @param {number} day 
 * @returns {string}
 */
export const getDayAbbreviation = (year, month, day) => {
  const date = new Date(year, month - 1, day);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
};

/**
 * Check if a specific date is a weekend (Saturday or Sunday)
 * @param {number} year 
 * @param {number} month (1-indexed)
 * @param {number} day 
 * @returns {boolean}
 */
export const isWeekendDay = (year, month, day) => {
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
};

/**
 * Auto-detect and return all weekend dates (formatted as YYYY-MM-DD) for a given month and year
 * @param {number} year 
 * @param {number} month (1-indexed)
 * @returns {string[]}
 */
export const getWeekendsInMonth = (year, month) => {
  const totalDays = getDaysInMonth(year, month);
  const weekends = [];
  for (let d = 1; d <= totalDays; d++) {
    if (isWeekendDay(year, month, d)) {
      const dayStr = String(d).padStart(2, '0');
      const monthStr = String(month).padStart(2, '0');
      weekends.push(`${year}-${monthStr}-${dayStr}`);
    }
  }
  return weekends;
};

/**
 * Format Date object as YYYY-MM-DD in local time
 * @param {Date} date 
 * @returns {string}
 */
export const formatDateString = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format date string to Indonesian format, e.g. "Senin, 12 Mei 2026" or "12 Mei 2026"
 * @param {string} dateStr YYYY-MM-DD
 * @param {boolean} includeDayName 
 * @returns {string}
 */
export const formatIndonesianDate = (dateStr, includeDayName = true) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const daysId = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthsId = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayName = daysId[date.getDay()];
  const day = date.getDate();
  const monthName = monthsId[date.getMonth()];
  const year = date.getFullYear();

  if (includeDayName) {
    return `${dayName}, ${day} ${monthName} ${year}`;
  }
  return `${day} ${monthName} ${year}`;
};
