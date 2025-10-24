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
    const [isExporting, setIsExporting] = useState(false);

    const exportToImage = async () => {
        if (!tableElement) {
            alert('Таблица не найдена');
            return;
        }

        if (isExporting) return;

        setIsExporting(true);
        try {
            // Сохраняем оригинальные стили
            const originalStyles = {
                overflow: tableElement.style.overflow,
                transform: tableElement.style.transform,
                transformOrigin: tableElement.style.transformOrigin,
            };

            // Применяем стили для корректного экспорта
            tableElement.style.overflow = 'visible';
            tableElement.style.transform = 'scale(1)';
            tableElement.style.transformOrigin = 'top left';

            // Ждем применения стилей
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(tableElement, {
                scale: 0.8, // Уменьшаем scale для больших таблиц
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
                    }
                }
            });

            // Восстанавливаем стили
            Object.assign(tableElement.style, originalStyles);

            const link = document.createElement('a');
            link.download = `${calendarName}_${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setIsOpen(false);
        } catch (error: any) {
            console.error('Ошибка при экспорте изображения:', error);
            alert('Ошибка при экспорте изображения. Попробуйте выбрать другой формат.');
        } finally {
            setIsExporting(false);
        }
    };

    const exportToPDF = async () => {
        if (!tableElement) {
            alert('Таблица не найдена');
            return;
        }

        if (isExporting) return;

        setIsExporting(true);
        try {
            const originalStyles = {
                overflow: tableElement.style.overflow,
                transform: tableElement.style.transform,
            };

            tableElement.style.overflow = 'visible';
            tableElement.style.transform = 'scale(1)';

            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(tableElement, {
                scale: 0.7, // Еще меньший scale для PDF
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: tableElement.scrollWidth,
                height: tableElement.scrollHeight,
            });

            Object.assign(tableElement.style, originalStyles);

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a3' // Используем A3 для больших таблиц
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Рассчитываем размеры изображения
            const imgWidth = pageWidth - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Добавляем заголовок
            pdf.setFontSize(14);
            pdf.text(calendarName, 10, 10);

            if (imgHeight <= pageHeight - 20) {
                pdf.addImage(imgData, 'PNG', 10, 15, imgWidth, imgHeight);
            } else {
                // Для очень больших изображений уменьшаем еще больше
                const scaleFactor = (pageHeight - 20) / imgHeight;
                const scaledWidth = imgWidth * scaleFactor;
                const scaledHeight = imgHeight * scaleFactor;
                pdf.addImage(imgData, 'PNG', 10, 15, scaledWidth, scaledHeight);
            }

            pdf.save(`${calendarName}_${new Date().toISOString().split('T')[0]}.pdf`);
            setIsOpen(false);
        } catch (error: any) {
            console.error('Ошибка при экспорте PDF:', error);
            alert('Ошибка при экспорте PDF. Попробуйте экспорт в Excel.');
        } finally {
            setIsExporting(false);
        }
    };

    const exportToExcel = () => {
        if (employees.length === 0) {
            alert('Нет данных для экспорта');
            return;
        }

        try {
            const headers = ['Сотрудник', ...daysInMonth.map(day =>
                `${day.getDate().toString().padStart(2, '0')}.${(day.getMonth() + 1).toString().padStart(2, '0')}`
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
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            setIsOpen(false);
        } catch (error: any) {
            console.error('Ошибка при экспорте Excel:', error);
            alert('Ошибка при экспорте Excel');
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
                    <button
                        onClick={exportToImage}
                        disabled={isExporting}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-200 flex items-center gap-2 disabled:opacity-50"
                    >
                        🖼️ Изображение
                    </button>
                    <button
                        onClick={exportToPDF}
                        disabled={isExporting}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-200 flex items-center gap-2 disabled:opacity-50"
                    >
                        📄 PDF
                    </button>
                    <button
                        onClick={exportToExcel}
                        disabled={isExporting}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
                    >
                        📊 Excel/CSV
                    </button>
                </div>
            )}
        </div>
    );
};