var plussaGuiSettings = {
	baseRestUrl: "https://gitlab.com/api/v4/",
	activeProjectId: 0,
	activeProjectMeta: false,
	activeFileMeta: false,
	errorCallback: function(status, errorThrown) {
		$('#plussaGuiReport').text("Error: "+status);
		console.log("ERROR!\n"+JSON.stringify(errorThrown));
	},
	successCallback: function(message) {
		$('#plussaGuiReport').text(message);
	}
}


$(document).ready(function(){
	plussaGuiGitlabRest.init({
		baseUrl: plussaGuiSettings.baseRestUrl,
    errorCallback: plussaGuiSettings.errorCallback
	});
	/* The line below constructs a File Tree structure for GUI design at startup. Remove comment slashes when necessary. */
	//$('#fileTree').fileTree({ treeStructure: plussaGuiFileTreeGenerator.test(), script: fileTreeScript }, function(linkNode) { });
	$("#markItUp").val("");
  // Setup markItUp! a javascript text editor
	$('#markItUp').markItUp(markItUpSettings);

	var updateFilePathRibbon = function(folder) {
		$("#plussaGuiProjectName").text(plussaGuiFileManager.getProjectMetaData(plussaGuiSettings.activeProjectId).name+": ");
		if(plussaGuiSettings.activeFileMeta.id) {
			//var pathInfo = plussaGuiFileManager.explodeFilePath(plussaGuiSettings.activeFileMeta.path);
			$("#plussaGuiFilePath").text(plussaGuiSettings.activeFileMeta.path);
		}
		else {
			if(folder != undefined) {
				$("#plussaGuiFilePath").text(folder);
			}
			else {
				$("#plussaGuiFilePath").text("");
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
					console.log("Loaded folder path: "+path+"\nfrom project: "+projectId+"\n"+JSON.stringify(result));
				});
			}
			updateFilePathRibbon(path);
		}
		//$("#plussaGuiProjectName").text(plussaGuiFileManager.getProjectMetaData(projectId).name+": ");
	};


	/* Callback function for implementing file download after click events of file
	 * name links in jQuery File Tree.
	 */
	var fileDownLoad = function(linkNode) {
		var filePath = $(linkNode).attr('rel');
		var projectId = plussaGuiFileTreeGenerator.getActiveProjectId(linkNode);
		console.log("file path: "+filePath+"\nproject id: "+projectId);
		var fileMeta = plussaGuiFileManager.getFileMetaData(projectId, filePath);
		if(fileMeta) {
			var content = plussaGuiFileManager.isFileLoaded(plussaGuiSettings.activeProjectMeta.id + fileMeta.path);
			/* If file is already loaded, get the contents. */
			if(content) {
				$('#markItUp').val(atob(content));
				console.log("Loaded "+filePath+" from File Manager.");
			}
			else {
				plussaGuiGitlabRest.loadFile(projectId, fileMeta.path, plussaGuiSettings.activeProjectMeta.default_branch, function(result) {
					plussaGuiFileManager.saveFileJSON(projectId+fileMeta.path, result);
					$('#markItUp').val(atob(result.content));
					console.log("Loaded "+filePath+" from REST API.");
				});
			}
			plussaGuiSettings.activeFileMeta = fileMeta;
			console.log("Active fileMeta: " + JSON.stringify(fileMeta));
			updateFilePathRibbon(filePath);
		}
		else {
			plussaGuiSettings.errorCallback(500, "File meta data was not found.");
		}
		$("#plussaGuiFileNameInput").css("display", "none");
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
		var content = plussaGuiFileManager.isFileLoaded(projectMeta.id + plussaGuiSettings.activeFileMeta.path);
		var path = $("#plussaGuiFilePath").text();
		var newContent = $("#markItUp").val();
		var successReport = "Saved " + path + " in project: " + projectMeta.name;
		/* Check if it is an update. */
		if(content) {
			// TODO: Check if the file contents have truly been altered and only after that proceed with the update.
			console.log("Update file.");
			plussaGuiGitlabRest.updateFile(projectMeta.id, projectMeta.default_branch, path, newContent, function(result) {
				plussaGuiFileManager.updateAfterFileSave(projectMeta.id, path, newContent);
				plussaGuiSettings.successCallback(successReport);
			});
		}
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
	});

	$("#plussaGuiNewFileBtn").click(function() {
		var folderTreeHTML = plussaGuiFileTreeGenerator.generateFolderTreeHTML(false, "plussaGuiFolderTree", function(path){
			$("#plussaGuiNewFilePath").text(path+"/");
		});
	});

	$("#plussaGuiCreateFileBtn").click(function() {
		$("#markItUp").val("");
		$("#plussaGuiFileNameInput").val("");
		if(plussaGuiSettings.activeFileMeta) {
			plussaGuiSettings.activeFileMeta = false;
			var pathInfo = plussaGuiFileManager.explodeFilePath($("#plussaGuiFilePath").text());
			if(pathInfo) {
				$("#plussaGuiFilePath").text(pathInfo[0]);
			}
			else {
				$("#plussaGuiFilePath").text("");
			}
		}
	});

	$("#plussaGuiDeleteFileBtn").click(function() {
		var projectMeta = plussaGuiSettings.activeProjectMeta;
		var branch = projectMeta.default_branch;
		var path = $("#plussaGuiFilePath").text();
		console.log("Delete file. Path: "+path);
		plussaGuiGitlabRest.deleteFile(projectMeta.id, branch, path, function(result) {
			plussaGuiFileManager.updateAfterFileDelete(projectMeta.id, plussaGuiSettings.activeFileMeta.path);
			plussaGuiSettings.activeFileMeta = {};
			$("#markItUp").val("");
			updateFileTree(projectMeta.id, path);
			plussaGuiSettings.successCallback("Deleted " + path + " from " + projectMeta.name);
			console.log("Delete file.");
		});
	});

	$("#plussaGuiPreviewBtn").click(function() {
		plussaGuiPreview.openPreview(plussaGuiSettings.activeProjectId, plussaGuiSettings.activeFileMeta.path);
	});

});
