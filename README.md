# ![flag](https://i.imgur.com/YnpGd36.png) Minefield Resurrected
An infinite, open source, Minesweeper. Based on borbit's mienfield.com

## Play the game at [Zikoat.github.io](https://zikoat.github.io/)
and join our [Discord][discord]

## Getting started with development
If you need help with using installation or using the source, message me on the [Discord server][discord]
### Prerequisites
Install [nodejs](https://nodejs.org/en/)

### Installing
[clone the git repository](https://help.github.com/articles/cloning-a-repository/) to your computer, from a [git IDE](https://www.sourcetreeapp.com/), or with the console.

open your terminal, and change your directory to the cloned folder
```
cd infinite-minesweeper
```
and run
```
npm install
```
to install the required dependencies
### Starting the development environment
```
npm start
```
`npm start` will open a new tab in your browser, showing you a new field. gameplay is the same as mienfield.com, but works locally and is not multiplayer
the files in your repository are being watched, and the site is getting reloaded

## Deploying
```
npm run build
```
The files will be built to the `./dist` directory. Copy these files to your hosting platform

## Built With
* Pixi.js
* Webpack
 
[discord]: https://discord.gg/UWWueDb