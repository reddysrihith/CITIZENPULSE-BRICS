const cloudinary = require('cloudinary').v2;

const hasCloudinaryConfig = () => Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

const configureCloudinary = () => {
  if (!hasCloudinaryConfig()) return false;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return true;
};

const uploadDataUri = async ({ dataUri, folder = 'skillsphere', resourceType = 'auto', publicId }) => {
  if (!configureCloudinary()) {
    const error = new Error('Cloudinary credentials are not configured');
    error.statusCode = 503;
    throw error;
  }

  return cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: resourceType,
    public_id: publicId,
    overwrite: false,
  });
};

module.exports = {
  hasCloudinaryConfig,
  uploadDataUri,
};
