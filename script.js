
// Constants for grid dimensions
const ROWS = 18;
const COLS = 48;
let traverseDelay = 200;
// Constants for cell types
const CELL_EMPTY = 0;
const CELL_START = 1;
const CELL_END = 2;
const CELL_WALL = 3;

// 2D array representing the grid
let grid = [];

// Variables to store the start and end cell coordinates
let startCell = null;
let endCell = null;

// Flag to indicate if the algorithm is running
let isRunning = false;

// Initialize the grid
function initializeGrid() {
  for (let row = 0; row < ROWS; row++) {
    grid[row] = [];
    for (let col = 0; col < COLS; col++) {
      grid[row][col] = CELL_EMPTY;
    }
  }
}


// Handle mouse down event on a cell
function handleCellMouseDown(row, col) {
  return function () {
    if (isRunning) return;

    if (grid[row][col] === CELL_EMPTY) {
      if (!startCell) {
        grid[row][col] = CELL_START;
        this.classList.add("start");
        this.innerHTML = `<i class="fa-solid fa-angles-right"></i>`;
        startCell = { row, col };
      } else if (!endCell) {
        grid[row][col] = CELL_END;
        this.classList.add("end");
        this.innerHTML = `<i class="fa-regular fa-circle-dot fa-beat"></i>`;
        endCell = { row, col };
      } else {
        grid[row][col] = CELL_WALL;
        this.classList.add("wall");
      }
    } else if (grid[row][col] === CELL_START) {
      grid[row][col] = CELL_EMPTY;
      this.classList.remove("start");
      this.innerHTML = ""
      startCell = null;
    } else if (grid[row][col] === CELL_END) {
      grid[row][col] = CELL_EMPTY;
      this.classList.remove("end");
      this.innerHTML = "";
      endCell = null;
    } else if (grid[row][col] === CELL_WALL) {
      grid[row][col] = CELL_EMPTY;
      this.classList.remove("wall");
    }
  };
}

// Handle mouse over event on a cell
function handleCellMouseOver(row, col) {
  return function () {
    if (isRunning) return;

    if (grid[row][col] === CELL_EMPTY) {
      this.classList.add("hover");
    } else if (grid[row][col] === CELL_WALL) {
      this.classList.remove("hover");
    }
  };
}

// Initialize the grid and create the grid cells
function initialize() {
  initializeGrid();
  createGridCells();
}

