import React from 'react';
import html2canvas from 'html2canvas';

interface ExportImageButtonProps {
    tableElement: HTMLElement | null;
    calendarName: string;
    className?: string;
}

export const ExportImageButton: React.FC<ExportImageButtonProps> = ({
                                                                        tableElement,
                                                                        calendarName,
                                                                        className = ''
                                                                    }) => {
    const exportToImage = async () => {
        if (!tableElement) {
            alert('Таблица не найдена');
            return;
        }

        try {
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

            document.body.style.cursor = 'auto';
        } catch (error) {
            console.error('Ошибка при экспорте:', error);
            alert('Ошибка при экспорте изображения');
            document.body.style.cursor = 'auto';
        }
    };

    return (
        <button
            onClick={exportToImage}
            className={`bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center gap-2 ${className}`}
        >
            🖼️ Экспорт как изображение
        </button>
    );
};