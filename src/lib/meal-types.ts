// Meal Type Labels Mapping
// DB uses numeric keys (0/1/2/3) stored as TINYINT
// Frontend displays simplified labels: COLAZIONE, PRANZO, CENA, SPUNTINO
export const MEAL_TYPE_LABELS: Record<number, string> = {
    0: 'COLAZIONE',
    1: 'PRANZO',
    2: 'CENA',
    3: 'SPUNTINO',
};

export function getMealTypeLabel(mealType: number | string | null | undefined): string {
    if (mealType === null || mealType === undefined) return 'MISTO';
    const numType = typeof mealType === 'string' ? parseInt(mealType) : mealType;
    return MEAL_TYPE_LABELS[numType] || 'MISTO';
}
