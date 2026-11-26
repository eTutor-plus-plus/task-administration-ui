import { TextDecoder, TextEncoder } from 'util';

Object.assign(global, { TextDecoder, TextEncoder });

/**
 * happy-dom's MutationObserver does not provide everything the rich text editor (tiptap/prosemirror)
 * calls when it is created (e.g. takeRecords), so component tests rendering the editor would fail.
 * Tests do not rely on DOM mutation notifications, so a no-op observer is sufficient.
 */
class NoopMutationObserver {
  constructor(_callback: MutationCallback) {
  }

  observe(): void {
  }

  disconnect(): void {
  }

  takeRecords(): MutationRecord[] {
    return [];
  }
}

Object.defineProperty(window, 'MutationObserver', {value: NoopMutationObserver, writable: true, configurable: true});
Object.defineProperty(globalThis, 'MutationObserver', {value: NoopMutationObserver, writable: true, configurable: true});
