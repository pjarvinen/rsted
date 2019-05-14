var plussaGuiPreview = (function() {

    var preWindow = null;
    var xhr = null;
    var lastContent = null;
    var renderedHash = null;
    var liveEditing = 0; // Enable/Disable live editing

    var openPreview = function(projectid, filepath) {
        // Set private token
        //var privateToken = document.getElementById('privateToken').value;
        
        var userCredentials = plussaGuiGitlabRest.getUserCredentials;
        var privateToken = userCredentials.privateToken;
        var rst = document.getElementsByTagName('textarea')[0].value;
        // Set all needed variables
        var data = 'token=' + privateToken + '&project=' + projectid + "&filepath=" + filepath + "&rst=" + rst;
        xhr = new XMLHttpRequest();
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
                    try {
                        preWindow.close();
                    }
                    catch (e) {
                        console.log("Error when closing window")
                    }
                    preWindow = window.open(response, "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,width=850,height=700");
                }
                document.getElementById("loader").style.display = "none";
            }
        };
    }


    function genPreview() {
        if (preWindow != null) {
            var self = $('#markItUp');
            var rst = self.val();
            var privateToken = document.getElementById('privateToken').value;
            lastContent = rst;
            
            var data = 'token=' + privateToken + '&project=' + getSelectedProject() + "&filepath=" + getSelectedFile() + "&rst=" + rst;
            xhr = new XMLHttpRequest();
            xhr.open("POST", script_root + "/srv/preview/");
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            // Send POST request with data
            xhr.send(data);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var response = xhr.responseText;
                    if (response != "") {
                        reloadPreview()
                        xhr = null;
                    }
                }
            };
        }
    }

    function reloadPreview() {
        preWindow.location.reload();
    }

    function probablyChanged() {
        var self = $('#markItUp');
        var rst = self.val();
        if ((xhr || lastContent == rst) && !preWindow) {
            return;
        }
        syncHashAndUpdate();
    }

    function syncHashAndUpdate() {
        var self = $('#markItUp');
        var rst = self.val();
        syncState(rst);
        genPreview();
    }

    function syncState(rst) {
        location.hash = '#' + b64EncodeUnicode(rst);
    }

    function getDecodedHash() {
        return b64DecodeUnicode(location.hash.substr(1));
    }

    function b64DecodeUnicode(str) {
        // Going backwards: from bytestream, to percent-encoding, to original string.
        return decodeURIComponent(atob(str).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }

    function getQueryArgs(locSearch) {
        locSearch = locSearch || window.location.search;
        var args = {};

        locSearch.replace(/(\w+)=(.+?)(&|$)/g, function(substr, key, value) {
            args[key] = window.decodeURIComponent(value);
        });
        return args;
    }

    window.onhashchange = function(ev) {
        $('textarea#markItUp').val(getDecodedHash());
    }

    function b64EncodeUnicode(str) {
        // first we use encodeURIComponent to get percent-encoded UTF-8,
        // then we convert the percent encodings into raw bytes which
        // can be fed into btoa.
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
            function toSolidBytes(match, p1) {
                return String.fromCharCode('0x' + p1);
        }));
    }

    function reactForRst(rst) {
        $('#markItUp').val(rst)
    }

    window.onpopstate = function(ev) {
        var doUpdate = false;
        if (getDecodedHash() != lastContent) {
            reactForRst(getDecodedHash())
            doUpdate = true;
        }

        if (doUpdate) {
            genPreview();
        }
    }

    $(function() {
        if (liveEditing == 1) {
            window.baseTitle = $('head title').text();

            $('textarea#markItUp').bind('change', probablyChanged).markItUp(mySettings);
            timerId = window.setInterval(probablyChanged, 900);
            /*window.setTimeout(function() {
                $('#editor-td > div').css({'width': '100%', 'height': '96%'});
            }, 200);*/
        }
    });

  // Public Preview API
  return {
    openPreview: openPreview,
    liveEditing: liveEditing
};
})();