import {useState, useEffect, useRef} from 'react';
import {BasicInfoForm} from './components/BasicInfoForm';
import {UploadTicketForm} from './components/UploadTicketForm';
import {DateRulesForm} from './components/DateRulesForm';
import {TimesheetPreview} from './components/TimesheetPreview';
import {OvertimeForm} from './components/OvertimeForm';
import {OvertimePreview} from './components/OvertimePreview';
import {getWeekendsInMonth, getMonthNameId, getDaysInMonth, isWeekendDay, formatIndonesianDate} from './utils/dateHelpers';
import {exportToPdf} from './utils/pdfExporter';
import {Calendar, FileText, Sparkles, Loader2, CheckCircle2, ChevronDown, Upload, UserCheck, Sun, Moon} from 'lucide-react';
import defaultSignature from './assets/images/default-signature.png';
import {PLACEHOLDERS, TEXTS} from './utils/constants';

function App() {
    // Theme Mode state
    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (!savedTheme) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = (e) => {
                setDarkMode(e.matches);
            };
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, []);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
    };

    // Accordion open/close states
    const [isBasicInfoOpen, setIsBasicInfoOpen] = useState(true);
    const [isUploadTicketOpen, setIsUploadTicketOpen] = useState(false);
    const [isDateRulesOpen, setIsDateRulesOpen] = useState(false);
    const [isOvertimeFormOpen, setIsOvertimeFormOpen] = useState(false);
    const [isAssetsFormOpen, setIsAssetsFormOpen] = useState(false);

    // DRAGGABLE LAYOUT RESIZER STATE
    const [leftWidth, setLeftWidth] = useState(40); // default 40%
    const [isDragging, setIsDragging] = useState(false);
    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
    const containerRef = useRef(null);
    const prevGlobalDescRef = useRef(PLACEHOLDERS.DEFAULT_GLOBAL_DESCRIPTION);
    const prevIsDescSameRef = useRef(true);

    useEffect(() => {
        const handleResize = () => {
            setIsLargeScreen(window.innerWidth >= 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
                if (newWidth >= 20 && newWidth <= 65) {
                    setLeftWidth(newWidth);
                }
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleDoubleClick = () => {
        setLeftWidth(40); // Reset to default 40%
    };

    // ==========================================
    // STATE FOR FEATURE 1: TIMESHEET BUILDER
    // ==========================================
    const [personnelState, setPersonnelState] = useState({
        employeeName: "",
        roleName: "",
        supervisorName: "",
        supervisorRole: "",
        departmentHeadName: "",
        departmentName: ""
    });

    // ==========================================
    // STATE FOR FEATURE 1: TIMESHEET BUILDER
    // ==========================================
    const [timesheetState, setTimesheetState] = useState({
        year: 2026,
        month: 5,
        weekendDays: getWeekendsInMonth(2026, 5),
        holidayDays: [],
        leaveDays: [],
        workedHolidayDays: []
    });

    const [defaultActivities, setDefaultActivities] = useState(PLACEHOLDERS.DEFAULT_ACTIVITIES);
    const [hourOfDefaultActivities, setHourOfDefaultActivities] = useState(PLACEHOLDERS.DEFAULT_BASELINE_HOURS);
    const [isAutoGenerate, setIsAutoGenerate] = useState(PLACEHOLDERS.DEFAULT_AUTO_GENERATE);
    const [weekdayHour, setWeekdayHour] = useState(PLACEHOLDERS.DEFAULT_WEEKDAY_HOUR);
    const [weekendHour, setWeekendHour] = useState(PLACEHOLDERS.DEFAULT_WEEKEND_HOUR);

    const [timesheetTickets, setTimesheetTickets] = useState([]);
    const [mergedRowGroups, setMergedRowGroups] = useState([]);

    const [timesheetHoursOverrides, setTimesheetHoursOverrides] = useState({});

    // Reset overrides when month or year changes
    useEffect(() => {
        setTimesheetHoursOverrides({});
    }, [timesheetState.month, timesheetState.year]);

    const [globalLogos, setGlobalLogos] = useState({
        companyLogo: null,
        vendorLogo: null,
        signatureEmployee: defaultSignature
    });

    // ==========================================
    // STATE FOR FEATURE 2: OVERTIME BUILDER
    // ==========================================
    const [overtimeState, setOvertimeState] = useState({
        formTitle: "SURAT KETERANGAN KERJA LEMBUR",
        formDescription: "Sehubungan dengan adanya pekerjaan yang tidak dapat ditangguhkan penyelesaiannya, maka dengan ini saya meminta kepada karyawan tersebut di bawah ini untuk melakukan kerja lembur pada hari dan waktu sebagaimana tercantum dalam daftar lembur di bawah ini:",
        isDescriptionSame: true,
        globalDescription: PLACEHOLDERS.DEFAULT_GLOBAL_DESCRIPTION,
        overtimeList: []
    });

    // ==========================================
    // PDF EXPORT & IMPORT POPUP MODAL STATE
    // ==========================================
    const [isGenerating, setIsGenerating] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [exportedFilename, setExportedFilename] = useState('');

    const [showImportSuccess, setShowImportSuccess] = useState(false);
    const [showImportError, setShowImportError] = useState(false);
    const [importSuccessCount, setImportSuccessCount] = useState(0);
    const [importErrorMsg, setImportErrorMsg] = useState('');


    // ==========================================
    // AUTOMATIC OVERTIME SCHEDULE DERIVATION
    // ==========================================
    useEffect(() => {
        const totalDays = getDaysInMonth(timesheetState.year, timesheetState.month);
        const qualifying = [];

        // 1. Get active days in the month
        const activeDays = [];
        for (let d = 1; d <= totalDays; d++) {
            const dStr = String(d).padStart(2, '0');
            const mStr = String(timesheetState.month).padStart(2, '0');
            const dateKey = `${timesheetState.year}-${mStr}-${dStr}`;

            const isHoliday = timesheetState.holidayDays.includes(dateKey) && !timesheetState.workedHolidayDays?.includes(dateKey);
            const isLeave = timesheetState.leaveDays.includes(dateKey);
            const isWeekend = timesheetState.weekendDays.includes(dateKey);

            if (!isHoliday && !isLeave && !isWeekend) {
                const isWorkedHoliday = timesheetState.workedHolidayDays?.includes(dateKey);
                const isPhysicallyWeekend = isWeekendDay(timesheetState.year, timesheetState.month, d);
                activeDays.push({
                    day: d,
                    dateKey,
                    isWeekendOrWorkedHoliday: isPhysicallyWeekend || isWorkedHoliday
                });
            }
        }

        // 2. Pre-calculate auto-generated hours if enabled
        let autoHours = {};
        if (isAutoGenerate && activeDays.length > 0 && timesheetTickets.length > 0) {
            const M = activeDays.length;
            const N = timesheetTickets.length;
            const baseCount = Math.floor(N / M);
            const remainder = N % M;

            timesheetTickets.forEach(t => {
                const ticketKey = t.id || t.ticketNumber;
                autoHours[ticketKey] = {};
            });

            let ticketIdx = 0;
            activeDays.forEach((activeDay, i) => {
                const d = activeDay.day;
                const hourPerTicket = activeDay.isWeekendOrWorkedHoliday ? weekendHour : weekdayHour;
                const count = i < remainder ? baseCount + 1 : baseCount;

                for (let c = 0; c < count; c++) {
                    if (ticketIdx < N) {
                        const ticket = timesheetTickets[ticketIdx];
                        const ticketKey = ticket.id || ticket.ticketNumber;
                        const rowIdx = 1 + ticketIdx;
                        const group = mergedRowGroups.find(g => g.indices.includes(rowIdx));
                        const isHidden = group ? group.indices[0] !== rowIdx : false;

                        if (isHidden) {
                            autoHours[ticketKey][d] = 0;
                        } else {
                            autoHours[ticketKey][d] = hourPerTicket;
                        }
                        ticketIdx++;
                    }
                }
            });
        }

        for (let day = 1; day <= totalDays; day++) {
            const dStr = String(day).padStart(2, '0');
            const mStr = String(timesheetState.month).padStart(2, '0');
            const dateKey = `${timesheetState.year}-${mStr}-${dStr}`;

            let daySum = 0;
            if (isAutoGenerate) {
                // Calculate default row baseline hours (same as manual mode)
                let defVal = timesheetTickets.length === 0 ? 0 : hourOfDefaultActivities;
                const isWeekend = isWeekendDay(timesheetState.year, timesheetState.month, day);
                const isWorkedHoliday = timesheetState.workedHolidayDays?.includes(dateKey);

                if (isWeekend || isWorkedHoliday) {
                    defVal = 0;
                } else {
                    const isSpecial = timesheetState.weekendDays.includes(dateKey) ||
                        (timesheetState.holidayDays.includes(dateKey) && !timesheetState.workedHolidayDays?.includes(dateKey)) ||
                        timesheetState.leaveDays.includes(dateKey);
                    if (isSpecial) {
                        defVal = 0;
                    } else if (timesheetTickets.length > 0) {
                        const dayHasTicket = timesheetTickets.some(ticket => {
                            const ticketKey = ticket.id || ticket.ticketNumber;
                            return autoHours[ticketKey] && autoHours[ticketKey][day] > 0;
                        });
                        if (!dayHasTicket) {
                            defVal = weekdayHour;
                        }
                    }
                }

                if (timesheetHoursOverrides['default'] && timesheetHoursOverrides['default'][day] !== undefined) {
                    defVal = timesheetHoursOverrides['default'][day];
                }
                daySum += Number(defVal || 0);

                timesheetTickets.forEach(ticket => {
                    const ticketKey = ticket.id || ticket.ticketNumber;
                    let ticketVal = autoHours[ticketKey] && autoHours[ticketKey][day] !== undefined
                        ? autoHours[ticketKey][day]
                        : 0;
                    if (timesheetHoursOverrides[ticketKey] && timesheetHoursOverrides[ticketKey][day] !== undefined) {
                        ticketVal = timesheetHoursOverrides[ticketKey][day];
                    }
                    daySum += Number(ticketVal || 0);
                });
            } else {
                // Calculate total daily hours from Timesheet
                let defVal = timesheetTickets.length === 0 ? 0 : hourOfDefaultActivities;

                const isWeekend = isWeekendDay(timesheetState.year, timesheetState.month, day);
                const isWorkedHoliday = timesheetState.workedHolidayDays?.includes(dateKey);

                if (isWeekend || isWorkedHoliday) {
                    defVal = 0;
                } else {
                    const isSpecial = timesheetState.weekendDays.includes(dateKey) ||
                        (timesheetState.holidayDays.includes(dateKey) && !timesheetState.workedHolidayDays?.includes(dateKey)) ||
                        timesheetState.leaveDays.includes(dateKey);
                    if (isSpecial) defVal = 0;
                }

                if (timesheetHoursOverrides['default'] && timesheetHoursOverrides['default'][day] !== undefined) {
                    defVal = timesheetHoursOverrides['default'][day];
                }

                daySum = Number(defVal || 0);
                timesheetTickets.forEach(ticket => {
                    let ticketVal = 0;
                    const ticketKey = ticket.id || ticket.ticketNumber;
                    if (timesheetHoursOverrides[ticketKey] && timesheetHoursOverrides[ticketKey][day] !== undefined) {
                        ticketVal = timesheetHoursOverrides[ticketKey][day];
                    }
                    daySum += Number(ticketVal || 0);
                });
            }

            if (daySum > 0) {
                const isWeekend = isWeekendDay(timesheetState.year, timesheetState.month, day);
                const isWorkedHoliday = timesheetState.workedHolidayDays?.includes(dateKey);
                const isHoliday = timesheetState.holidayDays.includes(dateKey);
                const isLeave = timesheetState.leaveDays.includes(dateKey);

                // Regular holidays and leave days do not generate overtime
                if (isLeave || (isHoliday && !isWorkedHoliday)) {
                    continue;
                }

                if (isWeekend) {
                    qualifying.push({
                        date: dateKey,
                        hours: daySum,
                        isWeekend: true,
                        isWeekday: false,
                        isHoliday: false
                    });
                } else if (isWorkedHoliday) {
                    qualifying.push({
                        date: dateKey,
                        hours: daySum,
                        isWeekend: false,
                        isWeekday: false,
                        isHoliday: true
                    });
                } else {
                    // Regular Work Day (Weekday)
                    if (daySum > 8) {
                        qualifying.push({
                            date: dateKey,
                            hours: daySum + 1 - 8,
                            isWeekend: false,
                            isWeekday: true,
                            isHoliday: false
                        });
                    }
                }
            }
        }

        // Limit the derived overtime schedule to a maximum of 20 days
        const limitedQualifying = qualifying.slice(0, 20);

        const globalDescChanged = prevGlobalDescRef.current !== overtimeState.globalDescription;
        const isDescSameToggledOn = !prevIsDescSameRef.current && overtimeState.isDescriptionSame;
        
        prevGlobalDescRef.current = overtimeState.globalDescription;
        prevIsDescSameRef.current = overtimeState.isDescriptionSame;

        const forceGlobalDesc = overtimeState.isDescriptionSame && (globalDescChanged || isDescSameToggledOn);

        const newOvertimeList = limitedQualifying.map(q => {
            const existing = overtimeState.overtimeList.find(item => item.overtimeDate === q.date);

            // Determine starting hour: Weekday is 17:00 (5 PM), Weekend/Holiday is 09:00 (9 AM)
            const startHour = q.isWeekday ? 17 : 9;

            // Calculate derived/default hours
            let derivedHours = q.hours;
            if (startHour + q.hours > 24) {
                derivedHours = 24 - startHour;
            }

            const formatTime = (h) => `${String(h).padStart(2, '0')}:00`;

            // Sync/re-derive if the calculated derived hours changed
            const hoursChanged = existing ? existing.derivedHours !== derivedHours : false;

            let overtimeHours = derivedHours;
            if (existing && !hoursChanged) {
                // Preserve manual override of overtimeHours if it exists and timesheet didn't change
                overtimeHours = existing.overtimeHours !== undefined ? existing.overtimeHours : derivedHours;
            }

            // Automatically recalculate time range based on overtimeHours if it hasn't been manually overrode
            let displayHours = overtimeHours;
            if (startHour + displayHours > 24) {
                displayHours = 24 - startHour;
            }
            const defaultTimeRange = `${formatTime(startHour)} - ${formatTime(startHour + displayHours)}`;
            
            // Preserve manual override of timeRange if it exists and hours didn't change
            let timeRange = defaultTimeRange;
            if (existing && !hoursChanged && existing.timeRange !== undefined) {
                timeRange = existing.timeRange;
            }

            let taskText = existing && existing.task !== undefined
                ? (forceGlobalDesc ? (overtimeState.globalDescription || '') : existing.task)
                : (overtimeState.isDescriptionSame ? (overtimeState.globalDescription || '') : PLACEHOLDERS.DEFAULT_GLOBAL_DESCRIPTION);

            let dateText = existing && existing.dateText !== undefined
                ? existing.dateText
                : formatIndonesianDate(q.date, true);

            return {
                id: existing ? existing.id : q.date,
                overtimeDate: q.date,
                dateText: dateText,
                overtimeHours: overtimeHours,
                derivedHours: derivedHours,
                timeRange: timeRange,
                isWeekend: q.isWeekend,
                isWeekday: q.isWeekday,
                isHoliday: q.isHoliday,
                task: taskText
            };
        });

        const isDifferent = JSON.stringify(overtimeState.overtimeList) !== JSON.stringify(newOvertimeList);
        if (isDifferent) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setOvertimeState(prev => ({
                ...prev,
                overtimeList: newOvertimeList
            }));
        }
    }, [
        timesheetState.year,
        timesheetState.month,
        timesheetState.weekendDays,
        timesheetState.holidayDays,
        timesheetState.workedHolidayDays,
        timesheetState.leaveDays,
        timesheetHoursOverrides,
        timesheetTickets,
        hourOfDefaultActivities,
        overtimeState.overtimeList,
        overtimeState.isDescriptionSame,
        overtimeState.globalDescription,
        isAutoGenerate,
        weekdayHour,
        weekendHour,
        mergedRowGroups
    ]);

    // ==========================================
    // AUTOMATIC SAME-DAY ROW MERGING
    // ==========================================
    useEffect(() => {
        if (!isAutoGenerate) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setMergedRowGroups(prev => {
                if (prev.length > 0) return [];
                return prev;
            });
            return;
        }

        const totalDays = getDaysInMonth(timesheetState.year, timesheetState.month);
        const activeDays = [];
        for (let d = 1; d <= totalDays; d++) {
            const dStr = String(d).padStart(2, '0');
            const mStr = String(timesheetState.month).padStart(2, '0');
            const dateKey = `${timesheetState.year}-${mStr}-${dStr}`;

            const isHoliday = timesheetState.holidayDays.includes(dateKey) && !timesheetState.workedHolidayDays?.includes(dateKey);
            const isLeave = timesheetState.leaveDays.includes(dateKey);
            const isWeekend = timesheetState.weekendDays.includes(dateKey);

            if (!isHoliday && !isLeave && !isWeekend) {
                const isWorkedHoliday = timesheetState.workedHolidayDays?.includes(dateKey);
                const isPhysicallyWeekend = isWeekendDay(timesheetState.year, timesheetState.month, d);
                activeDays.push({
                    day: d,
                    dateKey,
                    isWeekendOrWorkedHoliday: isPhysicallyWeekend || isWorkedHoliday
                });
            }
        }

        if (activeDays.length > 0 && timesheetTickets.length > 0) {
            const M = activeDays.length;
            const N = timesheetTickets.length;
            const baseCount = Math.floor(N / M);
            const remainder = N % M;

            const newMergedGroups = [];
            let ticketIdx = 0;

            activeDays.forEach((activeDay, i) => {
                const count = i < remainder ? baseCount + 1 : baseCount;
                const groupIndices = [];

                for (let c = 0; c < count; c++) {
                    if (ticketIdx < N) {
                        groupIndices.push(1 + ticketIdx);
                        ticketIdx++;
                    }
                }

                if (groupIndices.length >= 2) {
                    newMergedGroups.push({
                        id: `auto-merge-${activeDay.day}-${i}`,
                        indices: groupIndices
                    });
                }
            });

            if (JSON.stringify(mergedRowGroups) !== JSON.stringify(newMergedGroups)) {
                setMergedRowGroups(newMergedGroups);
            }
        } else {
            setMergedRowGroups(prev => {
                if (prev.length > 0) return [];
                return prev;
            });
        }
    }, [
        isAutoGenerate,
        timesheetTickets,
        timesheetState.year,
        timesheetState.month,
        timesheetState.holidayDays,
        timesheetState.leaveDays,
        timesheetState.workedHolidayDays,
        timesheetState.weekendDays,
        mergedRowGroups
    ]);

    // ==========================================
    // HANDLERS & ACTIONS
    // ==========================================
    const handleTicketsParsed = (newTickets) => {
        const ticketsWithIds = newTickets.map((t, idx) => ({
            ...t,
            id: `${t.ticketNumber}-${idx}-${Date.now()}`
        }));
        setTimesheetTickets(ticketsWithIds);
        setTimesheetHoursOverrides(prev => {
            const copy = {...prev};
            ticketsWithIds.forEach(t => {
                delete copy[t.id];
            });
            return copy;
        });
        setMergedRowGroups([]);
        setImportSuccessCount(newTickets.length);
        setShowImportSuccess(true);
    };

    const handleTicketsParseError = (errorMsg) => {
        setImportErrorMsg(errorMsg);
        setShowImportError(true);
    };

    const handleLogoUpload = (e, type) => {
        const file = e.target.files[0];
        if (!file) {
            setGlobalLogos(prev => ({
                ...prev,
                [type]: null
            }));
            return;
        }

        const logoUrl = URL.createObjectURL(file);
        setGlobalLogos(prev => ({
            ...prev,
            [type]: logoUrl
        }));
    };

    const handleCellEdit = (rowId, day, value) => {
        setTimesheetHoursOverrides(prev => {
            const rowOverrides = prev[rowId] ? {...prev[rowId]} : {};
            rowOverrides[day] = value;
            return {
                ...prev,
                [rowId]: rowOverrides
            };
        });
    };

    const handlePersonnelFieldChange = (field, value) => {
        setPersonnelState(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleOvertimeRowChange = (id, field, value) => {
        const parseHoursFromTimeRange = (timeRangeStr) => {
            const match = timeRangeStr.match(/(\d{1,2})[:.](\d{2})\s*-\s*(\d{1,2})[:.](\d{2})/);
            if (!match) return null;
            
            const startH = parseInt(match[1], 10);
            const startM = parseInt(match[2], 10);
            const endH = parseInt(match[3], 10);
            const endM = parseInt(match[4], 10);
            
            let startMinutes = startH * 60 + startM;
            let endMinutes = endH * 60 + endM;
            
            if (endMinutes < startMinutes) {
                endMinutes += 24 * 60;
            }
            
            const diffMinutes = endMinutes - startMinutes;
            return Math.round((diffMinutes / 60) * 100) / 100;
        };

        setOvertimeState(prev => {
            const newList = prev.overtimeList.map(row => {
                if (row.id !== id) return row;
                
                let updatedRow = { ...row, [field]: value };
                
                if (field === 'overtimeHours') {
                    const hours = Number(value || 0);
                    const startHour = row.isWeekday ? 17 : 9;
                    
                    let displayHours = hours;
                    if (startHour + hours > 24) {
                        displayHours = 24 - startHour;
                    }
                    
                    const formatTime = (h) => `${String(h).padStart(2, '0')}:00`;
                    updatedRow.timeRange = `${formatTime(startHour)} - ${formatTime(startHour + displayHours)}`;
                } else if (field === 'timeRange') {
                    const parsedHours = parseHoursFromTimeRange(value);
                    if (parsedHours !== null && !isNaN(parsedHours) && parsedHours >= 0 && parsedHours <= 24) {
                        updatedRow.overtimeHours = parsedHours;
                    }
                }
                
                return updatedRow;
            });

            return {
                ...prev,
                overtimeList: newList
            };
        });
    };

    const generateTimesheetFileName = (employeeName, monthName, prefix) => `${prefix} - ${employeeName || PLACEHOLDERS.EMPLOYEE_NAME} - ${monthName}.pdf`;


    // PDF Export triggers with asynchronous loaders
    const handleGenerateTimesheetPdf = () => {
        const filename = generateTimesheetFileName(
            personnelState.employeeName,
            getMonthNameId(timesheetState.month),
            TEXTS.TIMESHEET
        );

        setIsGenerating(true);
        setExportedFilename(filename);

        setTimeout(() => {
            exportToPdf('timesheet-pdf-area', {
                filename,
                orientation: 'landscape',
                margin: 4
            })
                .then(() => {
                    setIsGenerating(false);
                    setShowSuccessModal(true);
                })
                .catch((err) => {
                    setIsGenerating(false);
                    alert(`${TEXTS.ALERT_FAILED_DOWNLOAD_PDF}: ${err}`);
                });
        }, 350);
    };

    const handleGenerateOvertimePdf = () => {
        const filename = generateTimesheetFileName(
            personnelState.employeeName,
            getMonthNameId(timesheetState.month),
            TEXTS.OVERTIME
        );

        setIsGenerating(true);
        setExportedFilename(filename);

        setTimeout(() => {
            exportToPdf('overtime-pdf-area', {
                filename,
                orientation: 'portrait',
                margin: 10
            })
                .then(() => {
                    setIsGenerating(false);
                    setShowSuccessModal(true);
                })
                .catch((err) => {
                    setIsGenerating(false);
                    alert(`${TEXTS.ALERT_FAILED_DOWNLOAD_PDF}: ${err}`);
                });
        }, 350);
    };

    return (
        <div
            className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-950 dark:to-slate-900 text-gray-800 dark:text-gray-100 transition-colors duration-300 font-sans flex flex-col ${isDragging ? 'select-none' : ''}`}>

            {/* NAVBAR */}
            <header className="sticky top-0 z-40 glass-panel border-b border-gray-200/50 dark:border-gray-800/50 no-print">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

                    {/* Logo Title */}
                    <div className="flex items-center gap-2">
                        <div
                            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-mandiri-blue to-cyan-500 flex items-center justify-center text-white shadow-md">
                            <Sparkles className="w-5 h-5 animate-pulse"/>
                        </div>
                        <div>
                            <h1 className="text-sm font-bold leading-tight tracking-wide text-mandiri-blue dark:text-mandiri-yellow">
                                Timesheet & Overtime Builder
                            </h1>
                        </div>
                    </div>

                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-gray-700 dark:text-gray-300 transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-slate-200/30 dark:border-slate-700/30"
                        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {darkMode ? (
                            <Sun className="w-4 h-4 text-amber-500 transition-transform duration-500 hover:rotate-90" />
                        ) : (
                            <Moon className="w-4 h-4 text-indigo-450 transition-transform duration-500 hover:-rotate-12" />
                        )}
                        <span className="text-xs font-semibold hidden sm:inline">
                            {darkMode ? "Dark Mode" : "Light Mode"}
                        </span>
                    </button>
                </div>
            </header>

            {/* SPLIT LAYOUT VIEWER */}
            <main
                ref={containerRef}
                className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col lg:flex-row gap-0 min-h-0 relative"
            >

                {/* LEFT COLUMN: Input Accordion Forms */}
                <section
                    className="flex flex-col no-print min-w-0 overflow-y-auto h-full pr-1 pb-6 space-y-4"
                    style={{width: isLargeScreen ? `${leftWidth}%` : '100%', flexShrink: 0}}
                >
                    {/* Accordion 1: Basic Information */}
                    <div
                        className="glass-panel rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800/80 overflow-hidden">
                        <button
                            onClick={() => setIsBasicInfoOpen(!isBasicInfoOpen)}
                            className="w-full flex justify-between items-center p-4 font-bold text-mandiri-blue dark:text-gray-200 border-b border-gray-150 dark:border-gray-800 bg-slate-50/50 hover:bg-slate-100/50 dark:bg-slate-900/40 dark:hover:bg-slate-850/40 transition-colors text-left"
                        >
                            <div className="flex items-center gap-2">
                                <UserCheck className="w-5 h-5"/>
                                <span>Basic Information</span>
                            </div>
                            <ChevronDown
                                className={`w-4 h-4 transition-transform duration-300 ${isBasicInfoOpen ? 'rotate-180' : ''}`}/>
                        </button>
                        <div
                            className={`grid transition-all duration-300 ease-in-out ${isBasicInfoOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                            <div className="overflow-hidden p-4">
                                <BasicInfoForm
                                    personnel={personnelState}
                                    setPersonnel={setPersonnelState}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Accordion 2: Upload Ticket */}
                    <div
                        className="glass-panel rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800/80 overflow-hidden">
                        <button
                            onClick={() => setIsUploadTicketOpen(!isUploadTicketOpen)}
                            className="w-full flex justify-between items-center p-4 font-bold text-mandiri-blue dark:text-gray-200 border-b border-gray-150 dark:border-gray-800 bg-slate-50/50 hover:bg-slate-100/50 dark:bg-slate-900/40 dark:hover:bg-slate-850/40 transition-colors text-left"
                        >
                            <div className="flex items-center gap-2">
                                <Upload className="w-5 h-5"/>
                                <span>Import Tickets</span>
                            </div>
                            <ChevronDown
                                className={`w-4 h-4 transition-transform duration-300 ${isUploadTicketOpen ? 'rotate-180' : ''}`}/>
                        </button>
                        <div
                            className={`grid transition-all duration-300 ease-in-out ${isUploadTicketOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                            <div className="overflow-hidden p-4">
                                <UploadTicketForm
                                    defaultActivities={defaultActivities}
                                    setDefaultActivities={setDefaultActivities}
                                    hourOfDefaultActivities={hourOfDefaultActivities}
                                    setHourOfDefaultActivities={setHourOfDefaultActivities}
                                    tickets={timesheetTickets}
                                    onClearTickets={() => {
                                        setTimesheetTickets([]);
                                        setMergedRowGroups([]);
                                    }}
                                    onTicketsParsed={handleTicketsParsed}
                                    onTicketsParseError={handleTicketsParseError}
                                    isAutoGenerate={isAutoGenerate}
                                    setIsAutoGenerate={setIsAutoGenerate}
                                    weekdayHour={weekdayHour}
                                    setWeekdayHour={setWeekdayHour}
                                    weekendHour={weekendHour}
                                    setWeekendHour={setWeekendHour}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Accordion 3: Timesheet Date Rules */}
                    <div
                        className="glass-panel rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800/80 overflow-hidden">
                        <button
                            onClick={() => setIsDateRulesOpen(!isDateRulesOpen)}
                            className="w-full flex justify-between items-center p-4 font-bold text-mandiri-blue dark:text-gray-200 border-b border-gray-150 dark:border-gray-800 bg-slate-50/50 hover:bg-slate-100/50 dark:bg-slate-900/40 dark:hover:bg-slate-850/40 transition-colors text-left"
                        >
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5"/>
                                <span>Calendar Setting  </span>
                            </div>
                            <ChevronDown
                                className={`w-4 h-4 transition-transform duration-300 ${isDateRulesOpen ? 'rotate-180' : ''}`}/>
                        </button>
                        <div
                            className={`grid transition-all duration-300 ease-in-out ${isDateRulesOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                            <div className="overflow-hidden p-4">
                                <DateRulesForm
                                    state={timesheetState}
                                    setState={setTimesheetState}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Accordion 4: Overtime Form */}
                    <div
                        className="glass-panel rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800/80 overflow-hidden">
                        <button
                            onClick={() => setIsOvertimeFormOpen(!isOvertimeFormOpen)}
                            className="w-full flex justify-between items-center p-4 font-bold text-mandiri-blue dark:text-gray-200 border-b border-gray-150 dark:border-gray-800 bg-slate-50/50 hover:bg-slate-100/50 dark:bg-slate-900/40 dark:hover:bg-slate-850/40 transition-colors text-left"
                        >
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5"/>
                                <span>Overtime (Optional Update)</span>
                            </div>
                            <ChevronDown
                                className={`w-4 h-4 transition-transform duration-300 ${isOvertimeFormOpen ? 'rotate-180' : ''}`}/>
                        </button>
                        <div
                            className={`grid transition-all duration-300 ease-in-out ${isOvertimeFormOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                            <div className="overflow-hidden p-4">
                                <OvertimeForm
                                    state={overtimeState}
                                    setState={setOvertimeState}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Accordion 3: Import & Logo Assets */}
                    <div
                        className="glass-panel rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800/80 overflow-hidden">
                        <button
                            onClick={() => setIsAssetsFormOpen(!isAssetsFormOpen)}
                            className="w-full flex justify-between items-center p-4 font-bold text-mandiri-blue dark:text-gray-200 border-b border-gray-150 dark:border-gray-800 bg-slate-50/50 hover:bg-slate-100/50 dark:bg-slate-900/40 dark:hover:bg-slate-850/40 transition-colors text-left"
                        >
                            <div className="flex items-center gap-2">
                                <Upload className="w-5 h-5"/>
                                <span>Signature and Logos (Optional)</span>
                            </div>
                            <ChevronDown
                                className={`w-4 h-4 transition-transform duration-300 ${isAssetsFormOpen ? 'rotate-180' : ''}`}/>
                        </button>
                        <div
                            className={`grid transition-all duration-300 ease-in-out ${isAssetsFormOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                            <div className="overflow-hidden p-4 space-y-4">
                                {/* Logo File Selectors */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            className="block text-xs font-semibold text-gray-500 dark:text-gray-300 mb-1">
                                            Company Logo (Override)
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => handleLogoUpload(e, 'companyLogo')}
                                            className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-mandiri-blue/10 file:text-mandiri-blue dark:file:bg-gray-800 dark:file:text-gray-300 hover:file:bg-mandiri-blue/20"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            className="block text-xs font-semibold text-gray-500 dark:text-gray-300 mb-1">
                                            Vendor Logo (Override)
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => handleLogoUpload(e, 'vendorLogo')}
                                            className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-mandiri-blue/10 file:text-mandiri-blue dark:file:bg-gray-800 dark:file:text-gray-300 hover:file:bg-mandiri-blue/20"
                                        />
                                    </div>
                                </div>

                                {/* Employee Signature File Upload */}
                                <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80">
                                    <label
                                        className="block text-xs font-semibold text-gray-500 dark:text-gray-300 mb-1">
                                        Employee Signature Image
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => handleLogoUpload(e, 'signatureEmployee')}
                                        className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-mandiri-blue/10 file:text-mandiri-blue dark:file:bg-gray-800 dark:file:text-gray-300 hover:file:bg-mandiri-blue/20"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* DRAGGABLE SPLITTER DIVIDER BAR */}
                <div
                    className="hidden lg:flex items-center justify-center w-6 cursor-col-resize select-none no-print group relative"
                    onMouseDown={handleMouseDown}
                    onDoubleClick={handleDoubleClick}
                >
                    <div
                        className="w-[1.5px] h-full bg-slate-200 group-hover:bg-mandiri-blue group-active:bg-mandiri-blue transition-colors"></div>
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-8 bg-white border border-slate-200 shadow-md rounded-md flex flex-col items-center justify-center gap-0.5 group-hover:border-mandiri-blue group-active:border-mandiri-blue transition-colors">
                        <span className="w-1.5 h-0.5 bg-slate-400 group-hover:bg-mandiri-blue rounded-full"></span>
                        <span className="w-1.5 h-0.5 bg-slate-400 group-hover:bg-mandiri-blue rounded-full"></span>
                        <span className="w-1.5 h-0.5 bg-slate-400 group-hover:bg-mandiri-blue rounded-full"></span>
                    </div>
                </div>

                {/* RIGHT COLUMN: Stacked Previews */}
                <section
                    className="flex flex-col min-w-0 h-full overflow-hidden"
                    style={{flex: isLargeScreen ? '1 1 0%' : 'none'}}
                >
                    <div className="flex-1 overflow-y-auto space-y-6 pr-2 pb-6">
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 select-none">Timesheet
                                Preview</h4>
                            <TimesheetPreview
                                state={timesheetState}
                                tickets={timesheetTickets}
                                defaultActivities={defaultActivities}
                                hourOfDefaultActivities={hourOfDefaultActivities}
                                hoursOverrides={timesheetHoursOverrides}
                                onCellEdit={handleCellEdit}
                                onGeneratePdf={handleGenerateTimesheetPdf}
                                companyLogoUrl={globalLogos.companyLogo}
                                vendorLogoUrl={globalLogos.vendorLogo}
                                signatureEmployeeUrl={globalLogos.signatureEmployee}
                                personnel={personnelState}
                                mergedRowGroups={mergedRowGroups}
                                setMergedRowGroups={setMergedRowGroups}
                                isAutoGenerate={isAutoGenerate}
                                weekdayHour={weekdayHour}
                                weekendHour={weekendHour}
                            />
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 select-none">Overtime
                                Preview</h4>
                            <OvertimePreview
                                state={overtimeState}
                                onGeneratePdf={handleGenerateOvertimePdf}
                                companyLogoUrl={globalLogos.companyLogo}
                                signatureEmployeeUrl={globalLogos.signatureEmployee}
                                personnel={personnelState}
                                onRowChange={handleOvertimeRowChange}
                                onPersonnelChange={handlePersonnelFieldChange}
                                onGlobalDescriptionChange={(val) => {
                                    setOvertimeState(prev => {
                                        const updatedList = prev.overtimeList.map(row => ({
                                            ...row,
                                            task: val
                                        }));
                                        return {
                                            ...prev,
                                            globalDescription: val,
                                            overtimeList: updatedList
                                        };
                                    });
                                }}
                            />
                        </div>
                    </div>
                </section>

            </main>

            {/* ==========================================
         MODAL POP-UPS (LOADING & CONFIRMATION)
         ========================================== */}
            {isGenerating && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md transition-all duration-300">
                    <div
                        className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl flex flex-col items-center border border-slate-100 dark:border-slate-800 text-center animate-fade-in">
                        <div
                            className="w-16 h-16 rounded-full bg-mandiri-blue/10 dark:bg-slate-800 flex items-center justify-center text-mandiri-blue dark:text-mandiri-yellow mb-4">
                            <Loader2 className="w-8 h-8 animate-spin"/>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">Generating Compliance PDF</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                            We are compiling the document and scaling the Excel layouts. Please do not close the tab or
                            reload.
                        </p>
                    </div>
                </div>
            )}

            {showSuccessModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-all duration-300">
                    <div
                        className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center border border-slate-100 dark:border-slate-800 text-center animate-fade-in">
                        <div
                            className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 shadow-inner">
                            <CheckCircle2 className="w-9 h-9"/>
                        </div>
                        <h3 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 mb-1">PDF Export Complete</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-xs leading-normal">
                            Your file has been generated successfully.
                        </p>

                        <div
                            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-150 dark:border-slate-800/80 rounded-xl p-3 mb-5 text-left font-mono">
                            <div
                                className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-0.5">Filename
                            </div>
                            <div className="text-xs font-semibold text-mandiri-blue dark:text-mandiri-yellow truncate" title={exportedFilename}>
                                {exportedFilename}
                            </div>
                        </div>

                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full py-2.5 bg-mandiri-blue hover:bg-mandiri-blue/90 dark:bg-mandiri-yellow dark:text-gray-900 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                        >
                            Okay, got it!
                        </button>
                    </div>
                </div>
            )}

            {showImportSuccess && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-all duration-300">
                    <div
                        className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center border border-slate-100 dark:border-slate-800 text-center animate-fade-in">
                        <div
                            className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 shadow-inner">
                            <CheckCircle2 className="w-9 h-9"/>
                        </div>
                        <h3 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 mb-1">Import Successful</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-xs leading-normal">
                            Successfully parsed and loaded JIRA tickets.
                        </p>

                        <div className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-150 dark:border-slate-800/80 rounded-xl p-3 mb-5 text-left">
                            <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-0.5">Tickets
                                Loaded
                            </div>
                            <div className="text-sm font-extrabold text-mandiri-blue dark:text-mandiri-yellow">
                                {importSuccessCount} Issues
                            </div>
                        </div>

                        <button
                            onClick={() => setShowImportSuccess(false)}
                            className="w-full py-2.5 bg-mandiri-blue hover:bg-mandiri-blue/90 dark:bg-mandiri-yellow dark:text-gray-900 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {showImportError && (() => {
                const hasCode = importErrorMsg && importErrorMsg.includes('|[CODE]');
                const textMsg = hasCode ? importErrorMsg.split('|[CODE]')[0] : importErrorMsg;
                const codeExample = hasCode ? importErrorMsg.split('|[CODE]')[1] : null;

                return (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-all duration-300">
                        <div
                            className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center border border-slate-100 dark:border-slate-800 text-center animate-fade-in">
                            <div
                                className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-450 mb-4 shadow-inner">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2}
                                     stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                                </svg>
                            </div>
                            <h3 className="text-lg font-extrabold text-red-650 dark:text-red-400 mb-1">Jira Import Failed</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-xs leading-normal">
                                An error occurred during file parsing.
                            </p>

                            <div
                                className="w-full bg-red-50/55 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 rounded-xl p-3 mb-5 text-left font-sans">
                                <div className="text-[10px] text-red-500 dark:text-red-455 font-bold uppercase tracking-wider mb-0.5">Error
                                    Message
                                </div>
                                <div className="text-xs font-semibold text-red-700 dark:text-red-300 leading-normal" style={{ whiteSpace: 'pre-wrap' }}>
                                    {textMsg}
                                </div>
                                {codeExample && (
                                    <div className="relative border border-red-100/60 dark:border-red-900/30 rounded-lg overflow-hidden bg-slate-900 dark:bg-slate-950 text-slate-100 dark:text-slate-300 font-mono text-[10px] p-2.5 mt-2.5 shadow-inner">
                                        <div className="flex justify-between items-center mb-1 text-[8px] text-slate-400 select-none">
                                            <span>JSON TEMPLATE</span>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    navigator.clipboard.writeText(codeExample);
                                                    const btn = e.currentTarget;
                                                    btn.textContent = "Copied!";
                                                    setTimeout(() => {
                                                        btn.textContent = "Copy";
                                                    }, 2000);
                                                }}
                                                className="text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider hover:underline focus:outline-none cursor-pointer"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                        <pre className="overflow-x-auto whitespace-pre-wrap">{codeExample}</pre>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setShowImportError(false)}
                                className="w-full py-2.5 bg-red-600 hover:bg-red-700 dark:bg-red-650 dark:hover:bg-red-750 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                );
            })()}

        </div>
    );
}

export default App;
