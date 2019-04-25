var plussaGuiSettings = {
	baseRestUrl: "https://gitlab.com/api/v4/",
	activeProjectId: 0,
	activeProjectMeta: false,
	activeFileMeta: false,
	errorCallback: function(status, errorThrown) {
		$('#plussaGuiReport').text("Error: "+status);
		console.log("ERROR!\n"+JSON.stringify(errorThrown));
	}
}


$(document).ready(function(){
	plussaGuiGitlabRest.init({
		baseUrl: plussaGuiSettings.baseRestUrl,
    errorCallback: plussaGuiSettings.errorCallback
	});
	/* File tree structure for GUI design at startup. Remove comment slashes when necessary. */
	//$('#fileTree').fileTree({ treeStructure: plussaGuiFileTreeGenerator.test(), script: fileTreeScript }, function(linkNode) { });
	$("#markItUp").val("");
  // Setup markItUp! a javascript text editor
	$('#markItUp').markItUp(markItUpSettings);

	/*
	 * Helper function that finds the project id value of the currently open
	 * GitLab project from the jQuery File Tree. Id attribute of the project
	 * root folder <li> element is set by file-tree-generator.js
	 */
	var getActiveProjectId = function(node) {
		while(!$(node).parent().attr('id')) {
			node = $(node).parent();
		}
		return $(node).parent().attr('id').split('-')[1];
	}

	var explodeFilePath = function(filePath) {
    var lastIndexOfSlash = filePath.lastIndexOf('/');
    if(lastIndexOfSlash != -1) {
      return [filePath.substring(0, lastIndexOfSlash), filePath.substring(lastIndexOfSlash, filePath.length-1)];
    }
    else {
      return false;
    }
  }

	var updateFilePathRibbon = function(folder) {
		$("#plussaGuiProjectName").text(plussaGuiFileManager.getProjectMetaData(plussaGuiSettings.activeProjectId).name+": ");
		if(plussaGuiSettings.activeFileMeta.id) {
			//var pathInfo = explodeFilePath(plussaGuiSettings.activeFileMeta.path);
			$("#plussaGuiFolderPath").text(plussaGuiSettings.activeFileMeta.path);
			//$("#plussaGuiFilePath").text("");
		}
		else {
			if(folder != undefined) {
				$("#plussaGuiFolderPath").text(folder);
			}
			else {
				$("#plussaGuiFolderPath").text("");
			}
		}
	}

	/* Function that jQuery File Tree Plugin calls replacing the original
	 * $.post(...) query in the plugin code.
	 * This function opens a folder i.e. loads the folder content from GitLab
	 * REST API. The project root folders require different treatment from
	 * the project sub folders.
	 */
	var fileTreeScript = function(node, path, callback) {
		var projectId = "";
		var isProjectRoot = false;
		// Find the <li> element with an id attribute that holds the GitLab project id value.
		if($(node).attr('id')) {
			isProjectRoot = true;
			projectId = $(node).attr('id').split('-')[1];
		}
		else {
			projectId = getActiveProjectId(node);
		}
		plussaGuiSettings.activeProjectId = projectId;
		plussaGuiSettings.activeProjectMeta = plussaGuiFileManager.getProjectMetaData(projectId);
		var fileTreeJSON = {};
		if(isProjectRoot) {
			// If the project root folder is already loaded generate the file tree.
			if(fileTreeJSON = plussaGuiFileManager.isProjectLoaded(projectId)) {
				callback(plussaGuiFileTreeGenerator.generateFileTreeHTML(fileTreeJSON));
				console.log("Project already loaded: "+"\nid: "+projectId);
			}
			else {
				plussaGuiGitlabRest.loadOneProject(projectId, function(result) {
					plussaGuiFileManager.saveProjectJSON(projectId, result);
					callback(plussaGuiFileTreeGenerator.generateFileTreeHTML(result));
					console.log("Loaded one project: "+"\nid: "+projectId+"\n"+JSON.stringify(result));
				});
			}
			updateFilePathRibbon();
		}
		// Not a project root folder, load a project sub folder if not already loaded.
		else {
			if(fileTreeJSON = plussaGuiFileManager.isFolderLoaded(projectId, path)) {
				callback(plussaGuiFileTreeGenerator.generateFileTreeHTML(fileTreeJSON));
				console.log("Folder "+path+" already loaded: "+"\nid: "+projectId);
			}
			else {
				plussaGuiGitlabRest.loadFolder(projectId, path, function(result) {
					plussaGuiFileManager.saveFolderJSON(projectId, path, result);
					callback(plussaGuiFileTreeGenerator.generateFileTreeHTML(result));
					console.log("Loaded folder path: "+path+"\nfrom project: "+projectId);
				});
			}
			updateFilePathRibbon(path);
		}
		//$("#plussaGuiProjectName").text(plussaGuiFileManager.getProjectMetaData(projectId).name+": ");
	};

	$('#plussaGuiLoadProjectsBtn').click(function() {
		var userId = $('#userId').val();
		var privateToken = $('#privateToken').val();
		if(!userId || !privateToken) {
			plussaGuiSettings.errorCallback(400, "Error!");
		}
		else {
			// Construct a folder list presentation of the user's GitLab projects
			plussaGuiGitlabRest.loadProjectsInfo(userId, privateToken, function(result) {
				plussaGuiFileManager.setUserProjects(result);
				var fileTreeHTML = plussaGuiFileTreeGenerator.generateFileTreeHTML(result);
				//console.log(fileTreeHTML);
				$('#fileTree').fileTree({ treeStructure: fileTreeHTML, script: fileTreeScript }, function(linkNode) {
					// Callback function for implementing file download after click events of file name links.
					var filePath = $(linkNode).attr('rel');
					var projectId = getActiveProjectId(linkNode);
					console.log("file path: "+filePath+"\nproject id: "+projectId);
					var fileMeta = plussaGuiFileManager.getFileMetaData(projectId, filePath);
					if(fileMeta) {
						var content = plussaGuiFileManager.isFileLoaded(fileMeta.id);
						/* If file is already loaded, get the contents. Updates are stored
						 * in browser memory as well as sent to the server. */
						if(content) {
							$('#markItUp').val(atob(content));
							console.log("Loaded "+filePath+" from File Manager.");
						}
						else {
							plussaGuiGitlabRest.loadFile(projectId, fileMeta.id, function(result) {
								plussaGuiFileManager.saveFileJSON(result);
								$('#markItUp').val(atob(result.content));
								console.log("Loaded "+filePath+" from REST API.");
							});
						}
						plussaGuiSettings.activeFileMeta = fileMeta;
						updateFilePathRibbon(filePath.path);
						//$("#plussaGuiProjectName").text(plussaGuiFileManager.getProjectMetaData(projectId).name+": ");
					}
					else {
						plussaGuiSettings.errorCallback(500, "File SHA value was not found.");
					}
					$("#plussaGuiFileNameInput").css("display", "none");
				});
			});
		}
	});

	$("#plussaGuiSaveFileBtn").click(function() {
		var projectMeta = plussaGuiSettings.activeProjectMeta;//plussaGuiFileManager.getProjectMetaData(plussaGuiSettings.activeProjectId);
		var content = plussaGuiFileManager.isFileLoaded(plussaGuiSettings.activeFileMeta.id);
		var path = $("#plussaGuiFolderPath").text();
		/* Check if it is an update. */
		if(content) {
			// TODO: Check if contents have truly been altered and only after that proceed with the update.
			console.log("Update file.");

		}
		/* Save a new file. */
		else {
			console.log("Create file.");
			// Check if the file is to be saved into the project root folder.
			if(path.length == 0) {
				path = $("#plussaGuiFileNameInput").val();
			}
			else {
				path += "/" + $("#plussaGuiFileNameInput").val();
			}
			var branch = projectMeta.default_branch;//plussaGuiFileManager.getProjectMetaData(plussaGuiSettings.activeProjectId).default_branch;
			console.log("projectId: "+projectMeta.id+"\nbranch: "+projectMeta.default_branch+"\npath: "+path+"\ncontent: "+$("#markItUp").val());
			/*plussaGuiGitlabRest.newFile(plussaGuiSettings.activeProjectId, branch, path, $("#markItUp").val(), function(result) {
				console.log(JSON.stringify(result));
				//plussaGuiSettings.activeFileMeta = plussaGuiFileManager.getFileMetaData()
			});*/
		}
		$("#plussaGuiFileNameInput").css("display", "none");
		updateFilePathRibbon(path);
	});

	$("#plussaGuiNewFileBtn").click(function() {
		$("#markItUp").val("");
		$("#plussaGuiFileNameInput").val("");
		$("#plussaGuiFileNameInput").css("display", "inline");
		if(plussaGuiSettings.activeFileMeta) {
			plussaGuiSettings.activeFileMeta = false;
			var pathInfo = explodeFilePath($("#plussaGuiFolderPath").text());
			if(pathInfo) {
				$("#plussaGuiFolderPath").text(pathInfo[0]);
			}
			else {
				$("#plussaGuiFolderPath").text("");
			}
		}
	});

	$("#plussaGuiDeleteFileBtn").click(function() {
		var branch = plussaGuiFileManager.getProjectMetaData(plussaGuiSettings.activeProjectId).default_branch;
		var path = $("#plussaGuiFilePath").val();
		plussaGuiGitlabRest.deleteFile(plussaGuiSettings.activeProjectId, branch, path, function(result) {
			plussaGuiFileManager.updateAfterFileDelete(plussaGuiSettings.activeProjectId, plussaGuiSettings.activeFileMeta);
			plussaGuiSettings.activeFileMeta = {};
			$("#markItUp").val("");
			$("#plussaGuiFilePath").val("");
			console.log(JSON.stringify(result));
		});
	});

	$("#plussaGuiPreviewBtn").click(function() {
		console.log("Preview Button Clicked!");
	});

});
