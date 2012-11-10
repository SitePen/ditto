#!/usr/bin/python
 
import re, os, sys
import argparse
 
def grep(regex, base_dir, noDojo, noDijit, noDojox, customIgnore):
    matches = list()
    for path, dirs, files in os.walk(base_dir):
        if 'dojo' in dirs and noDojo == True:
            dirs.remove('dojo')
        if 'dijit' in dirs and noDijit == True:
            dirs.remove('dijit')
        if 'dojox' in dirs and noDojox == True:
            dirs.remove('dojox')
        if customIgnore and customIgnore in dirs:
            dirs.remove(customIgnore)
        for filename in files:
            fullpath = os.path.join(path, filename)
            f = open(os.path.abspath(fullpath), 'r')
            content = f.read()
            if(len(content) > 0):
                matches = matches + re.findall(regex, content)
    return matches
 
def sanitize(modules, amd, customOnly):
    cleanModules = list()
    if amd:
        for i in range (len(modules)):
        	# remove all whitespace
            modules[i] = re.sub("\s", "", modules[i])
            # remove all single / double quotes
            modules[i] = re.sub("[\'\"]", "", modules[i])
            # remove require([
            modules[i] = re.sub("require\\(\\s*\\[", "", modules[i])
            # remove define([
            modules[i] = re.sub("define\\(\\s*\\[", "", modules[i])
           	# remove ending paren
            modules[i] = re.sub("\\]", "", modules[i])
            # split require string into a list
            tmp = modules[i].split(",")
            # shove into cleanModules
            cleanModules = cleanModules + tmp
    else:
        for i in range (len(modules)):
            # remove all whitespace
            modules[i] = re.sub("\s", "", modules[i])
            # remove all single / double quotes
            modules[i] = re.sub("[\'\"]", "", modules[i])
            # remove dojo.require(
            modules[i] = re.sub("dojo.require\\(", "", modules[i])
            # remove end paran
            modules[i] = re.sub("\\)", "", modules[i])
            # replace all dots with slashes
            modules[i] = re.sub("\\.", "/", modules[i])
            # remove if empty
            if len(modules[i]) != 0:
               cleanModules.append(modules[i])
    if customOnly:
        # remove all dojo / dijit / dojox
        cleanModules = removeDojoModules(cleanModules);
    return cleanModules

def removeDojoModules(modules):
    customModules = list()
    for i in range (len(modules)):
        package = modules[i][:modules[i].index("/")]
        if package!="dojo" and package!="dijit" and package!="dojox":
            customModules.append(modules[i])
    return customModules

def findModules(path, legacyMode, noDojo, noDijit, noDojox, customIgnore, customOnly):
    dependencies = list()
    # get required modules
    dependencies = sanitize(grep('require\\(\\s*\\[[^]]*\\]\\s*', path, noDojo, noDijit, noDojox, customIgnore), True, customOnly)
    # get defined modules
    dependencies = dependencies + sanitize(grep('define\\(\\s*\\[[^]]*\\]\\s*', path, noDojo, noDijit, noDojox, customIgnore), True, customOnly)
    # get dojo.required modules
    if legacyMode:
        dependencies = dependencies + sanitize(grep('dojo.require\\(..*?\\)', path, noDojo, noDijit, noDojox, customIgnore), False, customOnly)
    # clean them all & remove duplicates
    return ",".join(list(set(dependencies)))

# Handle args and do the dang thing
parser = argparse.ArgumentParser(description='Auto-magically resolve AMD modules.')
parser.add_argument('-d', metavar="--dir", required=True, dest="dir", help="path to project")
parser.add_argument('-l', dest="legacyMode", action='store_true', help='find legacy dojo.requires( ) too')
parser.add_argument('-c', dest="customOnly", action='store_true', help="don't list dojo modules")
parser.add_argument('-noDojo', dest="noDojo", action='store_true', help="don't search dojo/")
parser.add_argument('-noDijit', dest="noDijit", action='store_true', help="don't search dijit/")
parser.add_argument('-noDojox', dest="noDojox", action='store_true', help="don't search dojox/")
parser.add_argument('-i', metavar="--ignore", required=False, dest="customIgnore", help="custom folder to ignore")
args = parser.parse_args()

print findModules(args.dir, args.legacyMode, args.noDojo, args.noDijit, args.noDojox, args.customIgnore, args.customOnly)

