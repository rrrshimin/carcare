export type AppState = {
  deviceId: string | null;
  onboardingCompleted: boolean;
};

let state: AppState = {
  deviceId: null,
  onboardingCompleted: false,
};

export function getAppState(): Readonly<AppState> {
  return state;
}

export function setAppState(patch: Partial<AppState>): void {
  state = { ...state, ...patch };
}
