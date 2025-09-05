const encodeString = (string) => {
    return new TextEncoder().encode(string);
};

const getEncodedJSON = (json) => {
    return encodeString(JSON.stringify(json))
};

export { getEncodedJSON };