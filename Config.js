const config = {
    killCamLength: 60, // in seconds (minimum value is 0.5) (the video generated will be half of this in seconds, the killCam will record the given length tho, the video plays in 2x)
    killCamResolution: 720, // resolution in px (highest resolution varies accoridng to discord limits)
    webhookUrl: '', // url of the webhook
    sessionSaverADMIN: 'DIPER_IS_A_SKID', // change this password and keep it to urself, the client script need to be changed in order to use admin
    sessionSaverNORMAL: 'JKING_IS_A_SKID', // this password is for normal users
    sessionSaverVIEW: 'GAY_LATIOS_IS_A_SKID', // VIEW only users
    PORT: 8080 // PORT where the session saver runs
};


if (config.killCamLength < 0.5) {
    config.killCamLength = 0.5;
};

if (config.webhookUrl !== '') {
    const [id, token] = config.webhookUrl.replace('https://discord.com/api/webhooks/', '').split('/');

    config.id = id;
    config.token = token;
};

export { config };
