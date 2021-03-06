var plussaGuiSettings = {
	baseRestUrl: "https://gitlab.com/api/v4/",
	activeProjectMeta: false,
	activeFileMeta: false,
	activeFolder: false,
	folderRegEx: "^[a-zA-Z0-9_]*$",
	fileNameRegEx: "^[a-zA-Z0-9_]*$",
	allowedFileExtensions: ['rst', 'txt', 'yaml', 'xml', 'md', 'html', 'css', 'py', 'class', 'conf'],
	checkFileExtension: false,
	defaultWeeksForCommitListing: 4,
	errorCallback: function(message) {
		var elem = $('#plussaGuiReport');
		elem.addClass("plussaGuiError");
		var left = $(window).width() - elem.width() - 50;
		var top = 20;
		elem.css({"left":left, "top":top});
		elem.html("<b>Error:</b><p>"+message+"</p>");
		elem.fadeIn(500, function() {
			setTimeout(function(){
				elem.fadeOut(2000, function() {
					elem.text("");
				});
			}, 3000);
		});
		console.log("ERROR!\n"+JSON.stringify(message));
	},
	successCallback: function(message) {
		var elem = $('#plussaGuiReport');
		elem.removeClass("plussaGuiError");
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
	}
}


$(document).ready(function(){
	plussaGuiGitlabRest.init({
		baseUrl: plussaGuiSettings.baseRestUrl,
    errorCallback: plussaGuiSettings.errorCallback
	});
	// Disable all file operation buttons at start up
	$(".plussaGuiFO").attr('disabled', 'disabled');

	/* The line below constructs a File Tree structure at startup for GUI design. Remove comment slashes when necessary. */
	//$('#fileTree').fileTree({ treeStructure: plussaGuiFileTreeGenerator.fileTreeForTesting(), script: fileTreeScript }, function(linkNode) { });
	$("#markItUp").val("");
  // Setup markItUp! a javascript text editor
	$('#markItUp').markItUp(markItUpSettings);

	// Returns a YYYY-MM-DD presentation of a given date.
	var formatDate = function(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
	}

	var showConfirmModal = function(labelText, operationName, action) {
		$('#plussaGuiConfirmModal').modal();
		$('#modalLabel').text(labelText);
		$("#plussaGuiConfirmOk").click(function() {
			$("#plussaGuiConfirmCancel").off('click');
			$('#plussaGuiConfirmModal').modal('hide');
			action();
		});
		$("#plussaGuiConfirmCancel").click(function() {
			plussaGuiSettings.successCallback(operationName + " operation canceled.");
			$("#plussaGuiConfirmOk").off('click');
		});
	}

	/* Update jQuery File Tree
	 * The behaviour of the function depends on whether plussaGuiSettings.activeFileMeta
	 * is false (file deleted), or has a value (file created).
	 */
	var updateFileTree = function(projectId, path) {
		console.log("File tree update: path="+path);
		var pathData = plussaGuiFileManager.explodeFilePath(path); // false if path is empty or just a file name
		if(pathData) {
			/* Open project subfolder, if it hasn't been deleted. */
			if(plussaGuiFileManager.isFolderLoaded(projectId, pathData[0])) {
				if(plussaGuiFileTreeGenerator.induceFolderOpenClick(projectId, pathData[0])) {
					if(!plussaGuiSettings.activeFileMeta) {
						// A file has been deleted.
						console.log("Found the node for deleted! "+pathData[0]);
						return;
					}
					else {
						// A file was created in an existing folder.
						console.log("Found the node for created! "+pathData[0]);
						return;
					}
				}
				else {
					// Folder node was not found in the file tree. Needs to be refreshed.
					var parentFolderData = plussaGuiFileManager.explodeFilePath(pathData[0]);
					plussaGuiFileTreeGenerator.updateAfterFolderAddition(projectId, parentFolderData, pathData);
				}
			}
			else {
				// Move down the file tree until existing subfolder, eventually the project root folder, is found.
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
	}

	/* Function that jQuery File Tree Plugin calls replacing the original
	 * $.post(...) query in the plugin code.
	 * This function opens a folder i.e. loads the folder content from GitLab
	 * REST API. Project root folders require different treatment from
	 * the project sub folders.
	 */
	var fileTreeScript = function(node, path, callback) {
		var projectId = "";
		var isProjectRoot = false;
		// Get the id attribute that holds the GitLab project id value.
		if($(node).attr('id')) {
			isProjectRoot = true;
			projectId = $(node).attr('id').split('-')[1];
			// Enable file operation buttons
			if($("#plussaGuiSaveFileBtn").attr("disabled")) {
				$(".plussaGuiFO").removeAttr("disabled");
			}
		}
		else {
			// If not a project root folder click, get the id from a helper function.
			projectId = plussaGuiFileTreeGenerator.getActiveProjectId(node);
		}
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
			$("#plussaGuiNewFilePath").text("");
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
			$("#plussaGuiNewFilePath").text(addSpaces(path));
		}
		$("#plussaGuiTargetProject").text(plussaGuiSettings.activeProjectMeta.name);
	};

	/*
	 * The file download implementation.
	 */
	var doFileDownLoad = function(linkNode) {
		var filePath = $(linkNode).attr('rel');
		var projectId = plussaGuiFileTreeGenerator.getActiveProjectId(linkNode);
		plussaGuiSettings.activeProjectMeta = plussaGuiFileManager.getProjectMetaData(projectId);
		console.log("file path: "+filePath+"\nproject id: "+projectId);
		var fileMeta = plussaGuiFileManager.getFileMetaData(projectId, filePath);
		if(fileMeta) {
			var content = plussaGuiFileManager.isFileLoaded(projectId, fileMeta.path);
			/* If file is already loaded, get the contents. */
			if(content) {
				$('#markItUp').val(atob(content));
				console.log("Loaded "+filePath+" from File Manager.");
			}
			else {
				plussaGuiGitlabRest.loadFile(projectId, fileMeta.path, plussaGuiSettings.activeProjectMeta.default_branch, function(result) {
					plussaGuiFileManager.saveFileJSON(projectId, fileMeta.path, result);
					$('#markItUp').val(atob(result.content));
					console.log("Loaded "+filePath+" from REST API.");
				});
			}
			plussaGuiSettings.activeFileMeta = fileMeta;
			$("#plussaGuiFilePath").text(addSpaces(fileMeta.path));
			console.log("Active fileMeta: " + JSON.stringify(fileMeta));
		}
		else {
			plussaGuiSettings.errorCallback("File meta data was not found.");
		}
		$("#plussaGuiProjectName").text(plussaGuiSettings.activeProjectMeta.name + ": ");
	}

	/*
	 * Callback function for click events of filename links in jQuery File Tree.
	 */
	var fileDownLoad = function(linkNode) {
		if(($('#markItUp').val().length > 0) && !plussaGuiSettings.activeFileMeta) {
			showConfirmModal('Discarding unsaved changes.', 'Open File', function() { doFileDownLoad(linkNode) });
		}
		else {
			doFileDownLoad(linkNode);
		}
	}

	/*
	 * Loads the metadata of all of the user's GitLab projects.
	 */
	$('#plussaGuiLoadProjectsBtn').click(function() {
		var userId = $('#userId').val();
		var privateToken = $('#privateToken').val();
		if(!userId || !privateToken) {
			plussaGuiSettings.errorCallback("Please, give your user credentials.");
			if(!userId) {
				$('#userId').focus();
			}
			else {
				$('#privateToken').focus();
			}
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

	/*
	 * Updates a repository file OR opens a panel for entering a new filename.
	 */
	$("#plussaGuiSaveFileBtn").click(function() {
		var projectMeta = plussaGuiSettings.activeProjectMeta;
		var path = removeSpaces($("#plussaGuiFilePath").text());
		var newContent = $("#markItUp").val();
		if(newContent.length == 0) {
			plussaGuiSettings.errorCallback("File is empty.");
			$("#markItUp").focus();
			return;
		}
		var successReport = "Saved " + path + " in project: " + projectMeta.name;
		if(!plussaGuiSettings.activeFileMeta) {
			// About to save a new file, so open new file panel.
			if(!$("#plussaGuiNewFilePanel").hasClass("collapse.show")) {
				$("#plussaGuiCancelBtn").click(); // Toggle button for showing/hiding the new file panel
			}
		}
		else {
			/* Do file update. */
			if(newContent.length == 0) {
				plussaGuiSettings.errorCallback("Empty files can not be saved.");
				$("#markItUp").focus();
				return;
			}
			plussaGuiGitlabRest.updateFile(projectMeta.id, projectMeta.default_branch, path, newContent, function(result) {
				plussaGuiFileManager.updateAfterFileSave(projectMeta.id, path, newContent);
				plussaGuiSettings.successCallback(successReport);
			});
		}
	});

	/*
	 * Saves a new file to the repository.
	 */
	$("#plussaGuiSaveNewFileBtn").click(function() {
		var projectMeta = plussaGuiSettings.activeProjectMeta;
		var path = removeSpaces($("#plussaGuiNewFilePath").text());
		var newContent = $("#markItUp").val();
		if(newContent.length == 0) {
			plussaGuiSettings.errorCallback("File is empty.");
			$("#markItUp").focus();
			return;
		}
		var filename = $("#plussaGuiPathInput").val();
		if(filename.length == 0) {
			plussaGuiSettings.errorCallback("Filename is empty.");
			$("#plussaGuiPathInput").focus();
			return;
		}
		if(filename.lastIndexOf('.') == -1) {
			plussaGuiSettings.errorCallback("Filename extension is missing.");
			$("#plussaGuiPathInput").focus();
			return;
		}
		var filenameData = filename.split('.');
		if(filenameData.length > 2) {
			plussaGuiSettings.errorCallback("Filename has too many extensions.");
			$("#plussaGuiPathInput").focus();
			return;
		}
		var regex = RegExp(plussaGuiSettings.fileNameRegEx);
		if(!regex.test(filenameData[0])) {
			plussaGuiSettings.errorCallback("Filename has to pass " + plussaGuiSettings.fileNameRegEx + " test.");
			$("#plussaGuiPathInput").focus();
			return;
		}
		if(plussaGuiSettings.checkFileExtension) {
			if(!plussaGuiSettings.allowedFileExtensions.includes(filenameData[1].toLowerCase())) {
				plussaGuiSettings.errorCallback("Allowed file extensions are: " + plussaGuiSettings.allowedFileExtensions);
				$("#plussaGuiPathInput").focus();
				return;
			}
		}
		if(plussaGuiFileManager.resourceExists(projectMeta.id, path, filename)) {
			path = ((path.length > 0)?path+"/":"")+filename;
			var msg = "File " + path + " in " + plussaGuiSettings.activeProjectMeta.name + " already exists.";
			showConfirmModal(msg, 'Overwrite', function() {
				var successReport = "Saved file over " + path + " in project: " + projectMeta.name;
				console.log("Overwriting to: "+path+"\nContent: "+newContent);
				plussaGuiGitlabRest.updateFile(projectMeta.id, projectMeta.default_branch, path, newContent, function(result) {
					plussaGuiFileManager.updateAfterFileSave(projectMeta.id, path, newContent);
					plussaGuiSettings.successCallback(successReport);
					plussaGuiSettings.activeFileMeta = plussaGuiFileManager.getFileMetaData(projectMeta.id, path);
					$("#plussaGuiCancelBtn").click(); // Close new file panel and reset form (Cancel is also the panel view toggle button).
					$("#plussaGuiFilePath").text(addSpaces(path));
					$("#plussaGuiProjectName").text(projectMeta.name + ": ");
				});
			});
			return;
		}
		// Concatenate file path and filename.
		path = ((path.length > 0)?path+"/":"")+filename;
		var successReport = "Saved new file " + path + " in project: " + projectMeta.name;
		/* Save a new file. */
		console.log("Create file.");
		console.log("projectId: "+projectMeta.id+"\nbranch: "+projectMeta.default_branch+"\npath: "+path+"\ncontent: "+newContent);
		plussaGuiGitlabRest.newFile(projectMeta.id, projectMeta.default_branch, path, newContent, function(result) {
			plussaGuiFileManager.updateAfterFileSave(projectMeta.id, path, newContent);
			console.log("Created file: "+JSON.stringify(result));
			plussaGuiSettings.successCallback(successReport);
			plussaGuiSettings.activeFileMeta = plussaGuiFileManager.getFileMetaData(projectMeta.id, path);
			$("#plussaGuiCancelBtn").click(); // Close new file panel and reset form.
			$("#plussaGuiFilePath").text(addSpaces(path));
			$("#plussaGuiProjectName").text(projectMeta.name + ": ");
			updateFileTree(projectMeta.id, path);
		});

	});

	/*
	 * Resets the current active file data and clears the editor.
	 */
	$("#plussaGuiNewFileBtn").click(function() {
		$("#markItUp").val("");
		$("#plussaGuiPathInput").val("");
		$("#plussaGuiFilePath").text("");
		$("#plussaGuiProjectName").text("");
		plussaGuiSettings.activeFileMeta = false;
		$("#markItUp").focus();
	});

	/*
	 * Adds a new folder name to the new file path.
	 */
	$("#plussaGuiAddFolderBtn").click(function() {
		var path = $("#plussaGuiNewFilePath").text();
		var newFolder = $("#plussaGuiPathInput").val();
		if(newFolder.length == 0) {
			plussaGuiSettings.errorCallback("Folder name is empty.");
			$("#plussaGuiPathInput").focus();
			return;
		}
		var regex = RegExp(plussaGuiSettings.folderRegEx);
		if(!regex.test(newFolder)) {
			plussaGuiSettings.errorCallback("Folder names must pass "+plussaGuiSettings.folderRegEx+" test.");
			$("#plussaGuiPathInput").focus();
			return;
		}
		if(plussaGuiFileManager.resourceExists(plussaGuiSettings.activeProjectMeta.id, path, newFolder)) {
			var errorMsg = "Folder " + path+"/"+newFolder + " in " + plussaGuiSettings.activeProjectMeta.name + " already exists.";
			plussaGuiSettings.errorCallback(errorMsg);
			$("#plussaGuiPathInput").focus();
			return;
		}
		if(path.length > 0) {
			$("#plussaGuiNewFilePath").text(path + " / " + newFolder);
		}
		else {
			$("#plussaGuiNewFilePath").text(newFolder);
		}
		$("#plussaGuiPathInput").val("");
		$(this).hide();
	});

	/*
	 * Reset the New File panel and toggle the view. See index.html for attached
	 * Bootstrap functionality.
	 */
	$("#plussaGuiCancelBtn").click(function() {
		$("#plussaGuiNewFilePath").text("");
		$("#plussaGuiPathInput").val("");
		$("#plussaGuiAddFolderBtn").show();
	});

	/*
	 * Delete a file from the repository.
	 */
	$("#plussaGuiDeleteFileBtn").click(function() {
		var projectMeta = plussaGuiSettings.activeProjectMeta;
		var branch = projectMeta.default_branch;
		if(!plussaGuiSettings.activeFileMeta) {
			plussaGuiSettings.errorCallback("No file to be deleted.");
			return;
		}
		var path = removeSpaces($("#plussaGuiFilePath").text());
		var modalText = 'Deleting '+path+' from '+projectMeta.name;
		showConfirmModal(modalText, 'Delete', function(){
			plussaGuiGitlabRest.deleteFile(projectMeta.id, branch, path, function(result) {
				plussaGuiFileManager.updateAfterFileDelete(projectMeta.id, path);
				$("#markItUp").val("");
				plussaGuiSettings.successCallback("Deleted " + path + " from " + projectMeta.name);
				$("#plussaGuiFilePath").text("");
				$("#plussaGuiProjectName").text("");
				plussaGuiSettings.activeFileMeta = false;
				updateFileTree(projectMeta.id, path);
				console.log("Deleted file: "+ path);
			});
		});
	});

	/*
	 * Commit listing shows the commits since the given number of weeks ago.
	 * The public community server sends max.100 items in one post. More information
 	 * on pagination: https://docs.gitlab.com/ee/api/README.html#pagination
	 */
	$("#plussaGuiShowCommitsLog").click(function (e) {
		var projectMeta = plussaGuiSettings.activeProjectMeta;
		var weeks = $('#plussaGuiWeeks').val();
		if(weeks.length == 0 || parseInt(weeks) == NaN) {
			weeks = plussaGuiSettings.defaultWeeksForCommitListing;
		}
		else {
			weeks = parseInt(weeks);
		}
		var dateMillis = Date.now() - (604800000 * weeks);
		var dateString = formatDate(dateMillis);
		console.log("Commits since: "+dateString);
		plussaGuiGitlabRest.getCommitHistory(projectMeta.id, projectMeta.default_branch, dateString, function(result) {
			plussaGuiFileTreeGenerator.buildCommitListing('#plussaGuiCommitListTarget', result);
		});
	});

	/*
	 * Rename a project repository file. Saves also the file content.
	 * TODO: The gui implementation in index.html AND data fetching AND data validation AND gui update afterwards
	 */
	$("#plussaGuiRenameFile").click(function() {
		var projectMeta = plussaGuiSettings.activeProjectMeta;
		var oldFilePath = "";
		var newFilePath = "";
		var content = $("#markItUp").val();
		plussaGuiGitlabRest.moveFile(projectMeta.id, projectMeta.default_branch, oldFilePath, newFilePath, content, function() {
			plussaGuiSettings.successCallback("Renamed file " + oldFilePath + " to " + newFilePath);
			plussaGuiFileManager.updateAfterFileDelete(projectMeta.id, oldFilePath);
			plussaGuiFileManager.updateAfterFileSave(projectMeta.id, newFilePath, content);
			// TODO: jQuery File Tree update in file-tree-generator.js
		});
	});

	$("#plussaGuiPreviewBtn").click(function() {
		plussaGuiPreview.openPreview(plussaGuiSettings.activeProjectMeta.id, plussaGuiSettings.activeFileMeta.path);
	});

	$("#plussaGuiPublishBtn").click(function() {
		plussaGuiPreview.publish(plussaGuiSettings.activeProjectMeta.id, plussaGuiSettings.activeFileMeta.path);
	});

});
