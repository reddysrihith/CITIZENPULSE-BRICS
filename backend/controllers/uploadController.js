const { uploadDataUri } = require('../services/cloudinaryService');

// @desc    Upload a base64 data URI to Cloudinary
// @route   POST /api/uploads
// @access  Private
exports.uploadFile = async (req, res, next) => {
  try {
    const { dataUri, folder, resourceType, publicId } = req.body;

    if (!dataUri || typeof dataUri !== 'string' || !dataUri.startsWith('data:')) {
      return res.status(400).json({ success: false, message: 'A base64 dataUri is required' });
    }

    const result = await uploadDataUri({
      dataUri,
      folder: folder || `skillsphere/${req.user.role}`,
      resourceType: resourceType || 'auto',
      publicId,
    });

    res.status(201).json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type,
        bytes: result.bytes,
        format: result.format,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};
