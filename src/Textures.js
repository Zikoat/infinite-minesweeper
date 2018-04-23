/**
 * Created by sisc0606 on 19.08.2017.
 */

import * as PIXI from "pixi.js";

// todo make loading multiple skins possible
import mine from "./assets/default/mine.png";
import closed from "./assets/default/closed.png";
import flag from "./assets/default/flag.png";
import mineWrong from "./assets/default/mineWrong.png";
import open from "./assets/default/open.png";
import cursor from "./assets/default/cursor.png";
import one      from "./assets/default/1.png";
import two      from "./assets/default/2.png";
import three    from "./assets/default/3.png";
import four     from "./assets/default/4.png";
import five     from "./assets/default/5.png";
import six      from "./assets/default/6.png";
import seven    from "./assets/default/7.png";
import eight    from "./assets/default/8.png";


let loadingPromise;
export let textures = null;
export let width = 2;	

function processTextures(){
	return new Promise((resolve, reject)=>{
		PIXI.loader
			.add("closed",closed)
			.add("flag",flag)
			.add("mine",mine)
			.add("mineWrong",mineWrong)
			.add("open",open)
			.add("cursor",cursor)

			.add("1",one)
			.add("2",two)
			.add("3",three)
			.add("4",four)
			.add("5",five)
			.add("6",six)
			.add("7",seven)
			.add("8",eight)
			
			.load((loader, resources) => {
				resolve(resources);
			});
	});
}

export function load() {
	// if the loading has already started, return the same promise
	if(!loadingPromise) {
		loadingPromise = processTextures().then((resources)=>{
			// extract the textures out from the resources we loaded
			textures = {
				mine: resources.mine.texture,
				closed: resources.closed.texture,
				flag: resources.flag.texture,
				mineWrong: resources.mineWrong.texture,
				open: resources.open.texture,
				cursor: resources.cursor.texture
			};
			for(let i = 1; i <= 8; i++) {
				textures[i] = resources[i.toString()].texture;
			}

			width = textures.closed.width;
			
			console.log("done loading");
			return textures;
		}).catch(reason=>console.error(reason));
	}
	
	return loadingPromise;
}