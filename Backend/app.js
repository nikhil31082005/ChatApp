const { createCanvas } = require("canvas");

function generateProfilePicture(name) {
    const width = 200; // Image width
    const height = 200; // Image height
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");

    // Extract the first character of the name
    const firstChar = name.charAt(0).toUpperCase();

    // Generate a background color based on the name
    const hash = name.split("").reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const color = `hsl(${hash % 360}, 70%, 50%)`; // Use HSL for vibrant colors

    // Fill the background
    context.fillStyle = color;
    context.fillRect(0, 0, width, height);

    // Add the text
    context.font = "bold 100px Arial";
    context.fillStyle = "#ffffff"; // White text
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(firstChar, width / 2, height / 2);

    // Return the image as a data URL
    return canvas.toDataURL();
}

// Example usage
const name = "John Doe";
const profilePicture = generateProfilePicture(name);
console.log(profilePicture); // Outputs a data URL for the image