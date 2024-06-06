const PORT = 3001;
const SERVER_URL = `http://192.168.1.102:${PORT}/`;
const directoryName = "uploads";
const imageDir = `./${directoryName}`;

module.exports = {
    PORT,
    SERVER_URL,
    directoryName,
    imageDir
}