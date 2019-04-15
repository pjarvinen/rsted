
$( document ).ready(function() {
  var plussaGuiHtmlPreview = (function() {

    var showPreview = function(rstString) {
      var windowName = "Preview";
      var rstString = $("#markItUp").val();
      var htmlString = rst2html(rstString);
      var aplusHTMLhead = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1"><title>'+windowName+'</title><link rel="stylesheet" href="https://plus.cs.hut.fi/static/css/main.css" /></head>';
      var aplusHTMLBody = '<body><div class="row"><div class="col-lg-12">' + htmlString + '</div></div></body></html>'
      previewWindow = window.open("", windowName);
      previewWindow.document.write(aplusHTMLhead + aplusHTMLBody);
      previewWindow.document.close();
    };

    // Public Html Preview API
    return {
        showPreview: showPreview
    };
  })();
});
