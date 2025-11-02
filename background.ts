// Background service worker for handling storage operations
// This is necessary because content scripts don't have direct access to chrome.storage

console.log('[Background] ========================================')
console.log('[Background] Service worker STARTING...')
console.log('[Background] Timestamp:', new Date().toISOString())
console.log('[Background] ========================================')

// Ensure chrome APIs are available
if (typeof chrome === 'undefined') {
  console.error('[Background] ❌ Chrome API not available!')
}

if (typeof chrome !== 'undefined' && typeof chrome.storage === 'undefined') {
  console.error('[Background] ❌ chrome.storage not available!')
}

const hasAlarms = typeof chrome !== 'undefined' && typeof chrome.alarms !== 'undefined'
const hasNotifications = typeof chrome !== 'undefined' && typeof chrome.notifications !== 'undefined'

console.log('[Background] Chrome APIs check:', {
  chrome: typeof chrome !== 'undefined',
  chromeStorage: typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined',
  chromeStorageLocal: typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined' && typeof chrome.storage.local !== 'undefined',
  chromeAlarms: hasAlarms,
  chromeNotifications: hasNotifications
})

if (!hasAlarms) {
  console.error('[Background] ❌ chrome.alarms NOT AVAILABLE - Alarms will not work!')
}

if (!hasNotifications) {
  console.error('[Background] ❌ chrome.notifications NOT AVAILABLE - Notifications will not work!')
}

// Use globalThis to access chrome in service worker context
const chromeAPI = globalThis.chrome || chrome

console.log('[Background] Using chrome API from:', chromeAPI === globalThis.chrome ? 'globalThis' : 'direct')

chromeAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Background] Received message:', request.type, request)
  
  try {
    if (request.type === 'STORAGE_GET') {
      chromeAPI.storage.local.get(request.keys, (result) => {
        if (chromeAPI.runtime.lastError) {
          console.error('[Background] STORAGE_GET error:', chromeAPI.runtime.lastError)
          sendResponse({ success: false, error: chromeAPI.runtime.lastError.message })
        } else {
          console.log('[Background] STORAGE_GET result:', result)
          sendResponse({ success: true, data: result })
        }
      })
      return true // Required for async sendResponse
    }

    if (request.type === 'STORAGE_SET') {
      console.log('[Background] STORAGE_SET data:', request.data)
      chromeAPI.storage.local.set(request.data, () => {
        if (chromeAPI.runtime.lastError) {
          console.error('[Background] STORAGE_SET error:', chromeAPI.runtime.lastError)
          sendResponse({ success: false, error: chromeAPI.runtime.lastError.message })
        } else {
          console.log('[Background] STORAGE_SET completed')
          sendResponse({ success: true })
        }
      })
      return true
    }

  if (request.type === 'STORAGE_REMOVE') {
    chromeAPI.storage.local.remove(request.keys, () => {
      if (chromeAPI.runtime.lastError) {
        console.error('[Background] STORAGE_REMOVE error:', chromeAPI.runtime.lastError)
        sendResponse({ success: false, error: chromeAPI.runtime.lastError.message })
      } else {
        console.log('[Background] STORAGE_REMOVE completed')
        sendResponse({ success: true })
      }
    })
    return true
  }

  if (request.type === 'CREATE_ALARM') {
    console.log('[Background] CREATE_ALARM for reminder:', request.reminderId, 'at', request.when)
    try {
      if (chromeAPI.alarms) {
        chromeAPI.alarms.create(`reminder_${request.reminderId}`, {
          when: request.when
        })
        console.log('[Background] Alarm created successfully')
        sendResponse({ success: true })
      } else {
        console.error('[Background] chrome.alarms is undefined')
        sendResponse({ success: false, error: 'chrome.alarms is not available' })
      }
    } catch (error) {
      console.error('[Background] CREATE_ALARM error:', error)
      sendResponse({ success: false, error: error.message })
    }
    return false
  }
  
  console.log('[Background] Unknown message type:', request.type)
  sendResponse({ success: false, error: 'Unknown message type' })
  } catch (error) {
    console.error('[Background] Error handling message:', error)
    sendResponse({ success: false, error: error.message })
  }
  
  return false
})

