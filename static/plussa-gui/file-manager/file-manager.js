
var plussaGuiFileManager = (function() {

  var userProjects = new Map(); // All user projects.
  var projectJSONs = new Map(); // Root file trees of every loaded user project.
  var folderJSONs = new Map(); // Project id keys map folder JSON maps, which in turn have folder paths as keys.
  var fileJSONs = new Map(); // All downloaded file contents with (projectId + filepath) keys.

  /* Helper function for sorting files and folders. */
  function compareItems(a, b) {
    if(a.type == 'tree') {
      if(b.type != 'tree') {
        return -1;
      }
      else {
        return a.name > b.name;
      }
    }
    else {
      if(b.type == 'blob') {
        return a.name > b.name;
      }
      else {
        return 1;
      }
    }
  }

  function findFileJSON(key) {
    var file = fileJSONs.get(key);
    if(file != undefined) {
      return file;
    }
    else {
      return false;
    }
  }

  function findFolder(projectId, folderPath) {
    var projectFolders = folderJSONs.get(projectId);
    if(projectFolders != undefined) {
      var folder = projectFolders.get(folderPath);
      if(folder != undefined) {
        return folder;
      }
    }
    return false;
  }

  function findUserProject(projectId) {
    var project = userProjects.get(projectId);
    if(project != undefined) {
      return project;
    }
    else {
      return false;
    }
  }

  function findProjectRootFolder(projectId) {
    var rootFolder = projectJSONs.get(projectId);
    if(rootFolder != undefined) {
      return rootFolder;
    }
    else {
      return false;
    }
  }

  function findFoldersForProject(projectId) {
    var projectFolders = folderJSONs.get(projectId);
    if(projectFolders != undefined) {
      return projectFolders; // Map with folder paths as keys
    }
    else {
      return folder;
    }
  }

  function findFolderForFile(projectId, filePath) {
    var lastIndexOfSlash = filePath.lastIndexOf('/');
    /* Check if the file resides in the project root folder i.e. if it does not
     * have a slash character in the file path. */
    if(lastIndexOfSlash == -1) {
      return findProjectRootFolder(projectId); // Get the project root folder.
    }
    else {
      var folderPath = filePath.substring(0, lastIndexOfSlash);
      return findFolder(projectId, folderPath);
    }
  }

  function deleteMetaData(projectId, path) {
    console.log("Before: \n"+JSON.stringify(findFolderForFile(projectId, path)));
    var folderJSONarray = findFolderForFile(projectId, path);
    var fileTreeUpdatePath = "";
    var i = 0;
    var l = folderJSONarray.length;
    for(i = 0; i < l; ++i) {
      if(folderJSONarray[i].path == path) {
        folderJSONarray.splice(i, 1);
        var lastIndexOfSlash = path.lastIndexOf('/');
        if(lastIndexOfSlash == -1) {
          // Update project root folder.
          projectJSONs.set(projectId, folderJSONarray);
        }
        else {
          // Update project sub folder.
          var folderPath = path.substring(0, lastIndexOfSlash);
          if(folderJSONarray.length == 0) {
            // Remove empty metadata folder.
            (folderJSONs.get(projectId)).delete(folderPath);
            // Remove folder metadata from its parent folder
            deleteMetaData(projectId, folderPath);
          }
          else {
            (folderJSONs.get(projectId)).set(folderPath, folderJSONarray);
          }
        }
        console.log("After: \n"+JSON.stringify(findFolderForFile(projectId, path)));
        return true;
      }
    }
    return false;
  }

  var saveFolderJSON = function(projectId, path, content) {;
    if(!folderJSONs.has(projectId)) {
      // No previous sub folders loaded for this project id, make a new entry.
      folderJSONs.set(projectId, new Map());
    }
    (folderJSONs.get(projectId)).set(path, content);
  }

  function saveNewMetaData(projectId, filePath) {
    var newFileMetaJSON = {
      id: 0,
      name: "",
      type: "blob",
      path: filePath,
      mode: "100644"
    }
    var pathInfo = explodeFilePath(filePath);
    /* If the file has no folder path it resides in the project root folder. */
    if(!pathInfo) {
      newFileMetaJSON.name = filePath;
      (projectJSONs.get(projectId)).push(newFileMetaJSON); // Add new file meta data JSON to the project root folder.
      (projectJSONs.get(projectId)).sort(compareItems);
    }
    else {
      newFileMetaJSON.name = pathInfo[1];
      var folderJSON = findFolder(projectId, pathInfo[0]);
      if(!folderJSON) {
        /* No existing folder, save new folder metadata to the parent folder AND
         * a new entry to the folder metadata map.
         */
        var newFolderMetaJSON = {
          id: 0,
          name: "",
          type: "tree",
          path: pathInfo[0],
          mode: "040000"
        }
        var folderInfo = explodeFilePath(pathInfo[0]);
        if(!folderInfo) {
          // New subfolder for project root folder.
          newFolderMetaJSON.name = pathInfo[0];
          (projectJSONs.get(projectId)).push(newFolderMetaJSON);
          (projectJSONs.get(projectId)).sort(compareItems);
        }
        else {
          newFolderMetaJSON.name = folderInfo[1];
          ((folderJSONs.get(projectId)).get(folderInfo[0])).push(newFolderMetaJSON);
          ((folderJSONs.get(projectId)).get(folderInfo[0])).sort(compareItems);
        }
        // Create a new array of file metadata JSON items with a new folder path as map key
        if(folderJSONs.has(projectId)) {
          (folderJSONs.get(projectId)).set(pathInfo[0], [newFileMetaJSON]);
        }
        else {
          /* No project subfolders have been downloaded yet. Create new folderJSONs
           * entry for the project.
           */
           saveFolderJSON(projectId, pathInfo[0], [newFileMetaJSON]);
        }
      }
      else {
        // Add file metadata to existing metadata array
        folderJSON.push(newFileMetaJSON);
        folderJSON.sort(compareItems);
      }
    }
  }

  // Save user's GitLab projects as a map with project id keys
  var setUserProjects = function(projectsMetaJSON) {
    for(i in projectsMetaJSON) {
      userProjects.set(""+projectsMetaJSON[i].id, projectsMetaJSON[i]);
    }
  }

  var saveProjectJSON = function(projectId, fileTreeJSON) {
    projectJSONs.set(projectId, fileTreeJSON);
  }

  var getProjectMetaData = function(projectId) {
    var projectMeta = findUserProject(projectId);
    if(projectMeta) {
      return {
        id: projectId,
        name: projectMeta.name,
        default_branch: projectMeta.default_branch,
        created_at: projectMeta.created_at,
        last_activity_at: projectMeta.last_activity_at,
        owner_name: projectMeta.owner.name
      }
    }
    return false;
  }

  var isProjectLoaded = function(projectId) {
    return findProjectRootFolder(projectId);
  }

  var isFolderLoaded = function(projectId, path) {
    return findFolder(projectId, path);
  }

  var getFileMetaData = function(projectId, filePath) {
    var folderJSON = findFolderForFile(projectId, filePath);
    if(folderJSON) {
      for(item in folderJSON) {
        if(folderJSON[item].path == filePath) {
          return folderJSON[item]; // File meta data.
        }
      }
    }
    else {
      return false;
    }
  }

  var saveFileJSON = function(projectId, path, fileJSON) {
    var key = projectId + path;
    fileJSONs.set(key, fileJSON);
  }

  function saveNewFileJSON(key, newContent) {
    var fileJSON = {
      size: newContent.length,
      encoding: "base64",
      content: btoa(newContent),
      sha:0
    }
    fileJSONs.set(key, fileJSON);
  }

  function updateFileJSON(key, newContent) {
    var file = fileJSONs.get(key);
    file.size = newContent.length;
    file.content = btoa(newContent);
    file.sha = 0;
    fileJSONs.set(key, file);
  }

  var isFileLoaded = function(projectId, path) {
    var result = findFileJSON(projectId + path);
    if(result) {
      return result.content;
    }
    else {
      return false;
    }
  }

  var updateAfterFileDelete = function(projectId, filePath) {
    var key = projectId + filePath;
    fileJSONs.delete(key); // Remove file content from File Manager.
     return deleteMetaData(projectId, filePath);
  }

  var updateAfterFileSave = function(projectId, filePath, newContent) {
    var key = projectId + filePath;
    // Update file content if the file path for the project exists.
    if(fileJSONs.has(key)) {
      updateFileJSON(key, newContent);
    }
    else {
      saveNewFileJSON(key, newContent);
      saveNewMetaData(projectId, filePath);
    }
  }

  /*
   * Helper function that returns filepath data as [folder path, filename] if possible.
   */
  var explodeFilePath = function(filePath) {
    if(filePath.length == 0) {
      return false;
    }
    var lastIndexOfSlash = filePath.lastIndexOf('/');
    if(lastIndexOfSlash != -1) {
      return [filePath.substring(0, lastIndexOfSlash), filePath.substring(lastIndexOfSlash+1, filePath.length)];
    }
    else {
      return false;
    }
  }

  // Public File Manager API
  return {
      setUserProjects: setUserProjects,
      saveProjectJSON: saveProjectJSON,
      getProjectMetaData: getProjectMetaData,
      saveFolderJSON: saveFolderJSON,
      isProjectLoaded: isProjectLoaded,
      isFolderLoaded: isFolderLoaded,
      getFileMetaData: getFileMetaData,
      saveFileJSON: saveFileJSON,
      updateAfterFileDelete: updateAfterFileDelete,
      updateAfterFileSave: updateAfterFileSave,
      isFileLoaded: isFileLoaded,
      explodeFilePath: explodeFilePath
  };
})();
