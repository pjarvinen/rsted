var preWindow;

function openPreview() {
    // Set private token
    var privateToken = document.getElementById('privateToken').value;
    // Set all needed variables
    var data = 'token=' + privateToken + '&project=' + getSelectedProject() + "&filepath=" + getSelectedFile();
    var xhr = new XMLHttpRequest();
    xhr.open("POST", script_root + "/srv/preview/");
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    // Send POST request with data
    xhr.send(data);
    document.getElementById("loader").style.display = "block";
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var response = xhr.responseText;
            if (response != "") {
                // Open preview window with the response url
                preWindow = window.open(response, "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,width=850,height=700");
            }
            document.getElementById("loader").style.display = "none";
        }
    };
}

function reloadPreview() {
    preWindow.location.reload();
}

function getSelectedProject() {
    // Temporary, TO-DO: Add a way to find the selected project's id
    var selectedProject_id = 11880781;
    return selectedProject_id;
}

function getSelectedFile() {
    // Temporary, TO-DO: Add a way to find the selected project's id
    var selectedFilePath = "m01_introduction/01_installation.rst";
    if (selectedFilePath.endsWith(".rst")) {
        selectedFilePath = selectedFilePath.slice(0, -4) + ".html"
    }
    return selectedFilePath;
}