// ===== Badge Count Management =====
async function updateBadgeCount() {
  try {
    console.log('[Background] Updating badge count')
    const result = await chromeAPI.storage.local.get('thinktwice_reminders')
    const reminders = result.thinktwice_reminders || []
    
    // Count pending reminders that are due (reminderTime has passed)
    const now = Date.now()
    const dueCount = reminders.filter(r => 
      r.status === 'pending' && r.reminderTime <= now
    ).length
    
    console.log('[Background] Due reminders:', dueCount)
    
    if (dueCount > 0) {
      chromeAPI.action.setBadgeText({ text: dueCount.toString() })
      chromeAPI.action.setBadgeBackgroundColor({ color: '#8B5CF6' })
    } else {
      chromeAPI.action.setBadgeText({ text: '' })
    }
  } catch (error) {
    console.error('[Background] Error updating badge:', error)
  }
}

// ===== Notification Creation =====
async function createReminderNotification(reminderId: string) {
  try {
    console.log('[Background] Creating notification for reminder:', reminderId)
    
    // Get reminder and product data
    const reminderResult = await chromeAPI.storage.local.get('thinktwice_reminders')
    const reminders = reminderResult.thinktwice_reminders || []
    const reminder = reminders.find(r => r.id === reminderId)
    
    if (!reminder) {
      console.error('[Background] Reminder not found:', reminderId)
      return
    }
    
    const productResult = await chromeAPI.storage.local.get('thinktwice_products')
    const products = productResult.thinktwice_products || {}
    const product = products[reminder.productId]
    
    if (!product) {
      console.error('[Background] Product not found:', reminder.productId)
      return
    }
    
    // Create notification
    if (chromeAPI.notifications) {
      const notificationOptions: chrome.notifications.NotificationOptions<true> = {
        type: 'basic' as const,
        iconUrl: product.image || 'icon128.png',
        title: 'Time to Reconsider?',
        message: product.name,
        contextMessage: product.price || 'Amazon Product',
        buttons: [
          { title: 'View Product' },
          { title: 'Not Interested' }
        ],
        requireInteraction: false,
        priority: 1
      }
      
      chromeAPI.notifications.create(reminderId, notificationOptions, (notificationId) => {
        console.log('[Background] Notification created:', notificationId)
      })
    } else {
      console.error('[Background] Cannot create notification - chrome.notifications unavailable')
    }
    
    // Update badge count
    await updateBadgeCount()
  } catch (error) {
    console.error('[Background] Error creating notification:', error)
  }
}

// ===== Alarm Listener =====
if (chromeAPI.alarms) {
  chromeAPI.alarms.onAlarm.addListener(async (alarm) => {
    console.log('[Background] Alarm fired:', alarm.name)
    
    if (alarm.name.startsWith('reminder_')) {
      const reminderId = alarm.name.replace('reminder_', '')
      await createReminderNotification(reminderId)
    } else if (alarm.name === 'badge_update') {
      await updateBadgeCount()
    }
  })
  console.log('[Background] ✅ Alarm listener registered')
} else {
  console.error('[Background] ❌ Cannot register alarm listener - chrome.alarms is undefined')
}

