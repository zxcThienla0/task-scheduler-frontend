import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ExportButtonProps {
    tableElement: HTMLElement | null;
    calendarName: string;
    className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
                                                              tableElement,
                                                              calendarName,
                                                              className = ''
                                                          }) => {
    const exportToPDF = async () => {
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
                scrollY: -window.scrollY,
                windowWidth: tableElement.scrollWidth,
                windowHeight: tableElement.scrollHeight
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

        } catch (error) {
            console.error('Ошибка при экспорте:', error);
            alert('Ошибка при экспорте PDF');
            document.body.style.cursor = 'auto';
        }
    };

    return (
        <button
            onClick={exportToPDF}
            className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2 ${className}`}
        >
            📄 Экспорт в PDF
        </button>
    );
};