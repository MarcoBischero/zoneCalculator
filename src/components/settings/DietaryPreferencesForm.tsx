'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const DIETARY_OPTIONS = [
    'Vegetarian', 'Vegan', 'Pescatarian', 'Low-Carb', 'Keto', 'Paleo', 'Mediterranean'
];

const ALLERGY_OPTIONS = [
    'Nuts', 'Peanuts', 'Dairy', 'Eggs', 'Soy', 'Shellfish', 'Fish', 'Gluten', 'Wheat'
];

const INTOLERANCE_OPTIONS = [
    'Lactose', 'Gluten', 'Fructose', 'Histamine'
];

export function DietaryPreferencesForm() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
    const [allergies, setAllergies] = useState<string[]>([]);
    const [intolerances, setIntolerances] = useState<string[]>([]);

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            const response = await fetch('/api/user/preferences');
            if (response.ok) {
                const prefs = await response.json();
                setDietaryPreferences(prefs.dietaryPreferences || []);
                setAllergies(prefs.allergies || []);
                setIntolerances(prefs.intolerances || []);
            }
        } catch (error) {
            console.error('Error fetching preferences:', error);
        } finally {
            setLoading(false);
        }
    };

    const savePreferences = async () => {
        setSaving(true);
        try {
            const response = await fetch('/api/user/preferences', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dietaryPreferences,
                    allergies,
                    intolerances,
                    favoriteFoods: [],
                    dislikedFoods: [],
                    enableProactiveTips: true,
                    enableEducationalMode: true
                })
            });

            if (response.ok) {
                alert('Preferences saved!');
            }
        } catch (error) {
            console.error('Error saving preferences:', error);
            alert('Failed to save preferences');
        } finally {
            setSaving(false);
        }
    };

    const toggleOption = (value: string, current: string[], setter: (val: string[]) => void) => {
        if (current.includes(value)) {
            setter(current.filter(v => v !== value));
        } else {
            setter([...current, value]);
        }
    };

    if (loading) {
        return <div className="text-muted-foreground">Loading...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>🥗 Dietary Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Label className="mb-2 block">Diet Types</Label>
                    <div className="flex flex-wrap gap-2">
                        {DIETARY_OPTIONS.map(option => (
                            <Button
                                key={option}
                                size="sm"
                                variant={dietaryPreferences.includes(option) ? 'default' : 'outline'}
                                onClick={() => toggleOption(option, dietaryPreferences, setDietaryPreferences)}
                            >
                                {option}
                            </Button>
                        ))}
                    </div>
                </div>

                <div>
                    <Label className="mb-2 block text-red-600 dark:text-red-400">⚠️ Allergies (Critical)</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                        ZoneMentor will NEVER suggest foods with these allergens
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {ALLERGY_OPTIONS.map(option => (
                            <Button
                                key={option}
                                size="sm"
                                variant={allergies.includes(option) ? 'destructive' : 'outline'}
                                onClick={() => toggleOption(option, allergies, setAllergies)}
                            >
                                {option}
                            </Button>
                        ))}
                    </div>
                </div>

                <div>
                    <Label className="mb-2 block">Intolerances</Label>
                    <div className="flex flex-wrap gap-2">
                        {INTOLERANCE_OPTIONS.map(option => (
                            <Button
                                key={option}
                                size="sm"
                                variant={intolerances.includes(option) ? 'default' : 'outline'}
                                onClick={() => toggleOption(option, intolerances, setIntolerances)}
                            >
                                {option}
                            </Button>
                        ))}
                    </div>
                </div>

                <Button
                    className="w-full"
                    onClick={savePreferences}
                    disabled={saving}
                >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Preferences'}
                </Button>
            </CardContent>
        </Card>
    );
}
