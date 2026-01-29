import { useEffect, useState } from "react"

import { ChromeMessaging } from "~/services/ChromeMessaging"
import { StorageProxyService } from "~/services/StorageProxyService"
import type { Product } from "~/storage"
import { storage } from "~/storage"
import { ProductState } from "~/storage/types"
import { extractProduct } from "~/utils/productExtractor"

interface UseProductPageStateParams {
  getProductId: (url: string) => string | null
  marketplace: string
}

interface UseProductPageStateReturn {
  currentView: "product" | "earlyreturn" | "oldflame" | null
  currentProduct: Product | null
  reminderId: string | null
  reminderDuration: number | null
  reminderStartTime: number | null
  hideOverlay: boolean
  pluginClosed: boolean
  setPluginClosed: (closed: boolean) => void
}

/**
 * Manages state for product pages including checking product state,
 * pending reminders, and determining which view to display.
 */
export function useProductPageState({
  getProductId,
  marketplace
}: UseProductPageStateParams): UseProductPageStateReturn {
  const [currentView, setCurrentView] = useState<
    "product" | "earlyreturn" | "oldflame" | null
  >(null)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [reminderId, setReminderId] = useState<string | null>(null)
  const [reminderDuration, setReminderDuration] = useState<number | null>(null)
  const [reminderStartTime, setReminderStartTime] = useState<number | null>(
    null
  )
  const [hideOverlay, setHideOverlay] = useState(true)
  const [pluginClosed, setPluginClosedState] = useState(false)
  const [tabIdSession, setTabIdSession] = useState<number | null>(null)
  const [currentProductId, setCurrentProductId] = useState<string | null>(null)

  useEffect(() => {
    ChromeMessaging.getTabId().then((tabId) => {
      setTabIdSession(tabId)
    })
  }, [])

  useEffect(() => {
    const updateProductId = () => {
      const url = window.location.href
      const productId = getProductId(url)
      setCurrentProductId((prev) => {
        if (prev !== productId) {
          console.log(
            "[useProductPageState] ProductId changed:",
            prev,
            "->",
            productId
          )
          return productId
        }
        return prev
      })
    }

    // Set initial productId
    updateProductId()

    // Listen for popstate (browser back/forward)
    window.addEventListener("popstate", updateProductId)

    // Intercept pushState and replaceState
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = function (...args) {
      originalPushState.apply(history, args)
      updateProductId()
    }

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args)
      updateProductId()
    }

    return () => {
      window.removeEventListener("popstate", updateProductId)
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
    }
  }, [getProductId])

  useEffect(() => {
    const checkForPendingReminder = async () => {
      const productId = currentProductId
      console.log(
        "[useProductPageState] Using productId from state:",
        productId
      )

      if (productId) {
        try {
          // Check if there's an active global snooze first
          console.log("[useProductPageState] Checking for global snooze...")
          const snoozedUntil = await storage.getGlobalSnooze()
          console.log(
            "[useProductPageState] Global snooze value:",
            snoozedUntil
          )

          if (snoozedUntil) {
            const now = Date.now()
            if (snoozedUntil > now) {
              // Snooze is still active - hide overlay
              console.log(
                "[useProductPageState] Global snooze active until:",
                new Date(snoozedUntil)
              )
              setHideOverlay(true)
              setCurrentView(null)
              return
            } else {
              // Snooze has expired - clear it
              console.log("[useProductPageState] Snooze expired, clearing...")
              await storage.clearGlobalSnooze()
            }
          }

          // Create composite key for storage lookup
          const compositeKey = `${marketplace}-${productId}`
          console.log(
            "[useProductPageState] Checking product storage for key:",
            compositeKey
          )

          // First check if this product has "iNeedThis" state - if so, hide overlay
          const existingProduct = await storage.getProduct(compositeKey)
          console.log(
            "[useProductPageState] Existing product state:",
            existingProduct?.state
          )
          if (existingProduct?.state === ProductState.I_NEED_THIS) {
            console.log(
              "[useProductPageState] Product has iNeedThis state - hiding overlay"
            )
            setHideOverlay(true)
            setCurrentView(null)
            return
          }

          // Product doesn't have iNeedThis state, show overlay
          console.log(
            "[useProductPageState] Product has not iNeedThis state - setting hideOverlay: false"
          )
          setHideOverlay(false)

          const reminders = await storage.getReminders()
          const pendingReminder = reminders.find(
            (r) => r.productId === compositeKey && r.status === "pending"
          )

          if (pendingReminder) {
            console.log(
              "[useProductPageState] Found pending reminder for this product:",
              pendingReminder.id
            )

            // Check if this reminder was just created in the current session
            const currentTabSessionState =
              await storage.getCurrentTabSessionState(tabIdSession)
            if (
              currentTabSessionState?.justCreatedReminderId ===
              pendingReminder.id
            ) {
              console.log(
                "[useProductPageState] Reminder was just created in this session, skipping early return view"
              )
              // Clear the flag so future checks work normally
              await storage.saveTabSessionState({
                ...currentTabSessionState,
                justCreatedReminderId: null
              })
              // Don't show any reminder view, let the success message display
              setReminderId(null)
              setReminderDuration(null)
              setReminderStartTime(null)
              setCurrentView(null)
              return
            }

            setReminderDuration(pendingReminder.duration)
            setReminderStartTime(
              pendingReminder.reminderTime - pendingReminder.duration
            )

            // Extract product info
            const product = extractProduct(marketplace, productId)
            setCurrentProduct(product)

            const now = Date.now()

            // Differentiate between early return and old flame
            if (pendingReminder.reminderTime > now) {
              // User came back before reminder time - still sleeping on it
              console.log(
                "[useProductPageState] User returned early - showing EarlyReturnFromSleep"
              )
              setCurrentView("earlyreturn")
            } else {
              // Reminder time has passed - they resisted the urge to buy
              console.log(
                "[useProductPageState] User returned after resisting - showing BackToAnOldFlame"
              )
              setCurrentView("oldflame")
            }
          } else {
            setReminderId(null)
            setReminderDuration(null)
            setReminderStartTime(null)
            setCurrentView(null)
          }
        } catch (error) {
          console.error(
            "[useProductPageState] Error checking for pending reminder:",
            error
          )
        }
      }
    }

    const checkForPluginClosed = async () => {
      const currentTabSessionState =
        await storage.getCurrentTabSessionState(tabIdSession)
      if (currentTabSessionState) {
        setPluginClosedState(currentTabSessionState.pluginClosed)
      }
    }

    const storageListener = (
      changes: chrome.storage.StorageChange,
      areaName: string
    ) => {
      // Only watch local storage changes
      if (areaName !== "local") return

      // Check if products storage changed - this might include our product
      if ("thinktwice_products" in changes) {
        console.log(
          "[useProductPageState] Products storage changed, re-checking..."
        )
        checkForPendingReminder()
      }

      // Check if snooze storage changed - need to re-check visibility
      if ("thinktwice_snooze" in changes) {
        console.log(
          "[useProductPageState] Snooze storage changed, re-checking..."
        )

        // If snooze was cleared (newValue is undefined or null), also reset pluginClosed
        const snoozeChange = changes["thinktwice_snooze"] as {
          oldValue?: number | null
          newValue?: number | null
        }
        if (!snoozeChange?.newValue || snoozeChange.newValue < Date.now()) {
          console.log(
            "[useProductPageState] Snooze cleared or expired - resetting pluginClosed state"
          )
          // Reset the pluginClosed state for this tab so overlay can appear again
          storage.getCurrentTabSessionState(tabIdSession).then((state) => {
            if (state && state.pluginClosed) {
              storage.saveTabSessionState({
                ...state,
                pluginClosed: false
              })
              setPluginClosedState(false)
            }
          })
        }

        checkForPendingReminder()
      }
    }

    checkForPluginClosed()
    checkForPendingReminder()

    // Set up storage change listener to re-check when products are updated

    const removeListener =
      StorageProxyService.addChangeListener(storageListener)

    return removeListener
  }, [getProductId, marketplace, tabIdSession, currentProductId])

  const setPluginClosed = (closed: boolean) => {
    console.log("[useProductPageState] Setting plugin closed:", closed)
    setPluginClosedState(closed)
    storage
      .getCurrentTabSessionState(tabIdSession)
      .then((currentTabSessionState) => {
        if (currentTabSessionState) {
          storage.saveTabSessionState({
            ...currentTabSessionState,
            pluginClosed: closed
          })
        } else {
          storage.saveTabSessionState({
            tabId: tabIdSession,
            pluginClosed: closed
          })
        }
        console.log("[useProductPageState] Plugin closed saved")
      })
  }

  return {
    currentView,
    currentProduct,
    reminderId,
    reminderDuration,
    reminderStartTime,
    hideOverlay,
    pluginClosed,
    setPluginClosed
  }
}
