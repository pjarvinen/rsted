
var plussaGuiGitlabRest = (function() {

  var init = function(settings) {
    plussaGuiGitlabRest.baseUrl = settings.baseUrl;
    plussaGuiGitlabRest.errorCallback = settings.errorCallback;
  };

  var privateToken = "";
  var userId = "";
  var userId = 0;
  var commitActions = [];

  function doRestQuery(url, privateToken, method, data, success) {
    // Using the core $.ajax() method
    $.ajax({
      // The URL for the request
      url: url,
      // The data to send (will be converted to a query string)
      data: JSON.stringify(data),
      // Whether this is a POST or GET request
      type: method,
      // The type of data we expect back
      dataType: "json",
      crossDomain: true,
      contentType: "application/json",
      processData: false,
      // Additional header key-value pairs
      headers: {
        "PRIVATE-TOKEN": privateToken
      }
    })
      // Code to run if the request succeeds (is done).
      // The response is passed to the callback function
      .done(function( json ) {
         success(json);
      })
      // Code to run if the request fails.
      // Status codes and error data are passed to the callback function
      .fail(function( xhr, status, errorThrown ) {
        plussaGuiGitlabRest.errorCallback(status, errorThrown);
      });
  }

  function doCommit(projectId, branch, message, commitData, callback) {
    var url = plussaGuiGitlabRest.baseUrl + "projects/" + projectId + "/repository/commits";
    var data = {
      id: projectId,
      branch: branch,
      commit_message: message,
      actions: commitData
    }
    //console.log("url: "+url+"\ntoken: "+plussaGuiGitlabRest.privateToken+"\nmethod: POST\ndata: "+JSON.stringify(data));
    doRestQuery(url, plussaGuiGitlabRest.privateToken, "POST", data, callback);
  }

  var loadProjectsInfo = function(userId, privateToken, callback) {
    plussaGuiGitlabRest.userId = userId;
    plussaGuiGitlabRest.privateToken = privateToken;
    var url = plussaGuiGitlabRest.baseUrl + "users/" + userId + "/projects";
    doRestQuery(url, privateToken, "GET", {}, callback);
  }

  var loadOneProject = function(projectId, callback) {
    var url = plussaGuiGitlabRest.baseUrl + "projects/" + projectId + "/repository/tree";
    doRestQuery(url, plussaGuiGitlabRest.privateToken, "GET", {}, callback);
  }

  var loadFolder = function(projectId, path, callback) {
    var url = plussaGuiGitlabRest.baseUrl + "projects/" + projectId + "/repository/tree?path=" + path;
    doRestQuery(url, plussaGuiGitlabRest.privateToken, "GET", {}, callback);
  }

  var loadFile = function(projectId, filePath, branch, callback) {
    var url = plussaGuiGitlabRest.baseUrl + "projects/" + projectId + "/repository/files/" + encodeURIComponent(filePath).replace('.', '%2E') + '?ref='+branch;
    console.log("Load file from: \n"+url);
    doRestQuery(url, plussaGuiGitlabRest.privateToken, "GET", {}, callback);
  }

  var newFile = function(projectId, branch, filePath, content, callback) {
    var url = plussaGuiGitlabRest.baseUrl + "projects/" + projectId + "/repository/files/" + encodeURIComponent(filePath).replace('.', '%2E');
    var commitData = {
      branch: branch,
      content: btoa(content),
      encoding: "base64",
      commit_message: "Created file: "+filePath
    };
    doRestQuery(url, plussaGuiGitlabRest.privateToken, "POST", commitData, callback);
  }

  var updateFile = function(projectId, branch, filePath, content, callback) {
    var url = plussaGuiGitlabRest.baseUrl + "projects/" + projectId + "/repository/files/" + encodeURIComponent(filePath).replace('.', '%2E');
    var commitData = {
      branch: branch,
      content: btoa(content),
      encoding: "base64",
      commit_message: "Updated file: "+filePath
    };
    console.log("Updating to: \n"+url+"\nData: "+JSON.stringify(commitData));
    doRestQuery(url, plussaGuiGitlabRest.privateToken, "PUT", commitData, callback);
  }

  var moveFile = function() {

  }

  var deleteFile = function(projectId, branch, filePath, callback) {
    var url = plussaGuiGitlabRest.baseUrl + "projects/" + projectId + "/repository/files/" + encodeURIComponent(filePath).replace('.', '%2E');
    var commitData = {
      branch: branch,
      commit_message: "Deleted file: "+filePath
    };
    console.log("Deleting: \n"+url+"\nData: "+JSON.stringify(commitData));
    doRestQuery(url, plussaGuiGitlabRest.privateToken, "DELETE", commitData, callback);
  }

  var renameFolder = function() {

  }

  var deleteFolder = function() {

  }

  var getUserCredentials = function() {
    return {
      userId: userId,
      privateToken: privateToken
    }
  }

  // Public REST Query API
  return {
      init: init,
      loadProjectsInfo: loadProjectsInfo,
      loadOneProject: loadOneProject,
      loadFolder: loadFolder,
      loadFile: loadFile,
      newFile: newFile,
      updateFile: updateFile,
      moveFile: moveFile,
      deleteFile: deleteFile,
      renameFolder: renameFolder,
      deleteFolder: deleteFolder,
      getUserCredentials: getUserCredentials
  };
})();