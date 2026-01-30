import type { Page } from "@playwright/test"

/**
 * Handle tab closure gracefully
 * Executes a callback and handles errors that occur when tab is closed
 */
export async function handleTabClosure(
  page: Page,
  callback: () => Promise<void>,
  onClosed?: () => void
): Promise<void> {
  try {
    await callback()
    // If we get here, tab didn't close
  } catch (error) {
    // Expected: callback throws when tab is closed
    if (page.isClosed()) {
      if (onClosed) {
        onClosed()
      }
    } else {
      throw error
    }
  }
}

/**
 * Wrap a promise with a timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeout: number,
  errorMsg: string
): Promise<T> {
  let timeoutId: NodeJS.Timeout

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMsg))
    }, timeout)
  })

  try {
    const result = await Promise.race([promise, timeoutPromise])
    clearTimeout(timeoutId!)
    return result
  } catch (error) {
    clearTimeout(timeoutId!)
    throw error
  }
}

/**
 * Retry an operation with exponential backoff
 */
export async function retryOperation<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (attempt < maxRetries - 1) {
        // Wait with exponential backoff before retrying
        await new Promise((resolve) =>
          setTimeout(resolve, delayMs * Math.pow(2, attempt))
        )
      }
    }
  }

  throw lastError || new Error("Operation failed after retries")
}

/**
 * Wait for tab closure or timeout
 */
export async function waitForTabClosureOrTimeout(
  page: Page,
  timeoutMs: number
): Promise<boolean> {
  try {
    await page.waitForTimeout(timeoutMs)
    // If we get here, tab didn't close within timeout
    return false
  } catch {
    // Expected: waitForTimeout throws when tab is closed
    return page.isClosed()
  }
}
