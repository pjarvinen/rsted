// jQuery File Tree Plugin
//
// Version 1.01
//
// Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
// 24 March 2008
//
// Visit http://abeautifulsite.net/notebook.php?article=58 for more information
//
// Usage: $('.fileTreeDemo').fileTree( options, callback )
//
// Options:  root           - root folder to display; default = /
//           script         - location of the serverside AJAX file to use; default = jqueryFileTree.php
//           folderEvent    - event to trigger expand/collapse; default = click
//           expandSpeed    - default = 500 (ms); use -1 for no animation
//           collapseSpeed  - default = 500 (ms); use -1 for no animation
//           expandEasing   - easing function to use on expand (optional)
//           collapseEasing - easing function to use on collapse (optional)
//           multiFolder    - whether or not to limit the browser to one subfolder at a time
//           loadMessage    - Message to display while initial tree loads (can be HTML)
//
// History:
//
// 1.01 - updated to work with foreign characters in directory/file names (12 April 2008)
// 1.00 - released (24 March 2008)
//
// TERMS OF USE
//
// This plugin is dual-licensed under the GNU General Public License and the MIT License and
// is copyright 2008 A Beautiful Site, LLC.
//
if(jQuery) (function($){

	$.extend($.fn, {
		fileTree: function(o, fileCb) {
			// Defaults
			if( !o ) var o = {};
			if( o.root == undefined ) o.root = '/this/folder';
			if( o.script == undefined ) o.script = 'jqueryFileTree.php';
			if( o.folderEvent == undefined ) o.folderEvent = 'click';
			if( o.expandSpeed == undefined ) o.expandSpeed= 500;
			if( o.collapseSpeed == undefined ) o.collapseSpeed= 500;
			if( o.expandEasing == undefined ) o.expandEasing = null;
			if( o.collapseEasing == undefined ) o.collapseEasing = null;
			if( o.multiFolder == undefined ) o.multiFolder = true;
			if( o.loadMessage == undefined ) o.loadMessage = 'Loading...';

			$(this).each( function() {

				/*
				 * Modified for Plussa GUI purposes.
				 * Initial folder list consists of user's A-plus projects and is delivered
				 * into this plugin as a o.treeStructure parameter value. Subsequent
				 * folder downloads and listings belong under each project folder.
				 * The o.script parameter is used to direct handling of Ajax calls elsewhere.
				 */
				function showTree(c, t) {
					$(".jqueryFileTree.start").remove();
					if( o.root != t ) {
						$(c).addClass('wait');
						o.script(c, t, function(data) {
							$(c).find('.start').html('');
							$(c).removeClass('wait').append(data);
							$(c).find('UL:hidden').slideDown({ duration: o.expandSpeed, easing: o.expandEasing });
							bindTree(c);
						});
					}
					else {
						$(c).find('.start').html('');
						$(c).append(o.treeStructure);
						if( o.root == t ) $(c).find('UL:hidden').show();
						bindTree(c);
					}
				}

				/*
				 * Original File Tree Plugin code commented out.
				 *
				function showTree(c, t) {
					$(c).addClass('wait');
					$(".jqueryFileTree.start").remove();
					$.post(o.script, { dir: t }, function(data) {
						$(c).find('.start').html('');
						$(c).removeClass('wait').append(data);
						if( o.root == t ) $(c).find('UL:hidden').show(); else $(c).find('UL:hidden').slideDown({ duration: o.expandSpeed, easing: o.expandEasing });
						bindTree(c);
					});
				}*/

				function bindTree(t) {
					// Original code line:
					//$(t).find('LI A').on(o.folderEvent, function() {
					$(t).find('.fileTreeLink').on(o.folderEvent, function() {
						if( $(this).parent().hasClass('directory') ) {
							if( $(this).parent().hasClass('collapsed') ) {
								// Expand
								if( !o.multiFolder ) {
									$(this).parent().parent().find('UL').slideUp({ duration: o.collapseSpeed, easing: o.collapseEasing });
									$(this).parent().parent().find('LI.directory').removeClass('expanded').addClass('collapsed');
								}
								$(this).parent().find('UL').remove(); // cleanup
								/* Modified code for Plussa GUI purposes. */
								showTree( $(this).parent(), $(this).attr('rel') );
								/* Original code commented out
								showTree( $(this).parent(), escape($(this).attr('rel').match( /.*\// )) ); */
								$(this).parent().removeClass('collapsed').addClass('expanded');
							} else {
								// The option of Collapsing directories is removed
								//$(this).parent().find('UL').slideUp({ duration: o.collapseSpeed, easing: o.collapseEasing });
								//$(this).parent().removeClass('expanded').addClass('collapsed');
								/* Added code for Plussa GUI purposes. Call folder loading script in all cases.
								 * In this instance no HTML code is generated. Folder click is the chosen file destination.
								 */
								o.script( $(this).parent(), $(this).attr('rel'), function(p) { return; } );
							}

						} else {
							/* Modified code for Plussa GUI purposes. */
							fileCb($(this)); // File download callback.
							/* Original code commented out
							h($(this).attr('rel')); */
						}
						return false;
					});
					// Prevent A from triggering the # on non-click events
					if( o.folderEvent.toLowerCase != 'click' ) $(t).find('LI A').on('click', function() { return false; });
				}


				// Loading message
				$(this).html('<ul class="jqueryFileTree start"><li class="wait">' + o.loadMessage + '<li></ul>');
				// Get the initial file list
				showTree( $(this), escape(o.root) );
			});
		}
	});

})(jQuery);