function performbiBFS() {
  const startQueue = [];
  const endQueue = [];

  const startVisited = new Array(ROWS)
    .fill()
    .map(() => new Array(COLS).fill(false));
  const endVisited = new Array(ROWS)
    .fill()
    .map(() => new Array(COLS).fill(false));

  const startParent = new Array(ROWS).fill().map(() => new Array(COLS));
  const endParent = new Array(ROWS).fill().map(() => new Array(COLS));

  const startDirections = [
    [-1, 0], // Up
    [0, 1], // Right
    [1, 0], // Down
    [0, -1], // Left
  ];

  const endDirections = [
    [1, 0], // Down
    [0, -1], // Left
    [-1, 0], // Up
    [0, 1], // Right
  ];

  const { row: startRow, col: startCol } = startCell;
  const { row: endRow, col: endCol } = endCell;

  startQueue.push({ row: startRow, col: startCol });
  startVisited[startRow][startCol] = true;

  endQueue.push({ row: endRow, col: endCol });
  endVisited[endRow][endCol] = true;

  let isEndReached = false;
  let commonNode = null;

  let traverseDelay = 100;

  traverseNext();

  function traverseNext() {
    if (!startQueue.length || !endQueue.length || !isEndReached) {
      if (startQueue.length) {
        const { row, col } = startQueue.shift();
        for (const [dx, dy] of startDirections) {
          const newRow = row + dx;
          const newCol = col + dy;
          if (
            newRow >= 0 &&
            newRow < ROWS &&
            newCol >= 0 &&
            newCol < COLS &&
            grid[newRow][newCol] !== CELL_WALL &&
            !startVisited[newRow][newCol]
          ) {
            startQueue.push({ row: newRow, col: newCol });
            startVisited[newRow][newCol] = true;
            startParent[newRow][newCol] = { row, col };
          }
        }
        const cell = document.querySelector(
          `.cell:nth-child(${row * COLS + col + 1})`
        );
        cell.classList.add("visited");
        setTimeout(traverseNext, traverseDelay);
      } else if (endQueue.length) {
        const { row, col } = endQueue.shift();
        for (const [dx, dy] of endDirections) {
          const newRow = row + dx;
          const newCol = col + dy;
          if (
            newRow >= 0 &&
            newRow < ROWS &&
            newCol >= 0 &&
            newCol < COLS &&
            grid[newRow][newCol] !== CELL_WALL &&
            !endVisited[newRow][newCol]
          ) {
            endQueue.push({ row: newRow, col: newCol });
            endVisited[newRow][newCol] = true;
            endParent[newRow][newCol] = { row, col };
          }
        }
        const cell = document.querySelector(
          `.cell:nth-child(${row * COLS + col + 1})`
        );
        cell.classList.add("visited");
        setTimeout(traverseNext, traverseDelay);
      } else {
        if (!isEndReached) {
          alert("No path found.");
        }
      }
    } else {
      // If we found a common node, reconstruct and visualize the shortest path
      reconstructPath(startParent, commonNode, true);
      reconstructPath(endParent, commonNode, false);
    }
  }

  function reconstructPath(parent, commonNode, isStart) {
    let row = commonNode.row;
    let col = commonNode.col;

    while (parent[row][col]) {
      const { row: parentRow, col: parentCol } = parent[row][col];
      const cell = document.querySelector(
        `.cell:nth-child(${row * COLS + col + 1})`
      );
      cell.classList.add("shortest-path");
      row = parentRow;
      col = parentCol;
    }

    const startCell = document.querySelector(
      `.cell:nth-child(${startRow * COLS + startCol + 1})`
    );
    startCell.classList.add("shortest-path");
    const endCell = document.querySelector(
      `.cell:nth-child(${endRow * COLS + endCol + 1})`
    );
    endCell.classList.add("shortest-path");

    // Finished animating the shortest path, set isRunning to false
    isRunning = false;
  }
}


function performastar() {
  message.innerHTML = "A* algorithm ensures the shortest path using heuristics";
  const pq = new PriorityQueue(
    (a, b) => a.distance + a.heuristic - b.distance - b.heuristic
  );

  const distance = new Array(ROWS)
    .fill()
    .map(() => new Array(COLS).fill(Number.MAX_VALUE));
  const heuristic = new Array(ROWS).fill().map(() => new Array(COLS));

  const parent = new Array(ROWS).fill().map(() => new Array(COLS));

  const directions = [
    [-1, 0], // Up
    [0, 1], // Right
    [1, 0], // Down
    [0, -1], // Left
  ];

  const { row: startRow, col: startCol } = startCell;
  const { row: endRow, col: endCol } = endCell;

  distance[startRow][startCol] = 0;
  pq.enqueue({ row: startRow, col: startCol, distance: 0, heuristic: 0 });

  let isEndReached = false;

  let traverseDelay = 100;

  traverseNext();

  function traverseNext() {
    if (!pq.isEmpty() && !isEndReached) {
      const { row, col } = pq.dequeue();

      if (row === endRow && col === endCol) {
        isEndReached = true;
        visualizeShortestPath(parent);
        return;
      }

      for (const [dx, dy] of directions) {
        const newRow = row + dx;
        const newCol = col + dy;

        if (
          newRow >= 0 &&
          newRow < ROWS &&
          newCol >= 0 &&
          newCol < COLS &&
          grid[newRow][newCol] !== CELL_WALL
        ) {
          const newDistance = distance[row][col] + 1;
          const newHeuristic = heuristicValue(newRow, newCol);

          if (newDistance + newHeuristic < distance[newRow][newCol]) {
            distance[newRow][newCol] = newDistance;
            heuristic[newRow][newCol] = newHeuristic;
            parent[newRow][newCol] = { row, col };
            pq.enqueue({
              row: newRow,
              col: newCol,
              distance: newDistance,
              heuristic: newHeuristic,
            });

            const cell = document.querySelector(
              `.cell:nth-child(${newRow * COLS + newCol + 1})`
            );
            cell.classList.add("visited");
            setTimeout(traverseNext, traverseDelay);
          }
        }
      }
    } else {
      if (!isEndReached) {
        alert("No path found.");
      }
    }
  }

  function heuristicValue(row, col) {
    // Calculate the Manhattan distance heuristic
    return Math.abs(endRow - row) + Math.abs(endCol - col);
  }
}

