// Meal Type Labels Mapping
// DB uses numeric keys (0/1/2/3/4/5) for foreign key relationships
// Frontend displays simplified labels: COLAZIONE, PRANZO, CENA, SPUNTINO
export const MEAL_TYPE_LABELS: Record<string, string> = {
    '0': 'COLAZIONE',
    '1': 'PRANZO',
    '2': 'CENA',
    '3': 'SPUNTINO',
    '4': 'SPUNTINO',
    '5': 'SPUNTINO',
};

export function getMealTypeLabel(mealType: string | null | undefined): string {
    if (!mealType) return 'MISTO';
    return MEAL_TYPE_LABELS[mealType] || mealType;
}
