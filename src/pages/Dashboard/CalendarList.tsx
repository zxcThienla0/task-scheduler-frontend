import {useNavigate} from 'react-router-dom';
import React, {useState, useEffect} from 'react';
import {calendarService} from '../../http/calendarService';


interface Calendar {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
}

interface CalendarListProps {
    onAddCalendar: () => void;
    refreshTrigger?: number;
}

export const CalendarList: React.FC<CalendarListProps> = ({
                                                              onAddCalendar,
                                                              refreshTrigger
                                                          }) => {
    const navigate = useNavigate();
    const [calendars, setCalendars] = useState<Calendar[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        loadCalendars();
    }, [refreshTrigger]);

    const loadCalendars = async () => {
        try {
            setIsLoading(true);
            const calendarsData = await calendarService.getCalendars();
            setCalendars(calendarsData as any);
        } catch (error: any) {
            console.error('Ошибка загрузки календарей:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCalendar = async (calendarId: string) => {
        if (!window.confirm('Удалить календарь?')) return;

        try {
            await calendarService.deleteCalendar(calendarId);
            setCalendars(calendars.filter(cal => cal.id !== calendarId));
        } catch (error: any) {
            setError(error.response?.data?.message || 'Ошибка удаления календаря');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-32">
                <div className="text-gray-500">Загрузка календарей...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
                <button
                    onClick={loadCalendars}
                    className="ml-4 text-red-800 underline"
                >
                    Попробовать снова
                </button>
            </div>
        );
    }

    return (
        <div>
            {calendars.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-500 text-lg mb-4">У вас пока нет календарей</div>
                    <button
                        onClick={onAddCalendar}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
                    >
                        Создать первый календарь
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {calendars.map((calendar) => (
                        <div
                            key={calendar.id}
                            className="border border-gray-200 rounded-lg p-4 shadow-md transition-shadow"
                        >
                            <h3 className="font-semibold text-lg mb-2">{calendar.name}</h3>
                            {calendar.description && (
                                <p className="text-gray-600 text-sm mb-3">{calendar.description}</p>
                            )}
                            <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs">
                  Создан: {new Date(calendar.createdAt).toLocaleDateString()}
                </span>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => navigate(`/calendar/${calendar.id}`)}
                                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                                    >
                                        Открыть
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCalendar(calendar.id)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};