// Perform Depth-First Search (DFS) algorithm
function performDFS() {
  // Create a stack to store nodes to visit
  message.innerHTML = "DFS does not guarantee the shortest path";
  const stack = [];

  // Create a 2D array to track visited nodes
  const visited = new Array(ROWS);
  for (let i = 0; i < ROWS; i++) {
    visited[i] = new Array(COLS).fill(false);
  }

  // Create a 2D array to track the parent of each node (for path reconstruction)
  const parent = new Array(ROWS);
  for (let i = 0; i < ROWS; i++) {
    parent[i] = new Array(COLS);
  }

  // Define the possible directions to move in the grid (up, right, down, left)
  const directions = [
    [-1, 0], // Up
    [0, 1], // Right
    [1, 0], // Down
    [0, -1], // Left
  ];

  // Get the coordinates of the start and end cells
  const { row: startRow, col: startCol } = startCell;
  const { row: endRow, col: endCol } = endCell;

  // Push the start cell to the stack and mark it as visited
  stack.push({ row: startRow, col: startCol });
  visited[startRow][startCol] = true;

  let isEndReached = false; // Flag to indicate if the end cell has been reached

  // While there are nodes to visit in the stack
  let traverseDelay = 200; // Delay between traversing each cell
  traverseNext();

  function traverseNext() {
    if (stack.length > 0 && !isEndReached) {
      // Pop the next node from the stack
      const { row, col } = stack.pop();

      // If we have reached the end cell, reconstruct and visualize the shortest path
      if (row === endRow && col === endCol) {
        isEndReached = true;
        visualizeShortestPath(parent);
        return;
      }

      // Visit the neighbors of the current cell
      for (const [dx, dy] of directions) {
        const newRow = row + dx;
        const newCol = col + dy;

        // Check if the neighbor is within the grid boundaries and is not a wall
        if (
          newRow >= 0 &&
          newRow < ROWS &&
          newCol >= 0 &&
          newCol < COLS &&
          grid[newRow][newCol] !== CELL_WALL &&
          !visited[newRow][newCol]
        ) {
          // Push the neighbor to the stack, mark it as visited, set its parent, and visualize it
          stack.push({ row: newRow, col: newCol });
          visited[newRow][newCol] = true;
          parent[newRow][newCol] = { row, col };

          setTimeout(() => {
            const cell = document.querySelector(
              `.cell:nth-child(${newRow * COLS + newCol + 1})`
            );
            cell.classList.add("visited");
            traverseNext(); // Traverse the next cell
          }, traverseDelay);
        }
      }
    } else {
      // If we reached here, it means there is no valid path from the start to the end
      if (!isEndReached) {
        alert("No path found.");
      }
    }
  }
}

// function performDijkstra() {
//   // Create a priority queue to store nodes to visit
   // message.innerHTML =
    //  "Dijkstra's algorithm guarantees the shortest path in non-negative edge weighted graphs";

//   const pq = new PriorityQueue((a, b) => a.distance - b.distance);

//   // Create a 2D array to track the distance of each node from the start node
//   const distance = new Array(ROWS);
//   for (let i = 0; i < ROWS; i++) {
//     distance[i] = new Array(COLS).fill(Number.MAX_VALUE);
//   }

