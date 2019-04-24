
var plussaGuiFileManager = (function() {

  var userProjects = []; // JSON array of all user projects.
  var projectJSONs = []; // JSON root file trees of every loaded user project.
  var folderJSONs = []; // All folder JSON objects under project root folders.
  var fileJSONs = []; // All downloaded file metadata and content.

  // Save GitLab project list JSON and return a FileTree Plugin HTML String to be added to the web page
  var setUserProjects = function(projectsMetaJSON) {
    userProjects = projectsMetaJSON;
  }

  var saveProjectJSON = function(projectId, fileTree) {
    projectJSONs.push({projectId: projectId, fileTree: fileTree});
  }

  var getProjectMetaData = function(projectId) {
    var l = userProjects.length;
    var i = 0;
    for(i = 0; i < l; ++i) {
      if(userProjects[i].id == projectId) {
        return {
          id: projectId,
          name: userProjects[i].name,
          default_branch: userProjects[i].default_branch,
          created_at: userProjects[i].created_at,
          last_activity_at: userProjects[i].last_activity_at,
          owner_name: userProjects[i].owner.name
        }
      }
    }
    return ;
  }

  var saveFolderJSON = function(projectId, path, content) {
    var i = 0;
    var l = folderJSONs.length;
    for(i = 0; i < l; ++i) {
      if(folderJSONs[i].projectId == projectId) {
        folderJSONs[i].folders.push({path: path, content: content});
        return;
      }
    }
    // No previous folders loaded for this projectId, make a new entry
    folderJSONs.push({projectId: projectId, folders: [{path: path, content: content}]});
  }

  var isProjectLoaded = function(projectId) {
    var i = 0;
    var l = projectJSONs.length;
    for(i = 0; i < l; ++i) {
      if(projectJSONs[i].projectId == projectId) {
        return projectJSONs[i].fileTree;
      }
    }
    return false;
  }

  var isFolderLoaded = function(projectId, path) {
    var i = 0, j = 0;
    var l = folderJSONs.length;
    for(i = 0; i < l; ++i) {
      if(folderJSONs[i].projectId == projectId) {
        l = folderJSONs[i].folders.length;
        for(j = 0; j < l; ++j) {
          if(folderJSONs[i].folders[j].path == path) {
            return folderJSONs[i].folders[j].content;
          }
        }
        return false;
      }
    }
    return false;
  }

  var getFileMetaData = function(projectId, folderPath, fileName) {
    var folderJSON = [];
    /* Check if the file resides in the project root folder i.e. if it has the same
     * folder path and file name parameter values. */
    var path = "";
    if(folderPath == fileName) {
      folderJSON = isProjectLoaded(projectId);
      path = folderPath;
    }
    else {
      folderJSON = isFolderLoaded(projectId, folderPath);
      path = folderPath + "/" + fileName;
    }
    if(folderJSON) {
      var i = 0;
      var l = folderJSON.length;
      for(i = 0; i < l; ++i) {
        if(folderJSON[i].path == path) {
          return folderJSON[i]; // File meta data.
        }
      }
    }
    return false;
  }

  var saveFileJSON = function(fileJSON) {
    fileJSONs.push(fileJSON);
  }

  var isFileLoaded = function(fileId) {
    var i = 0;
    var l = fileJSONs.length;
    for(i = 0; i < l; ++i) {
      if(fileJSONs[i].sha == fileId) {
        return fileJSONs[i].content;
      }
    }
    return false;
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
      isFileLoaded: isFileLoaded
  };
})();
