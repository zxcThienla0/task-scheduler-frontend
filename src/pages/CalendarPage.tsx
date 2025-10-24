import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {calendarService} from '../http/calendarService';
import {employeeService} from '../http/employeeService';
import {shiftService} from '../http/shiftService';
import {shareLinkService} from '../http/shareLinkService';
import {CalendarGrid} from '../components/CalendarGrid';
import {EmployeeManagement} from '../components/EmployeeMenagement.tsx';
import {ExportMenu} from '../components/ExportMenu';

interface Calendar {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

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

interface ShareLink {
    id: string;
    token: string;
    isActive: boolean;
    createdAt: string;
    createdBy?: {
        id: string;
        email: string;
        name: string;
    };
}

export const CalendarPage: React.FC = () => {
    const {calendarId} = useParams<{ calendarId: string }>();
    const navigate = useNavigate();
    const [calendar, setCalendar] = useState<Calendar | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showShareModal, setShowShareModal] = useState(false);
    const [newShareLink, setNewShareLink] = useState<string | null>(null);
    const [currentMonthDays, setCurrentMonthDays] = useState<Date[]>([]);
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

    useEffect(() => {
        if (calendarId) {
            loadCalendarData();
        }
    }, [calendarId]);

    const loadCalendarData = async () => {
        try {
            setIsLoading(true);

            const calendars = await calendarService.getCalendars();
            const currentCalendar = calendars.find((cal: any) => cal.id === calendarId);
            setCalendar(currentCalendar as any || null);

            if (calendarId) {
                try {
                    const employeesData = await employeeService.getEmployees(calendarId);
                    setEmployees(employeesData || []);
                } catch (error) {
                    console.error('Ошибка загрузки сотрудников:', error);
                    setEmployees([]);
                }

                try {
                    const shiftsData = await shiftService.getShifts(calendarId);
                    setShifts(shiftsData || []);
                } catch (error) {
                    console.error('Ошибка загрузки смен:', error);
                    setShifts([]);
                }

                try {
                    const shareLinksData = await shareLinkService.getShareLinks(calendarId);
                    setShareLinks(shareLinksData || []);
                } catch (error) {
                    console.error('Ошибка загрузки ссылок:', error);
                    setShareLinks([]);
                }
            }

        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddEmployee = async (name: string) => {
        try {
            if (!calendarId) return;

            const newEmployee = await employeeService.createEmployee(calendarId, name);
            setEmployees(prev => [...prev, newEmployee]);
        } catch (error) {
            console.error('Ошибка добавления сотрудника:', error);
            alert('Ошибка при добавлении сотрудника');
        }
    };

    const handleDeleteEmployee = async (employeeId: string) => {
        try {
            if (!calendarId) return;

            await employeeService.deleteEmployee(calendarId, employeeId);

            const updatedEmployees = await employeeService.getEmployees(calendarId);
            setEmployees(updatedEmployees || []);

            const updatedShifts = shifts.filter(shift => shift.employeeId !== employeeId);
            setShifts(updatedShifts);

        } catch (error) {
            console.error('Ошибка удаления сотрудника:', error);
            alert('Ошибка при удалении сотрудника');
        }
    };

    const handleShiftChange = async (employeeId: string, date: Date, shiftType: string) => {
        try {
            if (!calendarId) return;

            const existingShift = shifts.find(
                shift => shift.employeeId === employeeId &&
                    new Date(shift.date).toDateString() === date.toDateString()
            );

            if (existingShift) {
                const updatedShift = await shiftService.updateShift(existingShift.id, shiftType);
                setShifts(prev => prev.map(shift =>
                    shift.id === existingShift.id ? updatedShift : shift
                ));
            } else {
                const newShift = await shiftService.createShift(calendarId, employeeId, date, shiftType);
                setShifts(prev => [...prev, newShift]);
            }

        } catch (error) {
            console.error('Ошибка обновления смены:', error);
        }
    };

    const handleCreateShareLink = async () => {
        try {
            if (!calendarId) return;

            const shareLink = await shareLinkService.createShareLink(calendarId);
            const fullUrl = `${window.location.origin}/shared/${shareLink.token}`;

            setNewShareLink(fullUrl);
            setShowShareModal(true);

            const shareLinksData = await shareLinkService.getShareLinks(calendarId);
            setShareLinks(shareLinksData || []);

        } catch (error) {
            console.error('Ошибка создания ссылки:', error);
            alert('Ошибка при создании ссылки');
        }
    };

    const handleDeactivateShareLink = async (shareLinkId: string) => {
        try {
            await shareLinkService.deactivateShareLink(shareLinkId);

            const shareLinksData = await shareLinkService.getShareLinks(calendarId!);
            setShareLinks(shareLinksData || []);

        } catch (error) {
            console.error('Ошибка деактивации ссылки:', error);
            alert('Ошибка при деактивации ссылки');
        }
    };

    const handleActivateShareLink = async (shareLinkId: string) => {
        try {
            await shareLinkService.activateShareLink(shareLinkId);

            const shareLinksData = await shareLinkService.getShareLinks(calendarId!);
            setShareLinks(shareLinksData || []);

        } catch (error) {
            console.error('Ошибка активации ссылки:', error);
            alert('Ошибка при активации ссылки');
        }
    };

    const handleDeleteShareLink = async (shareLinkId: string) => {
        if (!window.confirm('Удалить ссылку?')) return;

        try {
            await shareLinkService.deleteShareLink(shareLinkId);

            const shareLinksData = await shareLinkService.getShareLinks(calendarId!);
            setShareLinks(shareLinksData || []);

        } catch (error) {
            console.error('Ошибка удаления ссылки:', error);
            alert('Ошибка при удалении ссылки');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Ссылка скопирована в буфер обмена!');
        });
    };

    const handleMonthDaysUpdate = (days: Date[]) => {
        setCurrentMonthDays(days);
    };

    const handleMonthChange = (month: Date) => {
        setCurrentMonth(month);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-32">
                <div className="text-gray-500">Загрузка календаря...</div>
            </div>
        );
    }

