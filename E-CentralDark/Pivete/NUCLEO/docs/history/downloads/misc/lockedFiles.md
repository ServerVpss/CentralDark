# OUTRO - lockedFiles.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\Bolt\source\app\lib\persistence\lockedFiles.ts
**SHA:** d10e470392c0ce09
**Timestamp:** 2026-08-28T02:56:18.229096
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- function getChatMap(chatId: string, createIfMissing = false): Map<string, LockedItem> | undefined {

### Ouro Bruto (primeiros 5000 chars)
```
import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('LockedFiles');

// Key for storing locked files in localStorage
export const LOCKED_FILES_KEY = 'bolt.lockedFiles';

export interface LockedItem {
  chatId: string; // Chat ID to scope locks to a specific project
  path: string;
  isFolder: boolean; // Indicates if this is a folder lock
}

// In-memory cache for locked items to reduce localStorage reads
let lockedItemsCache: LockedItem[] | null = null;

// Map for faster lookups by chatId and path
const lockedItemsMap = new Map<string, Map<string, LockedItem>>();

// Debounce timer for localStorage writes
let saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const SAVE_DEBOUNCE_MS = 300;

/**
 * Get a chat-specific map from the lookup maps
 */
function getChatMap(chatId: string, createIfMissing = false): Map<string, LockedItem> | undefined {
  if (createIfMissing && !lockedItemsMap.has(chatId)) {
    lockedItemsMap.set(chatId, new Map());
  }

  return lockedItemsMap.get(chatId);
}

/**
 * Initialize the in-memory cache and lookup maps
 */
function initializeCache(): LockedItem[] {
  if (lockedItemsCache !== null) {
    return lockedItemsCache;
  }

  try {
    if (typeof localStorage !== 'undefined') {
      const lockedItemsJson = localStorage.getItem(LOCKED_FILES_KEY);

      if (lockedItemsJson) {
        const items = JSON.parse(lockedItemsJson);

        // Handle legacy format (without isFolder property)
        const normalizedItems = items.map((item: any) => ({
          ...item,
          isFolder: item.isFolder !== undefined ? item.isFolder : false,
        }));

        // Update the cache
        lockedItemsCache = normalizedItems;

        // Build the lookup maps
        rebuildLookupMaps(normalizedItems);

        return normalizedItems;
      }
    }

    // Initialize with empty array if no data in localStorage
    lockedItemsCache = [];

    return [];
  } catch (error) {
    logger.error('Failed to initialize locked items cache', error);
    lockedItemsCache = [];

    return [];
  }
}

/**
 * Rebuild the lookup maps from the items array
 */
function rebuildLookupMaps(items: LockedItem[]): void {
  // Clear existing maps
  lockedItemsMap.clear();

  // Build new maps
  for (const item of items) {
    if (!lockedItemsMap.has(item.chatId)) {
      lockedItemsMap.set(item.chatId, new Map());
    }

    const chatMap = lockedItemsMap.get(item.chatId)!;
    chatMap.set(item.path, item);
  }
}

/**
 * Save locked items to localStorage with debouncing
 */
export function saveLockedItems(items: LockedItem[]): void {
  // Update the in-memory cache immediately
  lockedItemsCache = [...items];

  // Rebuild the lookup maps
  rebuildLookupMaps(items);

  // Debounce the localStorage write
  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer);
  }

  saveDebounceTimer = setTimeout(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LOCKED_FILES_KEY, JSON.stringify(items));
        logger.info(`Saved ${items.length} locked items to localStorage`);
      }
    } catch (error) {
      logger.error('Failed to save locked items to localStorage', error);
    }
  }, SAVE_DEBOUNCE_MS);
}

/**
 * Get locked items from cache or localStorage
 */
export function getLockedItems(): LockedItem[] {
  // Use cache if available
  if (lockedItemsCache !== null) {
    return lockedItemsCache;
  }

  // Initialize cache if not yet done
  return initializeCache();
}

/**
 * Add a file or folder to the locked items list
 * @param chatId The chat ID to scope the lock to
 * @param path The path of the file or folder to lock
 * @param isFolder Whether this is a folder lock
 */
export function addLockedItem(chatId: string, path: string, isFolder: boolean = false): void {
  // Ensure cache is initialized
  const lockedItems = getLockedItems();

  // Create the new item
  const newItem = { chatId, path, isFolder };

  // Update the in-memory map directly for faster access
  const chatMap = getChatMap(chatId, true)!;
  chatMap.set(path, newItem);

  // Remove any existing entry for this path in this chat and add the new one
  const filteredItems = lockedItems.filter((item) => !(item.chatId === chatId && item.path === path));
  filteredItems.push(newItem);

  // Save the updated list (this will update the cache and maps)
  saveLockedItems(filteredItems);

  logger.info(`Added locked ${isFolder ? 'folder' : 'file'}: ${path} for chat: ${chatId}`);
}

/**
 * Add a file to the locked items list (for backward compatibility)
 */
export function addLockedFile(chatId: string, filePath: string): void {
  addLockedItem(chatId, filePath);
}

/**
 * Add a folder to the locked items list
 */
export function addLockedFolder(chatId: string, folderPath: string): void {
  addLockedItem(chatId, folderPath);
}

/**
 * Remove an item from the locked items list
 * @param chatId The chat ID the lock belongs to
 * @param path The path of the item to
```