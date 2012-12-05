[Ditto](http://profile.dojotoolkit.org/)
=================

Ditto is a webapp that auto-magically resolves a project's AMD and legacy dojo.require dependencies. It's meant to ease the creation of custom build profiles by showing developers all explicitly required modules in a given project.


What it does
------------
Ditto works by traversing a project's file tree and finding all modules that are <b>explicitly</b> required. The modules can be AMD modules or legacy Dojo modules, and can be required anywhere in any file within a project. Ditto will format all dependcies in standard dependency string format, giving the user an instant view into a project's dependencies.


What it doesn't do
------------
Ditto does <b>not</b> traverse the entire dependency tree. It will only list the modules that are required <i>within</i> your project. For example, if I require a `dijit.form.FilteringSelect` within my project, Ditto will only list "dijit/form/FilteringSelect", and not all dependencies of the FilteringSelect widget itself. Any worthwhile optimizer takes care of all implicit dependencies, so these shouldn't be included in your build profiles anyways!


Options
------------
Ditto includes several options to refine what modules it returns during analyzation. As mentioned, Ditto optionally supports listing all dojo.requires in addition to standard AMD modules. I wanted to make this really powerful for the Dojo community in particular; adding legacy support was a must. A user can also tell Ditto to only list custom modules, nothing from the Dojo, Dijit, or Dojox packages, even if explicitly required. Finally, a user can skip particular folders altogether. This is very useful when a library is included in your project. Again, think Dojo. If I had `dojo/`, `dojox/`, and `dijit/` locally in my project, I'd get tons of modules I don't care about in my dependency list.


Running locally
-----------
Ditto can be run locally in a php environment:

1. Run the following commands

```
git clone git@github.com:bitpshr/ditto.git
cd ditto
git submodule init
git submodule update
./build.sh
```

2. Deploy the contents of `dist/` to a php-enabled http server
3. Party


Browser support
-----------
Ditto requires a standards-compliant browser that supports HTML5 [File Access](http://www.html5rocks.com/en/features/file_access). Use the latest version of Safari, Firefox, or Chrome and you should be fine. I plan to implement regular old 1995-style file upload functionality for older browsers (I’m looking at you, IE). I could definitely use some help to determine specific version cutoffs.


Features & bugs
-----------
If you experience any issues using Ditto, or would like to see new functionality added, drop a line on our Issue Tracker.

https://github.com/bitpshr/ditto/issues


License
-------

Ditto is licensed under the [same terms](http://bugs.dojotoolkit.org/browser/dojo/trunk/LICENSE) as the Dojo Toolkit. Consult the individual projects for additional licensing information.
