const { PrismaClient } = require("@prisma/client");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
// const { check } = require("prisma");

const prisma = new PrismaClient();

async function deserialize(user_id) {
  const user = await prisma.username.findUnique({
    where: {
      id: user_id,
    },
  });

  return user;
}

async function checkUserExists(username) {
  const user = await prisma.username.findUnique({
    where: {
      username: username,
    },
  });

  return user;
}

async function postSignup(usernm, pw) {
  console.log("postSignup function");
  await prisma.username.create({
    data: {
      username: usernm,
      password: pw,
    },
  });
}

async function addRootFolder() {
  console.log("addrootfoler");
  const folder = await prisma.folder.create({
    data: {
      name: "home",
    },
  });

  return folder;
}

async function filesPost(filename, folderid, size, cloudPath) {
  console.log("filespost func");
  await prisma.files.create({
    data: {
      filename: filename,
      folderId: Number(folderid),
      size: size,
      cloudPath: cloudPath,
    },
  });
}

async function getFolder(foldername) {
  console.log("getfolder");
  const folder = await prisma.folder.findFirst({
    where: {
      name: foldername,
    },
    include: {
      children: true,
      files: true,
      parent: true,
    },
  });
  return folder;
}

async function getFolderById(folderId) {
  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId,
    },
    include: {
      children: true,
      files: true,
      parent: true,
    },
  });
  return folder;
}

async function getAllFolders() {
  const folders = await prisma.folder.findMany();
  return folders;
}

async function folderPost(currfolder_id, newfolder_name) {
  let currfolder = await prisma.folder.findUnique({
    where: {
      id: currfolder_id,
    },
    select: {
      path: true,
      name: true,
    },
  });

  let newpath = currfolder.path.slice();
  newpath.push(currfolder_id);

  console.log("newpath");
  console.log(newpath);

  try {
    await prisma.folder.create({
      data: {
        parentId: currfolder_id,
        name: newfolder_name,
        path: newpath,
      },
    });
  } catch (error) {
    console.log("ERROR!");
    console.log(error);
  }
  //   await prisma.folder.update({
  //     where: {
  //         id: currfolder_id,
  //     },
  //     data: {

  //     }
  //   })
}

async function deleteFolder(folderid) {
  await prisma.folder.delete({
    where: {
      id: Number(folderid),
    },
  });
}

// async function getFiles(folder) {
//   const folder_obj = await prisma.folder.findUnique({
//     where: {
//       name: folder,
//     },
//     select: {
//       files: true,
//     },
//   });

//   return folder_obj.files;
// }

async function renameFolder(folderid, oldname, newname) {
  await prisma.folder.update({
    where: {
      id: folderid,
    },
    data: {
      name: newname,
    },
  });

  //are there children? If YES:
  // if (folderObj.children.length > 0) {
  //   console.log("there are children");

  //   let id = folderObj.id;
  //   const getPath = await prisma.folder.findFirst({
  //     where: {
  //       parentId: id,
  //     },
  //     select: {
  //       path: true,
  //     },
  //   });

  //   let newpath = getPath.path.slice();
  //   let index = newpath.indexOf(oldname);
  //   newpath[index] = newname;

  //   await prisma.folder.updateMany({
  //     where: {
  //       parentId: id,
  //     },
  //     data: {
  //       path: newpath,
  //     },
  //   });
  // }
}

async function getFileDetail(fileId) {
  const numId = Number(fileId);
  const file = prisma.files.findUnique({
    where: {
      id: numId,
    },
  });
  return file;
}

// async function getSubFolders(folder) {
//   const folder_obj = await prisma.folder.findUnique({
//     where: {
//       name: folder,
//     },
//     select: {
//       children: true,
//     },
//   });

//   return folder_obj.children;
// }

module.exports = {
  deserialize,
  checkUserExists,
  postSignup,
  filesPost,
  addRootFolder,
  getFolder,
  folderPost,
  // getFiles,
  deleteFolder,
  renameFolder,
  getFileDetail,
  getFolderById,
  getAllFolders,
  //   getSubFolders,
};
