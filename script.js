const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;
const cellsX = 10;
const cellsY = 5;
const width = window.innerWidth;
const height = window.innerHeight - 4;
const unitLengthX = width / cellsX;
const unitLengthY = height / cellsY;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width,
    height,
    wireframes: false,
  },
});
Render.run(render);
Runner.run(Runner.create(), engine);
//  WALLS
const walls = [
  Bodies.rectangle(width / 2, 0, width, 4, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 4, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 4, height, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 4, height, { isStatic: true }),
];
World.add(world, walls);
//Maze
const grid = Array(cellsY)
  .fill(null)
  .map(() => Array(cellsX).fill(false));
const verticals = Array(cellsY)
  .fill(null)
  .map(() => Array(cellsX - 1).fill(false));
const horizontals = Array(cellsY - 1)
  .fill(null)
  .map(() => Array(cellsX).fill(false));

const startRow = Math.floor(Math.random() * cellsY);
const startCol = Math.floor(Math.random() * cellsX);
const shuffle = (arr) => {
  let counter = arr.length;
  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);
    counter--;
    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }
  return arr;
};
const cellProcessing = (row, col) => {
  if (grid[row][col]) {
    return;
  }
  //mark cell as visited
  grid[row][col] = true;
  //randow list of neighbors
  const neighbors = shuffle([
    [row - 1, col, "up"],
    [row, col + 1, "right"],
    [row + 1, col, "down"],
    [row, col - 1, "left"],
  ]);
  for (let neighbor of neighbors) {
    const [nextRow, nextCol, direction] = neighbor;
    //if that neighbor is out of bounds
    if (nextRow < 0 || nextRow >= cellsY || nextCol < 0 || nextCol >= cellsX) {
      continue;
    }
    //if we visited that neighbor
    if (grid[nextRow][nextCol]) {
      continue;
    }
    //remove a wall from either ver or hor
    if (direction === "left") {
      verticals[row][col - 1] = true;
    } else if (direction === "right") {
      verticals[row][col] = true;
    } else if (direction === "up") {
      horizontals[row - 1][col] = true;
    } else if (direction === "down") {
      horizontals[row][col] = true;
    }
    cellProcessing(nextRow, nextCol);
  }
};
cellProcessing(startRow, startCol);
//showing the Walls
horizontals.forEach((row, rowInd) => {
  row.forEach((open, colInd) => {
    if (open) {
      return;
    }
    const wall = Bodies.rectangle(
      colInd * unitLengthX + unitLengthX / 2,
      rowInd * unitLengthY + unitLengthY,
      unitLengthX,
      5,
      {
        isStatic: true,
        label: "wall",
        render: {
          fillStyle: "green",
        },
      }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row, rowInd) => {
  row.forEach((open, colInd) => {
    if (open) {
      return;
    }
    const wall = Bodies.rectangle(
      colInd * unitLengthX + unitLengthX,
      rowInd * unitLengthY + unitLengthY / 2,
      5,
      unitLengthY,
      {
        label: "wall",
        isStatic: true,
        render: {
          fillStyle: "green",
        },
      }
    );
    World.add(world, wall);
  });
});
//Goal
const goal = Bodies.rectangle(
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  unitLengthX * 0.7,
  unitLengthY * 0.7,
  {
    isStatic: true,
    label: "goal",
    render: {
      fillStyle: "blue",
    },
  }
);
World.add(world, goal);
//Ball
const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, unitLengthY / 4, {
  label: "ball",
  render: {
    fillStyle: "red",
  },
});
World.add(world, ball);

document.addEventListener("keydown", (event) => {
  const { x, y } = ball.velocity;
  if (event.keyCode === 38) {
    Body.setVelocity(ball, { x, y: y - 5 });
  }
  if (event.keyCode === 39) {
    Body.setVelocity(ball, { x: x + 5, y });
  }
  if (event.keyCode === 40) {
    Body.setVelocity(ball, { x, y: y + 5 });
  }
  if (event.keyCode === 37) {
    Body.setVelocity(ball, { x: x - 5, y });
  }
});
//When Winning
Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    const labels = ["ball", "goal"];
    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      document.querySelector(".winner").classList.remove("hidden");
      world.gravity.y = 1;
      world.bodies.forEach((body) => {
        if (body.label === "wall") {
          Body.setStatic(body, false);
        }
      });
    }
  });
});
