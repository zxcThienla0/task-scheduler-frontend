import React from 'react';

interface Employee {
    id: string;
    name: string;
}

interface Shift {
    id: string;
    date: string;
    shiftType: string;
    employeeId: string;
}

interface ExportExcelButtonProps {
    employees: Employee[];
    shifts: Shift[];
    calendarName: string;
    daysInMonth: Date[];
    className?: string;
}

export const ExportExcelButton: React.FC<ExportExcelButtonProps> = ({
                                                                        employees,
                                                                        shifts,
                                                                        calendarName,
                                                                        daysInMonth,
                                                                        className = ''
                                                                    }) => {
    const exportToExcel = () => {
        const headers = ['Сотрудник', ...daysInMonth.map(day =>
            `${day.getDate()}.${day.getMonth() + 1}.${day.getFullYear()}`
        )];

        const data = employees.map(employee => {
            const row = [employee.name];

            daysInMonth.forEach(day => {
                const shift = shifts.find(s =>
                    s.employeeId === employee.id &&
                    new Date(s.date).toDateString() === day.toDateString()
                );

                const shiftType = shift?.shiftType || 'NOT_WORKING';
                let shiftSymbol = '';

                switch (shiftType) {
                    case 'DAY_SHIFT': shiftSymbol = 'Д'; break;
                    case 'NIGHT_SHIFT': shiftSymbol = 'Н'; break;
                    case 'HOLIDAY': shiftSymbol = 'С'; break;
                    case 'LEAVE': shiftSymbol = 'О'; break;
                    default: shiftSymbol = '-';
                }

                row.push(shiftSymbol);
            });

            return row;
        });

        const csvContent = [
            headers.join(','),
            ...data.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `${calendarName}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <button
            onClick={exportToExcel}
            className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 ${className}`}
        >
            📊 Экспорт в Excel
        </button>
    );
};