// ===== Notification Click Handlers =====
if (chromeAPI.notifications) {
  chromeAPI.notifications.onClicked.addListener((notificationId) => {
    console.log('[Background] Notification clicked:', notificationId)
    // Open popup when notification is clicked
    chromeAPI.action.openPopup()
    chromeAPI.notifications.clear(notificationId)
  })

  chromeAPI.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
    console.log('[Background] Notification button clicked:', notificationId, 'button:', buttonIndex)
    
    try {
      // Get reminder and product
      const reminderResult = await chromeAPI.storage.local.get('thinktwice_reminders')
      const reminders = reminderResult.thinktwice_reminders || []
      const reminderIndex = reminders.findIndex(r => r.id === notificationId)
      
      if (reminderIndex === -1) {
        console.error('[Background] Reminder not found for notification:', notificationId)
        return
      }
      
      const reminder = reminders[reminderIndex]
      
      if (buttonIndex === 0) {
        // View Product - open product page and mark as completed
        const productResult = await chromeAPI.storage.local.get('thinktwice_products')
        const products = productResult.thinktwice_products || {}
        const product = products[reminder.productId]
        
        if (product) {
          chromeAPI.tabs.create({ url: product.url })
        }
        
        // Mark as completed
        reminders[reminderIndex] = { ...reminder, status: 'completed' }
        await chromeAPI.storage.local.set({ thinktwice_reminders: reminders })
      } else if (buttonIndex === 1) {
        // Not Interested - mark as dismissed
        reminders[reminderIndex] = { ...reminder, status: 'dismissed' }
        await chromeAPI.storage.local.set({ thinktwice_reminders: reminders })
      }
      
      // Clear notification and update badge
      chromeAPI.notifications.clear(notificationId)
      await updateBadgeCount()
    } catch (error) {
      console.error('[Background] Error handling notification button:', error)
    }
  })
  
  console.log('[Background] ✅ Notification listeners registered')
} else {
  console.error('[Background] ❌ Cannot register notification listeners - chrome.notifications is undefined')
}

// ===== Service Worker Initialization =====
async function initializeServiceWorker() {
  console.log('[Background] Initializing service worker...')
  
  try {
    // Restore alarms for pending reminders
    const result = await chromeAPI.storage.local.get('thinktwice_reminders')
    const reminders = result.thinktwice_reminders || []
    const now = Date.now()
    
    console.log('[Background] Found', reminders.length, 'reminders in storage')
    
    for (const reminder of reminders) {
      if (reminder.status === 'pending' && reminder.reminderTime > now) {
        // Recreate alarm for future reminders
        if (chromeAPI.alarms) {
          chromeAPI.alarms.create(`reminder_${reminder.id}`, {
            when: reminder.reminderTime
          })
          console.log('[Background] Restored alarm for reminder:', reminder.id)
        } else {
          console.error('[Background] Cannot restore alarm - chrome.alarms unavailable')
        }
      } else if (reminder.status === 'pending' && reminder.reminderTime <= now) {
        // Reminder is overdue - create notification immediately
        console.log('[Background] Found overdue reminder:', reminder.id)
        await createReminderNotification(reminder.id)
      }
    }
    
    // Set up periodic badge update alarm
    if (chromeAPI.alarms) {
      chromeAPI.alarms.create('badge_update', {
        periodInMinutes: 1
      })
      console.log('[Background] Periodic badge update alarm created')
    } else {
      console.error('[Background] Cannot create badge update alarm - chrome.alarms unavailable')
    }
    
    // Initial badge update
    await updateBadgeCount()
    
    console.log('[Background] Service worker initialization complete')
  } catch (error) {
    console.error('[Background] Error during initialization:', error)
  }
}

// Run initialization
initializeServiceWorker().then(() => {
  console.log('[Background] ✅ Service worker initialized successfully')
  
  // Log all alarms for debugging
  if (chromeAPI.alarms) {
    chromeAPI.alarms.getAll((alarms) => {
      console.log('[Background] Active alarms after initialization:', alarms.length)
      alarms.forEach(alarm => {
        console.log('[Background]   -', alarm.name, 'scheduled for', new Date(alarm.scheduledTime))
      })
    })
  } else {
    console.error('[Background] Cannot list alarms - chrome.alarms unavailable')
  }
}).catch(error => {
  console.error('[Background] ❌ Initialization failed:', error)
})

console.log('[Background] Initialization started...')

export {}

