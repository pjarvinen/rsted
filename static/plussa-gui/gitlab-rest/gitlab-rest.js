
var plussaGuiGitlabRest = (function() {

  var init = function(settings) {
    plussaGuiGitlabRest.baseUrl = settings.baseUrl;
    plussaGuiGitlabRest.errorCallback = settings.errorCallback;
  };

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
      // Additional header key-value pairs
      headers: {
        "PRIVATE-TOKEN": privateToken
      }
    })
      // Code to run if the request succeeds (is done);
      // The response is passed to the function
      .done(function( json ) {
         success(json);
      })
      // Code to run if the request fails; the raw request and
      // status codes are passed to the function
      .fail(function( xhr, status, errorThrown ) {
        plussaGuiGitlabRest.errorCallback(status, errorThrown);
      });
  }

  var loadProjects = function(userId, privateToken, callback) {
    var url = plussaGuiGitlabRest.baseUrl + "users/" + userId + "/projects";
    doRestQuery(url, privateToken, "GET", {}, callback);
  };

  var loadFolder = function() {

  };

  var loadFile = function() {

  };

  var newFolder = function() {

  };

  var newFile = function() {

  };

  var renameFolder = function() {

  };

  var renameFile = function() {

  };

  var deleteFolder = function() {

  };

  var deleteFile = function() {

  };

  var doCommit = function() {

  };


  // Public GitLab REST API
  return {
      init: init,
      loadProjects: loadProjects,
      loadFolder: loadFolder,
      loadFile: loadFile,
      newFolder: newFolder,
      newFile: newFile,
      renameFolder: renameFolder,
      renameFile: renameFile,
      deleteFolder: deleteFolder,
      deleteFile: deleteFile,
      doCommit: doCommit
  };
})();

$( document ).ready(function() {
  plussaGuiGitlabRest.init({
		baseUrl: plussaGuiSettings.baseRestUrl,
    errorCallback: plussaGuiSettings.errorCallback
	});
});
