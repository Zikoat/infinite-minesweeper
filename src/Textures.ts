/**
 * Created by sisc0606 on 19.08.2017.
 */

import { Assets, Texture, Resource } from "pixi.js";

// todo make loading multiple skins possible
import tex_mine from "./assets/default/mine.png";
import tex_closed from "./assets/default/closed.png";
import tex_flag from "./assets/default/flag.png";
import tex_mineWrong from "./assets/default/mineWrong.png";
import tex_open from "./assets/default/open.png";
import tex_cursor from "./assets/default/cursor.png";
import tex_1 from "./assets/default/1.png";
import tex_2 from "./assets/default/2.png";
import tex_3 from "./assets/default/3.png";
import tex_4 from "./assets/default/4.png";
import tex_5 from "./assets/default/5.png";
import tex_6 from "./assets/default/6.png";
import tex_7 from "./assets/default/7.png";
import tex_8 from "./assets/default/8.png";
import { assert } from "./assert";

// todo rename resource to texture. never use resource?
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
  Assets.add([
    { alias: "closed", src: tex_closed },
    { alias: "flag", src: tex_flag },
    { alias: "mine", src: tex_mine },
    { alias: "mineWrong", src: tex_mineWrong },
    { alias: "open", src: tex_open },
    { alias: "cursor", src: tex_cursor },
    { alias: "1", src: tex_1 },
    { alias: "2", src: tex_2 },
    { alias: "3", src: tex_3 },
    { alias: "4", src: tex_4 },
    { alias: "5", src: tex_5 },
    { alias: "6", src: tex_6 },
    { alias: "7", src: tex_7 },
    { alias: "8", src: tex_8 },
  ] satisfies Array<{ alias: (typeof textureNames)[number]; src: unknown }>);

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

function validateTextures(
  textures: Record<string, Texture<Resource>>,
): MinesTextures {
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
