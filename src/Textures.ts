/**
 * Created by sisc0606 on 19.08.2017.
 */

import { Assets, Texture, Resource, utils, Loader } from "pixi.js";

// todo make loading multiple skins possible
import mine from "./assets/default/mine.png";
import closed from "./assets/default/closed.png";
import flag from "./assets/default/flag.png";
import mineWrong from "./assets/default/mineWrong.png";
import open from "./assets/default/open.png";
import cursor from "./assets/default/cursor.png";

import one from "./assets/default/1.png";
import two from "./assets/default/2.png";
import three from "./assets/default/3.png";
import four from "./assets/default/4.png";
import five from "./assets/default/5.png";
import six from "./assets/default/6.png";
import seven from "./assets/default/7.png";
import eight from "./assets/default/8.png";
import { assert } from "./assert";

export let textures: MinesTextures;

export type MinesTextures = {
  mine: Texture;
  closed: Texture;
  flag: Texture;
  mineWrong: Texture;
  open: Texture;
  cursor: Texture;

  1: Texture;
  2: Texture;
  3: Texture;
  4: Texture;
  5: Texture;
  6: Texture;
  7: Texture;
  8: Texture;
};

export let width = 2;

async function processTextures(): Promise<Record<string, Texture>> {
  Assets.addBundle("myBundle", [
    { alias: "closed", src: closed },
    { alias: "flag", src: flag },
    { alias: "mine", src: mine },
    { alias: "mineWrong", src: mineWrong },
    { alias: "open", src: open },
    { alias: "cursor", src: cursor },
    { alias: "1", src: one },
    { alias: "2", src: two },
    { alias: "3", src: three },
    { alias: "4", src: four },
    { alias: "5", src: five },
    { alias: "6", src: six },
    { alias: "7", src: seven },
    { alias: "8", src: eight },
  ]);

  const loadedBundle: { myBundle: MinesTextures } = await Assets.loadBundle([
    "myBundle",
  ]);

  return loadedBundle.myBundle;
}

export async function load() {
  // if the loading has already started, return the same promise
  const resources = await processTextures();
  assert(resources.mine);
  assert(resources.closed);
  assert(resources.flag);
  assert(resources.mineWrong);
  assert(resources.open);
  assert(resources.cursor);
  assert(resources[1]);
  assert(resources[2]);
  assert(resources[3]);
  assert(resources[4]);
  assert(resources[5]);
  assert(resources[6]);
  assert(resources[7]);
  assert(resources[8]);

  textures = {
    mine: resources.mine,
    closed: resources.closed,
    flag: resources.flag,
    mineWrong: resources.mineWrong,
    open: resources.open,
    cursor: resources.cursor,
    1: resources[1],
    2: resources[2],
    3: resources[3],
    4: resources[4],
    5: resources[5],
    6: resources[6],
    7: resources[7],
    8: resources[8],
  };

  width = textures.closed.width;
  return textures;
}
