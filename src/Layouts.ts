// reference: https://i.imgur.com/6dvfGVY.jpg
// from: http://htwins.net/minesweeper/ made by carykh
export type Layout = number[][];
const normal = [
  [-1, 1],
  [0, 1],
  [1, 1],

  [-1, 0],
  //[0,0],
  [1, 0],

  [-1, -1],
  [0, -1],
  [1, -1],
] satisfies Layout;
const knight = [
  [1, 2],
  [2, 1],
  [2, -1],
  [1, -2],
  [-1, -2],
  [-2, -1],
  [-2, 1],
  [-1, 2],
] satisfies Layout;
const swath = [
  [-2, -2],
  [-1, -2],
  [0, -2],
  [1, -2],
  [2, -2],

  [-2, -1],
  [-1, -1],
  [0, -1],
  [1, -1],
  [2, -1],

  [-2, 0],
  [-1, 0],
  //[0,0],
  [1, 0],
  [2, 0],

  [-2, 1],
  [-1, 1],
  [0, 1],
  [1, 1],
  [2, 1],

  [-2, 2],
  [-1, 2],
  [0, 2],
  [1, 2],
  [2, 2],
] satisfies Layout;
const orth = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
] satisfies Layout;
const farOrth = [
  [1, 0],
  [2, 0],
  [0, 1],
  [0, 2],
  [0, -1],
  [0, -2],
  [-1, 0],
  [-2, 0],
] satisfies Layout;
const noUp = [
  [-1, 1],
  //[0,1],
  [1, 1],

  [-1, 0],
  //[0,0],
  [1, 0],

  [-1, -1],
  [0, -1],
  [1, -1],
] satisfies Layout;
const noVert = [
  [-1, 1],
  //[0,1],
  [1, 1],

  [-1, 0],
  //[0,0],
  [1, 0],

  [-1, -1],
  //[0,-1],
  [1, -1],
] satisfies Layout;
const hexagon = [
  [1, 1],
  [-1, 0],
  [1, 0],
  [0, -1],
  [-1, -1],
  [0, 1],
] satisfies Layout;
const diagHex = [
  [1, 1],
  [-1, 0],
  [1, 0],
  [0, -1],
  [-1, -1],
  [0, 1],

  [1, 2],
  [2, 1],
  [1, -1],
  [-1, -2],
  [-2, -1],
  [-1, 1],
] satisfies Layout;
const horiz = [
  [-2, 0],
  [-1, 0],
  //[0,0],
  [1, 0],
  [2, 0],
] satisfies Layout;
// @ts-expect-error untested and unused. the following are double, and might not work
const double = [
  [-1, -1],
  [0, -1],
  [0, -1],
  [1, -1],

  [-1, 0],
  [-1, 0],
  //[0,0],
  [1, 0],
  [1, 0],

  [-1, -1],
  [0, -1],
  [0, -1],
  [1, -1],
] satisfies Layout;
// @ts-expect-error Untested and unused
const taxiCab = [
  [0, 2],

  [-1, 1],
  [0, 1],
  [0, 1],
  [1, 1],

  [-2, 0],
  [-1, 0],
  [-1, 0],
  //[0,0],
  [1, 0],
  [1, 0],
  [2, 0],

  [-1, -1],
  [0, -1],
  [0, -1],
  [1, -1],

  [0, -2],
] satisfies Layout;
// @ts-expect-error Untested and unused
const doubHex = [
  [1, 1],
  [-1, 0],
  [1, 0],
  [0, -1],
  [-1, -1],
  [0, 1],

  [1, 2],
  [2, 1],
  [1, -1],
  [-1, -2],
  [-2, -1],
  [-1, 1],
] satisfies Layout;
// @ts-expect-error Untested and unused
const pawn = [
  [0, 2],
  [-1, 1],
  [-1, 1],
  [0, 1],
  [0, 1],
  [1, 1],
  [1, 1],
] satisfies Layout;

export {
  normal,
  knight,
  swath,
  orth,
  farOrth,
  noUp,
  noVert,
  hexagon,
  diagHex,
  horiz,
  // dont export doubles, as they are unstable
};
