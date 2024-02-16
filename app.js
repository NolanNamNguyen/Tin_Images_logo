const {dialog} = require('electron');
const sharp = require('sharp');
const fs = require('fs');

// Function to open file dialog and select an image
const selectImage = async () => {
    try {
        const result = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{name: 'Images', extensions: ['jpg', 'png', 'gif']}],
        });

        if (!result.canceled && result.filePaths.length > 0) {
            const imagePath = result.filePaths[0];
            manipulateImage(imagePath);
        }
    } catch (error) {
        console.error('Error selecting image:', error);
    }
};

// Function to manipulate the selected image using sharp
const manipulateImage = async (imagePath) => {
    try {
        const buffer = await fs.promises.readFile(imagePath);
        const manipulatedImage = await sharp(buffer)
            .resize(300, 200)
            .toBuffer();

        // Save or display manipulated image as needed
        // For example, save manipulated image to a file
        fs.writeFile('manipulated-image.jpg', manipulatedImage, (err) => {
            if (err) throw err;
            console.log('Manipulated image saved successfully');
        });
    } catch (error) {
        console.error('Error manipulating image:', error);
    }
};

// Call the function to select an image when the script is executed
selectImage();