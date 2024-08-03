/**
 * Created by sisc0606 on 19.08.2017.
 */

import { Assets, Texture } from "pixi.js";

// todo make loading multiple skins possible
import { assert } from "./assert";

const textureNames = [
  "mine",
  "closed",
  "flag",
  "mineWrong",
  "open",
  "cursor",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
] as const;

export type MinesTextures = Record<(typeof textureNames)[number], Texture>;

export let width = 2;

export async function loadTextures(): Promise<MinesTextures> {
  const themeNames = ["default", "borbitnight", "winxp"];

  const textureAssets = textureNames.map((name) => ({
    alias: name,
    src: "./assets/" + themeNames[0] + "/" + name + ".png",
  }));

  Assets.add(
    textureAssets satisfies Array<{
      alias: (typeof textureNames)[number];
      src: unknown;
    }>,
  );

  const textures = validateTextures(
    await (Assets.load(textureNames) as Promise<Record<string, Texture>>),
  );

  width = textures.closed.width;

  return textures;
}

export function getTextures(): MinesTextures {
  const gottenTextures: Record<string, Texture> = {};

  for (const textureName of textureNames) {
    const gottenTexture = Assets.get(textureName);
    assert(
      gottenTexture,
      "could not get previously loaded texture " + textureName,
    );
    gottenTextures[textureName] = gottenTexture;
  }

  const textures = validateTextures(gottenTextures);

  return textures;
}

function validateTextures(textures: Record<string, Texture>): MinesTextures {
  assert(textures.mine);
  assert(textures.closed);
  assert(textures.flag);
  assert(textures.mineWrong);
  assert(textures.open);
  assert(textures.cursor);
  assert(textures[1]);
  assert(textures[2]);
  assert(textures[3]);
  assert(textures[4]);
  assert(textures[5]);
  assert(textures[6]);
  assert(textures[7]);
  assert(textures[8]);
  return textures as MinesTextures;
}
