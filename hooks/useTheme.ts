// C:\Users\Pedro\.gemini\antigravity\scratch\edu-app\hooks\useTheme.ts
import { useAuthStore } from '../store/useAuthStore';
import { SCHOOL_THEMES, AppTheme } from '../constants/theme';

export function useTheme(): AppTheme {
    const user = useAuthStore((state) => state.user);

    if (!user || !user.school_id) {
        return SCHOOL_THEMES['default'];
    }

    const theme = SCHOOL_THEMES[user.school_id];
    return theme || SCHOOL_THEMES['default'];
}
