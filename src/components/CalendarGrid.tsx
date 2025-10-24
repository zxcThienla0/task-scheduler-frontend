import React, {useState, useEffect, useMemo} from 'react';

interface Employee {
    id: string;
    name: string;
}

interface Shift {
    id: string;
    date: string;
    shiftType: string;
    employeeId: string;
    notes?: string;
}

interface CalendarGridProps {
    employees: Employee[];
    shifts: Shift[];
    onShiftChange: (employeeId: string, date: Date, shiftType: string) => void;
    isReadOnly?: boolean;
    onMonthDaysUpdate?: (days: Date[]) => void;
    onMonthChange?: (month: Date) => void; // Добавляем новый пропс
}

const SHIFT_TYPES = [
    {value: 'NOT_WORKING', label: '❌', color: 'bg-gray-200', title: 'Не работает'},
    {value: 'DAY_SHIFT', label: '🌞', color: 'bg-yellow-200', title: 'Дневная смена'},
    {value: 'NIGHT_SHIFT', label: '🌙', color: 'bg-blue-300', title: 'Ночная смена'},
    {value: 'HOLIDAY', label: '🌍', color: 'bg-purple-200', title: 'Суточная смена'},
    {value: 'LEAVE', label: '🏥', color: 'bg-red-200', title: 'Больничный/Отпуск'},
];

