import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
                                                          tableElement,
                                                          employees,
                                                          shifts,
                                                          calendarName,
                                                          daysInMonth
                                                      }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center gap-2"
            >
                📥 Экспорт
                <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 min-w-48">
                    <button
                        onClick={async () => {
                            if (!tableElement) {
                                alert('Таблица не найдена');
                                return;
                            }
                            try {
                                const originalCursor = document.body.style.cursor;
                                document.body.style.cursor = 'wait';
                                const canvas = await html2canvas(tableElement, {
                                    scale: 2,
                                    useCORS: true,
                                    scrollY: -window.scrollY
                                });
                                const link = document.createElement('a');
                                link.download = `${calendarName}_${new Date().toISOString().split('T')[0]}.png`;
                                link.href = canvas.toDataURL('image/png');
                                link.click();
                                document.body.style.cursor = originalCursor;
                                setIsOpen(false);
                            } catch (error: any) {
                                alert('Ошибка при экспорте изображения');
                                document.body.style.cursor = 'auto';
                            }
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-200 flex items-center gap-2"
                    >
                        🖼️ Изображение
                    </button>
                    <button
                        onClick={() => {
                            const headers = ['Сотрудник', ...daysInMonth.map(day =>
                                `${day.getDate()}.${day.getMonth() + 1}`
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
                            setIsOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-200 flex items-center gap-2"
                    >
                        📊 Excel/CSV
                    </button>
                    <button
                        onClick={async () => {
                            if (!tableElement) {
                                alert('Таблица не найдена');
                                return;
                            }
                            try {
                                const originalCursor = document.body.style.cursor;
                                document.body.style.cursor = 'wait';
                                const canvas = await html2canvas(tableElement, {
                                    scale: 2,
                                    useCORS: true,
                                    scrollY: -window.scrollY
                                });
                                const imgData = canvas.toDataURL('image/png');
                                const pdf = new jsPDF({
                                    orientation: 'landscape',
                                    unit: 'mm',
                                    format: 'a4'
                                });
                                const pageWidth = pdf.internal.pageSize.getWidth();
                                const pageHeight = pdf.internal.pageSize.getHeight();
                                pdf.setFontSize(16);
                                pdf.text(calendarName, 10, 10);
                                const imgWidth = pageWidth - 20;
                                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                                let heightLeft = imgHeight;
                                let position = 20;
                                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                                heightLeft -= pageHeight;
                                while (heightLeft >= 0) {
                                    position = heightLeft - imgHeight;
                                    pdf.addPage();
                                    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                                    heightLeft -= pageHeight;
                                }
                                pdf.save(`${calendarName}_${new Date().toISOString().split('T')[0]}.pdf`);
                                document.body.style.cursor = originalCursor;
                                setIsOpen(false);
                            } catch (error: any) {
                                alert('Ошибка при экспорте PDF');
                                document.body.style.cursor = 'auto';
                            }
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                    >
                        📄 PDF
                    </button>
                </div>
            )}
        </div>
    );
};