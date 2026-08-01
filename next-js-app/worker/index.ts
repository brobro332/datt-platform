/// <reference lib="webworker" />
export default null;
declare let self: ServiceWorkerGlobalScope;

self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const title = data.title || "DATT 알림";
    const options = {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      data: {
        url: data.url || "/",
      },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      const url = event.notification.data.url;
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus().then(() => client.navigate(url));
      }
      return self.clients.openWindow(url);
    })
  );
});
