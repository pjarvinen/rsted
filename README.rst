A-plus https://github.com/Aalto-LeTech/a-plus LMS course material editor based on a simple online editor https://github.com/anru/rsted for reStructuredText on Flask.

This is a group work for TIEA4 & TIETS19 courses at Tampere University in Finland.

Getting setup
-------------

Requirements for rsted:

* Flask
* rst2html (from Docutils)

These requirements are expressed in the pip-requirements.txt file and may be
installed by running the following (from within a virtual environment)::

    pip install -r pip-requirements.txt


How to run
----------

Your Environment
++++++++++++++++
From within your environment, just run::

    ./application.py

This will start a server on port 5000.  Just visit http://localhost:5000/ in
your browser.

Docker
++++++
In a docker installed host, just build and run::

    docker build -t rsted .
    docker run --name rsted --rm -p 5000:5000 rsted

A server starts on port 5000. Please adjust it, if you need another port
by changing run command above. And then just visit http://localhost:5000/ in
your browser.
