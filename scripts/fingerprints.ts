export class Fingerprints {
  private static readonly SESSION_ID_KEY = 'session_id';
  private static readonly USER_ID_KEY = 'user_id';
  private static readonly FINGERPRINTS_KEY = 'fingerprints';

  /**
   * Save session ID to local storage
   */
  saveSessionId(sessionId: string): void {
    localStorage.setItem(Fingerprints.SESSION_ID_KEY, sessionId);
  }

  /**
   * Retrieve session ID from local storage
   */
  getSessionId(): string | null {
    return localStorage.getItem(Fingerprints.SESSION_ID_KEY);
  }

  /**
   * Save user ID to local storage
   */
  saveUserId(userId: string): void {
    localStorage.setItem(Fingerprints.USER_ID_KEY, userId);
  }

  /**
   * Retrieve user ID from local storage
   */
  getUserId(): string | null {
    return localStorage.getItem(Fingerprints.USER_ID_KEY);
  }

  /**
   * Save fingerprints to local storage
   */
  saveFingerprints(fingerprints: string): void {
    localStorage.setItem(Fingerprints.FINGERPRINTS_KEY, fingerprints);
  }

  /**
   * Retrieve fingerprints from local storage
   */
  getFingerprints(): string {
    // Create fingerprints if not already created
    if (!localStorage.getItem(Fingerprints.FINGERPRINTS_KEY)) {
      const fingerprints = extractMachineFingerprints()
      this.saveFingerprints(fingerprints)
    }
    return localStorage.getItem(Fingerprints.FINGERPRINTS_KEY) || ""
  }

  /**
   * Clear all stored data
   */
  clear(): void {
    localStorage.removeItem(Fingerprints.SESSION_ID_KEY);
    localStorage.removeItem(Fingerprints.USER_ID_KEY);
    localStorage.removeItem(Fingerprints.FINGERPRINTS_KEY);
  }

  clearSessionId(): void {
    localStorage.removeItem(Fingerprints.SESSION_ID_KEY);
  }

  clearUserId(): void {
    localStorage.removeItem(Fingerprints.USER_ID_KEY);
  }

  clearFingerprints(): void {
    localStorage.removeItem(Fingerprints.FINGERPRINTS_KEY);
  }
}

/**
 * Extract machine fingerprints to identify the current machine
 * Returns a comma-separated string of fingerprint values
 */
export function extractMachineFingerprints(): string {
  const fingerprints: string[] = [];

  // Screen resolution
  if (typeof screen !== 'undefined') {
    fingerprints.push(`screen:${screen.width}x${screen.height}`);
  }

  // Color depth
  if (typeof screen !== 'undefined') {
    fingerprints.push(`colorDepth:${screen.colorDepth}`);
  }

  // Timezone
  try {
    fingerprints.push(`timezone:${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
  } catch (e) {
    // Fallback for older browsers
    fingerprints.push(`timezone:${new Date().getTimezoneOffset()}`);
  }

  // Language
  fingerprints.push(`language:${navigator.language}`);

  // Platform
  fingerprints.push(`platform:${navigator.platform}`);

  // User agent
  fingerprints.push(`userAgent:${navigator.userAgent}`);

  // Hardware concurrency
  if (navigator.hardwareConcurrency) {
    fingerprints.push(`cores:${navigator.hardwareConcurrency}`);
  }

  // Device memory
  if ('deviceMemory' in navigator) {
    fingerprints.push(`memory:${(navigator as any).deviceMemory}`);
  }

  return fingerprints.join(',');
}
