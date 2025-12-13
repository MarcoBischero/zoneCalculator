// Meal Type Labels Mapping
export const MEAL_TYPE_LABELS: Record<string, string> = {
    '0': 'COLAZIONE',
    '1': 'PRANZO',
    '2': 'CENA',
    '3': 'SPUNTINO 1',
    '4': 'SPUNTINO 2',
    '5': 'SPUNTINO 3',
};

export function getMealTypeLabel(mealType: string | null | undefined): string {
    if (!mealType) return 'MISTO';
    return MEAL_TYPE_LABELS[mealType] || mealType;
}
