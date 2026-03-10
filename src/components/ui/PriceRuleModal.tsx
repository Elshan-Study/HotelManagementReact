// src/components/ui/PriceRuleModal.tsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { RuleType } from '../../features/priceRule/priceRuleTypes';
import type { PriceRuleResponseDto } from '../../features/priceRule/priceRuleTypes';
import { useCreatePriceRule, useUpdatePriceRule } from '../../features/priceRule/usePriceRule';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../api/errorHandler.ts';

interface Props {
    isOpen: boolean;
    mode: 'create' | 'edit';
    roomTypeId: number;
    initialData?: PriceRuleResponseDto;
    onClose: () => void;
}

interface FormValues {
    name: string;
    ruleType: number;
    startDate: string;
    endDate: string;
    isIncrease: boolean;
    isPercent: boolean;
    value: number;
    isActive: boolean;
    isGlobal: boolean;
}

const RULE_TYPE_OPTIONS = [
    { value: RuleType.SeasonalRange, label: 'Диапазон' },
    { value: RuleType.SpecialDate, label: 'Специальная дата' },
];

const toRuleTypeNumber = (val: unknown): number => {
    if (typeof val === 'number') return val;
    if (val === 'SeasonalRange') return RuleType.SeasonalRange;
    if (val === 'SpecialDate') return RuleType.SpecialDate;
    return Number(val);
};

