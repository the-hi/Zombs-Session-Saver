Session-Saver
=============

Session-Saver is a Node.js tool that lets you save your game WebSocket sessions locally instead of only in the browser.
This allows you to capture session information and reconnect or reuse it later in the browser without losing your active game session.

---

Features
--------
- Easy session script toggles
- Different Alarms for sessions
- Simple configuration via config.js
- A kill cam to see how ur base died
- Save active WebSocket sessions locally
- Store session IDs, and handshake data for later use
- Reconnect in your browser with the saved session (Admin, Normal, and View only mode)

---

Prerequisites
-------------
- Node.js (v18 or later recommended) [https://nodejs.org/en/download/]
- A Discord Webhook URL (Webhook ID and Token) if you want session logs sent automatically

---

Session-Saver Installation Guide
===============================
1.Download the project

  Clone the repository:
   
  git clone https://github.com/the-hi/Session-Saver.git
   
  Or download the ZIP and extract it manually.

  You need to download mpg123 if you're using linux: `sudo apt update && sudo apt install mpg123`

------------------------

2.Navigate to the project folder

  Open the project folder, right click on the folder and click on "Open in terminal".

------------------------

3.Configure the project

  Open config.js and set your Webhook ID and Token.

  Example:

  If your Webhook URL is:

  `https://discord.com/api/webhooks/1408923573d34689458/_0AFMuvzMwktKeDXssIqSKf162-9wlEGsLlSay_Vzq_THyxfl9tVKqK73js_PU1vXz7hZ`

  Then your config would be:

```js
export const config = {
  id: "1408923573d34689458",
  token: "_0AFMuvzMwktKeDXssIqSKf162-9wlEGsLlSay_Vzq_THyxfl9tVKqK73js_PU1vXz7hZ"
};
```
------------------------
4. Install node modules

   npm install

------------------------
5.Run the project

  node Start.js

------------------------
Done
----
Your Session-Saver is now running! You can save and restore your game sessions whenever needed.