export const CalendarGrid: React.FC<CalendarGridProps> = ({
                                                              employees,
                                                              shifts,
                                                              onShiftChange,
                                                              isReadOnly = false,
                                                              onMonthDaysUpdate,
                                                              onMonthChange
                                                          }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [sortByAlphabet, setSortByAlphabet] = useState(false);
    const [daysInMonth, setDaysInMonth] = useState<Date[]>([]);

    const sortedEmployees = useMemo(() => {
        if (sortByAlphabet) {
            return [...employees].sort((a, b) =>
                a.name.localeCompare(b.name, 'ru')
            );
        }
        return employees;
    }, [employees, sortByAlphabet]);

    useEffect(() => {
        generateCalendarDays();
    }, [currentDate]);


    useEffect(() => {
        if (onMonthDaysUpdate) {
            onMonthDaysUpdate(daysInMonth);
        }
    }, [daysInMonth, onMonthDaysUpdate]);

    // Вызываем onMonthChange при изменении месяца
    useEffect(() => {
        if (onMonthChange) {
            onMonthChange(currentDate);
        }
    }, [currentDate, onMonthChange]);

    const generateCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const lastDay = new Date(year, month + 1, 0);

        const days: Date[] = [];
        for (let day = 1; day <= lastDay.getDate(); day++) {
            days.push(new Date(year, month, day));
        }

        setDaysInMonth(days);
    };

    const getShiftForEmployee = (employeeId: string, date: Date): Shift | undefined => {
        return shifts.find(shift =>
            shift.employeeId === employeeId &&
            new Date(shift.date).toDateString() === date.toDateString()
        );
    };

    const handleEmployeeHeaderClick = () => {
        setSortByAlphabet(prev => !prev);
    };

    const handleShiftClick = (employeeId: string, date: Date, currentShiftType: string) => {
        if (isReadOnly) {
            return;
        }

        const currentIndex = SHIFT_TYPES.findIndex(type => type.value === currentShiftType);
        const nextIndex = (currentIndex + 1) % SHIFT_TYPES.length;
        const nextShiftType = SHIFT_TYPES[nextIndex].value;

        onShiftChange(employeeId, date, nextShiftType);
    };

    const goToPreviousMonth = () => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        setCurrentDate(newDate);
    };

    const goToNextMonth = () => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        setCurrentDate(newDate);
    };

    if (employees.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 select-none">
                Добавьте сотрудников для отображения календаря
            </div>
        );
    }

    return (
        <div className="select-none mb-3 ">
            <div className="flex justify-between items-center mb-6 max-w-[1440px] mx-auto">
                <button
                    onClick={goToPreviousMonth}
                    className="bg-white border-black border-1 text-1xl text-black px-4 py-2 rounded transition-colors select-none"
                >
                    ←
                </button>

                <div className="flex flex-col items-center">
                    <h2 className="text-xl font-semibold select-none">
                        {currentDate.toLocaleDateString('ru-RU', {
                            month: 'long',
                            year: 'numeric'
                        })}
                    </h2>
                    {sortByAlphabet && (
                        <div className="text-sm text-blue-600 mt-1 select-none">
                            Сортировка по алфавиту
                        </div>
                    )}
                </div>

                <button
                    onClick={goToNextMonth}
                    className="bg-white border-black border-1 text-1xl text-black px-4 py-2 rounded transition-colors select-none "
                >
                    →
                </button>
            </div>

            <div className="overflow-x-auto">
                <table
                    className="min-w-full border-collapse select-none"
                >
                    <thead>
                    <tr>
                        <th
                            className={`
                                border border-gray-300 p-2 min-w-24 mr-1 sticky left-0 z-10 
                                select-none cursor-pointer transition-colors
                                ${sortByAlphabet
                                ? 'bg-blue-50 border-blue-300 hover:bg-blue-100'
                                : 'bg-white hover:bg-gray-100'
                            }
                            `}
                            onClick={handleEmployeeHeaderClick}
                            title={sortByAlphabet
                                ? "Нажмите чтобы отключить сортировку по алфавиту"
                                : "Нажмите чтобы включить сортировку по алфавиту"
                            }
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Сотрудник</span>
                                <div className="flex flex-col ml-1">
                                    <span className={`text-xs ${sortByAlphabet ? 'text-blue-500' : 'text-gray-400'}`}>
                                        {sortByAlphabet ? '↓' : '↕'}
                                    </span>
                                </div>
                            </div>
                        </th>
                        {daysInMonth.map(day => {
                            const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                            return (
                                <th
                                    key={day.toISOString()}
                                    className={`border border-gray-300 p-2 text-center min-w-12 select-none ${
                                        isWeekend ? 'bg-blue-100' : 'bg-white'
                                    }`}
                                >
                                    <div className="text-sm font-medium select-none">
                                        {day.getDate()}
                                    </div>
                                    <div className="text-xs text-gray-500 select-none">
                                        {day.toLocaleDateString('ru-RU', {weekday: 'short'})}
                                    </div>
                                </th>
                            );
                        })}
                    </tr>
                    </thead>

                    <tbody>
                    {sortedEmployees.map(employee => (
                        <tr key={employee.id}>
                            <td className={`
                                border border-gray-300 p-2 font-medium sticky left-0 z-10 
                                select-none
                                ${sortByAlphabet ? 'bg-blue-50' : 'bg-white'}
                            `}>
                                {employee.name}
                            </td>

                            {daysInMonth.map(day => {
                                const shift = getShiftForEmployee(employee.id, day);
                                const shiftType = SHIFT_TYPES.find(
                                    type => type.value === (shift?.shiftType || 'NOT_WORKING')
                                ) || SHIFT_TYPES[0];

                                const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                                return (
                                    <td
                                        key={day.toISOString()}
                                        className={`border border-gray-300 p-1 text-center select-none ${
                                            isReadOnly
                                                ? 'cursor-not-allowed opacity-90'
                                                : 'cursor-pointer hover:opacity-80 hover:shadow-md'
                                        } ${
                                            isWeekend ? 'bg-blue-100' : 'bg-white'
                                        }`}
                                        onClick={() => handleShiftClick(
                                            employee.id,
                                            day,
                                            shift?.shiftType || 'NOT_WORKING'
                                        )}
                                        title={isReadOnly
                                            ? `${employee.name}, ${day.toLocaleDateString()}: ${shiftType.title} (только просмотр)`
                                            : `${employee.name}, ${day.toLocaleDateString()}: ${shiftType.title}`
                                        }
                                    >
                                        <div className={`${shiftType.color} rounded p-2 text-lg select-none ${
                                            isReadOnly ? '' : ''
                                        }`}>
                                            {shiftType.label}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6">
                <div className="flex flex-wrap gap-2 justify-center mb-3">
                    {SHIFT_TYPES.map(type => (
                        <div key={type.value} className="flex items-center gap-1 select-none">
                            <div className={`${type.color} rounded p-1 text-sm select-none`}>
                                {type.label}
                            </div>
                            <span className="text-sm text-gray-600 select-none">{type.title}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};