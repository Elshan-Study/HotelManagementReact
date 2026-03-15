// src/pages/admin/PriceCalendar.tsx
import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../api/errorHandler';
import { useRoomTypes } from '../../features/roomType/useRoomTypes.ts';
import {
    usePriceRulesForPeriod,
    useAllPriceRules,
    useDeletePriceRule } from '../../features/priceRule/usePriceRule';
import PriceRuleModal from '../../components/ui/PriceRuleModal';
import type { PriceRuleResponseDto } from '../../features/priceRule/priceRuleTypes';
import { RuleType } from '../../features/priceRule/priceRuleTypes';

const RULE_TYPE_LABELS: Record<string | number, string> = {
    [RuleType.SeasonalRange]: 'Диапазон',
    [RuleType.SpecialDate]: 'Специальная дата',
    'SeasonalRange': 'Диапазон',
    'SpecialDate': 'Специальная дата',
};

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const RULE_COLORS = [
    'bg-blue-200 text-blue-800',
    'bg-green-200 text-green-800',
    'bg-purple-200 text-purple-800',
    'bg-yellow-200 text-yellow-800',
    'bg-pink-200 text-pink-800',
    'bg-orange-200 text-orange-800',
    'bg-teal-200 text-teal-800',
    'bg-red-200 text-red-800',
    'bg-indigo-200 text-indigo-800',
    'bg-cyan-200 text-cyan-800',
    'bg-lime-200 text-lime-800',
    'bg-rose-200 text-rose-800',
];

