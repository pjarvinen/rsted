import requests, subprocess, os, sys, shutil, random
from zipfile import ZipFile
from io import BytesIO
import urllib
import urllib.request
import gitlab
import base64

base_url = "https://gitlab.com/api/v4/projects/"

class RSTCompiler:
    def __init__(self, project_id, token, filepath):
        self.gl = gitlab.Gitlab('https://gitlab.com', private_token=token)
        self.project_id = project_id
        self.project = self.gl.projects.get(project_id)
        self.token = token
        self.filepath = filepath
        self.dirpath = "temp/" + str(self.project_id) + "/"
    def download_archive(self):
        directory = "temp/" + self.project_id
        # Remove old project directory
        shutil.rmtree(directory, ignore_errors=True)

        # API Url
        url = base_url + str(self.project_id) + "/repository/archive.zip"
        # Set Private Token as header
        headers = {'PRIVATE-TOKEN': self.token}
        print(headers)
        # Make the API request
        #r = requests.get(url, headers=headers, stream=True)
        req = urllib.request.Request(url, headers=headers)
        r = urllib.request.urlopen(req)
        print("url")
        #try:
        with ZipFile(BytesIO(r.read())) as zipObj:
            namelist = zipObj.namelist()
            zipObj.extractall("temp")
            os.rename("temp/" + str(namelist[0])[:-1], "temp/" + str(self.project_id))
            return self.dirpath
        #except:
        #    print("Unexpected error while extracting zip file: ", sys.exc_info()[0])
        #    return None


    def compile_rst(self):
        try:
            subprocess.call("make html", cwd=self.dirpath, shell=True)
        except subprocess.CalledProcessError as err:
            print("Error while building html: {0}".format(err))
            return 1
        return 0

    def getListOfFiles(self, dirName):
        # create a list of file and sub directories 
        # names in the given directory 
        listOfFile = os.listdir(dirName)
        allFiles = list()
        # Iterate over all the entries
        for entry in listOfFile:
            # Create full path
            fullPath = os.path.join(dirName, entry)
            # If entry is a directory then get the list of files in this directory 
            if os.path.isdir(fullPath):
                allFiles = allFiles + self.getListOfFiles(fullPath)
            else:
                allFiles.append(fullPath)
                    
        return allFiles

    def publish(self):
        dirName = self.dirpath + "_build/"
        listOfFiles = self.getListOfFiles(dirName)
        create_data = {
            'branch_name': 'master',  # v3
            'branch': 'master',  # v4
            'commit_message': 'New Build from PlussaGUI',
            'actions': []
        }
        update_data = {
            'branch_name': 'master',  # v3
            'branch': 'master',  # v4
            'commit_message': 'New Build from PlussaGUI',
            'actions': []
        }
        for elem in listOfFiles:
            f = None
            try:
                f = self.project.files.get(file_path=elem, ref='master')
            except gitlab.exceptions.GitlabGetError as error:
                if str(error).startswith('400'):
                    f = None
            if f is None:
                if elem.endswith('.html') or elem.endswith('.yaml') or elem.endswith('.js') or elem.endswith('.css'):
                    create_data['actions'].append({
                                    'action': 'create',
                                    'file_path': elem,
                                    'content': open(elem, encoding="utf8").read(),
                                })
                elif elem.endswith('.png') or elem.endswith('.jpg') or elem.endswith('.gif'):
                    with open(elem, 'rb') as image:
                        byte_content = image.read()
                    base64_bytes = base64.b64encode(byte_content)
                    base64_string = base64_bytes.decode('utf-8')
                    create_data['actions'].append({
                                # Binary files need to be base64 encoded
                                'action': 'create',
                                'file_path': elem,
                                'content': base64_string,
                                'encoding': 'base64',
                            })
            else:
                if elem.endswith('.html') or elem.endswith('.yaml') or elem.endswith('.js') or elem.endswith('.css'):
                    update_data['actions'].append({
                                    'action': 'update',
                                    'file_path': elem,
                                    'content': open(elem, encoding="utf8").read(),
                                })
                elif elem.endswith('.png') or elem.endswith('.jpg') or elem.endswith('.gif'):
                    with open(elem, 'rb') as image:
                        byte_content = image.read()
                    base64_bytes = base64.b64encode(byte_content)
                    base64_string = base64_bytes.decode('utf-8')
                    update_data['actions'].append({
                                # Binary files need to be base64 encoded
                                'action': 'update',
                                'file_path': elem,
                                'content': base64_string,
                                'encoding': 'base64',
                            })
        self.project.commits.create(create_data)
        self.project.commits.create(update_data)
        return True

    def get_html(self):
        if self.filepath.endswith(".rst"):
            self.filepath = self.filepath[:-4] + ".html"
        full_path = self.dirpath + "_build/html/" + self.filepath + "?" + str(random.randint(1,500))
        return full_path
        

    def directory_exists(self):
        if os.path.isdir("temp/" + str(self.project_id)):
            print (os.path)
            return True
        else:
            return False
        
