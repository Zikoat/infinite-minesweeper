# ![flag](https://i.imgur.com/YnpGd36.png) Minefield Resurrected

An infinite, open source, Minesweeper. Based on borbit's mienfield.com

## Play the game at [Zikoat.github.io](https://zikoat.github.io/)

and join our [Discord][discord]

## Getting started with development

If you need help with using installation or using the source, message me on the [Discord server][discord] or [send me a mail][mail]

### Prerequisites

Install [nodejs](https://nodejs.org/en/)

### Installing

[clone the git repository](https://help.github.com/articles/cloning-a-repository/) to your computer, from a [git GUI](https://www.sourcetreeapp.com/), or with the console.

open your terminal, and change your directory to the cloned folder

```shell
cd infinite-minesweeper
```

and run

```shell
npm install
```

to install the required dependencies

### Starting the development environment

```shell
npm start
```

`npm start` will open a new tab in your browser, showing you a new field. gameplay is the same as mienfield.com, but works locally and is not multiplayer. The files in your repository are being watched, and the site is getting reloaded automatically when you change a file.

## Deploying

```shell
npm run build
```

The files will be built to the `./dist` directory. Copy these files to your hosting platform

## Made With

- Pixi.js
- TypeScript
- ~~Webpack~~ [bun](https://bun.sh/)
- GreenSock
- :heart:

[discord]: https://discord.gg/XzpSVxx
[mail]: mailto:sschoeler99@gmail.com
