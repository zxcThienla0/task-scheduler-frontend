🗓️ Akella24 Calendar - Frontend
<div align="center">
https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react
https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript
https://img.shields.io/badge/Vite-7.1.7-646CFF?style=for-the-badge&logo=vite
https://img.shields.io/badge/Tailwind-4.1.14-06B6D4?style=for-the-badge&logo=tailwindcss

Производственный сайт: akella24calendar.ru

</div>
📋 О проекте
Frontend-часть коммерческого проекта Akella24 Calendar, разработанная на современном стеке технологий. Приложение предоставляет функционал календаря и управления событиями.

🚀 Технологический стек
Основные технологии
React 19.1.1 - UI библиотека

TypeScript - статическая типизация

Vite 7.1.7 - сборка и разработка

Tailwind CSS 4.1.14 - стилизация

State Management & Routing
Zustand 5.0.8 - управление состоянием

React Router DOM 7.9.4 - маршрутизация

HTTP Client
Axios 1.12.2 - HTTP запросы к backend API

Development Tools
ESLint - линтинг кода

TypeScript ESLint - линтинг TypeScript

📁 Структура проекта
text
src/
├── components/          # React компоненты
│   ├── ui/             # Переиспользуемые UI компоненты
│   ├── calendar/        # Компоненты календаря
│   └── common/          # Общие компоненты
├── pages/               # Страницы приложения
├── stores/              # Zustand stores
├── services/            # API сервисы
├── types/               # TypeScript типы
├── utils/               # Вспомогательные функции
├── hooks/               # Кастомные React хуки
└── assets/              # Статические файлы
🛠 Установка и запуск
Предварительные требования
Node.js 18+

npm или yarn

Установка зависимостей
bash
npm install
Запуск в режиме разработки
bash
npm run dev
Приложение будет доступно по адресу: http://localhost:5173

Сборка для production
bash
npm run build
Просмотр собранной версии
bash
npm run preview
Линтинг кода
bash
npm run lint
🔗 Интеграция с Backend
Проект взаимодействует с отдельным backend-сервером, расположенным в другом репозитории. Основные особенности интеграции:

REST API через Axios

JWT аутентификация (предположительно)

Обработка ошибок и загрузки данных

Интерсепторы для автоматической обработки запросов

🌐 Деплой
Проект размещен в интернете под доменом akella24calendar.ru и используется в коммерческих целях.

Скрипты деплоя
npm run build - создает оптимизированную сборку

npm run preview - локальная проверка production сборки

🎯 Ключевые функции
На основе используемого стека можно предположить реализацию:

📅 Управление календарем - просмотр, создание, редактирование событий

🔐 Аутентификация и авторизация пользователей

📱 Адаптивный дизайн для разных устройств

⚡ Быстрая загрузка благодаря Vite и оптимизациям

🎨 Современный UI с Tailwind CSS

🔄 State management через Zustand для предсказуемого состояния

🛣 Клиентская маршрутизация через React Router

🤝 Разработка
Code Style
TypeScript с строгими настройками

ESLint для поддержания качества кода

Функциональные компоненты с хуками

Рекомендации по разработке
Используйте TypeScript для типизации пропсов и состояний

Следуйте принципам компонентного подхода

Используйте кастомные хуки для переиспользуемой логики

Делите компоненты на умные и глупые (presentational)

📞 Контакты
Для вопросов по frontend части проекта обращайтесь к разработчику или через Issues в репозитории.

<div align="center">
Production: akella24calendar.ru | Built with ❤️ using React & TypeScript

</div>
