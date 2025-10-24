import React, { useState } from 'react';
import html2canvas from 'html2canvas';

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

interface ExportMenuProps {
    tableElement: HTMLElement | null;
    employees: Employee[];
    shifts: Shift[];
    calendarName: string;
    daysInMonth: Date[];
    currentMonth: Date;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
                                                          tableElement,
                                                          employees,
                                                          shifts,
                                                          calendarName,
                                                          daysInMonth,
                                                          currentMonth
                                                      }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const exportToImage = async () => {
        if (!tableElement) {
            alert('Таблица не найдена');
            return;
        }

        if (isExporting) return;

        setIsExporting(true);
        try {
            const monthName = currentMonth.toLocaleDateString('ru-RU', {
                month: 'long',
                year: 'numeric'
            });

            const originalStyles = {
                overflow: tableElement.style.overflow,
                transform: tableElement.style.transform,
                transformOrigin: tableElement.style.transformOrigin,
                background: tableElement.style.background,
            };

            tableElement.style.overflow = 'visible';
            tableElement.style.transform = 'scale(1)';
            tableElement.style.transformOrigin = 'top left';
            tableElement.style.background = '#ffffff';

            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(tableElement, {
                scale: 0.8,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                removeContainer: true,
                width: tableElement.scrollWidth,
                height: tableElement.scrollHeight,
                onclone: (clonedDoc) => {
                    const clonedTable = clonedDoc.querySelector('table');
                    if (clonedTable) {
                        clonedTable.style.overflow = 'visible';
                        clonedTable.style.transform = 'scale(1)';
                        clonedTable.style.background = '#ffffff';
                    }
                }
            });

            Object.assign(tableElement.style, originalStyles);

            const link = document.createElement('a');
            link.download = `${calendarName}_${monthName.replace(' ', '_')}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setIsOpen(false);
        } catch (error: any) {
            console.error('Ошибка при экспорте изображения:', error);
            alert('Ошибка при экспорте изображения. Попробуйте уменьшить масштаб страницы или подождать.');
        } finally {
            setIsExporting(false);
        }
    };

    const exportAsPrintableTable = () => {
        if (employees.length === 0) {
            alert('Нет данных для экспорта');
            return;
        }

        try {
            const monthName = currentMonth.toLocaleDateString('ru-RU', {
                month: 'long',
                year: 'numeric'
            });

            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${calendarName} - ${monthName}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            background: white;
        }
        .header { 
            text-align: center; 
            margin-bottom: 20px; 
        }
        .calendar-name { 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 5px;
        }
        .month-name { 
            font-size: 18px; 
            color: #666; 
        }
        table { 
            border-collapse: collapse; 
            width: 100%; 
            font-size: 12px;
        }
        th, td { 
            border: 1px solid #ddd; 
            padding: 6px; 
            text-align: center; 
        }
        th { 
            background-color: #f5f5f5; 
            font-weight: bold; 
            position: sticky;
            left: 0;
            z-index: 10;
        }
        .employee-name { 
            background-color: white; 
            font-weight: bold; 
            position: sticky;
            left: 0;
            z-index: 10;
            min-width: 120px;
        }
        .weekend { 
            background-color: #e6f3ff; 
        }
        .shift-day { background-color: #fff9c4; }
        .shift-night { background-color: #bbdefb; }
        .shift-holiday { background-color: #e1bee7; }
        .shift-leave { background-color: #ffcdd2; }
        .shift-not-working { background-color: #f5f5f5; }
        .legend { 
            margin-top: 20px; 
            display: flex; 
            flex-wrap: wrap; 
            gap: 15px; 
            justify-content: center;
        }
        .legend-item { 
            display: flex; 
            align-items: center; 
            gap: 5px; 
        }
        .legend-color { 
            width: 20px; 
            height: 20px; 
            border: 1px solid #ddd; 
        }
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="calendar-name">${calendarName}</div>
        <div class="month-name">${monthName}</div>
    </div>
    
    <table>
        <thead>
            <tr>
                <th class="employee-name">Сотрудник</th>
                ${daysInMonth.map(day => {
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                return `
                        <th class="${isWeekend ? 'weekend' : ''}">
                            <div>${day.getDate()}</div>
                            <div style="font-size: 10px; color: #666;">${day.toLocaleDateString('ru-RU', {weekday: 'short'})}</div>
                        </th>
                    `;
            }).join('')}
            </tr>
        </thead>
        <tbody>
            ${employees.map(employee => `
                <tr>
                    <td class="employee-name">${employee.name}</td>
                    ${daysInMonth.map(day => {
                const shift = shifts.find(s =>
                    s.employeeId === employee.id &&
                    new Date(s.date).toDateString() === day.toDateString()
                );
                const shiftType = shift?.shiftType || 'NOT_WORKING';
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                let shiftClass = '';
                let shiftSymbol = '';

                switch (shiftType) {
                    case 'DAY_SHIFT':
                        shiftClass = 'shift-day';
                        shiftSymbol = 'Д';
                        break;
                    case 'NIGHT_SHIFT':
                        shiftClass = 'shift-night';
                        shiftSymbol = 'Н';
                        break;
                    case 'HOLIDAY':
                        shiftClass = 'shift-holiday';
                        shiftSymbol = 'С';
                        break;
                    case 'LEAVE':
                        shiftClass = 'shift-leave';
                        shiftSymbol = 'О';
                        break;
                    default:
                        shiftClass = 'shift-not-working';
                        shiftSymbol = '-';
                }

                return `
                            <td class="${shiftClass} ${isWeekend ? 'weekend' : ''}">
                                ${shiftSymbol}
                            </td>
                        `;
            }).join('')}
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="legend">
        <div class="legend-item">
            <div class="legend-color" style="background-color: #fff9c4;"></div>
            <span>Д - Дневная смена</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background-color: #bbdefb;"></div>
            <span>Н - Ночная смена</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background-color: #e1bee7;"></div>
            <span>С - Суточная смена</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background-color: #ffcdd2;"></div>
            <span>О - Отпуск/Больничный</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background-color: #f5f5f5;"></div>
            <span>- - Не работает</span>
        </div>
    </div>

    <div class="no-print" style="margin-top: 20px; text-align: center; color: #666;">
        <p>Для печати: Нажмите Ctrl+P или используйте меню печати браузера</p>
        <p>Для сохранения как PDF: В диалоге печати выберите "Сохранить как PDF"</p>
    </div>
</body>
</html>
            `;

            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(htmlContent);
                printWindow.document.close();

                setTimeout(() => {
                    printWindow.print();
                }, 500);
            }

            setIsOpen(false);
        } catch (error: any) {
            console.error('Ошибка при создании таблицы для печати:', error);
            alert('Ошибка при создании таблицы для печати');
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isExporting}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {isExporting ? '⏳ Экспорт...' : '📥 Экспорт'}
                <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 min-w-48">
                    <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-200">
                        {currentMonth.toLocaleDateString('ru-RU', {
                            month: 'long',
                            year: 'numeric'
                        })}
                    </div>
                    <button
                        onClick={exportToImage}
                        disabled={isExporting}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-200 flex items-center gap-2 disabled:opacity-50"
                    >
                        🖼️ Изображение (PNG)
                    </button>
                    <button
                        onClick={exportAsPrintableTable}
                        disabled={isExporting}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
                    >
                        🖨️ Версия для печати
                    </button>
                </div>
            )}
        </div>
    );
};