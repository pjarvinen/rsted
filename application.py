#!/usr/bin/env python
# all the imports

import os, sys
#reload(sys)
#sys.setdefaultencoding('utf-8')

from flask import Flask, request, render_template, make_response, url_for, send_from_directory

<<<<<<< HEAD
from rsted.rstcompiler import RSTCompiler
=======
from rsted.html import rst2html as _rst2html
>>>>>>> da2ca956f2d7a3836fed2355aa7204c7ef154cf3

from flaskext.helpers import render_html

# handle relative path references by changing to project directory
run_from = os.path.dirname(os.path.abspath(sys.argv[0]))
if run_from != os.path.curdir:
    os.chdir(run_from)

# create our little application :)
app = Flask(__name__)
app.config.from_pyfile(os.environ.get('RSTED_CONF', 'settings.py'))



def view_is_active(view_name):
    if request.path == url_for(view_name):
        return 'active'
    return ''

@app.context_processor
def ctx_pro():
    return {
        'MEDIA_URL': '/static/',
        'is_active': view_is_active
    }

@app.route("/")
@render_html('index.html')
def index():
    yield 'js_params', {'theme': request.args.get('theme', '')}


<<<<<<< HEAD
@app.route('/srv/preview/', methods=['POST', 'GET'])
def preview():
    token = request.form.get('token', '')
    project = request.form.get('project', '')
    filepath = request.form.get('filepath', '')
    rst = request.form.get('rst', '')
    if not token or not project or not filepath:
        return ""
    else:
        compiler = RSTCompiler(project, token, filepath)
        if not compiler.directory_exists():
            print("Directory doesnt exist")
            compiler.download_archive()
        with open(compiler.dirpath + filepath, "w") as rf:
            rf.write(rst)
        compiler.compile_rst()
        return compiler.get_html()

@app.route('/srv/loadproject/', methods=['POST', 'GET'])
def loadproject():
    token = request.form.get('token', '')
    project = request.form.get('project', '')
    filepath = request.form.get('filepath', '')
    if not token or not project or not filepath:
        return ""
    else:
        compiler = RSTCompiler(project, token, filepath)
        if compiler.download_archive():
            compiler.compile_rst()
            return compiler.get_html()


@app.route('/temp/<path:filename>')
def temp_projects(filename):
    return send_from_directory(app.root_path + '/temp/', filename, conditional=True)
=======
@app.route('/about/')
def about():
    return render_template('about.html')

@app.route('/srv/rst2html/', methods=['POST', 'GET'])
def rst2html():
    rst = request.form.get('rst', '')
    theme = request.form.get('theme')
    if theme == 'basic':
        theme = None
    html = _rst2html(rst, theme=theme)
    return html
>>>>>>> da2ca956f2d7a3836fed2355aa7204c7ef154cf3


if __name__ == '__main__':
    app.run(host=app.config.get('HOST', '0.0.0.0'),
            port=app.config.get('PORT', 5000))
