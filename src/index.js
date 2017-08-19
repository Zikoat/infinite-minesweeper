import _ from 'lodash';
import { square, diag } from './lib';
import Field from "./Field";

function component() {
	var element = document.createElement('div');
	
	// Lodash, now imported by this script
	element.innerHTML = _.join(['owo', "does", 'webpack', "work"], ' ');
	
	return element;
}

console.log(square(11));

const f = new Field();
f.open(1,1);

document.body.appendChild(component());