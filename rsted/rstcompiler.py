import requests, subprocess, os, sys, shutil, random
from zipfile import ZipFile
from io import BytesIO
import urllib.request

base_url = "https://gitlab.com/api/v4/projects/"

class RSTCompiler:
    def __init__(self, project_id, token, filepath):
        self.project_id = project_id
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
            subprocess.check_call(["make", "html"], cwd=self.dirpath, shell=True)
        except subprocess.CalledProcessError as err:
            print("Error while building html: {0}".format(err))
            return 1
        return 0


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
        