//   // Create a 2D array to track the parent of each node (for path reconstruction)
//   const parent = new Array(ROWS);
//   for (let i = 0; i < ROWS; i++) {
//     parent[i] = new Array(COLS);
//   }

//   // Get the coordinates of the start and end cells
//   const { row: startRow, col: startCol } = startCell;
//   const { row: endRow, col: endCol } = endCell;

//   // Set the distance of the start node to 0 and enqueue it
//   distance[startRow][startCol] = 0;
//   pq.enqueue({ row: startRow, col: startCol, distance: 0 });

//   let isEndReached = false; // Flag to indicate if the end cell has been reached

//   // While there are nodes to visit in the priority queue
//    // Delay between traversing each cell
//   traverseNext();

//   function traverseNext() {
//     if (!pq.isEmpty() && !isEndReached) {
//       // Dequeue the node with the smallest distance
//       const { row, col } = pq.dequeue();

//       // If we have reached the end cell, reconstruct and visualize the shortest path
//       if (row === endRow && col === endCol) {
//         isEndReached = true;
//         visualizeShortestPath(parent);
//         return;
//       }

//       // Visit the neighbors of the current cell
//       const directions = [
//         [-1, 0], // Up
//         [0, 1], // Right
//         [1, 0], // Down
//         [0, -1], // Left
//       ];

//       for (const [dx, dy] of directions) {
//         const newRow = row + dx;
//         const newCol = col + dy;

//         // Check if the neighbor is within the grid boundaries and is not a wall
//         if (
//           newRow >= 0 &&
//           newRow < ROWS &&
//           newCol >= 0 &&
//           newCol < COLS &&
//           grid[newRow][newCol] !== CELL_WALL
//         ) {
//           // Calculate the new distance to the neighbor through the current cell
//           const newDistance = distance[row][col] + 1;

//           // If the new distance is smaller, update the distance and enqueue the neighbor
//           if (newDistance < distance[newRow][newCol]) {
//             distance[newRow][newCol] = newDistance;
//             parent[newRow][newCol] = { row, col };

//             // Enqueue the neighbor with the updated distance for further exploration
//             pq.enqueue({ row: newRow, col: newCol, distance: newDistance });

//             // Visualize the cell with a delay
//             setTimeout(() => {
//               const cell = document.querySelector(
//                 `.cell:nth-child(${newRow * COLS + newCol + 1})`
//               );
//               cell.classList.add("visited");
//               traverseNext(); // Traverse the next cell
//             }, traverseDelay);
//           }
//         }
//       }
//     } else {
//       // If we reached here, it means there is no valid path from the start to the end
//       if (!isEndReached) {
//         alert("No path found.");
//       }
//     }
//   }
// }

// Priority Queue implementation (used for Dijkstra's algorithm)

class PriorityQueue {
  constructor(compareFunc) {
    this.queue = [];
    this.compareFunc = compareFunc;
  }

  enqueue(element) {
    this.queue.push(element);
    this.queue.sort(this.compareFunc);
  }

  dequeue() {
    return this.queue.shift();
  }

  isEmpty() {
    return this.queue.length === 0;
  }
}

// Perform breadth-first search (BFS) algorithm

