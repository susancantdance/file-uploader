const db = require("../db/queries");
const { validationResult } = require("express-validator");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: "dnhptebmt",
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
  secure: true,
});

async function filesGet(req, res, next) {
  console.log(req.baseUrl);
  console.log(req.originalUrl);
  console.log(req.path);

  console.log("req.query.folder");
  console.log(req.query.folder);

  let currfolder;
  let path = [];
  let files = [];
  let subfolders = [];
  let textPath = [];
  let folder = {};

  if (req.query.folder) {
    currfolder = await db.getFolderById(Number(req.query.folder));
    console.log(currfolder);
    console.log(currfolder.name);
    if (currfolder) {
      path = currfolder.path.slice();
      files = currfolder.files.slice();
      subfolders = currfolder.children;

      //create text path
      let allFolders = await db.getAllFolders();
      const lookUpFolder = new Map(
        allFolders.map((fldr) => [fldr.id, fldr.name])
      );
      console.log(lookUpFolder);

      for (let i = 0; i < path.length; i++) {
        textPath.push({ id: path[i], name: lookUpFolder.get(path[i]) });
      }
      console.log(textPath);
      path = textPath.slice();
      folder = currfolder.name;
    } else {
      res.send("That folder doesnt exist!");
      return;
    }

    // path.forEach(async (folderId) => {
    //   let foldername = await db.getFolderById(folderId);
    //   textPath.push(foldername.name);
    //   console.log("TEXT PATH:");
    //   console.log(textPath);
    // });
    //     path = textPath.slice();
    // console.log(`path is now ${path}`);
  } else {
    currfolder = await db.getFolder("home");
    console.log(`currfolder is ${currfolder}`);
    if (currfolder == null) {
      currfolder = await db.addRootFolder();
    } else {
      files = currfolder.files.slice();
      subfolders = currfolder.children;
    }
    folder = currfolder.name;
  }

  console.log("currfolder");
  console.log(currfolder);
  console.log(path);

  res.render("files", {
    user: req.user,
    folder: currfolder,
    path: path,
    files: files,
    subfolders: subfolders,
  });
}

// async function getPath(folderId) {
//   await db.getFolderById(folderId).then((results) => {
//     return results;
//   });
// }

async function filesPost(req, res, next) {
  //   console.log(req.file, req.body);
  //   const folder = await db.getFolderById(req.body.currentfolder);
  //   console.log(`folder ${folder.id}`);
  console.log(req.file);

  console.log(cloudinary.config());

  let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
      let stream = cloudinary.uploader.upload_stream((error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      });

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
  };

  let result_obj;
  async function upload(req) {
    result_obj = await streamUpload(req);
    console.log(result_obj);
  }
  await upload(req);

  await db.filesPost(
    req.file.originalname,
    Number(req.body.currentfolder), //id
    req.file.size,
    result_obj.secure_url
  );
  res.redirect("/files?folder=" + req.body.currentfolder);
}

async function folderPost(req, res, next) {
  //   console.log("in folderpost in controller");
  //   console.log("req.body.currentfolder");
  //   console.log(req.body.currentfolder);
  //   const currfolder = await db.getFolderById(req.body.currentfolder);
  //   console.log("currfolder");
  //   console.log(currfolder);
  //   //   const newpath = currfolder.path.push(req.body.newfolder);
  //   console.log("newpath");
  //   console.log(newpath);
  await db.folderPost(Number(req.body.currentfolder), req.body.newfolder);
  //   const newfolder = await db.getFolder(req.body.newfolder);

  res.redirect("/files?folder=" + req.body.currentfolder);
  //   res.render("files", {
  //     user: req.user,
  //     folder: req.body.newfolder,
  //     path: newpath,
  //   });
}

async function folderDelete(req, res, next) {
  let folder = await db.getFolderById(Number(req.body.folderid));
  //   console.log("folder");
  //   console.log(folder);

  await db.deleteFolder(req.body.folderid);
  res.redirect("/files?folder=" + folder.parentId);
}

async function folderRename(req, res, next) {
  await db.renameFolder(
    Number(req.body.folderid),
    req.body.oldname,
    req.body.newname
  );
  res.redirect("/files?folder=" + req.body.folderid);
}

async function fileDetailGet(req, res, next) {
  const fileId = req.query.file;
  const fileInfo = await db.getFileDetail(fileId);
  res.render("filedetail", { file: fileInfo });
}

async function fileDownload(req, res, next) {
  console.log(req.body.filepath);
  const path = req.body.filepath;
  res.redirect(path);
}

module.exports = {
  filesGet,
  filesPost,
  folderPost,
  folderDelete,
  folderRename,
  fileDetailGet,
  fileDownload,
};