    if (!calendar) {
        return (
            <div className="p-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    Календарь не найден
                </div>
                <button
                    onClick={() => navigate('/calendars')}
                    className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded"
                >
                    Назад к списку
                </button>
            </div>
        );
    }

    return (
        <div className="p-3 mx-auto">
            <div className="flex justify-between items-center mb-6 max-w-7xl mx-auto">
                <div>
                    <h1 className="text-2xl font-bold">{calendar.name}</h1>
                    {calendar.description && (
                        <p className="text-gray-600 mt-2">{calendar.description}</p>
                    )}
                </div>
                <div className="flex gap-2">
                    <ExportMenu
                        employees={employees}
                        shifts={shifts}
                        calendarName={calendar.name}
                        daysInMonth={currentMonthDays}
                        currentMonth={currentMonth}
                    />
                    <button
                        onClick={handleCreateShareLink}
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    >
                        Поделиться
                    </button>
                    <button
                        onClick={() => navigate('/calendars')}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                        Назад к списку
                    </button>
                </div>
            </div>

            {showShareModal && newShareLink && (
                <div className="fixed inset-0 bg-[#00000080] flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Ссылка для общего доступа</h3>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newShareLink}
                                readOnly
                                className="border border-gray-300 rounded px-3 py-2 flex-1 text-sm"
                            />
                            <button
                                onClick={() => copyToClipboard(newShareLink)}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Копировать
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Отправьте эту ссылку другим пользователям для просмотра календаря
                        </p>
                        <button
                            onClick={() => setShowShareModal(false)}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            )}

            <EmployeeManagement
                employees={employees}
                onAddEmployee={handleAddEmployee}
                onDeleteEmployee={handleDeleteEmployee}
            />

            <CalendarGrid
                employees={employees}
                shifts={shifts}
                onShiftChange={handleShiftChange}
                onMonthDaysUpdate={handleMonthDaysUpdate}
                onMonthChange={handleMonthChange}
            />

            <div className="mb-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Ссылки для общего доступа</h2>
                    <button
                        onClick={handleCreateShareLink}
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
                    >
                        Создать новую ссылку
                    </button>
                </div>

                {shareLinks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Нет активных ссылок для общего доступа
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {shareLinks.map(shareLink => (
                            <div key={shareLink.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${
                                                shareLink.isActive ? 'bg-green-500' : 'bg-red-500'
                                            }`}></span>
                                            <span className="font-medium">
                                                {shareLink.isActive ? 'Активна' : 'Неактивна'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Создана: {new Date(shareLink.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        {shareLink.isActive ? (
                                            <button
                                                onClick={() => handleDeactivateShareLink(shareLink.id)}
                                                className="text-yellow-600 hover:text-yellow-800 text-sm"
                                                title="Деактивировать"
                                            >
                                                ⏸️
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleActivateShareLink(shareLink.id)}
                                                className="text-green-600 hover:text-green-800 text-sm"
                                                title="Активировать"
                                            >
                                                ▶️
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteShareLink(shareLink.id)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                            title="Удалить"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={`${window.location.origin}/shared/${shareLink.token}`}
                                        readOnly
                                        className="border border-gray-300 rounded px-2 py-1 text-xs flex-1"
                                    />
                                    <button
                                        onClick={() => copyToClipboard(`${window.location.origin}/shared/${shareLink.token}`)}
                                        className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-xs"
                                    >
                                        Копировать
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};