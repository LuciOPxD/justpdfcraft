/**
 * Browser LocalStorage Draft & History Manager (100% Private, Zero-Backend)
 */

const DRAFTS_KEY = 'justpdfcraft_drafts_v2';
const HISTORY_KEY = 'justpdfcraft_search_history';

export function getSavedDrafts() {
  try {
    const data = localStorage.getItem(DRAFTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('LocalStorage Read Error:', e);
    return [];
  }
}

export function saveDraft(draftData) {
  try {
    const drafts = getSavedDrafts();
    const existingIndex = drafts.findIndex((d) => d.id === draftData.id);
    
    const timestamp = new Date().toISOString();
    const updatedDraft = {
      ...draftData,
      updatedAt: timestamp,
      id: draftData.id || `draft_${Date.now()}`
    };

    if (existingIndex >= 0) {
      drafts[existingIndex] = updatedDraft;
    } else {
      drafts.unshift(updatedDraft);
    }

    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts.slice(0, 30))); // Keep last 30 drafts
    return updatedDraft;
  } catch (e) {
    console.error('LocalStorage Save Error:', e);
    return null;
  }
}

export function deleteDraft(id) {
  try {
    const drafts = getSavedDrafts().filter((d) => d.id !== id);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    return drafts;
  } catch (e) {
    console.error('LocalStorage Delete Error:', e);
    return [];
  }
}

export function getSearchHistory() {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function addSearchQuery(query) {
  if (!query || !query.trim()) return;
  try {
    const history = getSearchHistory().filter((q) => q !== query);
    history.unshift(query.trim());
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
  } catch (e) {
    // Ignore
  }
}
