
var plussaGuiGitlabRest = (function() {

  var init = function(settings) {
    plussaGuiGitlabRest.baseUrl = settings.baseUrl;
    plussaGuiGitlabRest.errorCallback = settings.errorCallback;
  };

  var privateToken = "";
  var commitActions = [];

  function doRestQuery(url, privateToken, method, data, success) {
    // Using the core $.ajax() method
    $.ajax({
      // The URL for the request
      url: url,
      // The data to send (will be converted to a query string)
      data: data,
      // Whether this is a POST or GET request
      type: method,
      // The type of data we expect back
      dataType: "json",
      // Additional header key-value pairs,
      //contentType: "application/json",
      //processData: false,
      headers: {
        "Content-Type": "application/json",
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
    //console.log("url: "+url+"\ntoken: "+plussaGuiGitlabRest.privateToken+"method: POST\ndata: "+JSON.stringify(data));
    doRestQuery(url, plussaGuiGitlabRest.privateToken, "POST", data, callback);
  }

  var loadProjectsInfo = function(userId, privateToken, callback) {
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

  var loadFile = function(projectId, fileSHA, callback) {
    var url = plussaGuiGitlabRest.baseUrl + "projects/" + projectId + "/repository/blobs/" + fileSHA;
    doRestQuery(url, plussaGuiGitlabRest.privateToken, "GET", {}, callback);
  }

  var newFile = function(projectId, branch, path, content, callback) {
    var commitData = [{
      action: "create",
      file_path: path,
      content: btoa(content),
      encoding: "base64"
    }];
    var message = "Created new file: "+path;
    doCommit(projectId, branch, message, commitData, callback);
  }

  var updateFile = function(projectId, branch, path, content, callback) {
    var commitData = [{
      action: "update",
      file_path: path,
      content: btoa(content),
      encoding: "base64"
    }];
    var message = "Updated file: "+path;
    doCommit(projectId, branch, message, commitData, callback);
  }

  var moveFile = function() {

  }

  var deleteFile = function() {

  }

  var renameFolder = function() {

  }

  var deleteFolder = function() {

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
      deleteFolder: deleteFolder

  };
})();

$( document ).ready(function() {
  plussaGuiGitlabRest.init({
		baseUrl: plussaGuiSettings.baseRestUrl,
    errorCallback: plussaGuiSettings.errorCallback
	});
});
