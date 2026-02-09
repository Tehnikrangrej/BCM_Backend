const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isPdf = file.mimetype === "application/pdf";

    return {
      folder: "bank_change_requests",
      resource_type: isPdf ? "raw" : "auto", // ⭐ IMPORTANT
      use_filename: true,
      unique_filename: true,
    };
  },
});

const upload = multer({ storage });

module.exports = upload;