function performBFS() {
  // Create a queue to store the nodes to visit
  message.innerHTML = "BFS guarantees the shortest path";
  const queue = [];

  // Create a 2D array to track visited nodes
  const visited = new Array(ROWS);
  for (let i = 0; i < ROWS; i++) {
    visited[i] = new Array(COLS).fill(false);
  }

  // Create a 2D array to track the parent of each node (for path reconstruction)
  const parent = new Array(ROWS);
  for (let i = 0; i < ROWS; i++) {
    parent[i] = new Array(COLS);
  }

  // Define the possible directions to move in the grid (up, right, down, left)
  const directions = [
    [-1, 0], // Up
    [0, 1], // Right
    [1, 0], // Down
    [0, -1], // Left
  ];

  // Get the coordinates of the start and end cells
  const { row: startRow, col: startCol } = startCell;
  const { row: endRow, col: endCol } = endCell;

  // Enqueue the start cell and mark it as visited
  queue.push({ row: startRow, col: startCol });
  visited[startRow][startCol] = true;

  let isEndReached = false; // Flag to indicate if the end cell has been reached

  // While there are nodes to visit in the queue
   // Delay between traversing each cell
  traverseNext();

  function traverseNext() {
    if (queue.length > 0 && !isEndReached) {
      // Dequeue the next node
      const { row, col } = queue.shift();

      // If we have reached the end cell, reconstruct and visualize the shortest path
      if (row === endRow && col === endCol) {
        isEndReached = true;
        visualizeShortestPath(parent);
        return;
      }

      // Visit the neighbors of the current cell
      for (const [dx, dy] of directions) {
        const newRow = row + dx;
        const newCol = col + dy;

        // Check if the neighbor is within the grid boundaries and is not a wall
        if (
          newRow >= 0 &&
          newRow < ROWS &&
          newCol >= 0 &&
          newCol < COLS &&
          grid[newRow][newCol] !== CELL_WALL &&
          !visited[newRow][newCol]
        ) {
          // Enqueue the neighbor, mark it as visited, set its parent, and visualize it
          queue.push({ row: newRow, col: newCol });
          visited[newRow][newCol] = true;
          parent[newRow][newCol] = { row, col };

          setTimeout(() => {
            const cell = document.querySelector(
              `.cell:nth-child(${newRow * COLS + newCol + 1})`
            );
            cell.classList.add("visited");
            traverseNext(); // Traverse the next cell
          }, traverseDelay);
        }
      }
    } 
    else {
      // If we reached here, it means there is no valid path from the start to the end
     if(!isEndReached){
        alert("No path found.");
     }
    }
  }
}

// Visualize the shortest path from the start to the end cell
function visualizeShortestPath(parent) {
  let row = endCell.row;
  let col = endCell.col;

  // Traverse the path from end to start and visualize it
  const pathDelay = 50; // Delay between visualizing each cell on the path
  visualizeNext();

  function visualizeNext() {
    if (row !== startCell.row || col !== startCell.col) {
      const cell = document.querySelector(
        `.cell:nth-child(${row * COLS + col + 1})`
      );
      cell.classList.remove("visited");
      cell.classList.add("shortest-path");

      const { row: parentRow, col: parentCol } = parent[row][col];
      row = parentRow;
      col = parentCol;

      setTimeout(visualizeNext, pathDelay); // Visualize the next cell on the path
    } else {
      // Finished animating the shortest path, set isRunning to false
      isRunning = false;
    }
  }
}
// Run the pathfinding algorithm
function runAlgorithm(algoName) {
  if (isRunning) return;

  if (!startCell || !endCell) {
    message.innerHTML = "Please select a start and end cell.";
    return;
  }

  isRunning = true;
  if (algoName === "") {
    message.innerHTML = "Select an algorithm";
  } else if (algoName === "BFS") {
    performBFS();
  } else if (algoName === "DFS") {
    performDFS();
   } 
  //  else if (algoName === "dijkstra")
  //   {
  //  message.innerHTML ="Dijguarantees thshortest path in non-negative edge weighted graphs";
  //  performdjkts();
  //  } 
  else if (algoName === "biBFS") {
     performbiBFS();
  } else if (algoName === "astar") {
      performastar();
  }

  isRunning = false;
}


function createGridCells() {
  const container = document.getElementById("grid");
  container.innerHTML = "";

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      // Set the appropriate class based on the cell type
      if (grid[row][col] === CELL_START) {
        cell.classList.add("start");
        cell.innerHTML = `<i class="fa-solid fa-angles-right"></i>`;
      } else if (grid[row][col] === CELL_END) {
        cell.classList.add("end");
        cell.innerHTML = `<i class="fa-regular fa-circle-dot fa-beat"></i>`;
      } else if (grid[row][col] === CELL_WALL) {
        cell.classList.add("wall");
      }

      cell.addEventListener("mousedown", handleCellMouseDown(row, col));
      cell.addEventListener("mouseover", handleCellMouseOver(row, col));
      container.appendChild(cell);
    }
  }
}

