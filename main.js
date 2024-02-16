// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const sharp = require('sharp');
const fs = require('fs');
const { dialog } = require('electron');

const manipulateImage = async (imagePath, logoPath) => {
  const parts = imagePath.split(/[\\/]/);
  const outputPath = `${path.dirname(logoPath)}/${parts[parts.length - 1]}`;


  // Read the foreground image dimensions
  await Promise.all([
    sharp(imagePath).metadata(),
    sharp(logoPath).metadata(),
  ])
    .then(([backgroundMetadata, foregroundMetadata]) => {
      const backgroundHeight = backgroundMetadata.height;
      const foregroundHeight = foregroundMetadata.height;

      // Calculate the coordinates to place the foreground image at the bottom left corner
      const left = 50; // Left corner
      const top = backgroundHeight - foregroundHeight - 50; // Bottom corner

      // Composite the foreground image onto the background image
      sharp(imagePath)
        .composite([{ input: logoPath, top, left }])
        .toFile(outputPath, (err, info) => {
          if (err) {
            dialog.showErrorBox('Error', 'Failed to generate images');
          } else {
          }
        });
    })
    .catch((err) => {
      dialog.showErrorBox('Error', 'Failed to generate images');
    });
};

async function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile('index.html');

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  let imagesPath;
  let logoPath;

  app.on('activate', function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  ipcMain.on('imagesBtnClick', async (event, arg) => {
    const result = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] });
    if (!result.canceled && result.filePaths.length > 0) {
      imagesPath = result.filePaths;
    }
    // Perform actions here when the button is clicked
  });

  ipcMain.on('logoBtnClick', async (event, arg) => {
    const result = await dialog.showOpenDialog({ properties: ['openFile'] });
    console.log('result.filePaths', result.filePaths);
    if (!result.canceled && result.filePaths.length > 0) {
      logoPath = result.filePaths[0];
    }
    // Perform actions here when the button is clicked
  });

  ipcMain.on('generateBtnClick', async () => {
    for (let i = 0; i < imagesPath.length; i++) {
      await manipulateImage(imagesPath[i], logoPath);
    }
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
