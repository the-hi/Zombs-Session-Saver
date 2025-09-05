import { config } from "../Config.js";
import { webhookClient } from "../utils/Webhook.js";

const CHANGE_PASSWORD = (decodedMessage, CLIENT) => {
    const { newPassword, type } = JSON.parse(decodedMessage);

    if (CLIENT["ADMIN"]) {
        const key = "sessionSaver" + type.toUpperCase();
        const password = config[key];
        if (password) {
            password = newPassword;
            console.log(`${key} password got changed to: ${newPassword}`);
            if (webhookClient) webhookClient.send({ content: `${key} password got changed to: ${newPassword}` });
        }
    }
};

export { CHANGE_PASSWORD };