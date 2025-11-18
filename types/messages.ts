/**
 * Chrome Runtime Message Types and Interfaces
 *
 * This file defines all message types used for communication between
 * content scripts/popup and the background service worker.
 */

export enum MessageType {
  CREATE_ALARM = "CREATE_ALARM",
  CLOSE_CURRENT_TAB = "CLOSE_CURRENT_TAB",
  CREATE_TAB = "CREATE_TAB",
  GET_TAB_ID = "GET_TAB_ID",
  STORAGE_GET = "STORAGE_GET",
  STORAGE_SET = "STORAGE_SET",
  STORAGE_REMOVE = "STORAGE_REMOVE"
}

// Individual message interfaces

export interface CreateAlarmMessage {
  type: MessageType.CREATE_ALARM
  reminderId: string
  when: number
}

export interface CloseCurrentTabMessage {
  type: MessageType.CLOSE_CURRENT_TAB
}

export interface CreateTabMessage {
  type: MessageType.CREATE_TAB
  url: string
}

export interface GetTabIdMessage {
  type: MessageType.GET_TAB_ID
}

export interface StorageGetMessage {
  type: MessageType.STORAGE_GET
  keys: string | string[]
}

export interface StorageSetMessage {
  type: MessageType.STORAGE_SET
  data: Record<string, unknown>
}

export interface StorageRemoveMessage {
  type: MessageType.STORAGE_REMOVE
  keys: string | string[]
}

// Union type for all messages
export type Message =
  | CreateAlarmMessage
  | CloseCurrentTabMessage
  | CreateTabMessage
  | GetTabIdMessage
  | StorageGetMessage
  | StorageSetMessage
  | StorageRemoveMessage

// Response interface
export interface MessageResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}
