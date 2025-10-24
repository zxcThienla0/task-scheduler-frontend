import {BrowserRouter as Router, Routes, Route, Link, Navigate} from 'react-router-dom';
import "./index.css"
import {useAuthStore} from "./http/authStore";
import {Login} from './pages/Login';
import {Register} from './pages/Register';
import {Dashboard} from "./pages/Dashboard/index.tsx";
import axios from "axios";
import {CalendarPage} from "./pages/CalendarPage.tsx";
import {SharedCalendarPage} from "./pages/SharedCalendarPage.tsx";

axios.defaults.withCredentials = true;


function App() {
    const {user, logout, isAuth} = useAuthStore();


    const basename = process.env.NODE_ENV === 'production'
        ? ''
        : '';

    return (
        <>
            <Router basename={basename}>
                <div>
                    <div className="bg-black text-white p-4">
                        <nav className='container flex justify-between'>
                            <ul className="flex space-x-4">
                                <li><Link to="/" className="">Главная</Link></li>
                            </ul>
                            <ul className="flex w-auto">
                                {!isAuth ? (
                                    <>
                                        <li><Link to="/register" className="mr-5">Регистрация</Link>
                                        </li>
                                        <li><Link to="/login" className="">Войти</Link></li>
                                    </>
                                ) : (
                                    <>
                                        <li className="pr-5">{user?.email}</li>
                                        <li>
                                            <button
                                                onClick={logout}
                                                className="hover:underline text-sm cursor-pointer"
                                            >
                                                Выйти
                                            </button>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </nav>
                    </div>
                    <main className="">
                        {!isAuth ? (
                            <Routes>
                                <Route path="/" element={<Register/>}/>
                                <Route path="/login" element={<Login/>}/>
                                <Route path="/calendar/:calendarId" element={<CalendarPage/>}/>
                                <Route path="/shared/:token" element={<SharedCalendarPage/>}/>
                                <Route path="*" element={<Navigate to="/" replace/>}/>
                            </Routes>
                        ) : (
                            <Routes>
                                <Route path="/" element={<Dashboard/>}/>
                                <Route path="/register" element={<Register/>}/>
                                <Route path="/login" element={<Login/>}/>
                                <Route path="/calendar/:calendarId" element={<CalendarPage/>}/>
                                <Route path="/shared/:token" element={<SharedCalendarPage/>}/>
                                <Route path="*" element={<Navigate to="/" replace/>}/>
                            </Routes>)}

                    </main>
                </div>
            </Router>
        </>
    )
}

export default App