function generateRandomWalls() {
  if (isRunning) return;

  // Clear the grid and remove any walls, visited cells, and shortest paths
  resetGrid();

  // Create a maze by adding walls to the grid
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      // Randomly set walls in the grid with a certain probability
      if (Math.random() < 0.3) {
        grid[row][col] = CELL_WALL;
        // Visualize the wall immediately after setting it
        const cell = document.querySelector(
          `.cell:nth-child(${row * COLS + col + 1})`
        );
        cell.classList.add("wall");
      }
    }
  }

  // Set the start and end cells randomly
  startCell = null;
  endCell = null;
  while (!startCell || !endCell) {
    const randomRow = Math.floor(Math.random() * ROWS);
    const randomCol = Math.floor(Math.random() * COLS);
    if (grid[randomRow][randomCol] !== CELL_WALL) {
      if (!startCell) {
        grid[randomRow][randomCol] = CELL_START;
        startCell = { row: randomRow, col: randomCol };
        // Visualize the start cell immediately after setting it
        const cell = document.querySelector(
          `.cell:nth-child(${randomRow * COLS + randomCol + 1})`
        );
        cell.classList.add("start");
        cell.innerHTML = `<i class="fa-solid fa-angles-right"></i>`;
      } else if (!endCell) {
        grid[randomRow][randomCol] = CELL_END;
        endCell = { row: randomRow, col: randomCol };
        // Visualize the end cell immediately after setting it
        const cell = document.querySelector(
          `.cell:nth-child(${randomRow * COLS + randomCol + 1})`
        );
        cell.classList.add("end");
        cell.innerHTML = `<i class="fa-regular fa-circle-dot fa-beat"></i>`;
      }
    }
  }
}

function resetGrid() {
  isRunning = false;
  const cells = document.querySelectorAll(".cell");

  // Remove the visited and shortest-path classes with a delay for the animation
  cells.forEach((cell) => {
    cell.classList.remove("visited", "shortest-path");
    setTimeout(() => {
      cell.classList.remove("start", "end", "wall", "hover");
      cell.style.backgroundColor = "#fff"; // Reset cell background color
    }, 100);
  });

  // Clear the grid data
  initializeGrid();
  startCell = null;
  endCell = null;
  initialize();
}

// Add event listeners to buttons
document.getElementById("runButton").addEventListener("click", function () {
  runAlgorithm(algoName.value);
});
document.getElementById("resetButton").addEventListener("click", resetGrid);
document.getElementById("RandomWalls").addEventListener("click", generateRandomWalls);
// Add event listener to the "Generate Random Maze" button


const algoName = document.getElementById("algo-select");
const visSpeed = document.getElementById("ani-speed");

function btnNameChange() {
  document.getElementById("runButton").textContent = "Visualize " + algoName.value;
  document.getElementById("runButton").addEventListener("click", function () {
        
    runAlgorithm(algoName.value);
  
  });
  if (algoName.value == "BFS")
    message.innerHTML = "BFS guarantees the shortest path";
  else if (algoName.value == "DFS")
    message.innerHTML = "DFS does not guarantee the shortest path";
  else if (algoName.value == "astar")
    message.innerHTML =
      "A* algorithm ensures the shortest path using heuristics";
  else if (algoName.value == "biBFS")
    message.innerHTML = "Bidirectional BFS guarantees the shortest path";
        

}
algoName.onchange = btnNameChange;
function aniSpeed() {
  traverseDelay = Number(visSpeed.value) * traverseDelay;
  console.log(visSpeed.value);
}
visSpeed.onchange = aniSpeed;

let message = document.getElementById("message");


// Call the initialize function when the page loads
window.onload = initialize;