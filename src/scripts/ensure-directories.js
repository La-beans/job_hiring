const fs = require("fs")
const path = require("path")

// Ensure public/images directory exists
const imagesDir = path.join(__dirname, "..", "public", "images")
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true })
  console.log("Created images directory")
}

// Create a default avatar image if it doesn't exist
const avatarPath = path.join(imagesDir, "avatar.png")
if (!fs.existsSync(avatarPath)) {
  // This is a simple placeholder. In a real app, you'd want to copy an actual image file
  fs.writeFileSync(avatarPath, "placeholder")
  console.log("Created placeholder avatar image")
}

console.log("Directory setup complete")

