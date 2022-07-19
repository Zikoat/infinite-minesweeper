/**
 * Created by sisc0606 on 19.08.2017.
 */

function openCellsSimple(field) {}

function flagCellsSimple(field) {
  field.getAll().forEach((cell) => {
    let neighbors = cell.getNeighbors();
    let closedNeighbors = neighbors.filter((cell) => !cell.isOpen);
    if (cell.value() === closedNeighbors.length) {
      closedNeighbors.forEach((cell) => cell.flag());
    }
  });
}

export default class SimpleBot {
  constructor(field) {
    this.field = field;

    this.openQueue = [];
    this.flagQueue = [];

    //window.setInterval(step, 400);
  }
  step() {
    console.log(`there are ${this.flagQueue.length} cells to flag`);
    console.log(`there are ${this.openQueue.length} cells to open`);

    const toFlag = this.flagQueue.pop(); // type cell or undefined
    if (toFlag) {
      if (toFlag.isFlagged) {
        console.log("is already flagged:", toFlag);
        return;
      }
      toFlag.flag();
      console.log("flagged");
      return toFlag;
    }

    const toOpen = this.openQueue.pop();
    if (toOpen) {
      toOpen.open();
      console.log("opened");
      return toOpen;
    }

    this.flagToQueue();
    this.openToQueue();
  }

  flagToQueue() {
    this.field.getAll().forEach((cell) => {
      const neighbors = cell.getNeighbors();
      const closedNeighbors = neighbors.filter((cell) => !cell.isOpen);
      if (cell.value() === closedNeighbors.length) {
        closedNeighbors.forEach((neighbor) => {
          if (!neighbor.isFlagged) this.flagQueue.push(neighbor);
        });
      }
    });
  }

  openToQueue() {
    this.field
      .getAll()
      .filter((cell) => cell.isOpen && cell.value() !== 0)
      .forEach((cell) => {
        const neighboringCells = cell.getNeighbors(); // type [cells]
        const neighboringMinesAmount = cell.value(); // type int
        const neighboringClosedCellsAmount = neighboringCells.filter(
          (cell) => cell.isOpen
        ).length; // type int
        const neighboringFlagAmount = neighboringCells.filter(
          (cell) => cell.isFlagged
        ).length; // type int

        let restNeighbors = neighboringCells.filter(
          (neighbor) => !(neighbor.isFlagged || neighbor.isOpen)
        );

        if (restNeighbors.length === neighboringMinesAmount)
          restNeighbors.forEach((neighbor) => this.openQueue.push(neighbor));
      });
  }

  runBotSimple() {
    let steps = 0;
    let prevOpened = -1;
    while (
      this.field.getAll().filter((cell) => cell.isOpen).length !== prevOpened
    ) {
      steps++;
      prevOpened = this.field.getAll().filter((cell) => cell.isOpen).length;
      flagCellsSimple(this.field);
      openCellsSimple(this.field);
    }
  }

  logStats() {
    let all = this.field.getAll();
    console.log("all:", all.length);
    console.log("flags:", all.filter((cell) => cell.isFlagged).length);
    let opened = all.filter((cell) => cell.isOpen);
    console.log("opened:", opened.length);
    if (
      all.length - opened.length !==
      all.filter((cell) => !cell.isOpen).length
    )
      console.warn(
        "openDiff:",
        all.length - opened.length - all.filter((cell) => !cell.isOpen).length
      );
    console.log("closed:", all.length - opened.length);
    return { steps: steps };
  }
}
