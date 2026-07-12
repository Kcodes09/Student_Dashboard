"use client";

export default function TestNotificationsPage() {
  const testLocalNotification = () => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Local Notification Test", {
        body: "This is a direct local notification from the browser window.",
        icon: "/globe.svg",
      });
    } else {
      alert("Notification permission not granted. Please enable it in the header.");
    }
  };

  const testServiceWorkerNotification = () => {
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "SCHEDULE_NOTIFICATION",
        title: "Service Worker Notification Test",
        body: "This notification was handled and displayed by the background Service Worker.",
        tag: "test-sw",
      });
    } else {
      alert("Service Worker not active. Try reloading the page or check devtools.");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Notification Tester</h1>
        <p className="text-[var(--text-muted)] mt-1">
          Use this page to verify that the PWA push notifications and local notifications are working properly on your device.
        </p>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="font-semibold text-lg">1. Local Window Notification</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Tests standard HTML5 browser notifications directly from the active tab.
          </p>
          <button
            onClick={testLocalNotification}
            className="mt-2 self-start px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow-sm active:scale-95"
          >
            Trigger Local Notification
          </button>
        </div>

        <hr className="border-[var(--border-subtle)] my-2" />

        <div className="flex flex-col gap-2">
          <h2 className="font-semibold text-lg">2. Service Worker Notification</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Tests sending a message to the PWA Service Worker, which then triggers the notification. This validates that your Service Worker is properly registered and handling messages.
          </p>
          <button
            onClick={testServiceWorkerNotification}
            className="mt-2 self-start px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition shadow-sm active:scale-95"
          >
            Trigger SW Notification
          </button>
        </div>
      </div>
    </div>
  );
}
