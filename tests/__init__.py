"""Test package. Points DATALUME_DATA_DIR at a throwaway directory *before*
any backend module is imported, so tests never touch real user data."""

import os
import tempfile

os.environ["DATALUME_DATA_DIR"] = tempfile.mkdtemp(prefix="datalume-tests-")
