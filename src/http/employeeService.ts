import $api from './index.ts';

export const employeeService = {
    async getEmployees(calendarId: string) {
        const response = await $api.get(`/calendar/${calendarId}/employees`);
        return response.data;
    },

    async createEmployee(calendarId: string, name: string) {
        const response = await $api.post(`/calendar/${calendarId}/employees`, {
            name
        });
        return response.data;
    },

    async deleteEmployee(calendarId: string, employeeId: string) {
        const response = await $api.delete(`/calendar/${calendarId}/employees/${employeeId}`);
        return response.data;
    }
};