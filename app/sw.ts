/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();

// Basic local notification for classes logic (could be extended)
self.addEventListener("message", (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === "SCHEDULE_NOTIFICATION") {
    // Handling local notifications from the foreground app
    self.registration.showNotification(event.data.title, {
      body: event.data.body,
      icon: "/globe.svg",
      tag: event.data.tag || "class-alert",
      requireInteraction: true,
    });
  }
});
