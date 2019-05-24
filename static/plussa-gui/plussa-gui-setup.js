var plussaGuiSettings = {
	baseRestUrl: "https://gitlab.com/api/v4/",
	activeProjectId: 0,
	activeProjectMeta: false,
	activeFileMeta: false,
<<<<<<< HEAD
	activeFolder: false,
	errorCallback: function(status, errorThrown) {
		var elem = $('#plussaGuiReport');
		var left = $(window).width() - elem.width() - 50;
		var top = 20;
		elem.css({"left":left, "top":top});
		elem.addClass("plussaGuiError");
		elem.text("Error: "+status);
		elem.fadeIn(500, function() {
			setTimeout(function(){
				elem.fadeOut(2000, function() {
					elem.text("");
					elem.removeClass("plussaGuiError");
				});
			}, 3000);
		});
		console.log("ERROR!\n"+JSON.stringify(errorThrown));
	},
	successCallback: function(message) {
		var elem = $('#plussaGuiReport');
		var left = $(window).width() - elem.width() - 50;
		var top = 20;
		elem.css({"left":left, "top":top});
		elem.text(message);
		elem.fadeIn(500, function() {
			setTimeout(function(){
				elem.fadeOut(2000, function() {
					elem.text("");
				});
			}, 3000);
		});
=======
	errorCallback: function(status, errorThrown) {
		$('#plussaGuiReport').text("Error: "+status);
		console.log("ERROR!\n"+JSON.stringify(errorThrown));
	},
	successCallback: function(message) {
		$('#plussaGuiReport').text(message);
>>>>>>> da2ca956f2d7a3836fed2355aa7204c7ef154cf3
	}
}


$(document).ready(function(){
	plussaGuiGitlabRest.init({
		baseUrl: plussaGuiSettings.baseRestUrl,
    errorCallback: plussaGuiSettings.errorCallback
	});
<<<<<<< HEAD
	/* The line below constructs a File Tree structure at startup for GUI design. Remove comment slashes when necessary. */
	//$('#fileTree').fileTree({ treeStructure: plussaGuiFileTreeGenerator.fileTreeForTesting(), script: fileTreeScript }, function(linkNode) { });
=======
	/* File tree structure for GUI design at startup. Remove comment slashes when necessary. */
	//$('#fileTree').fileTree({ treeStructure: plussaGuiFileTreeGenerator.test(), script: fileTreeScript }, function(linkNode) { });
>>>>>>> da2ca956f2d7a3836fed2355aa7204c7ef154cf3
	$("#markItUp").val("");
  // Setup markItUp! a javascript text editor
	$('#markItUp').markItUp(markItUpSettings);

<<<<<<< HEAD
	// Update jQuery File Tree
	var updateFileTree = function(projectId, path) {
		console.log("File tree update: path="+path);
		var pathData = plussaGuiFileManager.explodeFilePath(path); // false if path is empty or just a file name
		if(pathData) {
			console.log("File tree update: pathData="+pathData);
			/* Open project subfolder, if it hasn't been deleted. */
			if(plussaGuiFileManager.isFolderLoaded(projectId, pathData[0])) {
				if(plussaGuiFileTreeGenerator.induceFolderOpenClick(projectId, pathData[0])) {
					return;
				}
				else {
					// The folder node was not found. Re-generate parent node to get to the desired node.
					var subPathData = plussaGuiFileManager.explodeFilePath(pathData[0]);
					if(plussaGuiFileTreeGenerator.induceFolderOpenClick(projectId, subPathData[0])) {
						plussaGuiFileTreeGenerator.induceFolderOpenClick(projectId, pathData[0]);
					}
				}
			}
			else {
				// Move down the file tree until existing sub folder, eventually the project root folder, is found.
				updateFileTree(projectId, pathData[0]);
			}
		}
		else {
			/* No path data besides the file name. Reload project root folder. */
			plussaGuiFileTreeGenerator.induceProjectOpenClick(projectId);
		}
	}

	// Add space characters to the file path string
	var addSpaces = function(path) {
		if(path.length == 0) {
			return "";
		}
		var result = "";
		for(var i in path) {
			if(path[i] == "/") {
				result += " / ";
			}
			else {
				result += path[i];
			}
		}
		return result;
	}

	// Remove spaces from file path string
	var removeSpaces = function(path) {
		if(path.length == 0) {
			return "";
		}
		var result = "";
		for(var i in path) {
			if(path[i] == ' ') {
				continue;
			}
			else {
				result += path[i];
			}
		}
		return result;
=======
	var updateFilePathRibbon = function(folder) {
		$("#plussaGuiProjectName").text(plussaGuiFileManager.getProjectMetaData(plussaGuiSettings.activeProjectId).name+": ");
		if(plussaGuiSettings.activeFileMeta.id) {
			//var pathInfo = plussaGuiFileManager.explodeFilePath(plussaGuiSettings.activeFileMeta.path);
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

	// Update jQuery File Tree
	var updateFileTree = function(projectId, path) {
		var pathData = plussaGuiFileManager.explodeFilePath(path); // false if path is just a file name
		if(pathData) {
			/* Reload project subfolder. */
			plussaGuiFileTreeGenerator.induceFolderOpenClick(projectId, pathData[0]);
		}
		else {
			/* No path data besides the file name. Reload project root folder. */
			plussaGuiFileTreeGenerator.induceProjectOpenClick(projectId);
		}
>>>>>>> da2ca956f2d7a3836fed2355aa7204c7ef154cf3
	}

	/* Function that jQuery File Tree Plugin calls replacing the original
	 * $.post(...) query in the plugin code.
	 * This function opens a folder i.e. loads the folder content from GitLab
<<<<<<< HEAD
	 * REST API. Project root folders require different treatment from
=======
	 * REST API. The project root folders require different treatment from
>>>>>>> da2ca956f2d7a3836fed2355aa7204c7ef154cf3
	 * the project sub folders.
	 */
	var fileTreeScript = function(node, path, callback) {
		var projectId = "";
		var isProjectRoot = false;
<<<<<<< HEAD
		// Get the id attribute that holds the GitLab project id value.
=======
		// Find the <li> element with an id attribute that holds the GitLab project id value.
>>>>>>> da2ca956f2d7a3836fed2355aa7204c7ef154cf3
		if($(node).attr('id')) {
			isProjectRoot = true;
			projectId = $(node).attr('id').split('-')[1];
		}
		else {
<<<<<<< HEAD
			// If not a project root folder click, get the id from a helper function.
=======
>>>>>>> da2ca956f2d7a3836fed2355aa7204c7ef154cf3
			projectId = plussaGuiFileTreeGenerator.getActiveProjectId(node);
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
<<<<<<< HEAD
			$("#plussaGuiNewFilePath").text("");
=======
			updateFilePathRibbon();
>>>>>>> da2ca956f2d7a3836fed2355aa7204c7ef154cf3
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
					console.log("Loaded folder path: "+path+"\nfrom project: "+projectId+"\n"+JSON.stringify(result));
				});
			}
<<<<<<< HEAD
			$("#plussaGuiNewFilePath").text(addSpaces(path));
		}
		$("#plussaGuiTargetProject").text(plussaGuiSettings.activeProjectMeta.name);
=======
			updateFilePathRibbon(path);
		}
		//$("#plussaGuiProjectName").text(plussaGuiFileManager.getProjectMetaData(projectId).name+": ");
>>>>>>> da2ca956f2d7a3836fed2355aa7204c7ef154cf3
	};


	/* Callback function for implementing file download after click events of file
	 * name links in jQuery File Tree.
	 */
	var fileDownLoad = function(linkNode) {
		var filePath = $(linkNode).attr('rel');
		var projectId = plussaGuiFileTreeGenerator.getActiveProjectId(linkNode);
<<<<<<< HEAD
		plussaGuiSettings.activeProjectMeta = plussaGuiFileManager.getProjectMetaData(projectId);
		console.log("file path: "+filePath+"\nproject id: "+projectId);
		var fileMeta = plussaGuiFileManager.getFileMetaData(projectId, filePath);
		if(fileMeta) {
			var content = plussaGuiFileManager.isFileLoaded(projectId + fileMeta.path);
=======
		console.log("file path: "+filePath+"\nproject id: "+projectId);
		var fileMeta = plussaGuiFileManager.getFileMetaData(projectId, filePath);
		if(fileMeta) {
			var content = plussaGuiFileManager.isFileLoaded(plussaGuiSettings.activeProjectMeta.id + fileMeta.path);
>>>>>>> da2ca956f2d7a3836fed2355aa7204c7ef154cf3
			/* If file is already loaded, get the contents. */
			if(content) {
				$('#markItUp').val(atob(content));
				console.log("Loaded "+filePath+" from File Manager.");
			}
			else {
				plussaGuiGitlabRest.loadFile(projectId, fileMeta.path, plussaGuiSettings.activeProjectMeta.default_branch, function(result) {
<<<<<<< HEAD
					plussaGuiFileManager.saveFileJSON(projectId + fileMeta.path, result);
=======
					plussaGuiFileManager.saveFileJSON(projectId+fileMeta.path, result);
>>>>>>> da2ca956f2d7a3836fed2355aa7204c7ef154cf3
					$('#markItUp').val(atob(result.content));
					console.log("Loaded "+filePath+" from REST API.");
				});
			}
			plussaGuiSettings.activeFileMeta = fileMeta;
<<<<<<< HEAD
			$("#plussaGuiFilePath").text(addSpaces(fileMeta.path));
			console.log("Active fileMeta: " + JSON.stringify(fileMeta));
=======
			console.log("Active fileMeta: " + JSON.stringify(fileMeta));
			updateFilePathRibbon(filePath);
>>>>>>> da2ca956f2d7a3836fed2355aa7204c7ef154cf3
		}
		else {
			plussaGuiSettings.errorCallback(500, "File meta data was not found.");
		}
<<<<<<< HEAD
		$("#plussaGuiProjectName").text(plussaGuiSettings.activeProjectMeta.name + ": ");
=======
		$("#plussaGuiFileNameInput").css("display", "none");
>>>>>>> da2ca956f2d7a3836fed2355aa7204c7ef154cf3
	}

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
				$('#fileTree').fileTree({ treeStructure: fileTreeHTML, script: fileTreeScript }, fileDownLoad);
			});
		}
	});

	$("#plussaGuiSaveFileBtn").click(function() {
		var projectMeta = plussaGuiSettings.activeProjectMeta;
<<<<<<< HEAD
		var path = removeSpaces($("#plussaGuiFilePath").text());
		var newContent = $("#markItUp").val();
		var successReport = "Saved " + path + " in project: " + projectMeta.name;
		if(!plussaGuiSettings.activeFileMeta) {
			// Save a new file i.e. open new file panel.
			if($("#plussaGuiNewFilePanel").hasClass("collapse.show")) {
				// Panel already open. Do nothing.
				return;
			}
			else {
				// Open new file panel
				$("#plussaGuiCancelBtn").click(); // Toggle button for showing/hiding the new file panel
			}
		}
		else {
			/* Do file update. */
=======
		var content = plussaGuiFileManager.isFileLoaded(projectMeta.id + plussaGuiSettings.activeFileMeta.path);
		var path = $("#plussaGuiFolderPath").text();
		var newContent = $("#markItUp").val();
		var successReport = "Saved " + path + " in project: " + projectMeta.name;
		/* Check if it is an update. */
		if(content) {
			// TODO: Check if the file contents have truly been altered and only after that proceed with the update.
>>>>>>> da2ca956f2d7a3836fed2355aa7204c7ef154cf3
			console.log("Update file.");
			plussaGuiGitlabRest.updateFile(projectMeta.id, projectMeta.default_branch, path, newContent, function(result) {
				plussaGuiFileManager.updateAfterFileSave(projectMeta.id, path, newContent);
				plussaGuiSettings.successCallback(successReport);
			});
		}
<<<<<<< HEAD
	});

	$("#plussaGuiSaveNewFileBtn").click(function() {
		var projectMeta = plussaGuiSettings.activeProjectMeta;
		var path = removeSpaces($("#plussaGuiNewFilePath").text());
		console.log("Path after spaces removal: "+path);
		var newContent = $("#markItUp").val();
		// TODO: Validate input data.
		if(path.length > 0) {
			// Concatenate file path and filename.
			path += "/" + $("#plussaGuiPathInput").val();
		}
		else {
			// No file path data, path equals filename
			path = $("#plussaGuiPathInput").val();
		}
		var successReport = "Saved new file " + path + " in project: " + projectMeta.name;
		/* Save a new file. */
		console.log("Create file.");
		console.log("projectId: "+projectMeta.id+"\nbranch: "+projectMeta.default_branch+"\npath: "+path+"\ncontent: "+newContent);
		plussaGuiGitlabRest.newFile(projectMeta.id, projectMeta.default_branch, path, newContent, function(result) {
			plussaGuiFileManager.updateAfterFileSave(projectMeta.id, path, newContent);
			updateFileTree(projectMeta.id, path);
			console.log("Created file: "+JSON.stringify(result));
			plussaGuiSettings.successCallback(successReport);
			plussaGuiSettings.activeFileMeta = plussaGuiFileManager.getFileMetaData(projectMeta.id, path);
			$("#plussaGuiCancelBtn").click(); // Close new file panel and reset form.
			$("#plussaGuiFilePath").text(addSpaces(path));
			$("#plussaGuiProjectName").text(projectMeta.name + ": ");
		});

=======
		else {
			/* Save a new file. */
			console.log("Create file.");
			console.log("projectId: "+projectMeta.id+"\nbranch: "+projectMeta.default_branch+"\npath: "+path+"\ncontent: "+newContent);
			// If the file has no path info, it is located in the project root folder and path equals file name.
			if(path.length == 0) {
				path = $("#plussaGuiFileNameInput").val();
			}
			// Otherwise the file is located in a sub folder and path equals folder path plus file name.
			else {
				path += "/" + $("#plussaGuiFileNameInput").val();
			}
			plussaGuiGitlabRest.newFile(projectMeta.id, projectMeta.default_branch, path, newContent, function(result) {
				plussaGuiFileManager.updateAfterFileSave(projectMeta.id, path, newContent);
				$("#plussaGuiFileNameInput").css("display", "none");
				$("#plussaGuiFileNameInput").val("");
				updateFileTree(projectMeta.id, path);
				console.log("Created file: "+JSON.stringify(result));
				plussaGuiSettings.successCallback(successReport);
				updateFilePathRibbon(path);
				plussaGuiSettings.activeFileMeta = plussaGuiFileManager.getFileMetaData(projectMeta.id, path);
			});
		}
>>>>>>> da2ca956f2d7a3836fed2355aa7204c7ef154cf3
	});

	$("#plussaGuiNewFileBtn").click(function() {
		$("#markItUp").val("");
<<<<<<< HEAD
		$("#plussaGuiPathInput").val("");
		$("#plussaGuiFilePath").text("");
		$("#plussaGuiProjectName").text("");
		plussaGuiSettings.activeFileMeta = false;
		$("#markItUp").focus();
	});

	$("#plussaGuiAddFolderBtn").click(function() {
		var path = $("#plussaGuiNewFilePath").text();
		var newFolder = $("#plussaGuiPathInput").val();
		if(path.length > 0) {
			$("#plussaGuiNewFilePath").text(path + " / " + newFolder);
		}
		else {
			$("#plussaGuiNewFilePath").text(newFolder);
		}
		$("#plussaGuiPathInput").val("");
		$(this).hide();
	});

	$("#plussaGuiCancelBtn").click(function() {
		$("#plussaGuiNewFilePath").text("");
		$("#plussaGuiPathInput").val("");
		$("#plussaGuiAddFolderBtn").show();
=======
		$("#plussaGuiFileNameInput").val("");
		$("#plussaGuiFileNameInput").css("display", "inline");
		if(plussaGuiSettings.activeFileMeta) {
			plussaGuiSettings.activeFileMeta = false;
			var pathInfo = plussaGuiFileManager.explodeFilePath($("#plussaGuiFolderPath").text());
			if(pathInfo) {
				$("#plussaGuiFolderPath").text(pathInfo[0]);
			}
			else {
				$("#plussaGuiFolderPath").text("");
			}
		}
>>>>>>> da2ca956f2d7a3836fed2355aa7204c7ef154cf3
	});

	$("#plussaGuiDeleteFileBtn").click(function() {
		var projectMeta = plussaGuiSettings.activeProjectMeta;
		var branch = projectMeta.default_branch;
<<<<<<< HEAD
		var path = removeSpaces($("#plussaGuiFilePath").text());
		plussaGuiGitlabRest.deleteFile(projectMeta.id, branch, path, function(result) {
			plussaGuiFileManager.updateAfterFileDelete(projectMeta.id, path);
			$("#markItUp").val("");
			updateFileTree(projectMeta.id, path);
			plussaGuiSettings.successCallback("Deleted " + path + " from " + projectMeta.name);
			$("#plussaGuiFilePath").text("");
			$("#plussaGuiProjectName").text("");
			plussaGuiSettings.activeFileMeta = false;
			console.log("Deleted file: "+ path);
=======
		var path = $("#plussaGuiFolderPath").text();
		console.log("Delete file. Path: "+path);
		plussaGuiGitlabRest.deleteFile(projectMeta.id, branch, path, function(result) {
			plussaGuiFileManager.updateAfterFileDelete(projectMeta.id, plussaGuiSettings.activeFileMeta.path);
			plussaGuiSettings.activeFileMeta = {};
			$("#markItUp").val("");
			updateFileTree(projectMeta.id, path);
			plussaGuiSettings.successCallback("Deleted " + path + " from " + projectMeta.name);
			console.log("Delete file.");
>>>>>>> da2ca956f2d7a3836fed2355aa7204c7ef154cf3
		});
	});

	$("#plussaGuiPreviewBtn").click(function() {
<<<<<<< HEAD
		plussaGuiPreview.openPreview(plussaGuiSettings.activeProjectId, plussaGuiSettings.activeFileMeta.path);
	});

	$("#plussaGuiPublishBtn").click(function() {
		console.log("Publish button clicked!");
=======
		console.log("Preview button clicked!");
>>>>>>> da2ca956f2d7a3836fed2355aa7204c7ef154cf3
	});

});
