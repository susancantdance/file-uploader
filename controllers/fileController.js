const db = require("../db/queries");
const { validationResult } = require("express-validator");

async function filesGet(req, res, next) {
  console.log(req.baseUrl);
  console.log(req.originalUrl);
  console.log(req.path);
  //   await db.addRootFolder();
  //   let path = "home";
  //   let folder = "home";
  //   let subfolders = [];
  console.log("req.query.folder");
  console.log(req.query.folder);

  let currfolder;
  let path = [];
  let files = [];

  if (req.query.folder) {
    currfolder = await db.getFolderId(req.query.folder);
    path = currfolder.path.slice();
    files = currfolder.files.slice();
  } else {
    currfolder = await db.getFolderId("home");
    console.log(`currfolder is ${currfolder}`);
    if (currfolder == undefined) {
      currfolder = await db.addRootFolder();
    }
    files = currfolder.files.slice();
  }

  const folder = currfolder.name;
  const subfolders = currfolder.children;

  console.log("currfolder");
  console.log(currfolder);

  console.log(`files.length ${files.length}`);

  res.render("files", {
    user: req.user,
    folder: folder,
    path: path,
    files: files,
    subfolders: subfolders,
  });
}
async function filesPost(req, res, next) {
  console.log(req.file, req.body);
  const folder = await db.getFolderId(req.body.currentfolder);
  console.log(`folder ${folder.id}`);
  await db.filesPost(
    req.file.originalname,
    folder.id,
    req.file.size,
    req.file.path
  );
  res.redirect("/files?folder=" + folder.name);
}

async function folderPost(req, res, next) {
  console.log("in folderpost in controller");
  console.log("req.body.currentfolder");
  console.log(req.body.currentfolder);
  const currfolder = await db.getFolderId(req.body.currentfolder);
  console.log("currfolder");
  console.log(currfolder);
  //   const newpath = currfolder.path.push(req.body.newfolder);
  //   console.log("newpath");
  //   console.log(newpath);
  await db.folderPost(currfolder.id, req.body.newfolder);
  //   const newfolder = await db.getFolderId(req.body.newfolder);

  res.redirect("/files?folder=" + req.body.currentfolder);
  //   res.render("files", {
  //     user: req.user,
  //     folder: req.body.newfolder,
  //     path: newpath,
  //   });
}

async function folderDelete(req, res, next) {
  let folder = await db.getFolderId(req.body.foldername);
  console.log("folder");
  console.log(folder);
  let parentfolder = folder.parent;

  await db.deleteFolder(folder.name);
  res.redirect("/files?folder=" + parentfolder.name);
}

async function folderRename(req, res, next) {
  await db.renameFolder(req.body.oldname, req.body.newname);
  res.redirect("/files?folder=" + req.body.newname);
}

async function fileDetailGet(req, res, next) {
  const fileId = req.query.file;
  const fileInfo = await db.getFileDetail(fileId);
  res.render("filedetail", { file: fileInfo });
}

async function fileDownload(req, res, next) {
  const path = req.body.filepath;
  res.download(path);
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
