# Sootnotes

Sootnotes is a minimal, out-of-your-way note-taking aid. It can take screenshots and video screen captures, and will produce a markdown file containing your notes and links to any screenshots or videos you take. 

Sootnotes was designed as a low-friction way to continuously document steps taken during pentesting, hacking challenges, and the offensive security exams which require or suggest submission of a report detailing findings. 

At the moment, the Sootnotes repo is private, and the license has not been determined. Once a license has been assigned and a build has been verified on windows, linux, and macOs, the repo will be made public. Until then, if you have access to this repo, you may use Sootnotes, but please do not distribute the application or its source code without prior consent from its author. 

## To build for use

1. install [nodejs v12](https://nodejs.org/en/)
2. run `npm install`
3. run `yarn dist` (or `yarn dist:<your platform>` ['win', 'mac', 'linux'] (or 'mac-zip' if you would rather build a zip than a dmg))
4. the resulting install package can be found in `dist/`
  * the install package is not yet code-signed, so you may need to tell your OS to trust sootnotes

## To develop
1. install [nodejs v12](https://nodejs.org/en/)
2. run `npm install`
3. run `yarn start` to launch the electron app and automatically rebuild and reload web content on save
  * if you need to relaunch electron after closing it, you can use `yarn start:electron` instead

