/**
 * Created by sisc0606 on 19.08.2017.
 */
export const sqrt = Math.sqrt;
export function square(x) {
	return x * x;
}
export function diag(x, y) {
	return sqrt(square(x) + square(y));
}

export let changeThis;

setTimeout(function() {
	changeThis += 20;
}, 100);