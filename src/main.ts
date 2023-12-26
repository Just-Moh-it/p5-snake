import p5 from "p5";

import "./style.css";

// @ts-expect-error unused var
const _app = new p5((p5Instance) => {
  const p = p5Instance as unknown as p5;

  const canvasWidth = 400;
  const canvasHeight = 400;
  let resolution = 20;
  const speedMag = resolution;
  let s: Snake;
  let food: Food;
  let timer = 0;
  let frameRate = 15;
  let score = 0;

  p.setup = function () {
    this.createCanvas(canvasWidth, canvasHeight);

    food = new Food(resolution, canvasWidth, canvasHeight, p);
    s = new Snake(
      canvasWidth,
      canvasHeight,
      resolution,
      food,
      p,
      speedMag,
      increaseScore
    );

    food.update();
  };

  function increaseScore() {
    score++;
  }

  p.draw = function () {
    this.background(0, 0, 0);

    if (timer % frameRate === 0) {
      s.update();
    }

    s.show();
    food.show();

    p.text(score.toString(), canvasWidth - 20, 20);

    timer++;
  };

  p.keyPressed = function () {
    let newYSpeed = s.ySpeed;
    let newXSpeed = s.xSpeed;

    if (p.keyCode === p.UP_ARROW && newYSpeed === 0) {
      newYSpeed = speedMag * -1;
      newXSpeed = 0;
    } else if (p.keyCode === p.DOWN_ARROW && newYSpeed === 0) {
      newYSpeed = speedMag;
      newXSpeed = 0;
    } else if (p.keyCode === p.LEFT_ARROW && newXSpeed === 0) {
      newYSpeed = 0;
      newXSpeed = speedMag * -1;
    } else if (p.keyCode === p.RIGHT_ARROW && newXSpeed === 0) {
      newYSpeed = 0;
      newXSpeed = speedMag;
    } else if (p.key === ",") {
      frameRate += 2;
    } else if (p.key === ".") {
      frameRate -= 2;
    } else if (p.key === "-") {
      resolution -= 1;
    } else if (p.key === "=") {
      resolution += 1;
    } else if (p.key === "r") {
      this.setup();
    }

    if (
      s.partCoords.at(-2)?.[0] === s.partCoords.at(-1)?.[0] &&
      s.partCoords.at(-2)?.[1] === s.partCoords.at(-1)?.[1]
    )
      return;

    s.ySpeed = newYSpeed;
    s.xSpeed = newXSpeed;
  };
}, document.getElementById("app")!);

class Snake {
  xSpeed: number;
  ySpeed: number;
  private resolution = 0;
  private canvasHeight;
  private canvasWidth;
  private food: Food;
  private p: p5;
  private isGameOver = false;
  private onEatingFood: () => void;
  partCoords: [number, number][];

  constructor(
    canvasWidth: number,
    canvasHeight: number,
    resolution: number,
    food: Food,
    p: p5,
    speed: number,
    onEatingFood: () => void
  ) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.resolution = resolution;
    this.food = food;
    this.p = p;
    this.xSpeed = speed;
    this.ySpeed = 0;
    this.partCoords = [[0, 0]];
    this.onEatingFood = onEatingFood;
  }

  getHead() {
    return { x: this.partCoords.at(-1)![0], y: this.partCoords.at(-1)![1] };
  }

  update() {
    if (this.isGameOver) return;
    console.log("😋 Food x", this.food.x);
    console.log("🐍 Snake x", this.getHead());
    if (
      this.partCoords.some(
        (coord) => coord[0] === this.food.x && coord[1] === this.food.y
      )
    ) {
      this.food.update();
      this.partCoords.push([
        this.partCoords.at(-1)![0] + this.xSpeed,
        this.partCoords.at(-1)![1] + this.ySpeed,
      ]);
      this.onEatingFood();
    } else {
      this.partCoords.push([
        this.getHead().x + this.xSpeed,
        this.getHead().y + this.ySpeed,
      ]);
      this.partCoords.shift();
    }

    if (
      this.getHead().x + this.resolution > this.canvasWidth ||
      this.getHead().x < 0 ||
      this.getHead().y + this.resolution > this.canvasHeight ||
      this.getHead().y < 0 ||
      this.partCoords.reduce(
        (acc, coord) => {
          if (
            acc[0].some(
              (accCoord) => accCoord[0] === coord[0] && accCoord[1] === coord[1]
            )
          ) {
            acc[1] = true;
          }

          acc[0].push(coord);

          return acc;
        },
        [[], false] as [typeof this.partCoords, boolean]
      )[1]
    )
      this.gameOver();
  }

  show() {
    if (this.isGameOver) {
      console.log("Game over");
      this.p.color(255, 0, 0);
      this.p.text("Game over", this.canvasWidth / 2, this.canvasHeight / 2);
    }
    for (const [i, part] of this.partCoords.entries()) {
      if (i === this.partCoords.length - 1) this.p.fill(209, 213, 219);
      this.p.rect(part[0], part[1], this.resolution, this.resolution);
      if (i === this.partCoords.length - 1) this.p.fill(255, 255, 255);
    }
  }

  gameOver() {
    this.isGameOver = true;
  }
}

class Food {
  x: number;
  y: number;
  private resolution: number;
  private canvasWidth: number;
  private canvasHeight: number;
  private p: p5;

  constructor(
    resolution: number,
    canvasWidth: number,
    canvasHeight: number,
    p: p5
  ) {
    this.resolution = resolution;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.p = p;

    this.x = 0;
    this.y = 0;

    this.update();
  }

  update() {
    this.x =
      Math.floor(this.p.random(0, this.canvasWidth) / this.resolution) *
      this.resolution;
    this.y =
      Math.floor(this.p.random(0, this.canvasHeight) / this.resolution) *
      this.resolution;
  }

  show() {
    this.p.fill(this.p.color(249, 115, 22));
    this.p.square(this.x, this.y, this.resolution, 4, 4, 4, 4);
    this.p.fill(255, 255, 255);
  }
}
