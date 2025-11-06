"use client";

import "./globals.css";
import Header from "./main/component/Header";
import { NotifContextProvider } from "./main/lib/NotifContext";
import NotificationDisplay from "./main/component/NotificationDisplay";
import { AuthProvider } from "./main/lib/AuthContext";
import TanstackProvider from "./providerTan";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const root = document.documentElement;
                const theme = localStorage.getItem('theme-storage');
                let currentTheme = 'light'; // Предполагаем светлую тему по умолчанию

                if (theme) {
                  try {
                    const parsed = JSON.parse(theme);
                    if (parsed.state.theme) {
                      currentTheme = parsed.state.theme;
                    }
                  } catch (e) {
                    // Если парсинг не удался, полагаемся на системные предпочтения
                    currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  currentTheme = 'dark';
                }

                if (currentTheme === 'dark') {
                  root.classList.add('dark');
                } else {
                  root.classList.remove('dark'); // Удаляем dark, если тема светлая
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <TanstackProvider>
          <AuthProvider>
            <Header />
            <NotifContextProvider>
              <div className="pt-16 min-h-[calc(100vh-64px)]">{children}</div>
              <NotificationDisplay />
            </NotifContextProvider>
          </AuthProvider>
        </TanstackProvider>
      </body>
    </html>
  );
}
