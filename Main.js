var width;
var height;

let stile = document.createElement('style');
stile.innerHTML = `
.p5-radio label {
   color: white;
 }
`;
document.head.appendChild(stile);


var tree = [];

var values = [];

var T;

var startPositionX;
var startPositionY;
var xOffset;
var yOffset;

var maxHeap = [];

var radio;
var isABR;


var showKey = true;
let cam;
let dragging = false;

let font;

function preload() {
  font = loadFont('Roboto.ttf');
}

function setup() {
    width   = 1200;
    height  = 800;
    createCanvas(width, height, WEBGL);

    textFont(font); 
    cam = createCamera();

    var numNodes = 15;

    for(var i = 0; i < numNodes; i++){
        values.push(i + 1);
        // values.push(Math.floor(Math.random() * 20) + 1);
    }
    shuffleArray(values);

    T = new Node(values[0]);
    // T = new Node(1);
    for(var i = 1; i < values.length; i++){
        treeInsert(values[i]);
        // RVLInsert(new Node(values[i]));
        // RVLInsert(new Node(i+1));
    }

    print(values);

    // maxHeap = [10,9,8,7,6,1,2,2,4,3];
    maxHeap = values;
    buildMaxHeap();
    print("Max heap");
    print(maxHeap);

    startPositionX = width / 2;
    startPositionY = 50;
    var levels = countLevels(T);
    xOffset = 30 * levels;
    yOffset = 7 * levels;
    // inOrderTreeWalk(T);

    // set position foreach node
    computePositions(T, startPositionX, startPositionY)
    


    // make button that calls function to extract max
    var button = createButton('Extract Max');
    button.position(19, 19);
    button.mousePressed(extractMax);
    button.size(100, 30);

    // make button that shows node key
    var button = createButton('Show Key');
    button.position(19, 49);
    button.mousePressed(function(){ showKey = !showKey; });
    button.size(100, 30);

    cam.move(500, 400, 0);

    // make textbox and button to insetr number
    var input = createInput();
    input.position(19, 79);
    input.size(100, 20);
    var button = createButton('Insert');
    button.position(119, 79);
    button.mousePressed(function(){
        var key = parseInt(input.value());
        treeInsert(key);
        input.value('');
    });
    var button = createButton('RVL');
    button.position(166, 79);
    button.mousePressed(function(){
        var key = parseInt(input.value());
        RVLInsert(new Node(key));
        input.value('');
    });

    radio = createRadio();
    radio.option('ABR')
    radio.option('Heap');
    radio.position(19, 100);
    radio.selected('ABR');
    radio.class('p5-radio');

}

function computePositions(node, posX, posY, level = 0){
    if (node == null) return;
    node.posX = posX;
    node.posY = posY;
    const newXOffset = xOffset / (level + 1);
    const newYOffset = yOffset + 2 * (level + 1);
    
    
    if (node.left != null){
        const leftX = posX - newXOffset;
        const leftY = posY + newYOffset;
        
        computePositions(node.left, leftX, leftY, level + 1);
    }
    if (node.right != null){
        const rightX = posX + newXOffset;
        const rightY = posY + newYOffset;

        computePositions(node.right, rightX, rightY, level + 1);
    }
}


