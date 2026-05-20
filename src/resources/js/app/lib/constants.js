export const API_BASE = import.meta.env.BASE_URL + 'api';

export const CHART_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b'];

export const SERIES_LABELS = {
    'inverted-pendulum': ['t', 'x (pos)', 'ẋ (vel)', 'θ (angle)', 'θ̇ (ang. vel)'],
    'ball-beam':         ['t', 'r (pos)', 'ṙ (vel)', 'α (angle)', 'α̇ (ang. vel)'],
};

export const STORAGE_KEYS = {
    apiKey:  'cas_api_key',
    session: 'cas_session',
};
