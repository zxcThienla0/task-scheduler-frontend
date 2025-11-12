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
    onMonthChange?: (month: Date) => void;
}

const SHIFT_TYPES = [
    {value: 'NOT_WORKING', label: '❌', color: 'bg-gray-200', title: 'Не работает'},
    {value: 'DAY_SHIFT', label: '🌞', color: 'bg-yellow-200', title: 'Дневная смена'},
    {value: 'NIGHT_SHIFT', label: '🌙', color: 'bg-blue-300', title: 'Ночная смена'},
    {value: 'HOLIDAY', label: '🌍', color: 'bg-purple-200', title: 'Суточная смена'},
    {value: 'LEAVE', label: '🏥', color: 'bg-red-200', title: 'Больничный/Отпуск'},
    {value: 'DENTIST_DAY', label: '🦷', color: 'bg-white', title: 'Стоматологический день'},
    {value: 'SURGERY_DAY', label: '🪡', color: 'bg-blue-200', title: 'Хирургический день'},
    {value: 'COMPUTED_TOMOGRAPHY', label: '🖥', color: 'bg-gray-300', title: 'Компьютерная томография'},
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
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [manualOrder, setManualOrder] = useState<string[]>([]);

    // Инициализируем ручной порядок при загрузке сотрудников
    useEffect(() => {
        if (employees.length > 0 && manualOrder.length === 0) {
            setManualOrder(employees.map(emp => emp.id));
        }
    }, [employees, manualOrder.length]);

    const sortedEmployees = useMemo(() => {
        if (sortByAlphabet) {
            return [...employees].sort((a, b) =>
                a.name.localeCompare(b.name, 'ru')
            );
        } else if (manualOrder.length > 0) {
            // Сортируем по ручному порядку
            const employeeMap = new Map(employees.map(emp => [emp.id, emp]));
            return manualOrder
                .map(id => employeeMap.get(id))
                .filter((emp): emp is Employee => emp !== undefined);
        }
        return employees;
    }, [employees, sortByAlphabet, manualOrder]);

    useEffect(() => {
        generateCalendarDays();
    }, [currentDate]);

    useEffect(() => {
        if (onMonthDaysUpdate) {
            onMonthDaysUpdate(daysInMonth);
        }
    }, [daysInMonth, onMonthDaysUpdate]);

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
        setSelectedEmployeeId(null); // Сбрасываем выделение при переключении сортировки
    };

    const handleEmployeeClick = (employeeId: string) => {
        if (sortByAlphabet) return; // Не позволяем выбирать при алфавитной сортировке

        setSelectedEmployeeId(prev =>
            prev === employeeId ? null : employeeId
        );
    };

    const moveEmployeeUp = () => {
        if (!selectedEmployeeId || sortByAlphabet) return;

        const currentIndex = manualOrder.indexOf(selectedEmployeeId);
        if (currentIndex > 0) {
            const newOrder = [...manualOrder];
            [newOrder[currentIndex - 1], newOrder[currentIndex]] =
                [newOrder[currentIndex], newOrder[currentIndex - 1]];
            setManualOrder(newOrder);
        }
    };

    const moveEmployeeDown = () => {
        if (!selectedEmployeeId || sortByAlphabet) return;

        const currentIndex = manualOrder.indexOf(selectedEmployeeId);
        if (currentIndex < manualOrder.length - 1) {
            const newOrder = [...manualOrder];
            [newOrder[currentIndex], newOrder[currentIndex + 1]] =
                [newOrder[currentIndex + 1], newOrder[currentIndex]];
            setManualOrder(newOrder);
        }
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
        <div className="select-none mb-3">
            {/* Панель управления сортировкой */}
            <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleEmployeeHeaderClick}
                        className={`px-4 py-2 rounded transition-colors ${
                            sortByAlphabet
                                ? 'bg-blue-500 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                        title={sortByAlphabet
                            ? "Нажмите чтобы отключить сортировку по алфавиту"
                            : "Нажмите чтобы включить сортировку по алфавиту"
                        }
                    >
                        {sortByAlphabet ? 'Сортировка по алфавиту' : 'Ручная сортировка'}
                    </button>

                    {!sortByAlphabet && selectedEmployeeId && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                                Выбран: {employees.find(e => e.id === selectedEmployeeId)?.name}
                            </span>
                            <button
                                onClick={moveEmployeeUp}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                disabled={!selectedEmployeeId || manualOrder.indexOf(selectedEmployeeId) === 0}
                                title="Переместить вверх"
                            >
                                ↑
                            </button>
                            <button
                                onClick={moveEmployeeDown}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                disabled={!selectedEmployeeId || manualOrder.indexOf(selectedEmployeeId) === manualOrder.length - 1}
                                title="Переместить вниз"
                            >
                                ↓
                            </button>
                        </div>
                    )}
                </div>

                {!sortByAlphabet && (
                    <div className="text-sm text-gray-500">
                        {selectedEmployeeId
                            ? "Кликните на сотрудника для выбора, затем используйте стрелки"
                            : "Кликните на сотрудника чтобы выбрать для перемещения"
                        }
                    </div>
                )}
            </div>

            {/* Остальная часть компонента остается такой же, но с небольшими изменениями в отображении сотрудников */}
            <div className="flex justify-between items-center mb-6">
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
                    className="bg-white border-black border-1 text-1xl text-black px-4 py-2 rounded transition-colors select-none"
                >
                    →
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse select-none">
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
                    {sortedEmployees.map((employee, employeeIndex) => {
                        const isSelected = selectedEmployeeId === employee.id;
                        const isSelectable = !sortByAlphabet;

                        return (
                            <React.Fragment key={employee.id}>
                                <tr>
                                    <td
                                        className={`
                                            border border-gray-300 p-2 font-medium sticky left-0 z-10 
                                            select-none transition-all
                                            ${isSelected
                                            ? 'bg-blue-200 border-blue-400 shadow-inner'
                                            : sortByAlphabet
                                                ? 'bg-blue-50'
                                                : 'bg-white hover:bg-gray-50'
                                        }
                                            ${isSelectable ? 'cursor-pointer' : 'cursor-default'}
                                        `}
                                        onClick={() => isSelectable && handleEmployeeClick(employee.id)}
                                        title={isSelectable
                                            ? isSelected
                                                ? "Сотрудник выбран. Используйте кнопки для перемещения"
                                                : "Кликните чтобы выбрать сотрудника для перемещения"
                                            : "Переключитесь на ручную сортировку для выбора сотрудников"
                                        }
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{employee.name}</span>
                                            {isSelected && (
                                                <span className="text-blue-600 text-sm">✓</span>
                                            )}
                                        </div>
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
                                                <div className={`${shiftType.color} rounded p-2 text-lg select-none`}>
                                                    {shiftType.label}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>

                                {(employeeIndex + 1) % 10 === 0 && employeeIndex !== sortedEmployees.length - 1 && (
                                    <tr>
                                        <td className={`
                                            border border-gray-300 p-2 font-medium sticky left-0 z-10 
                                            select-none bg-gray-100
                                            ${sortByAlphabet ? 'bg-blue-50' : 'bg-gray-100'}
                                        `}>
                                            <div className="text-sm text-gray-600">Сотрудник</div>
                                        </td>
                                        {daysInMonth.map(day => {
                                            const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                                            return (
                                                <th
                                                    key={`duplicate-${day.toISOString()}`}
                                                    className={`border border-gray-300 p-2 text-center min-w-12 select-none ${
                                                        isWeekend ? 'bg-blue-100' : 'bg-gray-100'
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
                                )}
                            </React.Fragment>
                        );
                    })}
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