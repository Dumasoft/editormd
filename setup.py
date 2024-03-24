import os
import sys

from setuptools import find_packages, setup

__version__ = '0.1.2'

f = open("README.md")
readme = f.read()
f.close()

if sys.argv[-1] == "publish":
    if os.system("pip freeze | grep wheel"):
        print("wheel not installed.\nUse `pip install wheel`.\nExiting.")
        sys.exit()
    if os.system("pip freeze | grep twine"):
        print("twine not installed.\nUse `pip install twine`.\nExiting.")
        sys.exit()
    os.system("python setup.py sdist bdist_wheel")
    os.system("twine upload dist/*")
    print("You probably want to also tag the version now:")
    print("  git tag -a %s -m 'version %s'" % (__version__, __version__))
    print("  git push --tags")
    sys.exit()

setup(
    name='editormd',
    version=__version__,
    description='A Django editor text in markdown',
    long_description=readme,
    author='Bruno Gómez García',
    author_email='contacto@dumasoft.io',
    url='https://dumasoft.io',
    packages=find_packages(exclude=["tests*"]),
    include_package_data=True,
    license="BSD",
    zip_safe=False,
    install_requires=[
        'djangorestframework'
    ],
)