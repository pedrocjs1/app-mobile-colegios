// C:\Users\Pedro\.gemini\antigravity\scratch\edu-app\constants\theme.ts

export interface AppTheme {
    primary: string;
    secondary: string;
    logo: string; // URL or local require
    name: string;
}

export const SCHOOL_THEMES: Record<string, AppTheme> = {
    default: {
        primary: '#007AFF', // Standard iOS Blue
        secondary: '#5856D6', // Indigo
        logo: 'https://via.placeholder.com/150',
        name: 'Standard Edu',
    },
    school_A: {
        primary: '#FF2D55', // Red/Pink
        secondary: '#FF3B30',
        logo: 'https://via.placeholder.com/150/FF2D55/FFFFFF?text=School+A',
        name: 'Academy Alpha',
    },
    school_B: {
        primary: '#34C759', // Green
        secondary: '#30B0C7',
        logo: 'https://via.placeholder.com/150/34C759/FFFFFF?text=School+B',
        name: 'Greenwood High',
    },
    school_C: {
        primary: '#FF9500', // Orange
        secondary: '#FFCC00',
        logo: 'https://via.placeholder.com/150/FF9500/FFFFFF?text=School+C',
        name: 'Sunrise College',
    }
};
