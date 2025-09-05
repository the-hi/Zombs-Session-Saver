const EXTRACT_SESSION_INFO = (SESSION) => {
    return {
        uid: SESSION.playerUid,
        type: SESSION.options.type,
        server: SESSION.options.server,
        sessionId: SESSION.options.sessionId,
        sessionName: SESSION.options.sessionName || `(${SESSION.options.server})${SESSION.syncNeeds.enterWorld.effectiveDisplayName}`,
    }
};

export { EXTRACT_SESSION_INFO };