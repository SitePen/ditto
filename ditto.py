#!/usr/bin/python
 
import re, os, sys
 
def grep(regex, base_dir):
    matches = list()
    for path, dirs, files in os.walk(base_dir):
        for filename in files:
            fullpath = os.path.join(path, filename)
            f = open(os.path.abspath(fullpath), 'r')
            content = f.read()
            if(len(content) > 0):
                matches = matches + re.findall(regex, content)
    return matches
 
def sanitize(modules, amd):
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
            modules[i] = re.sub("\\]\\s*\\)", "", modules[i])
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
    return cleanModules

def findModules(path):
    dependencies = list()
    # get required modules
    dependencies = sanitize(grep('require\\(\\s*\\[[^]]*\\]\\s*\\)', path), True)
    # get defined modules
    dependencies = dependencies + sanitize(grep('define\\(\\s*\\[[^]]*\\]\\s*\\)', path), True)
    # get dojo.required modules
    dependencies = dependencies + sanitize(grep('dojo.require\\(..*?\\)', path), False)
    # clean them all & remove duplicates
    return ",".join(list(set(dependencies)))

# check num of params
if len(sys.argv) < 2:
    print "usage: python ditty.py [projectDir]"
    exit(0)
print findModules(sys.argv[1])