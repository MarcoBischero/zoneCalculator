'use client';

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const GOAL_TYPES = [
    { value: 'WEIGHT_LOSS', label: '🎯 Weight Loss' },
    { value: 'WEIGHT_GAIN', label: '💪 Weight Gain' },
    { value: 'MAINTENANCE', label: '⚖️ Maintenance' },
    { value: 'MUSCLE_BUILDING', label: '🏋️ Muscle Building' },
    { value: 'PERFORMANCE', label: '⚡ Performance' },
    { value: 'GENERAL_HEALTH', label: '❤️ General Health' }
];

interface Goal {
    id?: number;
    goalType: string;
    targetWeight?: number;
    targetDate?: string;
    notes?: string;
    isActive: boolean;
}

export function CoachSettingsGoalsForm() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Coach Settings
    const [enableProactiveTips, setEnableProactiveTips] = useState(true);
    const [enableEducationalMode, setEnableEducationalMode] = useState(true);

    // Goals State
    const [goals, setGoals] = useState<Goal[]>([]);
    const [newGoal, setNewGoal] = useState<Goal>({
        goalType: 'WEIGHT_LOSS',
        isActive: true
    });
    const [showNewGoalForm, setShowNewGoalForm] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [prefsResponse, goalsResponse] = await Promise.all([
                fetch('/api/user/preferences'),
                fetch('/api/user/goals')
            ]);

            if (prefsResponse.ok) {
                const prefs = await prefsResponse.json();
                setEnableProactiveTips(prefs.enableProactiveTips ?? true);
                setEnableEducationalMode(prefs.enableEducationalMode ?? true);
            }

            if (goalsResponse.ok) {
                const goalsData = await goalsResponse.json();
                setGoals(goalsData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveCoachSettings = async () => {
        setSaving(true);
        try {
            // We need to preserve existing preferences, so fetch first
            const prefsResponse = await fetch('/api/user/preferences');
            const currentPrefs = prefsResponse.ok ? await prefsResponse.json() : {};

            const response = await fetch('/api/user/preferences', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...currentPrefs,
                    enableProactiveTips,
                    enableEducationalMode
                })
            });

            if (response.ok) {
                alert('Coach settings saved!');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const createGoal = async () => {
        try {
            const response = await fetch('/api/user/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newGoal)
            });

            if (response.ok) {
                const goal = await response.json();
                setGoals([...goals, goal]);
                setNewGoal({ goalType: 'WEIGHT_LOSS', isActive: true });
                setShowNewGoalForm(false);
            }
        } catch (error) {
            console.error('Error creating goal:', error);
        }
    };

    const deleteGoal = async (id: number) => {
        try {
            const response = await fetch(`/api/user/goals?id=${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setGoals(goals.filter(g => g.id !== id));
            }
        } catch (error) {
            console.error('Error deleting goal:', error);
        }
    };

    if (loading) {
        return <div className="text-muted-foreground">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Coach Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>🤖 Coach Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={enableProactiveTips}
                            onChange={(e) => setEnableProactiveTips(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <span className="text-sm">Enable Proactive Tips (daily suggestions)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={enableEducationalMode}
                            onChange={(e) => setEnableEducationalMode(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <span className="text-sm">Educational Mode (explains "why" behind advice)</span>
                    </label>

                    <Button
                        className="w-full"
                        onClick={saveCoachSettings}
                        disabled={saving}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Coach Settings'}
                    </Button>
                </CardContent>
            </Card>

            {/* Goals */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Nutrition Goals
                    </CardTitle>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowNewGoalForm(!showNewGoalForm)}
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Goal
                    </Button>
                </CardHeader>
                <CardContent>
                    {/* New Goal Form */}
                    {showNewGoalForm && (
                        <div className="mb-4 p-4 border rounded-lg bg-muted/50 space-y-3">
                            <div>
                                <Label>Goal Type</Label>
                                <select
                                    className="w-full mt-1 p-2 border rounded bg-background"
                                    value={newGoal.goalType}
                                    onChange={(e) => setNewGoal({ ...newGoal, goalType: e.target.value })}
                                >
                                    {GOAL_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Target Weight (kg)</Label>
                                    <Input
                                        type="number"
                                        placeholder="e.g., 70"
                                        value={newGoal.targetWeight || ''}
                                        onChange={(e) => setNewGoal({ ...newGoal, targetWeight: parseInt(e.target.value) || undefined })}
                                    />
                                </div>
                                <div>
                                    <Label>Target Date</Label>
                                    <Input
                                        type="date"
                                        value={newGoal.targetDate || ''}
                                        onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Notes</Label>
                                <Textarea
                                    placeholder="e.g., Beach season prep..."
                                    value={newGoal.notes || ''}
                                    onChange={(e) => setNewGoal({ ...newGoal, notes: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button size="sm" onClick={createGoal}>Create Goal</Button>
                                <Button size="sm" variant="ghost" onClick={() => setShowNewGoalForm(false)}>Cancel</Button>
                            </div>
                        </div>
                    )}

                    {/* Existing Goals */}
                    <div className="space-y-2">
                        {goals.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No goals set yet.</p>
                        ) : (
                            goals.map(goal => (
                                <div key={goal.id} className="flex items-start justify-between p-3 border rounded-lg">
                                    <div className="flex-1">
                                        <div className="font-medium">
                                            {GOAL_TYPES.find(t => t.value === goal.goalType)?.label || goal.goalType}
                                        </div>
                                        {goal.targetWeight && (
                                            <div className="text-sm text-muted-foreground">
                                                Target: {goal.targetWeight}kg
                                                {goal.targetDate && ` by ${new Date(goal.targetDate).toLocaleDateString()}`}
                                            </div>
                                        )}
                                        {goal.notes && (
                                            <div className="text-sm text-muted-foreground mt-1">{goal.notes}</div>
                                        )}
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => goal.id && deleteGoal(goal.id)}
                                    >
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
