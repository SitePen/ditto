[Ditto](http://bitpshr.info/ditto)
=================

Ditto is a webapp that auto-magically resolves a project's AMD and legacy dojo.require dependencies. It's meant to ease the creation of custom build profiles by showing developers all explicitly required modules in a given project.



What it does
-----------

Ditto works by traversing a project's file tree and finding all modules that are explicitly required. The modules can be AMD modules or legacy Dojo modules, and can be required anywhere in any file within a project. Ditto will format all dependcies in the required format for a custom Dojo build profile.



What it doesn't do
-----------

Ditto does <b>not</b> traverse the dependency tree. It will only list the modules that are required <i>within</i> your project. For example, if I require a `dijit.form.FilteringSelect` within my project, Ditto will only list "dijit/form/FilteringSelect", and not all dependencies of the FilteringSelect widget itself. <b>The Dojo Build System takes care of all implicit dependencies, so these shouldn't be included in your build profiles anyways.</b>



Browser support
-----------

Ditto requires a standards-compliant browser that supports HTML5 [File Access](http://www.html5rocks.com/en/features/file_access). Use the latest version of Safari, Firefox, or Chrome and you should be fine. I could definitely use some help to determine specific version cutoffs.



Running locally
-----------

Ditto can be run locally on any HTTP server such as Apache or Node:

1. Run the following commands

```
git clone git@github.com:bitpshr/ditto.git
cd ditto
git submodule init
git submodule update
./build.sh
```

2. Deploy the contents of `dist/`
3. Party


Future plans
------------

Ditto is a <b>work in progress</b>. There are several enhancements that can be made, including:

* Ignore certain files. Add an optional textbox that allows users to specify a pattern to ignore specific files, such as tests.
* Remove all PHP code, use only Python instead. We are currently calling a Python script from a PHP script. Its ugly.
* Write some mother effing test cases. I don't want to. I'm lazy. But I need to.



Features & bugs
-----------

If you experience any issues using Ditto, or would like to see new functionality added, drop a line on our Issue Tracker.

https://github.com/bitpshr/ditto/issues


