const { Router } = require("express");
const { body } = require("express-validator");
const fileRouter = Router();
const controller = require("../controllers/fileController");
const multer = require("multer");
var path = require("path");
// const handleUpload = require("./helper").handleUpload;

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "https://api.cloudinary.com/v1_1/dnhptebmt/auto/upload");
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, preservePath: true });

fileRouter.get("/", controller.filesGet);

fileRouter.post(
  "/upload",
  upload.single("uploaded_file"),
  controller.filesPost
);

fileRouter.post("/deletefolder", controller.folderDelete);

fileRouter.post("/createfolder", controller.folderPost);

fileRouter.post("/renamefolder", controller.folderRename);

fileRouter.get("/details", controller.fileDetailGet);

fileRouter.post("/download", controller.fileDownload);

module.exports = { fileRouter };
