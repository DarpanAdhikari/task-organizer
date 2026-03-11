self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(clients.claim()));


/* ---------- Listen Messages From Site ---------- */
self.addEventListener("message", async (event) => {

  const data = event.data;
  if (!data) return;

  switch (data.type) {

    // TEXT: notify page to handle function
    case "text":
      // show notification visually
      self.registration.showNotification(data.title || "Notification", {
        body: data.text || "",
        icon: data.icon || "https://www.darpanadhikari.com.np/addition/images/logo.ico",
        data: { type: "text" }
      });
      break;

    // LINK: open link immediately
    case "link":
      event.waitUntil(clients.openWindow(data.url));
      break;

    // ACTION: show notification with click handling
    case "action":
      self.registration.showNotification(data.title || "Action", {
        body: data.text || "",
        icon: data.icon || "/icon.png",
        actions: [{ action: "open", title: "Open" }],
        data: { type: "action", url: data.url || "/" }
      });
      break;

  }

});


/* ---------- Notification Click ---------- */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};

  // Only handle action notifications
  if (data.type === "action" && data.url) {
    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
          for (const client of clientList) {
            if ("focus" in client) {
              client.focus();
              client.navigate(data.url);
              return;
            }
          }
          return clients.openWindow(data.url);
        })
    );
  }

  // Text notifications do nothing on click (handled by page)
});