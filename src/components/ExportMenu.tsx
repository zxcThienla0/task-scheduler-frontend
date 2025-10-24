import React, {useState} from 'react';
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

    const canExport = employees.length > 0 && daysInMonth.length > 0;

    if (!canExport) {
        return (
            <button
                disabled
                className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed flex items-center gap-2"
                title="Нет данных для экспорта"
            >
                📥 Экспорт
            </button>
        );
    }

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
                <div
                    className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 min-w-48">
                    <button
                        onClick={async () => {
                            if (!tableElement) {
                                alert('Таблица не найдена');
                                return;
                            }
                            try {
                                const originalCursor = document.body.style.cursor;
                                document.body.style.cursor = 'wait';

                                // Добавляем временные стили для лучшего отображения
                                const originalStyle = tableElement.style.cssText;
                                tableElement.style.background = 'white';
                                tableElement.style.width = 'fit-content';

                                const canvas = await html2canvas(tableElement, {
                                    scale: 1, // Уменьшаем scale для производительности
                                    useCORS: true,
                                    scrollX: -window.scrollX,
                                    scrollY: -window.scrollY,
                                    width: tableElement.scrollWidth,
                                    height: tableElement.scrollHeight,
                                    backgroundColor: '#ffffff'
                                });

                                // Восстанавливаем оригинальные стили
                                tableElement.style.cssText = originalStyle;

                                const link = document.createElement('a');
                                link.download = `${calendarName}_${new Date().toISOString().split('T')[0]}.png`;
                                link.href = canvas.toDataURL('image/png', 1.0); // Максимальное качество
                                link.click();

                                document.body.style.cursor = originalCursor;
                                setIsOpen(false);
                            } catch (error: any) {
                                console.error('Ошибка при экспорте изображения:', error);
                                alert('Ошибка при экспорте изображения. Попробуйте уменьшить масштаб страницы.');
                                document.body.style.cursor = 'auto';
                            }
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-200 flex items-center gap-2"
                    >
                        🖼️ Изображение
                    </button>
                    <button
                        onClick={() => {
                            if (employees.length === 0) {
                                alert('Нет данных для экспорта');
                                setIsOpen(false);
                                return;
                            }

                            // Создаем заголовки с правильными датами
                            const headers = ['Сотрудник', ...daysInMonth.map(day =>
                                `${day.getDate().toString().padStart(2, '0')}.${(day.getMonth() + 1).toString().padStart(2, '0')}`
                            )];

                            // Создаем данные с понятными обозначениями
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
                                        case 'DAY_SHIFT':
                                            shiftSymbol = 'День';
                                            break;
                                        case 'NIGHT_SHIFT':
                                            shiftSymbol = 'Ночь';
                                            break;
                                        case 'HOLIDAY':
                                            shiftSymbol = 'Суточная';
                                            break;
                                        case 'LEAVE':
                                            shiftSymbol = 'Отпуск';
                                            break;
                                        default:
                                            shiftSymbol = 'Не работает';
                                    }

                                    row.push(shiftSymbol);
                                });

                                return row;
                            });

                            const csvContent = [
                                headers.join(';'),
                                ...data.map(row => row.map(cell => `"${cell}"`).join(';'))
                            ].join('\n');

                            const BOM = '\uFEFF';
                            const blob = new Blob([BOM + csvContent], {type: 'text/csv;charset=utf-8;'});
                            const link = document.createElement('a');
                            const url = URL.createObjectURL(blob);

                            link.setAttribute('href', url);
                            link.setAttribute('download', `${calendarName}_${new Date().toISOString().split('T')[0]}.csv`);
                            link.style.visibility = 'hidden';

                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
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

                                // Добавляем временные стили
                                const originalStyle = tableElement.style.cssText;
                                tableElement.style.background = 'white';
                                tableElement.style.width = 'fit-content';

                                const canvas = await html2canvas(tableElement, {
                                    scale: 1,
                                    useCORS: true,
                                    scrollX: -window.scrollX,
                                    scrollY: -window.scrollY,
                                    width: tableElement.scrollWidth,
                                    height: tableElement.scrollHeight,
                                    backgroundColor: '#ffffff'
                                });

                                // Восстанавливаем стили
                                tableElement.style.cssText = originalStyle;

                                const imgData = canvas.toDataURL('image/png', 1.0);
                                const pdf = new jsPDF({
                                    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
                                    unit: 'mm',
                                    format: 'a4'
                                });

                                const pageWidth = pdf.internal.pageSize.getWidth();
                                const pageHeight = pdf.internal.pageSize.getHeight();

                                // Добавляем заголовок
                                pdf.setFontSize(16);
                                pdf.setFont('helvetica', 'bold');
                                pdf.text(calendarName, 10, 10);

                                // Рассчитываем размеры изображения
                                const imgWidth = pageWidth - 20;
                                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                                // Проверяем, помещается ли изображение на одну страницу
                                if (imgHeight <= pageHeight - 20) {
                                    pdf.addImage(imgData, 'PNG', 10, 15, imgWidth, imgHeight);
                                } else {
                                    // Разбиваем на несколько страниц
                                    let position = 15;
                                    let remainingHeight = imgHeight;

                                    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                                    remainingHeight -= (pageHeight - position - 10);

                                    while (remainingHeight > 0) {
                                        pdf.addPage();
                                        position = -remainingHeight + 10;
                                        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                                        remainingHeight -= pageHeight;
                                    }
                                }

                                pdf.save(`${calendarName}_${new Date().toISOString().split('T')[0]}.pdf`);
                                document.body.style.cursor = originalCursor;
                                setIsOpen(false);
                            } catch (error: any) {
                                console.error('Ошибка при экспорте PDF:', error);
                                alert('Ошибка при экспорте PDF. Попробуйте уменьшить масштаб страницы.');
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