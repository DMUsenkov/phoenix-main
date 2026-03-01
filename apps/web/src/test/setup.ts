import '@testing-library/jest-dom';

class TestIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin = '0px';
  readonly thresholds: ReadonlyArray<number> = [0];

  constructor(_callback?: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}
  disconnect(): void {}
  observe(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  unobserve(): void {}
}

class TestResizeObserver implements ResizeObserver {
  constructor(_callback?: ResizeObserverCallback) {}
  disconnect(): void {}
  observe(): void {}
  unobserve(): void {}
}

globalThis.IntersectionObserver = TestIntersectionObserver;
globalThis.ResizeObserver = TestResizeObserver;