function shuffleArray(array) {
    for (var i = array.length - 1; i >= 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function draw() {
    background(0);

    if (dragging) {
        let dx = mouseX - lastMouseX;
        let dy = mouseY - lastMouseY;
        cam.move(dx * -0.5, dy * -0.5, 0);
        lastMouseX = mouseX;
        lastMouseY = mouseY;
    }


    if (keyIsPressed === true) {
        if (key === 'w') {
            cam.move(0, 0, 10);
        } else if (key === 's') {
            cam.move(0, 0, -10);
        }
    }

    isABR = radio.value() == 'ABR' ?? false;
    if (isABR){
        drawTree(T);
    }
    else {
        drawHeap(0, startPositionX, startPositionY, xOffset, yOffset);
    }
}

function mousePressed() {
    dragging = true;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
    //print mouse position
}

function mouseReleased() {
    dragging = false;
}

function buildMaxHeap(){
    for(var i = Math.floor(maxHeap.length/2); i >= 0; i--){
        maxHeapify(i);
    }
}

function maxHeapify(i){
    l = 2 * i + 1;
    r = 2 * i + 2;
    if (l < maxHeap.length && maxHeap[l] > maxHeap[i]){
        largest = l;
    } else {
        largest = i;
    }

    if (r < maxHeap.length && maxHeap[r] > maxHeap[largest]){
        largest = r;
    }

    if (largest != i){
        temp = maxHeap[i];
        maxHeap[i] = maxHeap[largest];
        maxHeap[largest] = temp;
        maxHeapify(largest);
    }
}

function extractMax(){
    maximum = maxHeap[0];
    maxHeap[0] = maxHeap[maxHeap.length - 1];
    maxHeap.pop();
    maxHeapify(0);
    
}



function countLevels(node){
    if(node == null){
        return 0;
    } else {
        var left = countLevels(node.left);
        var right = countLevels(node.right);

        if(left > right){
            return left + 1;
        } else {
            return right + 1;
        }
    }
}

function drawTree(node, level = 0){
    if (node == null) return;

    const radius = 20 - 1 * level;
    const fontSize = 25 - 1 * level;
    push();
    translate(0,0, 1);
    fill(255);
    circle(node.posX, node.posY, radius * 2);
    fill(0);
    textSize(fontSize);
    stroke(0);
    textAlign(CENTER, CENTER);
    if (showKey) text(node.key, node.posX, node.posY);
    textSize(fontSize - 10);
    fill("lime");
    text(node.h, node.posX, node.posY + 15);
    pop();

    if(node.left != null){
        stroke(255);
        line(node.posX, node.posY, node.left.posX, node.left.posY);
        drawTree(node.left, level + 1);
    }
    if(node.right != null){
        stroke(255);
        line(node.posX, node.posY, node.right.posX, node.right.posY);
        drawTree(node.right, level + 1);
    }

    
}


// function drawTree(node, startX, startY, xOffset, yOffset, level = 0) {
//     if (node == null) return;

//     const radius = 20 - 1 * level;
//     const fontSize = 25 - 1 * level;
//     fill(255);
//     circle(startX, startY, radius * 2);
//     // node.posX = startX;
//     // node.posY = startY;
//     fill(0);
//     textSize(fontSize);
//     stroke(0);
//     textAlign(CENTER, CENTER);
//     if (showKey) text(node.key, startX, startY);
//     textSize(fontSize - 10);
//     fill("lime");
//     text(node.h, startX, startY + 15);
//     text(node.posX, startX, startY + 25);
//     text(node.posY, startX, startY + 35);

//     const newXOffset = xOffset / (level +1);
//     const newYOffset = yOffset + 2 * (level + 1);


//     if (node.left != null) {
//         stroke(255);
//         const leftX = startX - newXOffset;
//         const leftY = startY + newYOffset;
//         const angle = Math.atan2(leftY - startY, leftX - startX);
//         const startXOffset = startX + radius * Math.cos(angle);
//         const startYOffset = startY + radius * Math.sin(angle);
//         line(startXOffset, startYOffset, leftX - radius * Math.cos(angle), leftY - radius * Math.sin(angle));
//         drawTree(node.left, leftX, leftY, xOffset, yOffset, level + 1);
//     }
//     if (node.right != null) {
//         stroke(255);
//         const rightX = startX + newXOffset;
//         const rightY = startY + newYOffset;
//         const angle = Math.atan2(rightY - startY, rightX - startX);
//         const startXOffset = startX + radius * Math.cos(angle);
//         const startYOffset = startY + radius * Math.sin(angle);
//         line(startXOffset, startYOffset, rightX - radius * Math.cos(angle), rightY - radius * Math.sin(angle));
//         drawTree(node.right, rightX, rightY, xOffset, yOffset, level + 1);
//     }
// }

function drawHeap(i, startX, startY, xOffset, yOffset, level = 0) {
    if (i > maxHeap.length) return;

    const radius = 20 - 1 * level;
    const fontSize = 25 - 1 * level;
    strokeWeight(0);
    // fill(Math.floor(255 * (1 - level * 1.5 / maxHeap.length)));
    fill(255);
    circle(startX, startY, radius * 2);
    strokeWeight(2);
    fill(0);
    textSize(fontSize);
    stroke(0);
    textAlign(CENTER, CENTER);
    text(maxHeap[i], startX, startY-2);
    textSize(fontSize - 10);

    const newXOffset = xOffset / (level +1);
    const newYOffset = yOffset + 2 * (level + 1);

    if (2 * i + 1 < maxHeap.length && maxHeap[2 * i] != null) {
        stroke(255);
        const leftX = startX - newXOffset;
        const leftY = startY + newYOffset;
        const angle = Math.atan2(leftY - startY, leftX - startX);
        const startXOffset = startX + radius * Math.cos(angle);
        const startYOffset = startY + radius * Math.sin(angle);
        line(startXOffset, startYOffset, leftX - radius * Math.cos(angle), leftY - radius * Math.sin(angle));
        drawHeap(2 * i + 1, leftX, leftY, xOffset, yOffset, level + 1);
    }
    if (2 * i + 2 < maxHeap.length && maxHeap[2 * i + 1] != null) {
        stroke(255);
        const rightX = startX + newXOffset;
        const rightY = startY + newYOffset;
        const angle = Math.atan2(rightY - startY, rightX - startX);
        const startXOffset = startX + radius * Math.cos(angle);
        const startYOffset = startY + radius * Math.sin(angle);
        line(startXOffset, startYOffset, rightX - radius * Math.cos(angle), rightY - radius * Math.sin(angle));
        drawHeap(2 * i + 2, rightX, rightY, xOffset, yOffset, level + 1);
    }
}


function treeInsert(key){
    var y = null;
    var x = T;
    while(x != null){
        y = x;
        if(key < x.key){
            x = x.left;
        } else {
            x = x.right;
        }
    }

    var z = new Node(key);
    z.p = y;
    if(y == null){
        T = z;
    } else if(z.key < y.key){
        y.left = z;
    } else {
        y.right = z;
    }
}

function leftRotate(x) {
    let y = x.right;
    x.right = y.left;
    if (y.left != null) {
        y.left.p = x;
    }
    y.p = x.p;
    if (x.p == null) {
        T = y;
    } else if (x == x.p.left) {
        x.p.left = y;
    } else {
        x.p.right = y;
    }
    y.left = x;
    x.p = y;

    // Update heights
    x.h = Math.max(x.left ? x.left.h : 0, x.right ? x.right.h : 0) + 1;
    y.h = Math.max(y.left ? y.left.h : 0, y.right ? y.right.h : 0) + 1;
}

function rightRotate(y) {
    let x = y.left;
    y.left = x.right;
    if (x.right != null) {
        x.right.p = y;
    }
    x.p = y.p;
    if (y.p == null) {
        T = x;
    } else if (y == y.p.right) {
        y.p.right = x;
    } else {
        y.p.left = x;
    }
    x.right = y;
    y.p = x;

    // Update heights
    y.h = Math.max(y.left != null ? y.left.h : 0, y.right != null ? y.right.h : 0) + 1;
    x.h = Math.max(x.left != null ? x.left.h : 0, x.right != null ? x.right.h : 0) + 1;
}

function RVLInsert(z) {
    var y = null;
    var x = T;
    while (x != null) {
        y = x;
        if (z.key < x.key) {
            x = x.left;
        } else {
            x = x.right;
        }
    }
    z.p = y;
    if (y == null) {
        T = z;
    } else if (z.key < y.key) {
        y.left = z;
    } else {
        y.right = z;
    }

    z.left = null;
    z.right = null;
    z.h = 1;

    // Update heights and balance the tree
    while (y != null) {
        y.h = Math.max(y.left != null ? y.left.h : 0, y.right != null ? y.right.h : 0) + 1;
        let balance = (y.left != null ? y.left.h : 0) - (y.right != null ? y.right.h : 0);

        if (balance > 1) {
            if (z.key < y.left.key) {
                rightRotate(y);
            } else {
                leftRotate(y.left);
                rightRotate(y);
            }
        } else if (balance < -1) {
            if (z.key > y.right.key) {
                leftRotate(y);
            } else {
                rightRotate(y.right);
                leftRotate(y);
            }
        }
        y = y.p;
    }
}


function inOrderTreeWalk(x){
    if(x != null){
        inOrderTreeWalk(x.left);
        console.log(x.key);
        inOrderTreeWalk(x.right);
    }
}

function postOrderTreeWalk(x){
    if(x != null){
        postOrderTreeWalk(x.left);
        postOrderTreeWalk(x.right);
        console.log(x.key);
    }
}

function preOrderTreeWalk(x){
    if(x != null){
        console.log(x.key);
        preOrderTreeWalk(x.left);
        preOrderTreeWalk(x.right);
    }
}