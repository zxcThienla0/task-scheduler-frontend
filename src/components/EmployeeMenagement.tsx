import React, {useState} from 'react';

interface Employee {
    id: string;
    name: string;
}

interface EmployeeManagementProps {
    calendarId?: string;
    employees: Employee[];
    onAddEmployee: (name: string) => void;
    onDeleteEmployee: (employeeId: string) => void;
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({
                                                                          employees,
                                                                          onAddEmployee,
                                                                          onDeleteEmployee
                                                                      }) => {
    const [newEmployeeName, setNewEmployeeName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newEmployeeName.trim()) {
            onAddEmployee(newEmployeeName.trim());
            setNewEmployeeName('');
        }
    };

    return (
        <div className="mb-8 max-w-7xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Сотрудники</h2>

            <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newEmployeeName}
                    onChange={(e) => setNewEmployeeName(e.target.value)}
                    placeholder="Имя сотрудника"
                    className="border border-gray-300 rounded px-3 py-2 flex-1"
                />
                <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                    Добавить
                </button>
            </form>

            <div className="space-y-2">
                {employees.map(employee => (
                    <div key={employee.id} className="flex justify-between items-center border-b pb-2">
                        <span>{employee.name}</span>
                        <button
                            onClick={() => onDeleteEmployee(employee.id)}
                            className="text-red-600 hover:text-red-800 border border-red-600 px-3 py-2 rounded hover:bg-red-200 transition-all duration-300"
                        >
                            Удалить
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};