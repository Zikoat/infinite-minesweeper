/**
 * Created by sisc0606 on 19.08.2017.
 */
import * as PIXI from "pixi.js";
import mine from "./assets/mine.png";
import closed from "./assets/closed.png";
import flag from "./assets/flag.png";
import mineWrong from "./assets/mineWrong.png";
import open from "./assets/open.png";

import one      from "./assets/1.png";
import two      from "./assets/2.png";
import three    from "./assets/3.png";
import four     from "./assets/4.png";
import five     from "./assets/5.png";
import six      from "./assets/6.png";
import seven    from "./assets/7.png";
import eight    from "./assets/8.png";

const numberImages = {
	1:one,
	2:two,
	3:three,
	4:four,
	5:five,
	6:six,
	7:seven,
	8:eight
};

let numberTextures = {};

for(let i = 1; i <= 8; i++) {
	numberTextures[i] = PIXI.Texture.fromImage(numberImages[i]);
}

export default {
	mine: PIXI.Texture.fromImage(mine),
	closed: PIXI.Texture.fromImage(closed),
	flag: PIXI.Texture.fromImage(flag),
	mineWrong: PIXI.Texture.fromImage(mineWrong),
	open: PIXI.Texture.fromImage(open),
	numbers: numberTextures
};