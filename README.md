[Ditto](http://bitpshr.info/ditto)
=================

Ditto is a webapp that auto-magically resolves a project's Dojo dependencies. It's meant to ease the creation of custom build profiles by showing developers all explicitly required modules in a given project.



How it works
-----------

Ditto works by traversing a project's file tree and finding all modules that are explicitly required. The modules can be AMD modules or legacy Dojo modules.

Ditto does <b>not</b> traverse the dependency tree. It will only list the modules that are required <i>within</i> your project. For example, if I require a `dijit.form.FilteringSelect` within my project, Ditto will only list "dijit/form/FilteringSelect", and not all dependencies of the FilteringSelect widget itself. The Dojo Build System takes care of all implicit dependencies, so these shouldn't be included in your build profiles anyways.



Future plans
------------

Ditto is a <b>work in progress</b>. There are several enhancements that can be made, including:

* Ignore certain files. Add an optional textbox that allows users to specify a pattern to ignore specific files, such as tests.
* Remove all PHP code, use only Python instead. We are currently calling a Python script from a PHP script. Its ugly.
* Use Dojo instead of jQuery for the app itself. Ditto hardly uses any JS at all, but it does use a jQuery plugin called [Filedrop](https://github.com/weixiyen/jquery-filedrop). We should port this to Dojo.
* Write some mother effing test cases. I don't want to. I'm lazy. But I need to.



Features & bugs
-----------

If you experience any issues using Ditto, or would like to see new functionality added, drop a line on our Issue Tracker.

https://github.com/bitpshr/ditto/issues

