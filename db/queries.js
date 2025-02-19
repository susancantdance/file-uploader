const { PrismaClient } = require("@prisma/client");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { check } = require("prisma");

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
      path: [],
    },
  });
  return folder;
}

async function filesPost(filename, folderid, size, path) {
  console.log("filespost func");
  await prisma.files.create({
    data: {
      filename: filename,
      folderId: folderid,
      size: size,
      path: path,
    },
  });
}

async function getFolderId(foldername) {
  console.log("getfolderId");
  const folder = await prisma.folder.findUnique({
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
  newpath.push(currfolder.name);

  console.log("newpath");
  console.log(newpath);
  await prisma.folder.create({
    data: {
      parentId: currfolder_id,
      name: newfolder_name,
      path: newpath,
    },
  });
  //   await prisma.folder.update({
  //     where: {
  //         id: currfolder_id,
  //     },
  //     data: {

  //     }
  //   })
}

async function deleteFolder(foldername) {
  await prisma.folder.delete({
    where: {
      name: foldername,
    },
  });
}

async function getFiles(folder) {
  const folder_obj = await prisma.folder.findUnique({
    where: {
      name: folder,
    },
    select: {
      files: true,
    },
  });

  return folder_obj.files;
}

async function renameFolder(oldname, newname) {
  let folderObj = await prisma.folder.findUnique({
    where: {
      name: oldname,
    },
    select: {
      path: true,
      id: true,
      children: true,
    },
  });

  await prisma.folder.update({
    where: {
      name: oldname,
    },
    data: {
      name: newname,
    },
  });

  //are there children? If YES:
  if (folderObj.children.length > 0) {
    console.log("there are children");

    let id = folderObj.id;
    const getPath = await prisma.folder.findFirst({
      where: {
        parentId: id,
      },
      select: {
        path: true,
      },
    });

    let newpath = getPath.path.slice();
    let index = newpath.indexOf(oldname);
    newpath[index] = newname;

    await prisma.folder.updateMany({
      where: {
        parentId: id,
      },
      data: {
        path: newpath,
      },
    });
  }
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
  getFolderId,
  folderPost,
  getFiles,
  deleteFolder,
  renameFolder,
  getFileDetail,
  //   getSubFolders,
};