export default function PriceRuleModal({ isOpen, mode, roomTypeId, initialData, onClose }: Props) {
    const createMutation = useCreatePriceRule();
    const updateMutation = useUpdatePriceRule();

    const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
        defaultValues: {
            name: '',
            ruleType: RuleType.SeasonalRange,
            startDate: '',
            endDate: '',
            isIncrease: true,
            isPercent: false,
            value: 0,
            isActive: true,
            isGlobal: false,
        },
    });

    const ruleType = watch('ruleType');
    const startDate = watch('startDate');
    const isPercent = watch('isPercent');
    const isPercentBool = isPercent === true || (isPercent as unknown) === 'true';
    const today = new Date().toISOString().split('T')[0];
    const isSpecialDate = Number(ruleType) === RuleType.SpecialDate;

    useEffect(() => {
        if (isSpecialDate) {
            setValue('endDate', startDate);
        }
    }, [ruleType, startDate, setValue, isSpecialDate]);

    useEffect(() => {
        if (mode === 'edit' && initialData) {
            reset({
                name: initialData.name,
                ruleType: toRuleTypeNumber(initialData.ruleType),
                startDate: initialData.startDate.split('T')[0],
                endDate: initialData.endDate.split('T')[0],
                isIncrease: initialData.isIncrease,
                isPercent: initialData.isPercent,
                value: initialData.value,
                isActive: initialData.isActive,
                isGlobal: initialData.roomTypeId === null,
            });
        } else if (mode === 'create') {
            reset({
                name: '',
                ruleType: RuleType.SeasonalRange,
                startDate: '',
                endDate: '',
                isIncrease: true,
                isPercent: false,
                value: 0,
                isActive: true,
                isGlobal: false,
            });
        }
    }, [mode, initialData, reset, isOpen]);

    const onSubmit = async (values: FormValues) => {
        try {
            const normalized = {
                ...values,
                ruleType: toRuleTypeNumber(values.ruleType),
                value: Number(values.value),
                isIncrease: values.isIncrease || (values.isIncrease as unknown) === 'true',
                isPercent: values.isPercent || (values.isPercent as unknown) === 'true',
                startDate: new Date(values.startDate + 'T00:00:00Z').toISOString(),
                endDate: new Date((values.endDate || values.startDate) + 'T00:00:00Z').toISOString(),
            };

            if (mode === 'create') {
                await toast.promise(
                    createMutation.mutateAsync({
                        ...normalized,
                        roomTypeId: normalized.isGlobal ? null : roomTypeId,
                    }),
                    {
                        loading: 'Создание правила...',
                        success: 'Правило успешно создано',
                        error: (err) => getErrorMessage(err),
                    }
                );
            } else if (initialData) {
                await toast.promise(
                    updateMutation.mutateAsync({ id: initialData.id, data: normalized }),
                    {
                        loading: 'Сохранение изменений...',
                        success: 'Правило обновлено',
                        error: (err) => getErrorMessage(err),
                    }
                );
            }
            onClose();
        } catch {
            // ошибка уже показана через toast.promise
        }
    };

    if (!isOpen) return null;

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <h2 className="text-lg font-bold mb-4">
                    {mode === 'create' ? 'Создать правило цены' : 'Редактировать правило'}
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    {/* Название */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                        <input
                            {...register('name', { required: 'Обязательное поле', maxLength: 200 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                            placeholder="Например: Летний сезон"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    {/* Тип правила */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Тип правила</label>
                        <select
                            value={watch('ruleType')}
                            onChange={(e) => setValue('ruleType', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                        >
                            {RULE_TYPE_OPTIONS.map(({ value, label }) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Даты */}
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
                            <input
                                type="date"
                                min={today}
                                {...register('startDate', { required: 'Обязательное поле' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                            />
                            {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {isSpecialDate ? 'Дата (авто)' : 'Дата конца'}
                            </label>
                            <input
                                type="date"
                                min={today}
                                {...register('endDate', {
                                    required: !isSpecialDate ? 'Обязательное поле' : false,
                                })}
                                disabled={isSpecialDate}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 disabled:bg-gray-100 disabled:text-gray-400"
                            />
                            {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>}
                        </div>
                    </div>

                    {/* Надбавка / скидка */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Тип изменения</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={watch('isIncrease') === true || (watch('isIncrease') as unknown) === 'true'}
                                    onChange={() => setValue('isIncrease', true)}
                                />
                                <span className="text-sm text-green-600 font-medium">Надбавка</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={watch('isIncrease') === false || (watch('isIncrease') as unknown) === 'false'}
                                    onChange={() => setValue('isIncrease', false)}
                                />
                                <span className="text-sm text-red-500 font-medium">Скидка</span>
                            </label>
                        </div>
                    </div>

                    {/* Значение + % или абсолютное */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Значение</label>
                        <div className="flex gap-3 items-start">
                            <div className="flex-1">
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max={isPercentBool ? 100 : undefined}
                                    {...register('value', {
                                        required: 'Обязательное поле',
                                        min: { value: 0.01, message: 'Должно быть больше 0' },
                                        max: isPercentBool
                                            ? { value: 100, message: 'Максимум 100%' }
                                            : undefined,
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                                />
                                {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value.message}</p>}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <label className="flex items-center gap-1 cursor-pointer text-sm">
                                    <input
                                        type="radio"
                                        checked={watch('isPercent') === false || (watch('isPercent') as unknown) === 'false'}
                                        onChange={() => setValue('isPercent', false)}
                                    />
                                    <span>₼</span>
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer text-sm">
                                    <input
                                        type="radio"
                                        checked={watch('isPercent') === true || (watch('isPercent') as unknown) === 'true'}
                                        onChange={() => setValue('isPercent', true)}
                                    />
                                    <span>%</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Глобальное правило — только при создании */}
                    {mode === 'create' && (
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={watch('isGlobal') === true}
                                onChange={(e) => setValue('isGlobal', e.target.checked)}
                                className="w-4 h-4 accent-orange-500"
                            />
                            <span className="text-sm text-gray-700">
                                Глобальное правило
                                <span className="text-gray-400 text-xs ml-1">(для всех типов комнат)</span>
                            </span>
                        </label>
                    )}

                    {/* isActive только при редактировании */}
                    {mode === 'edit' && (
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={watch('isActive') === true}
                                onChange={(e) => setValue('isActive', e.target.checked)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm text-gray-700">Активно</span>
                        </label>
                    )}

                    {/* Кнопки */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                            {isPending ? 'Сохранение...' : 'Сохранить'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}