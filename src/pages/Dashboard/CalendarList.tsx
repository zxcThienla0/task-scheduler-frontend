import {useNavigate} from 'react-router-dom';
import React, {useState, useEffect} from 'react';
import {calendarService} from '../../http/calendarService';

interface Calendar {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
}

interface CreateCalendarData {
    name: string;
    description?: string;
}

interface CalendarListProps {
    onAddCalendar?: () => void;
    refreshTrigger?: number;
}

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}

export const CalendarList: React.FC<CalendarListProps> = ({
                                                              onAddCalendar,
                                                              refreshTrigger
                                                          }) => {
    const navigate = useNavigate();
    const [calendars, setCalendars] = useState<Calendar[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [createForm, setCreateForm] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        loadCalendars();
    }, [refreshTrigger]);

    const loadCalendars = async () => {
        try {
            setIsLoading(true);
            const calendarsData = await calendarService.getCalendars();
            setCalendars(calendarsData);
        } catch (error: unknown) {
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
        } catch (error: unknown) {
            const err = error as ApiError;
            setError(err.response?.data?.message || 'Ошибка удаления календаря');
        }
    };

    const handleCreateCalendar = async () => {
        if (!createForm.name.trim()) {
            setError('Название календаря обязательно');
            return;
        }

        try {
            const calendarData: CreateCalendarData = {
                name: createForm.name.trim(),
                description: createForm.description.trim() || undefined
            };

            await calendarService.createCalendar(calendarData);

            setCreateForm({name: '', description: ''});
            setIsCreating(false);
            setError('');

            await loadCalendars();

            onAddCalendar?.();

        } catch (error: unknown) {
            const err = error as ApiError;
            setError(err.response?.data?.message || 'Ошибка создания календаря');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setCreateForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCancelCreate = () => {
        setIsCreating(false);
        setCreateForm({name: '', description: ''});
        setError('');
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-32">
                <div className="text-gray-500">Загрузка календарей...</div>
            </div>
        );
    }

    if (error && !isCreating) {
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
            {/* Кнопка для открытия формы создания */}
            {calendars.length > 0 && (
                <div className="mb-6 flex justify-end">
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        + Создать календарь
                    </button>
                </div>
            )}

            {/* Модальное окно/форма создания */}
            {isCreating && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Создать новый календарь</h3>

                        {error && (
                            <div
                                className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Название *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={createForm.name}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Введите название календаря"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Описание
                                </label>
                                <textarea
                                    name="description"
                                    value={createForm.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Введите описание календаря (необязательно)"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={handleCancelCreate}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleCreateCalendar}
                                disabled={!createForm.name.trim()}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                Создать
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {calendars.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-500 text-lg mb-4">У вас пока нет календарей</div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        Создать первый календарь
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {calendars.map((calendar) => (
                        <div
                            key={calendar.id}
                            className="border border-gray-200 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
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
                                        className="text-indigo-600 hover:text-indigo-800 text-sm transition-colors"
                                    >
                                        Открыть
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCalendar(calendar.id)}
                                        className="text-red-600 hover:text-red-800 text-sm transition-colors"
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