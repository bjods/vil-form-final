/// <reference types="vite/client" />

interface Window {
  Calendly: {
    initInlineWidget: (options: {
      url: string;
      parentElement: HTMLElement;
      prefill?: Record<string, string>;
      utm?: Record<string, string>;
    }) => void;
  };
}