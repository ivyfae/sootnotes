# SootNotes

Sootnotes is a minimal, out-of-your-way note-taking aid. It can take screenshots and video screen captures, and will produce a markdown file containing your notes and links to any screenshots or videos you take. 

Sootnotes is intended for use by penetration testers, technical writers, educators, and anyone else who needs a quick way to document multi-step processes.

## Platforms

SootNotes is an [electron](https://github.com/electron/electron) + [reactjs](https://github.com/reactjs/reactjs.org) app and should be able to run on any platform supported by electron.

* Windows: Yes
  * Windows binaries can be found at [https://homosexual.coffee/sootnotes/builds](https://homosexual.coffee/sootnotes/builds)
  * Follow build instructions below to create a setup binary.
* Linux: Partial (tested on [Kali](https://github.com/offensive-security))
  * `yarn dist:linux` to create .AppImage executable
  * resulting file needs `chmod +x` and to be run with `--no-sandbox` option
  * no install script or package yet
* MacOS: Untested

## To build executable

1. Install [nodejs (v12)](https://nodejs.org/en/)
2. Install [git (latest version)](https://git-scm.com/)
3. Run `git clone https://github.com/ivyfae/sootnotes.git`
4. Run `npm install`
    * If `yarn` was not installed by npm, run `npm install yarn`.
5. Run `yarn dist` (or `yarn dist:<your platform>` ['win', 'mac', 'linux'] (or 'mac-zip' if you would rather build a zip than a dmg))
6. The resulting install package can be found in `dist/`
    * The install package is not code-signed, so you may need to tell your OS to trust SootNotes.
    * **On Linux**, `chmod +x` and run the .AppImage with `--no-sandbox` option

## How to use SootNotes

  SootNotes was designed to build a Markdown file by appending each entry to the end of the file as you go. Editing, formatting, and cleanup are tasks that can be distracting and interrupt your rhythm or flow, so it is assumed that those things will be done in a text editor when you've completed the process you're documenting.
  
  SootNotes does not include a markdown viewer, so you'll need to find a markdown viewer or browser extension that works for you.

  1. Select an Output Directory using File > Select Output Directory
    * This is where `notes.md` and the `videos/` and `images/` directories will be created.
    * This setting will be stored between sessions.
  2. Select a Capture Source using the "Select Capture Source" button.
    * Screen sources will capture everything visible on that screen/monitor (including SootNotes, if it is visible to you).
    * Window sources will capture just the selected application window, excluding any other windows (such as SootNotes) that may be in front of it.
  3. Build your document
    * Add a note by typing into the box. Submit it by clicking **Add Note** or using **CTRL+ENTER** keyboard shortcut. The text box will be cleared.
    * Add a screenshot by clicking the **Add Screenshot** button. The screenshot will be saved to `images/` and a markdown image tag will be appended to the end of `notes.md`.
    * Add a recording by clicking the **Add Recording** button. The button's recording icon will blink and change to "Stop Recording" to indicate that a recording is in progress. Click **Stop Recording** to save the video to `videos/` and append a `<video>` tag to `notes.md`

  That's it! 

  Other available options: 
  * File
    * **Show Output Directory** opens your selected output directory in your operating system's file browser (explorer, finder, xdg-open)
  * Options
    * **Always on Top** toggles whether SootNotes should stay visible, even when another window has focus.
    * **Manually Name Captures** toggles whether to use auto-generated file names for screenshots and videos, or to pop up a save dialog and allow you to name the files yourself. 
      
## Development

Note: SootNotes' main branch is called `development`

1. Install [nodejs (v12)](https://nodejs.org/en/)
2. Install [git (latest version)](https://git-scm.com/)
3. Run `git clone https://github.com/ivyfae/sootnotes.git`
4. Run `npm install`
  * If `yarn` was not installed by npm, run `npm install yarn` and try again.
5. Run `yarn start` to launch the electron app and automatically rebuild and reload web content on save
  * If you need to relaunch electron after closing it, you can use `yarn start:electron` instead
