const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../../uploads');
const certificatesDir = path.join(uploadsDir, 'certificates');
const avatarsDir = path.join(uploadsDir, 'avatars');
const mediaDir = path.join(uploadsDir, 'media');

[uploadsDir, certificatesDir, avatarsDir, mediaDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

module.exports = {
  uploadsDir,
  certificatesDir,
  avatarsDir,
  mediaDir
};
