
var plussaGuiFileTreeGenerator = (function() {

  /*
   * Helper functions to generate HTML code for jQuery File Tree Plugin.
   * Id attribute of the GitLab project root <li> element holds the GitLab project id value.
   */
  var fileTreeHTMLbits = {
    root: function(insert) { return '<ul class="jqueryFileTree" style="display: none;">'+insert+'</ul>'; },
    projectRoot: function(projectId, insert) { return '<li id="aPlus-'+projectId+'" class="directory collapsed">'+insert+'</li>'; },
    folderRoot: function(insert) { return '<li class="directory collapsed">'+insert+'</li>'; },
    fileRoot: function(extension, insert) { return '<li class="file ext_'+extension+'">'+insert+'</li>'; },
    fileLink: function(path, linkText) { return '<a href="#" rel="'+path+'" class="fileTreeLink">'+linkText+'</a>'; },
    // Folder operation links are generated as a dropdown list after the folder link.
    folderLink: function(path, linkText) {
      return '<a href="#" rel="'+path+'" class="fileTreeLink">'+linkText+'</a>';/*+
      Folder removal and folder renaming links not being generated.
      '<a href="#" rel="'+path+'" class="deleteFolderLink fa fa-trash" title="Delete folder '+path+'"></a>'+
      '<a href="#" rel="'+path+'" class="renameFolderLink fa" title="Rename folder '+path+'">Re</a>';*/
    }
  }

  /*
   * Generates HTML code for jQuery File Tree Plugin.
   */
  var generateFileTreeHTML = function(fileTree) {
    var fileTreeHTML = "";
    var fileMeta = [];
    var i = 0;
    var l = fileTree.length;
    for(i = 0; i < l; ++i) {
      /* If the type attribute is absent we are generating user's GitLab project list i.e. the initial root folders from a
       * GitLab User Projects JSON object.
       */
      if(fileTree[i].type == undefined) {
        fileTreeHTML += fileTreeHTMLbits.projectRoot(fileTree[i].id, fileTreeHTMLbits.fileLink(fileTree[i].path, fileTree[i].name));
      }
      /* Generate a folder root <li> element if GitLab file tree JSON item has a type attribute with 'tree' value.
       */
      else if(fileTree[i].type == 'tree') {
        fileTreeHTML += fileTreeHTMLbits.folderRoot(fileTreeHTMLbits.folderLink(fileTree[i].path, fileTree[i].name));
      }
      else {
        fileMeta = fileTree[i].name.split('.'); // To find out the file extension.
        fileTreeHTML += fileTreeHTMLbits.fileRoot(fileMeta[fileMeta.length - 1], fileTreeHTMLbits.fileLink(fileTree[i].path, fileTree[i].name));
      }
    }
    return fileTreeHTMLbits.root(fileTreeHTML);
  }

  /*
	 * Helper function that finds the project id value of the currently open
	 * GitLab project from the jQuery File Tree. Id attribute of the project
	 * root folder <li> element is set by fileTreeHTMLbits.projectRoot (above).
	 */
	var getActiveProjectId = function(node) {
		while(!$(node).parent().attr('id')) {
			node = $(node).parent();
		}
    return $(node).parent().attr('id').split('-')[1];
	}

  var induceFolderOpenClick = function(projectId, folderPath) {
    var node = $("#aPlus-"+projectId).find('a[rel="'+folderPath+'"]').parent();
    if(node.length) {
      // The folder LI element was found.
      if(!node.hasClass("collapsed")) {
        node.addClass("collapsed").children("a").click();
      }
      else {
        node.children("a").click();
      }
      return true;
    }
    else {
      return false;
    }
  }

  var induceProjectOpenClick = function(projectId) {
    var node = $("#aPlus-"+projectId);
    if(!node.hasClass("collapsed")) {
      node.addClass("collapsed").children("a").click();
    }
    else {
      node.children("a").click();
    }
  }

  var updateAfterFolderAddition = function(projectId, parentData, fileData) {
    if(!parentData) {
      induceProjectOpenClick(projectId);
    }
    else {
      induceFolderOpenClick(projectId, parentData[0]);
    }
  }

  var buildCommitListing = function(target, listingJSON) {
    var result = '<table id="plussaGuiCommitListing" class="table"><thead><tr><th scope="col">#</th><th scope="col">Date</th><th scope="col">Action</th><th scope="col">Author</th></tr></thead><tbody>';
    for(item in listingJSON) {
      result += '<tr><th scope="row">' + (parseInt(item) + 1) + '</th>';
      result += '<td>' + listingJSON[item]["created_at"].substr(0, 10) + '</td>';
      result += '<td>' + listingJSON[item]["message"] + '</td>';
      result += '<td>' + listingJSON[item]["author_name"] + '</td></tr>';
    }
    result += "</tbody></table>";
    $(target).html(result);
  }

  // HTML material for testing
  var fileTreeForTesting = function() {
    return '<ul class="jqueryFileTree" style=""><li id="aPlus-11862275" class="directory expanded"><a href="#" rel="testinen" class="fileTreeLink">Testinen</a><ul class="jqueryFileTree" style=""><li class="directory expanded"><a href="#" rel="folder1" class="fileTreeLink">folder1</a><a class="folderOpLink" title="Delete Folder" href="javascript:plussaGuiDeleteFolder(\'folder1\')">D</a><a class="folderOpLink" title="Rename Folder" href="javascript:plussaGuiRenameFolder(\'folder1\')">R</a><ul class="jqueryFileTree" style=""><li class="file ext_txt"><a href="#" rel="folder1/testi.txt" class="fileTreeLink">testi.txt</a></li><li class="file ext_txt"><a href="#" rel="folder1/uusi.txt" class="fileTreeLink">uusi.txt</a></li></ul></li><li class="directory collapsed"><a href="#" rel="uusi" class="fileTreeLink">uusi</a><a class="folderOpLink" title="Delete Folder" href="javascript:plussaGuiDeleteFolder(\'uusi\')">D</a><a class="folderOpLink" title="Rename Folder" href="javascript:plussaGuiRenameFolder(\'uusi\')">R</a></li><li class="file ext_md"><a href="#" rel="README.md" class="fileTreeLink">README.md</a></li></ul></li><li id="aPlus-10918435" class="directory collapsed"><a href="#" rel="tuniplussa" class="fileTreeLink">TuniPlussa</a></li></ul>';
  }


  // Public File Tree Generator API
  return {
      generateFileTreeHTML: generateFileTreeHTML,
      getActiveProjectId: getActiveProjectId,
      induceFolderOpenClick: induceFolderOpenClick,
      induceProjectOpenClick: induceProjectOpenClick,
      updateAfterFolderAddition: updateAfterFolderAddition,
      buildCommitListing: buildCommitListing,
      fileTreeForTesting: fileTreeForTesting
  };
  })();
