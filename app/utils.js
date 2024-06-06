const fs = require('fs');
const path = require("path");
const constants = require("./constants/constants")

function findProjectRoot(currentDir) {
    // Check if package.json exists in the current directory
    if (fs.existsSync(path.join(currentDir, 'package.json'))) {
        return currentDir;
    }

    // If package.json is not found and we haven't reached the root directory, continue searching
    const parentDir = path.resolve(currentDir, '..');
    if (parentDir !== currentDir) {
        return findProjectRoot(parentDir);
    }

    // Return null if the root directory is reached and package.json is not found
    return null;
}

function getUploadFolderPath() {
    const projectRoot = findProjectRoot(__dirname);
    if (projectRoot) {
        return path.join(projectRoot, 'uploads');
    } else {
        throw new Error("Project root directory not found.");
    }
}

function removeAllFilesFromUpload() {
    try {
        fs.readdir(constants.imageDir, (err, files) => {
            if (err) throw err;
            for (const file of files) {
                fs.unlink(path.join(constants.imageDir, file), (err) => {
                    if (err) throw err;
                });
            }
        });
    } catch (error) {
        console.log("error in removeAllFilesFromUpload:", error)
    }
}

module.exports = {
    findProjectRoot,
    getUploadFolderPath,
    removeAllFilesFromUpload
};