const config = {
    killCamLength: 60, // in seconds (minimum value is 0.5)
    killCamResolution: 720, // resolution in px (highest resolution varies accoridng to discord limits)
    id: '', // id of the webhook for killCam
    token: '', // token of the webhook for killCam
    sessionSaverADMIN: 'GAY_PLANE_IS_NOOB', // change this password and keep it to urself, the client script need to be changed in order to use admin
    sessionSaverNORMAL: 'JKING_IS_A_SKID', // this password is for normal users
    sessionSaverVIEW: 'GAY_LATIOS_IS_A_SKID', // VIEW only users
    PORT: 8080 // PORT where the session saver runs
};

export { config };
