import multer from "multer";

const imageMimeTypes = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        if (imageMimeTypes.includes(file.mimetype)) {
            return callback(null, true);
        }

        return callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "image"));
    }
});

export const uploadProductImageFile = (req, res, next) => {
    upload.single("image")(req, res, (error) => {
        if (!error) return next();

        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "Image must be 5 MB or smaller"
            });
        }

        return res.status(400).json({
            success: false,
            message: "Please upload a JPG, PNG, or WebP image using the image field"
        });
    });
};
