importScripts("https://www.gstatic.com/firebasejs/8.4.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.4.1/firebase-messaging.js");

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
    apiKey: "AIzaSyB6LlVaiqII1pPnRRA8QyQaPCSwHlp2O_U",
    authDomain: "cashd-324d3.firebaseapp.com",
    databaseURL: "https://cashd-324d3.firebaseio.com",
    projectId: "cashd-324d3",
    storageBucket: "cashd-324d3.appspot.com",
    messagingSenderId: "208800833949",
    appId: "1:208800833949:web:af744fb1ac23b3f7b98f74",
    measurementId: "G-YRBM4VC4VV",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./firebase-messaging-sw.js')
      .then(function(registration) {
        initializeState(registration);
        console.log('Registration successful, scope is:', registration.scope);
      }).catch(function(err) {
    console.log('Service worker registration failed, error:', err);
  });
}

messaging.setBackgroundMessageHandler(function (payload) {
    console.log(
        "[firebase-messaging-sw.js] Received background message ",
        payload
    );
    return;
});

messaging.onBackgroundMessage((payload) => {
  return;
});

function initializeState() {

  if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
    console.warn('Notifications aren\'t supported.');
    return;
  }

  // Check the current Notification permission.
  if (Notification.permission === 'denied') {
    console.warn('The user has blocked notifications.');
    return;
  }

  // Check if push messaging is supported
  if (!('PushManager' in window)) {
    console.warn('Push messaging isn\'t supported.');
    return;
  }

  // We need the service worker registration to check for a subscription
  navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
    serviceWorkerRegistration.pushManager.subscribe()
      .then(function(subscription) {
        console.log(subscription);
      })
      .catch(function(e) {
        if (Notification.permission === 'denied') {
          console.warn('Permission for Notifications was denied');
        } else {
          console.error('Unable to subscribe to push.', e);
        }
      });
  });
}

self.addEventListener('push', function(event) {
  if (event.data) {
    const result = event.data.json();
    const body = customNotificationBody(result.data);
    return self.registration.showNotification("CashD", { body, icon: "/web-images/favicon.png"})
  } else {
    console.log('This push event has no data.');
  }
});

self.addEventListener('notificationclick', function(event) {
  // Android doesn't close the notification when you click on it
  // See: http://crbug.com/463146
  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(async function() {
    const allClients = await clients.matchAll({
      includeUncontrolled: true
    });

    let openClient;
    // Let's see if we already have a chat window open:
    for (const client of allClients) {
      const url = new URL(client.url);
      if (url.pathname.match(/admin\/watch-company-infor/g)) {
        // Excellent, let's use it!
        client.focus();
        openClient = client;
      }
    }

    // If we didn't find an existing chat window,
    // open a new one:
    if (!openClient) {
      await clients.openWindow('/admin');
    }
  }());
});

function customNotificationBody(data) {
  var content;
  switch (data.type) {
    case "ADMIN_NOTIFY":
      content = data.content;
      break;
    case "SEND_NEW_TIMESHEET_REQUEST":
      content = `${
        data.senderName
      } sent a request to approve the timesheet on ${data.requestDate}`;
      break;
    case "APPROVE_TIMESHEET_REQUEST":
      content = `${
        data.senderName
      } approved your request on ${data.requestDate}`;
      break;
    case "REJECTED_TIMESHEET_REQUEST":
      content = `${data.senderName} rejected your request on ${data.requestDate}`;
      break;
    case "APPROVE_TIMESHEET":
      content = `${
        data.senderName
      } approved your timesheet on ${data.requestDate}`;
      break;
    default:
      content = data.content;
      break;
  }
  return content;
}