const MONTH_NAMES = ['Январь','Февраль','Март','Апрель','Май','Июнь',
    'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

const PriceCalendar = () => {
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<number>(0);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showInactive, setShowInactive] = useState(false);
    const [roomTypeSearch, setRoomTypeSearch] = useState('');
    const [allRulesOpen, setAllRulesOpen] = useState(false);
    const [allRulesSearch, setAllRulesSearch] = useState('');
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        mode: 'create' | 'edit';
        data?: PriceRuleResponseDto;
    }>({ isOpen: false, mode: 'create' });

    const { data: roomTypesData } = useRoomTypes({ page: 1, pageSize: 100 });
    const roomTypes = roomTypesData?.items ?? [];
    const [roomTypeDropdownOpen, setRoomTypeDropdownOpen] = useState(false);

    // Сортировка в Все правила
    const [sortBy, setSortBy] = useState<string>('startDate:asc');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Фильтрация типов комнат по поиску
    const filteredRoomTypes = roomTypes.filter(rt =>
        rt.name.toLowerCase().includes(roomTypeSearch.toLowerCase())
    );

    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);

    // Активные правила для календарной сетки
    const { data: rulesData } = usePriceRulesForPeriod({
        roomTypeId: selectedRoomTypeId,
        from: monthStart.toISOString(),
        to: monthEnd.toISOString(),
        page: 1,
        pageSize: 50,
    });

    // Все правила для панели "все правила"
    const { data: allRulesData } = useAllPriceRules(
        selectedRoomTypeId > 0 ? selectedRoomTypeId : null,
        1,
        200,
        sortBy  // передаём сортировку
    );
    const allRules = useMemo(() => allRulesData?.items ?? [], [allRulesData?.items]);

    const activeRules = rulesData?.items ?? [];

    // Фильтрация по диапазону дат и поиску

    // Есть ли пересечение с выбранным диапазоном
    const hasDateIntersection = (rule: PriceRuleResponseDto): boolean => {
        if (!dateFrom && !dateTo) return false;
        const from = dateFrom ? new Date(dateFrom) : null;
        const to = dateTo ? new Date(dateTo) : null;
        const ruleStart = new Date(rule.startDate);
        const ruleEnd = new Date(rule.endDate);
        if (from && to) return ruleStart <= to && ruleEnd >= from;
        if (from) return ruleEnd >= from;
        if (to) return ruleStart <= to;
        return false;
    };

    // Правила для отображения в календаре (активные + опционально неактивные)
    const calendarRules = showInactive
        ? allRules.filter(r => {
            const start = new Date(r.startDate);
            const end = new Date(r.endDate);
            return start <= monthEnd && end >= monthStart;
        })
        : activeRules;

    const deleteMutation = useDeletePriceRule();

    // Цвета назначаем по allRules чтобы цвет не менялся при переключении showInactive
    const ruleColorMap = useMemo(() => {
        const map: Record<number, string> = {};
        allRules.forEach((rule, i) => {
            map[rule.id] = RULE_COLORS[i % RULE_COLORS.length];
        });
        return map;
    }, [allRules]);

    const getRulesForDate = (date: Date): PriceRuleResponseDto[] => {
        return calendarRules.filter(rule => {
            const start = new Date(rule.startDate);
            const end = new Date(rule.endDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            return date >= start && date <= end;
        });
    };

    const calendarDays = useMemo(() => {
        const days: (Date | null)[] = [];
        const firstDay = new Date(currentYear, currentMonth, 1);
        let startDow = firstDay.getDay() - 1;
        if (startDow < 0) startDow = 6;
        for (let i = 0; i < startDow; i++) days.push(null);
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            days.push(new Date(currentYear, currentMonth, d));
        }
        return days;
    }, [currentYear, currentMonth]);

    const prevMonth = () => {
        setSelectedDate(null);
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
        else setCurrentMonth(m => m - 1);
    };

    const nextMonth = () => {
        setSelectedDate(null);
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
        else setCurrentMonth(m => m + 1);
    };

    const isToday = (date: Date) =>
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

    const isSelected = (date: Date) =>
        selectedDate?.toDateString() === date.toDateString();

    const handleDelete = async (id: number) => {
        if (!window.confirm('Удалить правило?')) return;
        await toast.promise(
            deleteMutation.mutateAsync(id),
            {
                loading: 'Удаление...',
                success: 'Правило удалено',
                error: (err) => getErrorMessage(err),
            }
        );
    };

    const handleDayClick = (date: Date) => {
        setAllRulesOpen(false);
        if (selectedDate?.toDateString() === date.toDateString()) {
            setSelectedDate(null);
        } else {
            setSelectedDate(date);
        }
    };

    const handleSort = (col: string) => {
        setSortBy(prev => {
            const [prevCol, prevDir] = prev.split(':');
            if (prevCol === col) return `${col}:${prevDir === 'asc' ? 'desc' : 'asc'}`;
            return `${col}:asc`;
        });
    };

    const SortIcon = ({ col }: { col: string }) => {
        const [prevCol, prevDir] = sortBy.split(':');
        if (prevCol !== col) return <span className="text-gray-300 ml-1">↕</span>;
        return <span className="text-orange-500 ml-1">{prevDir === 'asc' ? '↑' : '↓'}</span>;
    };

    // Панель всех правил с поиском
    const filteredAllRules = useMemo(() => {
        let result = allRules.filter(r =>
            r.name.toLowerCase().includes(allRulesSearch.toLowerCase())
        );
        if (dateFrom) {
            const from = new Date(dateFrom);
            result = result.filter(r => new Date(r.endDate) >= from);
        }
        if (dateTo) {
            const to = new Date(dateTo);
            result = result.filter(r => new Date(r.startDate) <= to);
        }
        return result;
    }, [allRules, allRulesSearch, dateFrom, dateTo]);

    // Правила для боковой панели
    const sidebarRules = selectedDate ? getRulesForDate(selectedDate) : calendarRules;
    const sidebarTitle = selectedDate
        ? selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
        : 'Правила в этом месяце';

    const selectedRoomTypeName = roomTypes.find(rt => rt.id === selectedRoomTypeId)?.name ?? '';

    return (
        <div className="h-full p-6 flex flex-col gap-4">
            {/* Шапка */}
            <div className="flex items-center justify-between shrink-0">
                <h1 className="text-2xl font-bold text-stone-800">Ценовой календарь</h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { setAllRulesOpen(v => !v); setSelectedDate(null); }}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 ${
                            allRulesOpen
                                ? 'bg-stone-800 text-white border-stone-800'
                                : 'bg-white text-stone-700 border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        Все правила
                    </button>
                    <button
                        onClick={() => setModalState({ isOpen: true, mode: 'create' })}
                        disabled={!selectedRoomTypeId}
                        className="btn px-4 py-2 bg-orange-500 text-white rounded-lg flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Добавить правило
                    </button>
                </div>
            </div>

            {/* Выбор типа комнаты + showInactive */}
            <div className="flex items-center gap-4 shrink-0">
                <div className="relative w-72">
                    <input
                        type="text"
                        placeholder={selectedRoomTypeId > 0 ? selectedRoomTypeName : '— Выберите тип комнаты —'}
                        value={roomTypeSearch}
                        onChange={(e) => { setRoomTypeSearch(e.target.value); setRoomTypeDropdownOpen(true); }}
                        onFocus={() => { setRoomTypeDropdownOpen(true); }}
                        onBlur={() => setTimeout(() => setRoomTypeDropdownOpen(false), 150)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
                    />
                    {selectedRoomTypeId > 0 && (
                        <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => { setSelectedRoomTypeId(0); setRoomTypeSearch(''); setSelectedDate(null); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            ✕
                        </button>
                    )}

                    {roomTypeDropdownOpen && (
                        <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                            {filteredRoomTypes.length === 0 && (
                                <div className="px-4 py-2 text-sm text-gray-400">Ничего не найдено</div>
                            )}
                            {filteredRoomTypes.map(rt => (
                                <button
                                    key={rt.id}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => {
                                        setSelectedRoomTypeId(rt.id);
                                        setRoomTypeSearch('');
                                        setSelectedDate(null);
                                        setRoomTypeDropdownOpen(false);
                                    }}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${selectedRoomTypeId === rt.id ? 'bg-orange-50 text-orange-600 font-medium' : ''}`}
                                >
                                    {rt.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {selectedRoomTypeId > 0 && (
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={showInactive}
                            onChange={(e) => setShowInactive(e.target.checked)}
                            className="w-4 h-4 accent-orange-500"
                        />
                        <span className="text-sm text-gray-600">Показать неактивные</span>
                    </label>
                )}
            </div>

            {allRulesOpen ? (
                // панель всех правил
                <div className="flex-1 flex flex-col overflow-hidden gap-3">
                    {/* Фильтры */}
                    <div className="flex items-center gap-3 shrink-0 flex-wrap">
                        <input
                            type="text"
                            placeholder="Поиск по названию..."
                            value={allRulesSearch}
                            onChange={(e) => setAllRulesSearch(e.target.value)}
                            className="w-56 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
                        />
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Период:</span>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
                            />
                            <span className="text-gray-400">—</span>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
                            />
                            {(dateFrom || dateTo) && (
                                <button
                                    onClick={() => { setDateFrom(''); setDateTo(''); }}
                                    className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
                                >
                                    ✕ Сбросить
                                </button>
                            )}
                        </div>
                        <span className="text-xs text-gray-400 ml-auto">{filteredAllRules.length} правил</span>
                    </div>

                    {/* Таблица */}
                    <div className="flex-1 overflow-y-auto border border-gray-200 rounded-xl">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-white border-b border-gray-200 z-10">
                            <tr className="text-left">
                                <th className="px-4 py-3 font-medium text-gray-500 cursor-pointer hover:text-gray-700 select-none" onClick={() => handleSort('name')}>
                                    Название<SortIcon col="name" />
                                </th>
                                <th className="px-4 py-3 font-medium text-gray-500">Тип комнаты</th>
                                <th className="px-4 py-3 font-medium text-gray-500 cursor-pointer hover:text-gray-700 select-none" onClick={() => handleSort('startDate')}>
                                    Начало<SortIcon col="startDate" />
                                </th>
                                <th className="px-4 py-3 font-medium text-gray-500 cursor-pointer hover:text-gray-700 select-none" onClick={() => handleSort('endDate')}>
                                    Конец<SortIcon col="endDate" />
                                </th>
                                <th className="px-4 py-3 font-medium text-gray-500 cursor-pointer hover:text-gray-700 select-none" onClick={() => handleSort('value')}>
                                    Значение<SortIcon col="value" />
                                </th>
                                <th className="px-4 py-3 font-medium text-gray-500 cursor-pointer hover:text-gray-700 select-none" onClick={() => handleSort('isActive')}>
                                    Статус<SortIcon col="isActive" />
                                </th>
                                <th className="px-4 py-3"></th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredAllRules.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">Нет правил</td>
                                </tr>
                            )}
                            {filteredAllRules.map(rule => {
                                const intersects = hasDateIntersection(rule);
                                return (
                                    <tr
                                        key={rule.id}
                                        className={`border-b border-gray-100 transition-colors ${
                                            intersects ? 'bg-orange-50' : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <td className="px-4 py-2.5 font-medium text-stone-800">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2.5 h-2.5 rounded-sm shrink-0 ${ruleColorMap[rule.id]?.split(' ')[0]}`} />
                                                {rule.name}
                                                {intersects && (
                                                    <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded-full">
                                                пересекается
                                            </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 text-gray-500">
                                            {rule.roomTypeId === null
                                                ? <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-600">Глобальное</span>
                                                : (roomTypes.find(rt => rt.id === rule.roomTypeId)?.name ?? '—')
                                            }
                                        </td>
                                        <td className="px-4 py-2.5 text-gray-500">
                                            {new Date(rule.startDate).toLocaleDateString('ru-RU')}
                                        </td>
                                        <td className="px-4 py-2.5 text-gray-500">
                                            {new Date(rule.endDate).toLocaleDateString('ru-RU')}
                                        </td>
                                        <td className="px-4 py-2.5">
                                    <span className={`font-semibold ${rule.isIncrease ? 'text-green-600' : 'text-red-500'}`}>
                                        {rule.isIncrease ? '+' : '-'}{rule.value}{rule.isPercent ? '%' : ' ₼'}
                                    </span>
                                        </td>
                                        <td className="px-4 py-2.5">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${rule.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {rule.isActive ? 'Активно' : 'Неактивно'}
                                    </span>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex gap-1 justify-end">
                                                <button
                                                    onClick={() => { setModalState({ isOpen: true, mode: 'edit', data: rule }); setAllRulesOpen(false); }}
                                                    className="p-1.5 hover:bg-blue-100 rounded transition-colors"
                                                >
                                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(rule.id)}
                                                    className="p-1.5 hover:bg-red-100 rounded transition-colors"
                                                >
                                                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : !selectedRoomTypeId ? (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                    Выберите тип комнаты чтобы увидеть календарь
                </div>
            ) : (
                <div className="flex-1 flex gap-4 overflow-hidden">
                    {/* Календарь */}
                    <div className="flex-1 flex flex-col overflow-hidden border border-gray-200 rounded-xl">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
                            <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <span className="font-semibold text-stone-800">
                                {MONTH_NAMES[currentMonth]} {currentYear}
                            </span>
                            <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-7 border-b border-gray-200 shrink-0">
                            {WEEKDAYS.map((d, i) => (
                                <div key={d} className={`text-center text-xs font-semibold text-gray-500 py-2 ${i < 6 ? 'border-r border-gray-200' : ''}`}>
                                    {d}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 flex-1 overflow-hidden">
                            {calendarDays.map((date, i) => {
                                if (!date) {
                                    const col = i % 7;
                                    return <div key={`empty-${i}`} className={`bg-gray-50 ${col < 6 ? 'border-r border-gray-200' : ''} border-b border-gray-200`} />;
                                }
                                const dayRules = getRulesForDate(date);
                                const col = i % 7;
                                const selected = isSelected(date);
                                const todayCell = isToday(date);

                                return (
                                    <div
                                        key={date.toISOString()}
                                        onClick={() => handleDayClick(date)}
                                        className={`
                                            flex flex-col overflow-hidden cursor-pointer transition-colors
                                            border-b border-gray-200
                                            ${col < 6 ? 'border-r border-gray-200' : ''}
                                            ${selected ? 'bg-orange-50' : todayCell ? 'bg-amber-50' : 'hover:bg-gray-50'}
                                        `}
                                    >
                                        <div className="flex items-center justify-between px-1.5 pt-1">
                                            <span className={`text-xs font-semibold ${selected ? 'text-orange-600' : todayCell ? 'text-orange-500' : 'text-gray-700'}`}>
                                                {date.getDate()}
                                            </span>
                                            {dayRules.length > 2 && (
                                                <span className="text-xs text-gray-400">+{dayRules.length - 2}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-0.5 px-1 pb-1 overflow-hidden">
                                            {dayRules.slice(0, 2).map(rule => (
                                                <div
                                                    key={rule.id}
                                                    className={`text-xs px-1 rounded truncate ${ruleColorMap[rule.id]} ${!rule.isActive ? 'opacity-40' : ''}`}
                                                    title={`${rule.name}: ${rule.isIncrease ? '+' : '-'}${rule.value}${rule.isPercent ? '%' : '₼'}${!rule.isActive ? ' (неактивно)' : ''}`}
                                                >
                                                    {rule.isIncrease ? '+' : '-'}{rule.value}{rule.isPercent ? '%' : '₼'}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Панель справа */}
                    <div className="w-64 shrink-0 flex flex-col gap-2 overflow-y-auto">
                        <div className="flex items-center justify-between shrink-0">
                            <h3 className="font-semibold text-stone-700 text-sm">{sidebarTitle}</h3>
                            {selectedDate && (
                                <button onClick={() => setSelectedDate(null)} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                                    ✕ Сбросить
                                </button>
                            )}
                        </div>

                        {sidebarRules.length === 0 && (
                            <p className="text-gray-400 text-sm">
                                {selectedDate ? 'Нет правил на эту дату' : 'Нет правил в этом месяце'}
                            </p>
                        )}

                        {sidebarRules.map(rule => (
                            <div key={rule.id} className={`border rounded-lg p-3 text-sm transition-opacity ${rule.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-sm shrink-0 ${ruleColorMap[rule.id]?.split(' ')[0]}`} />
                                        <span className="font-medium text-stone-800 leading-tight">{rule.name}</span>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        <button onClick={() => setModalState({ isOpen: true, mode: 'edit', data: rule })} className="p-1 hover:bg-blue-100 rounded transition-colors">
                                            <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button onClick={() => handleDelete(rule.id)} className="p-1 hover:bg-red-100 rounded transition-colors">
                                            <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="text-gray-500 text-xs">{RULE_TYPE_LABELS[rule.ruleType] ?? 'Неизвестно'}</div>
                                <div className="text-gray-500 text-xs">
                                    {new Date(rule.startDate).toLocaleDateString('ru-RU')}
                                    {rule.startDate !== rule.endDate && ` — ${new Date(rule.endDate).toLocaleDateString('ru-RU')}`}
                                </div>
                                <div className={`font-semibold text-xs mt-1 ${rule.isIncrease ? 'text-green-600' : 'text-red-500'}`}>
                                    {rule.isIncrease ? '+' : '-'}{rule.value}{rule.isPercent ? '%' : ' ₼'}
                                </div>
                                <span className={`inline-block mt-1 px-1.5 py-0.5 rounded-full text-xs ${rule.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                    {rule.isActive ? 'Активно' : 'Неактивно'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <PriceRuleModal
                key={modalState.data?.id ?? 'create'}
                isOpen={modalState.isOpen}
                mode={modalState.mode}
                roomTypeId={selectedRoomTypeId}
                initialData={modalState.data}
                onClose={() => setModalState({ isOpen: false, mode: 'create' })}
            />
        </div>
    );
};

export default PriceCalendar;