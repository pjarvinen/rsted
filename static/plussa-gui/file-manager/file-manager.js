
var plussaGuiFileManager = (function() {

  var userProjects = [];
  var projectFiles = [];
  var fileTreeHTMLbits = {
    root: function(insertStatic) { return '<ul class="jqueryFileTree" style="display: none;">'+insertStatic+'</ul>'; },
    folderRoot: function(insert) { return '<li class="directory collapsed">'+insert+'</li>'; },
    itemLink: function(path, itemName) { return '<a href="#" rel="'+path+'">'+itemName+'</a>'; },
    rstFileRoot: function(insert) { return '<li class="file ext_rst">'+insert+'</li>'; },
    otherFileRoot: function(extension, insert) { return '<li class="file ext_'+extension+'">'+insert+'</li>'; }
  }

  // Set projects' JSON and return a FileTree HTML String to be added to the web page
  var setUserProjects = function(projects) {
    userProjects = projects;
    var fileTreeHTML = '';
    var i = 0;
    var l = userProjects.length;
    for(i = 0; i < l; ++i) {
      fileTreeHTML += fileTreeHTMLbits.folderRoot(fileTreeHTMLbits.itemLink(userProjects[i].path, userProjects[i].name));
    }
    return fileTreeHTMLbits.root(fileTreeHTML);
  };

  var getUserProjects = function() {
    return plussaGuiFileManager.userProjects;
  };

  // Public File Manager API
  return {
      setUserProjects: setUserProjects,
      getUserProjects: getUserProjects
  };
})();
