// Define constants
let squareFactor = 1.15
let minArea = 1
let areaFactor = 2.0 / 3.0
let epsilon = 0.0005

function getGridFromImage(imgData) {

  // Read image into a matrix
  let imageMatrix = cv.matFromImageData(imgData);

  console.log(imgData.data)


  let m = new cv.Mat()

  // Convert RGB to grayscale
  cv.cvtColor(imageMatrix, m, cv.COLOR_BGR2GRAY, 0)

  // Threshold image to black and white
  cv.threshold(m, m, 215, 255, cv.THRESH_BINARY)

  let contours = new cv.MatVector()
  let hierarchy = new cv.Mat()

  // Get contours from the image
  cv.findContours(m, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)

  let contourList = []

  for (let i = 0; i < contours.size; i++) {

    let contour = contours.get(i)
    let bounds = cv.boundingRect(contour)

    // Make sure contours are vaguely square
    if (bounds.width < bounds.height * squareFactor || bounds.width * squareFactor > bounds.height) {
      continue
    }

    // Make sure contours are of a certain area
    let contourArea = cv.contourArea(contour)
    if (contourArea < minArea && contourArea < areaFactor * bounds.width * bounds.height) {
      continue
    }

    // Contour list is in ascending order
    contourList.push(contour)
  }

  let medianArea = contourList.map(c => cv.countourArea(c)).sort((a, b) => a - b)[Math.floor(contourList.size / 2)]
  let medianPerimeter = contourList.map(c => cv.arcLength(c, true)).sort((a, b) => a - b)[Math.floor(contourList.size / 2)]

  temp = []
  for (let c of contourList) {
    if (Math.abs(cv.contourArea(c) - medianArea) < medianArea / 2.0) {
      continue
    }
    if (Math.abs(cv.arcLength(c, true) - medianPerimeter) < medianPerimeter / 2.0) {
      continue
    }
    temp.push(c)
  }
  contourList = temp

  let averageSideLength = medianPerimeter / 4

  let xs = contourList.map(c => c.x).sort((a, b) => a - b)
  let ys = contourList.map(c => c.y).sort((a, b) => a - b)

  let xBounds = []
  let yBounds = []

  let prevX, prevY = -10000000

  for (let x of xs) {
    if (x - prevX > averageSideLength / 2) {
      xBounds.push(x)
    }
    prevX = x
  }

  for (let y of ys) {
    if (y - prevY > averageSideLength / 2) {
      yBounds.push(y)
    }
    prevY = y
  }

  let rectangles = contourList.map(c => cv.boundingRect(c))

  let grid = createGrid(xBounds, yBounds, rectangles)

  // Can be used for better accuracy later
  // let numAdjacent = 0
  // let totalError = 0

  // for (let j = 0; j < grid.length; j++) {
  //   for (let k = 0; k < grid[0].length; k++) {
  //     if (grid[j][k] == null) {
  //       continue
  //     }

  //     if (j + 1 < grid.length && grid[j + 1][k] != null) {
  //       numAdjacent++
  //       totalError += grid[j + 1][k].y - grid[j][k].y - grid[j][k].height
  //     }

  //     if (k + 1 < grid[0].length && grid[j][k + 1] != null) {
  //       numAdjacent++
  //       totalError += grid[j][k + 1].x - grid[j][k].x - grid[j][k].width
  //     }
  //   }
  // }

  fillClueNumbers(grid)
  fillClueLengths(grid)

  gridAsJson = getGridAsJson(grid)

  return gridAsJson
}

// Initialize the grid as an array containing the 
// location and sizes of the cells
function createGrid(xBounds, yBounds, rectangles) {
  xBoundsLen = xBounds.length
  yBoundsLen = yBounds.length
  let grid = [...Array(yBoundsLen)].map(e => Array(xBoundsLen).fill(null))

  for (let i = 0; i < rectangles.length; i++) {
    let j = 0
    let k = 0

    while (yBounds[j + 1] <= rectangles[i]['y'] + epsilon && j < yBoundsLen) {
      j++
    }

    while (xBounds[k + 1] <= rectangles[i]['x'] + epsilon && k < xBoundsLen) {
      k++
    }

    grid[j][k] = {
      x: rectangles[i]['x'],
      y: rectangles[i]['y'],
      w: rectangles[i]['width'],
      h: rectangles[i]['height'],
      canGoTo: []
    }
  }
  return grid
}

// A function that uses the canGoTo attribute of the grid to assign
// numbers to the cells from which you can only go down or right
function fillClueNumbers(grid) {
  clueNumber = 1
  for (let j = 0; j < grid.length; j++) {
    for (let k = 0; k < grid[0].length; k++) {
      if (grid[j][k] == null) {
        continue
      }

      if (j + 1 < grid.length && grid[j + 1][k] != null) {
        grid[j + 1][k].canGoTo.push("top")
        grid[j][k].canGoTo.push("bottom")
      }

      if (k + 1 < grid[0].length && grid[j][k + 1] != null) {
        grid[j][k + 1].canGoTo.push("left")
        grid[j][k].canGoTo.push("right")
      }

      canGoTo = grid[j][k]['canGoTo']
      if (!("top" in canGoTo) && "bottom" in canGoTo || !("left" in canGoTo) && "right" in canGoTo) {
        grid[j][k]['clueNumber'] = clueNumber++
      }
    }
  }
}

// Fill the lengths of the clues according to 
// whether it they are going down or accross
function fillClueLengths(grid) {

  for (let j = grid.length - 1; j >= 0; j--) {
    for (let k = grid[0].length - 1; k >= 0; k--) {

      if (grid[j][k] == null) {
        continue
      } 

      let down = 1
      let right = 1
      
      if (j+1 < grid.length - 1) {
        if (grid[j+1][k] != null) {
          down += grid[j+1][k]["down"]
        } 
      } 

      if (k+1 < grid[0].length - 1) {
        if (grid[j][k+1] != null) {
          right += grid[j][k+1]["right"]
        } 
      } 
      grid[j][k]["down"] = down
      grid[j][k]["right"] = right
    }
  }
}

// Create a JSON object from the grid
function getGridAsJson(grid) {
  let clues = []

  for (let j = 0; j < grid.length; j++) {
    for (let k = 0; k < grid[0].length; k++) {
      if (grid[j][k] == null) {
        continue
      }

      if (grid[j][k]["down"] > 1) {
        writeClue(grid, clues, j, k, "down")
      } 
      if (grid[j][k]["right"] > 1) {
        writeClue(grid, clues, j, k, "right")
      }    
    }
  }

  let gridAsJson = {
    "clues": clues
  }

  return gridAsJson
}

// Add a new clue to the clues array
function writeClue(grid, clues, j, k, direction) {
  let directionNumber = (direction == "down") ? 1 : 0

  if ("clueNumber" in grid[j][k]) {
    clues.push({            
      "number": grid[j][k]["clueNumber"],
      "direction": directionNumber,
      "text": "TODO",
      "totalLength": grid[j][k][direction],
      "lengths": [grid[j][k][
        direction
      ]],
    "x": grid[j][k]["x"],
    "y": grid[j][k]["y"]})
  }
}