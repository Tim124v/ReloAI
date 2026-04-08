module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/frontend/src/lib/api.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TOKEN_KEY",
    ()=>TOKEN_KEY,
    "api",
    ()=>api
]);
const TOKEN_KEY = 'relo_token';
const getToken = ()=>("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : null;
async function request(path, options = {}) {
    const token = getToken();
    const res = await fetch(path, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : {},
            ...options.headers
        }
    });
    if (!res.ok) {
        const err = await res.json().catch(()=>({
                error: 'Request failed'
            }));
        throw Object.assign(new Error(err.error || err.message || 'Request failed'), {
            status: res.status,
            data: err
        });
    }
    return res.json();
}
const api = {
    get: (path)=>request(path),
    post: (path, body)=>request(path, {
            method: 'POST',
            body: JSON.stringify(body)
        })
};
;
}),
"[project]/frontend/src/lib/auth.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/lib/api.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
function AuthProvider({ children }) {
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [token, setToken] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const refreshUser = async ()=>{
        try {
            const data = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].get('/api/auth/me');
            setUser(data);
        } catch  {
            setUser(null);
            setToken(null);
            localStorage.removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOKEN_KEY"]);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const stored = localStorage.getItem(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOKEN_KEY"]);
        if (stored) {
            setToken(stored);
            refreshUser().finally(()=>setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);
    const login = (newToken, newUser)=>{
        localStorage.setItem(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOKEN_KEY"], newToken);
        setToken(newToken);
        setUser(newUser);
    };
    const logout = ()=>{
        localStorage.removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOKEN_KEY"]);
        setToken(null);
        setUser(null);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            token,
            loading,
            login,
            logout,
            refreshUser
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/frontend/src/lib/auth.tsx",
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
function useAuth() {
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
}),
"[project]/frontend/src/lib/i18n-data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LOCALES",
    ()=>LOCALES,
    "translations",
    ()=>translations
]);
const LOCALES = [
    {
        code: 'en',
        label: 'English',
        flag: '🇬🇧'
    },
    {
        code: 'ru',
        label: 'Русский',
        flag: '🇷🇺'
    },
    {
        code: 'es',
        label: 'Español',
        flag: '🇪🇸'
    },
    {
        code: 'de',
        label: 'Deutsch',
        flag: '🇩🇪'
    }
];
const translations = {
    en: {
        nav: {
            signIn: 'Sign In',
            getStarted: 'Get Started Free',
            dashboard: 'Dashboard',
            history: 'History',
            billing: 'Billing',
            logout: 'Sign out'
        },
        hero: {
            badge: 'AI-powered relocation intelligence',
            title1: 'Find your best',
            title2: 'country to relocate to',
            subtitle: 'Tell us your profession, budget, and goals. Our AI analyzes 195 countries and returns a ranked shortlist with visa requirements, costs, and a step-by-step relocation plan.',
            cta: 'Analyze my profile',
            ctaSecondary: 'Sign in',
            free: 'Free: 3 analyses/month · No credit card required'
        },
        stats: {
            countries: 'Countries analyzed',
            users: 'Users relocated',
            rating: 'Average rating',
            time: 'Minutes to results'
        },
        how: {
            title: 'How it works',
            subtitle: 'Three steps to your perfect destination',
            steps: [
                {
                    title: 'Fill your profile',
                    desc: 'Enter your profession, monthly budget, preferred language, and relocation goals.'
                },
                {
                    title: 'AI analyzes 195 countries',
                    desc: 'Our model scores every country against your profile — visa options, cost of living, job market, climate.'
                },
                {
                    title: 'Get your personalized plan',
                    desc: 'Receive a ranked shortlist with a month-by-month roadmap and pre-move checklist.'
                }
            ]
        },
        features: {
            title: 'Not ChatGPT. A real relocation tool.',
            subtitle: 'Structured output. Actionable steps. Specific to your profile.',
            items: [
                {
                    title: 'Scored ranking',
                    desc: 'Top 5 countries scored 0–100 based on your profile. Not just a list — a ranking.'
                },
                {
                    title: 'Visa & cost data',
                    desc: 'Visa type, requirements, timeline, and real monthly cost ranges for each destination.'
                },
                {
                    title: 'Relocation roadmap',
                    desc: 'Month-by-month action plan specific to your situation, not generic advice.'
                },
                {
                    title: 'Secure & private',
                    desc: 'Your data stays yours. History saved to your account, nothing shared.'
                }
            ]
        },
        preview: {
            title: 'What you get',
            topCountries: 'Top Countries',
            plan: 'Relocation Plan',
            checklist: 'Checklist',
            countries: [
                '🇵🇹 Portugal — 94/100',
                '🇦🇪 UAE — 91/100',
                '🇬🇪 Georgia — 87/100'
            ],
            steps: [
                'Month 1: Documents',
                'Month 2–3: Visa apply',
                'Month 4–6: Transition'
            ],
            checks: [
                'Apostille documents',
                'Bank account abroad',
                'Tax consultation'
            ]
        },
        testimonials: {
            title: 'Trusted by digital nomads & expats',
            items: [
                {
                    name: 'Alex M.',
                    role: 'Software Engineer → Portugal',
                    quote: 'ReloAI saved me weeks of research. The visa breakdown alone was worth it — I had no idea D7 was an option until the AI suggested it.'
                },
                {
                    name: 'Sofia R.',
                    role: 'Freelance Designer → Georgia',
                    quote: 'I was torn between 10 countries. ReloAI gave me a clear ranking with real cost estimates. Moved to Tbilisi 3 months later.'
                },
                {
                    name: 'James K.',
                    role: 'Finance Manager → UAE',
                    quote: 'The relocation roadmap was incredibly specific. Month-by-month steps that actually matched my situation. Highly recommend.'
                }
            ]
        },
        pricing: {
            title: 'Simple pricing',
            subtitle: "Start free. Upgrade when you're ready.",
            free: {
                name: 'Free',
                price: '$0',
                period: '',
                desc: '3 analyses/month',
                features: [
                    '3 AI analyses/month',
                    'Full structured output',
                    'Analysis history',
                    'Relocation plan + checklist'
                ],
                cta: 'Start free'
            },
            pro: {
                name: 'Pro',
                price: '$9',
                period: '/mo',
                desc: 'Unlimited analyses',
                badge: 'Most popular',
                features: [
                    'Unlimited AI analyses',
                    'Full history access',
                    'Priority processing',
                    'Cancel anytime'
                ],
                cta: 'Go Pro'
            }
        },
        faq: {
            title: 'Frequently asked questions',
            items: [
                {
                    q: 'How accurate is the AI analysis?',
                    a: 'The AI is trained on current visa regulations, cost of living indices, and expat community data. Results are a strong starting point — always verify visa requirements with official government sources before applying.'
                },
                {
                    q: 'What does "structured output" mean?',
                    a: 'Instead of paragraphs of text, you get JSON-powered cards: country scores, visa details, monthly costs, pros/cons — all formatted and scannable. Not a wall of text.'
                },
                {
                    q: 'Can I analyze multiple profiles?',
                    a: 'Yes. Free users get 3 analyses per month. Pro users get unlimited. Each analysis is saved in your history so you can compare results.'
                },
                {
                    q: 'What countries are covered?',
                    a: "All 195 UN-recognized countries. The AI prioritizes the most relevant ones based on your profile, so you'll typically see popular expat destinations and hidden gems."
                },
                {
                    q: 'Is my data safe?',
                    a: "Your profile data is sent to OpenAI for processing (under their privacy policy) and saved to your account history. We don't sell or share your data with third parties."
                }
            ]
        },
        cta: {
            title: 'Ready to find your country?',
            subtitle: 'Join thousands of people who used ReloAI to make smarter relocation decisions.',
            button: 'Analyze my profile — free'
        },
        footer: {
            copy: 'ReloAI — AI Relocation Intelligence',
            tagline: 'Making relocation decisions data-driven.'
        },
        profiles: {
            label: 'Profiles analyzed right now',
            items: [
                {
                    profession: 'Software Engineer',
                    budget: '$3,000/mo',
                    goal: 'Low taxes, warm climate'
                },
                {
                    profession: 'Freelance Designer',
                    budget: '$2,000/mo',
                    goal: 'Good internet, EU visa'
                },
                {
                    profession: 'Finance Manager',
                    budget: '$5,000/mo',
                    goal: 'Financial hub, English-friendly'
                },
                {
                    profession: 'Teacher / Educator',
                    budget: '$1,500/mo',
                    goal: 'Low cost of living, safe'
                }
            ]
        }
    },
    ru: {
        nav: {
            signIn: 'Войти',
            getStarted: 'Начать бесплатно',
            dashboard: 'Панель',
            history: 'История',
            billing: 'Оплата',
            logout: 'Выйти'
        },
        hero: {
            badge: 'ИИ-аналитика для релокации',
            title1: 'Найди лучшую страну',
            title2: 'для переезда',
            subtitle: 'Укажи профессию, бюджет и цели. Наш ИИ анализирует 195 стран и возвращает ранжированный список с визовыми требованиями, стоимостью жизни и пошаговым планом переезда.',
            cta: 'Анализировать профиль',
            ctaSecondary: 'Войти',
            free: 'Бесплатно: 3 анализа в месяц · Карта не нужна'
        },
        stats: {
            countries: 'Стран проанализировано',
            users: 'Пользователей переехало',
            rating: 'Средняя оценка',
            time: 'Минут до результата'
        },
        how: {
            title: 'Как это работает',
            subtitle: 'Три шага до идеальной страны',
            steps: [
                {
                    title: 'Заполни профиль',
                    desc: 'Укажи профессию, ежемесячный бюджет, предпочтительный язык и цели переезда.'
                },
                {
                    title: 'ИИ анализирует 195 стран',
                    desc: 'Модель оценивает каждую страну под твой профиль — визы, стоимость жизни, рынок труда, климат.'
                },
                {
                    title: 'Получи персональный план',
                    desc: 'Ранжированный список стран + пошаговая дорожная карта и чеклист до отъезда.'
                }
            ]
        },
        features: {
            title: 'Не ChatGPT. Реальный инструмент для релокации.',
            subtitle: 'Структурированный вывод. Конкретные шаги. Под твой профиль.',
            items: [
                {
                    title: 'Ранжирование стран',
                    desc: 'Топ-5 стран с оценкой 0–100 под твой профиль. Не просто список — ранжирование.'
                },
                {
                    title: 'Визы и стоимость',
                    desc: 'Тип визы, требования, сроки и реальные диапазоны расходов для каждой страны.'
                },
                {
                    title: 'Дорожная карта',
                    desc: 'Пошаговый план по месяцам — конкретно под твою ситуацию, без воды.'
                },
                {
                    title: 'Безопасность',
                    desc: 'Твои данные только твои. История сохраняется в аккаунте, ничего не передаётся.'
                }
            ]
        },
        preview: {
            title: 'Что ты получаешь',
            topCountries: 'Топ стран',
            plan: 'План переезда',
            checklist: 'Чеклист',
            countries: [
                '🇵🇹 Португалия — 94/100',
                '🇦🇪 ОАЭ — 91/100',
                '🇬🇪 Грузия — 87/100'
            ],
            steps: [
                'Месяц 1: Документы',
                'Месяц 2–3: Подача визы',
                'Месяц 4–6: Переезд'
            ],
            checks: [
                'Апостиль документов',
                'Счёт за рубежом',
                'Налоговая консультация'
            ]
        },
        testimonials: {
            title: 'Нам доверяют цифровые кочевники и экспаты',
            items: [
                {
                    name: 'Алекс М.',
                    role: 'Разработчик → Португалия',
                    quote: 'ReloAI сэкономил мне недели исследований. Разбор виз был бесценен — я не знал про D7, пока ИИ не предложил.'
                },
                {
                    name: 'София Р.',
                    role: 'Дизайнер → Грузия',
                    quote: 'Я разрывалась между 10 странами. ReloAI дал чёткий рейтинг с реальными затратами. Переехала в Тбилиси через 3 месяца.'
                },
                {
                    name: 'Джеймс К.',
                    role: 'Финансист → ОАЭ',
                    quote: 'Дорожная карта была невероятно конкретной. Пошаговые действия точно под мою ситуацию. Рекомендую всем.'
                }
            ]
        },
        pricing: {
            title: 'Простые цены',
            subtitle: 'Начни бесплатно. Переходи на Pro когда готов.',
            free: {
                name: 'Бесплатно',
                price: '$0',
                period: '',
                desc: '3 анализа в месяц',
                features: [
                    '3 ИИ-анализа в месяц',
                    'Полный структурированный вывод',
                    'История анализов',
                    'План переезда + чеклист'
                ],
                cta: 'Начать бесплатно'
            },
            pro: {
                name: 'Pro',
                price: '$9',
                period: '/мес',
                desc: 'Безлимитные анализы',
                badge: 'Популярно',
                features: [
                    'Безлимитные ИИ-анализы',
                    'Полный доступ к истории',
                    'Приоритетная обработка',
                    'Отмена в любой момент'
                ],
                cta: 'Перейти на Pro'
            }
        },
        faq: {
            title: 'Частые вопросы',
            items: [
                {
                    q: 'Насколько точен ИИ-анализ?',
                    a: 'ИИ обучен на актуальных данных о визовых правилах, стоимости жизни и экспат-сообществах. Результаты — сильная отправная точка. Всегда проверяй визовые требования на официальных сайтах перед подачей документов.'
                },
                {
                    q: 'Что значит "структурированный вывод"?',
                    a: 'Вместо стен текста ты получаешь карточки с оценками стран, деталями виз, диапазонами расходов, плюсами и минусами — всё отформатировано и читабельно.'
                },
                {
                    q: 'Можно анализировать несколько профилей?',
                    a: 'Да. Бесплатные пользователи получают 3 анализа в месяц, Pro — безлимит. Каждый анализ сохраняется в истории.'
                },
                {
                    q: 'Какие страны охвачены?',
                    a: 'Все 195 стран ООН. ИИ приоритизирует самые релевантные под твой профиль — популярные экспат-направления и скрытые жемчужины.'
                },
                {
                    q: 'Мои данные в безопасности?',
                    a: 'Данные профиля отправляются в OpenAI для обработки и сохраняются в твоём аккаунте. Мы не продаём и не передаём данные третьим лицам.'
                }
            ]
        },
        cta: {
            title: 'Готов найти свою страну?',
            subtitle: 'Тысячи людей уже используют ReloAI для принятия взвешенных решений о переезде.',
            button: 'Анализировать профиль — бесплатно'
        },
        footer: {
            copy: 'ReloAI — ИИ для релокации',
            tagline: 'Делаем решения о переезде основанными на данных.'
        },
        profiles: {
            label: 'Профили анализируются прямо сейчас',
            items: [
                {
                    profession: 'Разработчик',
                    budget: '$3,000/мес',
                    goal: 'Низкие налоги, тёплый климат'
                },
                {
                    profession: 'Дизайнер-фрилансер',
                    budget: '$2,000/мес',
                    goal: 'Хороший интернет, виза ЕС'
                },
                {
                    profession: 'Финансовый менеджер',
                    budget: '$5,000/мес',
                    goal: 'Финансовый хаб, английский'
                },
                {
                    profession: 'Преподаватель',
                    budget: '$1,500/мес',
                    goal: 'Низкие расходы, безопасность'
                }
            ]
        }
    },
    es: {
        nav: {
            signIn: 'Iniciar sesión',
            getStarted: 'Empezar gratis',
            dashboard: 'Panel',
            history: 'Historial',
            billing: 'Facturación',
            logout: 'Cerrar sesión'
        },
        hero: {
            badge: 'Inteligencia de reubicación con IA',
            title1: 'Encuentra tu mejor',
            title2: 'país para mudarte',
            subtitle: 'Dinos tu profesión, presupuesto y objetivos. Nuestra IA analiza 195 países y devuelve una lista clasificada con requisitos de visa, costos y un plan de reubicación paso a paso.',
            cta: 'Analizar mi perfil',
            ctaSecondary: 'Iniciar sesión',
            free: 'Gratis: 3 análisis/mes · Sin tarjeta de crédito'
        },
        stats: {
            countries: 'Países analizados',
            users: 'Usuarios reubicados',
            rating: 'Calificación promedio',
            time: 'Minutos para resultados'
        },
        how: {
            title: 'Cómo funciona',
            subtitle: 'Tres pasos a tu destino perfecto',
            steps: [
                {
                    title: 'Completa tu perfil',
                    desc: 'Ingresa tu profesión, presupuesto mensual, idioma preferido y objetivos de reubicación.'
                },
                {
                    title: 'La IA analiza 195 países',
                    desc: 'El modelo puntúa cada país según tu perfil: opciones de visa, costo de vida, mercado laboral, clima.'
                },
                {
                    title: 'Obtén tu plan personalizado',
                    desc: 'Lista clasificada con una hoja de ruta mes a mes y una lista de verificación previa al traslado.'
                }
            ]
        },
        features: {
            title: 'No es ChatGPT. Es una herramienta real.',
            subtitle: 'Salida estructurada. Pasos accionables. Específico a tu perfil.',
            items: [
                {
                    title: 'Ranking con puntuación',
                    desc: 'Los 5 mejores países puntuados del 0 al 100 según tu perfil. No solo una lista — un ranking.'
                },
                {
                    title: 'Datos de visa y costos',
                    desc: 'Tipo de visa, requisitos, plazos y rangos de costos mensuales reales para cada destino.'
                },
                {
                    title: 'Hoja de ruta de reubicación',
                    desc: 'Plan de acción mes a mes específico para tu situación, no consejos genéricos.'
                },
                {
                    title: 'Seguro y privado',
                    desc: 'Tus datos son tuyos. Historial guardado en tu cuenta, nada compartido.'
                }
            ]
        },
        preview: {
            title: 'Qué obtienes',
            topCountries: 'Mejores Países',
            plan: 'Plan de Reubicación',
            checklist: 'Lista de Verificación',
            countries: [
                '🇵🇹 Portugal — 94/100',
                '🇦🇪 EAU — 91/100',
                '🇬🇪 Georgia — 87/100'
            ],
            steps: [
                'Mes 1: Documentos',
                'Mes 2–3: Solicitud de visa',
                'Mes 4–6: Transición'
            ],
            checks: [
                'Apostilla de documentos',
                'Cuenta bancaria en el extranjero',
                'Consulta fiscal'
            ]
        },
        testimonials: {
            title: 'Confiado por nómadas digitales y expatriados',
            items: [
                {
                    name: 'Alex M.',
                    role: 'Ingeniero → Portugal',
                    quote: 'ReloAI me ahorró semanas de investigación. El desglose de visas fue invaluable — no sabía que la D7 era una opción hasta que la IA lo sugirió.'
                },
                {
                    name: 'Sofia R.',
                    role: 'Diseñadora → Georgia',
                    quote: 'Estaba entre 10 países. ReloAI me dio un ranking claro con costos reales. Me mudé a Tbilisi 3 meses después.'
                },
                {
                    name: 'James K.',
                    role: 'Financiero → EAU',
                    quote: 'La hoja de ruta fue increíblemente específica. Pasos mes a mes que realmente coincidían con mi situación. Muy recomendado.'
                }
            ]
        },
        pricing: {
            title: 'Precios simples',
            subtitle: 'Empieza gratis. Actualiza cuando estés listo.',
            free: {
                name: 'Gratis',
                price: '$0',
                period: '',
                desc: '3 análisis/mes',
                features: [
                    '3 análisis de IA/mes',
                    'Salida estructurada completa',
                    'Historial de análisis',
                    'Plan + lista de verificación'
                ],
                cta: 'Empezar gratis'
            },
            pro: {
                name: 'Pro',
                price: '$9',
                period: '/mes',
                desc: 'Análisis ilimitados',
                badge: 'Más popular',
                features: [
                    'Análisis de IA ilimitados',
                    'Acceso completo al historial',
                    'Procesamiento prioritario',
                    'Cancela cuando quieras'
                ],
                cta: 'Ir a Pro'
            }
        },
        faq: {
            title: 'Preguntas frecuentes',
            items: [
                {
                    q: '¿Qué tan preciso es el análisis de IA?',
                    a: 'La IA está entrenada con regulaciones de visa actuales, índices de costo de vida y datos de comunidades de expatriados. Los resultados son un sólido punto de partida — siempre verifica los requisitos de visa con fuentes oficiales antes de aplicar.'
                },
                {
                    q: '¿Qué significa "salida estructurada"?',
                    a: 'En lugar de párrafos de texto, obtienes tarjetas con puntuaciones de países, detalles de visa, rangos de costos mensuales y pros/contras — todo formateado y fácil de escanear.'
                },
                {
                    q: '¿Puedo analizar múltiples perfiles?',
                    a: 'Sí. Los usuarios gratuitos obtienen 3 análisis por mes. Los usuarios Pro obtienen ilimitados. Cada análisis se guarda en tu historial.'
                },
                {
                    q: '¿Qué países están cubiertos?',
                    a: 'Los 195 países reconocidos por la ONU. La IA prioriza los más relevantes según tu perfil.'
                },
                {
                    q: '¿Están seguros mis datos?',
                    a: 'Los datos de tu perfil se envían a OpenAI para su procesamiento y se guardan en el historial de tu cuenta. No vendemos ni compartimos tus datos con terceros.'
                }
            ]
        },
        cta: {
            title: '¿Listo para encontrar tu país?',
            subtitle: 'Miles de personas usan ReloAI para tomar decisiones de reubicación más inteligentes.',
            button: 'Analizar mi perfil — gratis'
        },
        footer: {
            copy: 'ReloAI — Inteligencia de Reubicación con IA',
            tagline: 'Haciendo las decisiones de reubicación basadas en datos.'
        },
        profiles: {
            label: 'Perfiles siendo analizados ahora mismo',
            items: [
                {
                    profession: 'Ingeniero de Software',
                    budget: '$3,000/mes',
                    goal: 'Bajos impuestos, clima cálido'
                },
                {
                    profession: 'Diseñador Freelance',
                    budget: '$2,000/mes',
                    goal: 'Buena internet, visa UE'
                },
                {
                    profession: 'Gerente Financiero',
                    budget: '$5,000/mes',
                    goal: 'Hub financiero, inglés'
                },
                {
                    profession: 'Docente',
                    budget: '$1,500/mes',
                    goal: 'Bajo costo de vida, seguridad'
                }
            ]
        }
    },
    de: {
        nav: {
            signIn: 'Anmelden',
            getStarted: 'Kostenlos starten',
            dashboard: 'Dashboard',
            history: 'Verlauf',
            billing: 'Abrechnung',
            logout: 'Abmelden'
        },
        hero: {
            badge: 'KI-gestützte Relocation-Intelligenz',
            title1: 'Finde dein bestes',
            title2: 'Land zum Auswandern',
            subtitle: 'Teile deine Profession, dein Budget und deine Ziele. Unsere KI analysiert 195 Länder und liefert eine Rangliste mit Visaanforderungen, Kosten und einem schrittweisen Relocation-Plan.',
            cta: 'Profil analysieren',
            ctaSecondary: 'Anmelden',
            free: 'Kostenlos: 3 Analysen/Monat · Keine Kreditkarte'
        },
        stats: {
            countries: 'Analysierte Länder',
            users: 'Umgezogene Nutzer',
            rating: 'Durchschnittsbewertung',
            time: 'Minuten bis Ergebnisse'
        },
        how: {
            title: 'So funktioniert es',
            subtitle: 'Drei Schritte zu deinem perfekten Zielland',
            steps: [
                {
                    title: 'Profil ausfüllen',
                    desc: 'Gib deine Profession, monatliches Budget, bevorzugte Sprache und Umzugsziele ein.'
                },
                {
                    title: 'KI analysiert 195 Länder',
                    desc: 'Das Modell bewertet jedes Land anhand deines Profils — Visaoptionen, Lebenshaltungskosten, Arbeitsmarkt, Klima.'
                },
                {
                    title: 'Persönlichen Plan erhalten',
                    desc: 'Rangliste mit monatlichem Fahrplan und Checkliste vor dem Umzug.'
                }
            ]
        },
        features: {
            title: 'Nicht ChatGPT. Ein echtes Relocation-Tool.',
            subtitle: 'Strukturierte Ausgabe. Umsetzbare Schritte. Spezifisch für dein Profil.',
            items: [
                {
                    title: 'Bewertetes Ranking',
                    desc: 'Top 5 Länder bewertet von 0–100 basierend auf deinem Profil. Keine bloße Liste — ein Ranking.'
                },
                {
                    title: 'Visa & Kostendaten',
                    desc: 'Visatyp, Anforderungen, Zeitplan und reale monatliche Kostenbereiche für jedes Ziel.'
                },
                {
                    title: 'Relocation-Fahrplan',
                    desc: 'Monatlicher Aktionsplan für deine spezifische Situation, keine allgemeinen Ratschläge.'
                },
                {
                    title: 'Sicher & privat',
                    desc: 'Deine Daten gehören dir. Verlauf in deinem Konto gespeichert, nichts geteilt.'
                }
            ]
        },
        preview: {
            title: 'Was du bekommst',
            topCountries: 'Top Länder',
            plan: 'Relocation-Plan',
            checklist: 'Checkliste',
            countries: [
                '🇵🇹 Portugal — 94/100',
                '🇦🇪 VAE — 91/100',
                '🇬🇪 Georgien — 87/100'
            ],
            steps: [
                'Monat 1: Dokumente',
                'Monat 2–3: Visum beantragen',
                'Monat 4–6: Übergang'
            ],
            checks: [
                'Apostille Dokumente',
                'Auslandskonto',
                'Steuerberatung'
            ]
        },
        testimonials: {
            title: 'Vertraut von digitalen Nomaden & Expats',
            items: [
                {
                    name: 'Alex M.',
                    role: 'Entwickler → Portugal',
                    quote: 'ReloAI hat mir wochenlange Recherche erspart. Die Visa-Analyse war unbezahlbar — ich wusste nicht, dass das D7 eine Option war.'
                },
                {
                    name: 'Sofia R.',
                    role: 'Designerin → Georgien',
                    quote: 'Ich war zwischen 10 Ländern hin- und hergerissen. ReloAI gab mir ein klares Ranking mit realen Kosten. 3 Monate später war ich in Tiflis.'
                },
                {
                    name: 'James K.',
                    role: 'Finanzmanager → VAE',
                    quote: 'Der Fahrplan war unglaublich spezifisch. Monatliche Schritte, die wirklich zu meiner Situation passten. Sehr empfehlenswert.'
                }
            ]
        },
        pricing: {
            title: 'Einfache Preise',
            subtitle: 'Kostenlos starten. Upgraden wenn du bereit bist.',
            free: {
                name: 'Kostenlos',
                price: '$0',
                period: '',
                desc: '3 Analysen/Monat',
                features: [
                    '3 KI-Analysen/Monat',
                    'Vollständige strukturierte Ausgabe',
                    'Analyseverlauf',
                    'Relocation-Plan + Checkliste'
                ],
                cta: 'Kostenlos starten'
            },
            pro: {
                name: 'Pro',
                price: '$9',
                period: '/Monat',
                desc: 'Unbegrenzte Analysen',
                badge: 'Beliebteste',
                features: [
                    'Unbegrenzte KI-Analysen',
                    'Vollständiger Verlaufszugriff',
                    'Prioritätsverarbeitung',
                    'Jederzeit kündigen'
                ],
                cta: 'Pro werden'
            }
        },
        faq: {
            title: 'Häufig gestellte Fragen',
            items: [
                {
                    q: 'Wie genau ist die KI-Analyse?',
                    a: 'Die KI ist auf aktuellen Visabestimmungen, Lebenshaltungskostenindizes und Expat-Community-Daten trainiert. Ergebnisse sind ein starker Ausgangspunkt — überprüfe Visaanforderungen immer bei offiziellen Quellen.'
                },
                {
                    q: 'Was bedeutet "strukturierte Ausgabe"?',
                    a: 'Statt Textabsätzen erhältst du Karten mit Länderbewertungen, Visadetails, monatlichen Kostenbereichen und Vor-/Nachteilen — alles formatiert und übersichtlich.'
                },
                {
                    q: 'Kann ich mehrere Profile analysieren?',
                    a: 'Ja. Kostenlose Nutzer erhalten 3 Analysen pro Monat. Pro-Nutzer erhalten unbegrenzte. Jede Analyse wird im Verlauf gespeichert.'
                },
                {
                    q: 'Welche Länder sind abgedeckt?',
                    a: 'Alle 195 von der UN anerkannten Länder. Die KI priorisiert die relevantesten für dein Profil.'
                },
                {
                    q: 'Sind meine Daten sicher?',
                    a: 'Profildaten werden zur Verarbeitung an OpenAI gesendet und im Verlauf deines Kontos gespeichert. Wir verkaufen oder teilen deine Daten nicht mit Dritten.'
                }
            ]
        },
        cta: {
            title: 'Bereit, dein Land zu finden?',
            subtitle: 'Tausende von Menschen nutzen ReloAI für klügere Umzugsentscheidungen.',
            button: 'Profil analysieren — kostenlos'
        },
        footer: {
            copy: 'ReloAI — KI Relocation Intelligence',
            tagline: 'Umzugsentscheidungen datengestützt machen.'
        },
        profiles: {
            label: 'Profile werden gerade analysiert',
            items: [
                {
                    profession: 'Software-Entwickler',
                    budget: '$3.000/Mon.',
                    goal: 'Niedrige Steuern, warmes Klima'
                },
                {
                    profession: 'Freelance-Designer',
                    budget: '$2.000/Mon.',
                    goal: 'Gutes Internet, EU-Visum'
                },
                {
                    profession: 'Finanzmanager',
                    budget: '$5.000/Mon.',
                    goal: 'Finanzzentrum, Englisch'
                },
                {
                    profession: 'Lehrer',
                    budget: '$1.500/Mon.',
                    goal: 'Niedrige Kosten, Sicherheit'
                }
            ]
        }
    }
};
}),
"[project]/frontend/src/lib/i18n.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "I18nProvider",
    ()=>I18nProvider,
    "useI18n",
    ()=>useI18n
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$i18n$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/lib/i18n-data.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
const I18nContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
function I18nProvider({ children }) {
    const [locale, setLocaleState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('en');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const stored = localStorage.getItem('relo_lang');
        if (stored && __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$i18n$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["translations"][stored]) setLocaleState(stored);
    }, []);
    const setLocale = (l)=>{
        setLocaleState(l);
        localStorage.setItem('relo_lang', l);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(I18nContext.Provider, {
        value: {
            locale,
            setLocale,
            t: __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$i18n$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["translations"][locale]
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/frontend/src/lib/i18n.tsx",
        lineNumber: 28,
        columnNumber: 5
    }, this);
}
function useI18n() {
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(I18nContext);
    if (!ctx) throw new Error('useI18n must be inside I18nProvider');
    return ctx;
}
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0c6jpbu._.js.map