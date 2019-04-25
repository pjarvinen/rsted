
var plussaGuiFileManager = (function() {

  var userProjects = new Map(); // All user projects.
  var projectJSONs = new Map(); // Root file trees of every loaded user project.
  var folderJSONs = new Map(); // Project id keys map folder JSON maps, which in turn have folder paths as keys.
  var fileJSONs = new Map(); // All downloaded file contents with file id (SHA value) keys.

  function findFileJSON(fileId) {
    var file = fileJSONs.get(fileId);
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

  function deleteFileMetaData(projectId, filePath) {
    console.log("Before: \n"+JSON.stringify(findFolderForFile(projectId, filePath)));
    var folderJSONarray = findFolderForFile(projectId, filePath);
    var i = 0;
    var l = folderJSONarray.length;
    for(i = 0; i < l; ++i) {
      if(folderJSONarray[i].path == filePath) {
        folderJSONarray.splice(i, 1);
        var lastIndexOfSlash = filePath.lastIndexOf('/');
        if(lastIndexOfSlash == -1) {
          // Update project root folder.
          projectJSONs.set(projectId, folderJSONarray);
        }
        else {
          // Update project sub folder.
          var folderPath = filePath.substring(0, lastIndexOfSlash);
          (folderJSONs.get(projectId)).set(folderPath, folderJSONarray);
        }
        console.log("After: \n"+JSON.stringify(findFolderForFile(projectId, filePath)));
        return true;
      }
    }
    return false;
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

  var saveFolderJSON = function(projectId, path, content) {;
    if(!folderJSONs.has(projectId)) {
      // No previous sub folders loaded for this project id, make a new entry
      folderJSONs.set(projectId, new Map());
    }
    (folderJSONs.get(projectId)).set(path, content);
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

  var saveFileJSON = function(fileJSON) {
    fileJSONs.set(fileJSON.sha, fileJSON);
  }

  var isFileLoaded = function(fileId) {
    var result = findFileJSON(fileId);
    if(result) {
      return result.content;
    }
    else {
      return false;
    }
  }

  var updateAfterFileDelete = function(projectId, fileMeta) {
    fileJSONs.delete(fileMeta.id); // Remove file content.
    deleteFileMetaData(projectId, fileMeta.path);
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
      isFileLoaded: isFileLoaded
  };
})();
