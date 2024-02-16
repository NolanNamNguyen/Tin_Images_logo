// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const sharp = require('sharp');
const fs = require('fs');
const { dialog } = require('electron');

const manipulateImage = async (imagePath) => {
  try {
    const homeDirectory = require('os').homedir();
    const foregroundImagePath = `${homeDirectory}/Logo.png`;
    const backgroundImagePath = imagePath;
    console.log('backgroundImagePath', backgroundImagePath);

    const parts = imagePath.split(/[\\/]/);
    const outputPath = `${homeDirectory}/${parts[parts.length - 1]}`;


    // Read the foreground image dimensions
    Promise.all([
      sharp(backgroundImagePath).metadata(),
      sharp(foregroundImagePath).metadata(),
    ])
      .then(([backgroundMetadata, foregroundMetadata]) => {
        const backgroundHeight = backgroundMetadata.height;
        const foregroundHeight = foregroundMetadata.height;

        // Calculate the coordinates to place the foreground image at the bottom left corner
        const left = 50; // Left corner
        const top = backgroundHeight - foregroundHeight - 50; // Bottom corner

        // Composite the foreground image onto the background image
        sharp(backgroundImagePath)
          .composite([{ input: foregroundImagePath, top, left }])
          .toFile(outputPath, (err, info) => {
            if (err) {
              console.error('Error compositing images:', err);
            } else {
              console.log('Image composited successfully:', info);
            }
          });
      })
      .catch((err) => {
        console.error('Error reading image metadata:', err);
      });


  } catch (error) {
    console.error('Error manipulating image:', error);
  }

};

async function createWindow() {
  // Create the browser window.
  // const mainWindow = new BrowserWindow({
  //   width: 800,
  //   height: 600,
  //   webPreferences: {
  //     preload: path.join(__dirname, 'preload.js'),
  //   },
  // });
  const result = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] });
  console.log('result', result);
  if (!result.canceled && result.filePaths.length > 0) {
    const imagePath = result.filePaths[0];
    manipulateImage(imagePath);
  }

  // and load the index.html of the app.
  // mainWindow.loadFile('index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
