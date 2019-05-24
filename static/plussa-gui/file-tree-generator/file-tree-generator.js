
var plussaGuiFileTreeGenerator = (function() {

  /*
   * Helper functions to generate HTML code for jQuery File Tree Plugin.
   * Id attribute of the GitLab project root <li> element holds the GitLab project id value.
   */
  var fileTreeHTMLbits = {
    root: function(insert) { return '<ul class="jqueryFileTree" style="display: none;">'+insert+'</ul>'; },
    projectRoot: function(projectId, insert) { return '<li id="aPlus-'+projectId+'" class="directory collapsed">'+insert+'</li>'; },
    folderRoot: function(insert) { return '<li class="directory collapsed">'+insert+'</li>'; },
    itemLink: function(path, itemName) { return '<a href="#" rel="'+path+'">'+itemName+'</a>'; },
    fileRoot: function(extension, insert) { return '<li class="file ext_'+extension+'">'+insert+'</li>'; }
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
        fileTreeHTML += fileTreeHTMLbits.projectRoot(fileTree[i].id, fileTreeHTMLbits.itemLink(fileTree[i].path, fileTree[i].name));
      }
      /* Generate a folder root <li> element if GitLab file tree JSON item has a type attribute with 'tree' value.
       */
      else if(fileTree[i].type == 'tree') {
        fileTreeHTML += fileTreeHTMLbits.folderRoot(fileTreeHTMLbits.itemLink(fileTree[i].path, fileTree[i].name));
      }
      else {
        fileMeta = fileTree[i].name.split('.'); // To find out the file extension.
        fileTreeHTML += fileTreeHTMLbits.fileRoot(fileMeta[fileMeta.length - 1], fileTreeHTMLbits.itemLink(fileTree[i].path, fileTree[i].name));
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
    if(node) {
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

  var induceFileClick = function(projectId, filePath) {
    console.log("Searching in "+projectId+" for "+filePath);
    var node = $("#aPlus-"+projectId).find("a[rel='"+filePath+"']");
    if(node) {
      console.log("jipii");
      node.click();
    }
  }

  // HTML material for testing
  var fileTreeForTesting = function() {
    return '<ul class="jqueryFileTree" style=""><li id="aPlus-11862275" class="directory collapsed"><a href="#" rel="testinen">Testinen</a></li><li id="aPlus-10918435" class="directory expanded"><a href="#" rel="tuniplussa">TuniPlussa</a><ul class="jqueryFileTree" style=""><li class="directory collapsed"><a href="#" rel="_static">_static</a></li><li class="directory collapsed"><a href="#" rel="_templates">_templates</a></li><li class="directory collapsed"><a href="#" rel="a-plus-rst-tools">a-plus-rst-tools</a></li><li class="directory collapsed"><a href="#" rel="exercises">exercises</a></li><li class="directory expanded"><a href="#" rel="extensions">extensions</a><ul class="jqueryFileTree" style=""><li class="file ext_py"><a href="#" rel="extensions/acos_submit.py">acos_submit.py</a></li><li class="file ext_py"><a href="#" rel="extensions/bootstrap_styled_topic.py">bootstrap_styled_topic.py</a></li><li class="file ext_py"><a href="#" rel="extensions/div.py">div.py</a></li></ul></li><li class="directory collapsed"><a href="#" rel="images">images</a></li><li class="directory collapsed"><a href="#" rel="m01_introduction">m01_introduction</a></li><li class="directory expanded"><a href="#" rel="m02_programming_exercises">m02_programming_exercises</a><ul class="jqueryFileTree" style=""><li class="file ext_rst"><a href="#" rel="m02_programming_exercises/01_instructions.rst">01_instructions.rst</a></li><li class="file ext_rst"><a href="#" rel="m02_programming_exercises/02_hello_world.rst">02_hello_world.rst</a></li><li class="file ext_rst"><a href="#" rel="m02_programming_exercises/04_personalized_exercises.rst">04_personalized_exercises.rst</a></li><li class="file ext_rst"><a href="#" rel="m02_programming_exercises/05_debugging_in_container.rst">05_debugging_in_container.rst</a></li><li class="file ext_rst"><a href="#" rel="m02_programming_exercises/06_radar.rst">06_radar.rst</a></li><li class="file ext_rst"><a href="#" rel="m02_programming_exercises/07_graphics.rst">07_graphics.rst</a></li><li class="file ext_rst"><a href="#" rel="m02_programming_exercises/index.rst">index.rst</a></li></ul></li><li class="directory collapsed"><a href="#" rel="m03_acos">m03_acos</a></li><li class="directory collapsed"><a href="#" rel="m04_converting">m04_converting</a></li><li class="directory collapsed"><a href="#" rel="m05_lti">m05_lti</a></li><li class="directory collapsed"><a href="#" rel="m06_rubyric">m06_rubyric</a></li><li class="directory collapsed"><a href="#" rel="m07_admin">m07_admin</a></li><li class="file ext_gitignore"><a href="#" rel=".gitignore">.gitignore</a></li><li class="file ext_gitmodules"><a href="#" rel=".gitmodules">.gitmodules</a></li><li class="file ext_LICENSE"><a href="#" rel="LICENSE">LICENSE</a></li><li class="file ext_Makefile"><a href="#" rel="Makefile">Makefile</a></li><li class="file ext_md"><a href="#" rel="README.md">README.md</a></li><li class="file ext_txt"><a href="#" rel="TODO.txt">TODO.txt</a></li><li class="file ext_meta"><a href="#" rel="apps.meta">apps.meta</a></li></ul></li></ul>';
  }

  // HTML material for testing
  var folderTreeForTesting = function() {
    return '<ul class="jqueryFileTree"><li id="aPlus-10918435" class="directory expanded"><a href="#" rel="tuniplussa">TuniPlussa</a><ul class="jqueryFileTree" style=""><li class="directory expanded"><a href="#" rel="_static">_static</a></li><li class="directory expanded"><a href="#" rel="_templates">_templates</a></li><li class="directory expanded"><a href="#" rel="a-plus-rst-tools">a-plus-rst-tools</a><ul class="jqueryFileTree" style="display: none;"><li class="directory expanded"><a href="#" rel="a-plus-rst-tools/directives">directives</a></li><li class="directory expanded"><a href="#" rel="a-plus-rst-tools/lib">lib</a></li><li class="directory expanded"><a href="#" rel="a-plus-rst-tools/theme">theme</a></li></ul></li><li class="directory expanded"><a href="#" rel="exercises">exercises</a><ul class="jqueryFileTree" style=""><li class="directory expanded"><a href="#" rel="exercises/hello_javascript">hello_javascript</a></li><li class="directory expanded"><a href="#" rel="exercises/hello_python">hello_python</a></li><li class="directory expanded"><a href="#" rel="exercises/hello_scala">hello_scala</a></li><li class="directory expanded"><a href="#" rel="exercises/personalized_number">personalized_number</a></li><li class="directory expanded"><a href="#" rel="exercises/personalized_python">personalized_python</a></li><li class="directory expanded"><a href="#" rel="exercises/solutions">solutions</a><ul class="jqueryFileTree" style=""><li class="directory expanded"><a href="#" rel="exercises/solutions/hello_python">hello_python</a></li></ul></li><li class="directory expanded"><a href="#" rel="exercises/turtle_python">turtle_python</a></li></ul></li><li class="directory expanded"><a href="#" rel="extensions">extensions</a><ul class="jqueryFileTree" style="display: none;"><li class="directory expanded"><a href="#" rel="images">images</a></li><li class="directory expanded"><a href="#" rel="m01_introduction">m01_introduction</a></li><li class="directory expanded"><a href="#" rel="m02_programming_exercises">m02_programming_exercises</a></li><li class="directory expanded"><a href="#" rel="m03_acos">m03_acos</a></li><li class="directory expanded"><a href="#" rel="m04_converting">m04_converting</a></li><li class="directory expanded"><a href="#" rel="m05_lti">m05_lti</a></li><li class="directory expanded"><a href="#" rel="m06_rubyric">m06_rubyric</a></li><li class="directory expanded"><a href="#" rel="m07_admin">m07_admin</a></li></ul></li></ul>';
  }


  // Public File Tree Generator API
  return {
      generateFileTreeHTML: generateFileTreeHTML,
      getActiveProjectId: getActiveProjectId,
      induceFolderOpenClick: induceFolderOpenClick,
      induceProjectOpenClick: induceProjectOpenClick,
      induceFileClick: induceFileClick,
      fileTreeForTesting: fileTreeForTesting,
      folderTreeForTesting: folderTreeForTesting
  };
  })();