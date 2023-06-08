/*	Narcissa

Aluno 1: Joao Julio 61610
Aluno 2: Rodrigo Freitas 62942

Comentario:
A nossa cobra nao come a cor duplicada, ou seja, se comer uma azul e ja tiver la uma azul fica a ultima que ja la estava
O nosso pensamento foi como se a cobra "cuspi-se" a baga pois ja a tinha no estomago. De qualquer forma perde metade do corpo


0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789
*/

// GLOBAL CONSTANTS

const ANIMATION_EVENTS_PER_SECOND = 4;

const IMAGE_NAME_EMPTY = "empty";
const IMAGE_NAME_INVALID = "invalid";
const IMAGE_NAME_SHRUB = "shrub";
const IMAGE_NAME_BERRY_BLUE = "berryBlue";
const IMAGE_NAME_SNAKE_HEAD = "snakeHead";
const IMAGE_NAME_SNAKE_BODY = "snakeBody";
const START_MENU= "Start Game";
const GAME_OVER_MENU= "Game Over";
const COLOR_ARRAY = ["berryBlue", "berryBrown", "berryCyan","berryGreen", "berryPurple", "berryRed"]
const SNAKE_INITIAL_LENGTH = 5;
const STOMACH_LENGTH = 3;
const LOSER_STATUS = "YOU LOST!";
const WINNER_STATUS = "YOU WON!";
const TARGET_SCORE = 300;

// GLOBAL VARIABLES

let control; // Try not no define more global variables

// ACTORS

class Actor {
  constructor(x, y, imageName) {
    this.x = x;
    this.y = y;
    this.atime = 0; // This has a very technical role in the control of the animations
    this.imageName = imageName;
    this.show();
  }
  draw(x, y, image) {
    control.ctx.drawImage(image, x * ACTOR_PIXELS_X, y * ACTOR_PIXELS_Y);
  }
  show() {
    this.checkPosition();
    control.world[this.x][this.y] = this;
    this.draw(this.x, this.y, GameImages[this.imageName]);
  }
  hide() {
    control.world[this.x][this.y] = control.getEmpty();
    this.draw(this.x, this.y, GameImages[IMAGE_NAME_EMPTY]);
  }
  move(dx, dy) {
    this.hide();
    this.x += dx;
    this.y += dy;
    this.show();
  }
  animation(x, y) {}
  checkPosition() {
    if (
      control.world[this.x] === undefined ||
      control.world[this.x][this.y] === undefined
    )
      fatalError("Invalid position");
  }
}

class Shrub extends Actor {
  constructor(x, y) {
    super(x, y, IMAGE_NAME_SHRUB);
    this.shrubExtensions = []; // vetor de extensoes do arbusto
    setInterval(
      () => {this.grow();},
      1000 * (Math.floor(Math.random() * 81) + 20)
    );
  }

  grow() {
    let validPosition = false;
    while(!validPosition) { // Enquanto nao encontrar uma posicao fazia
      let nextAdjacent = rand(this.shrubExtensions.length + 1);
      if(nextAdjacent == 0) { // Caso seja o arbusto
        let newX = rand(3) - 1;
        let newY = rand(3) - 1;
        if(control.world[this.x + newX][this.y + newY] instanceof Empty) {
          this.shrubExtensions.push(new ShrubExtension(this.x + newX, this.y + newY));
          validPosition = true;
        }
      } else { // Caso seja uma extensao
        let newX = rand(3) - 1;
        let newY = rand(3) - 1;
        if(control.world[this.shrubExtensions[nextAdjacent - 1].x + newX][this.shrubExtensions[nextAdjacent - 1].y + newY] instanceof Empty) {
          this.shrubExtensions.push(new ShrubExtension(this.shrubExtensions[nextAdjacent - 1].x + newX, this.shrubExtensions[nextAdjacent - 1].y + newY));
          validPosition = true;
        }
      }
    }
  }
}

// Extensao de um arbustro - E um arbustro que nao cresce
class ShrubExtension extends Actor {
  constructor(x, y) {
    super(x, y, IMAGE_NAME_SHRUB);
  }
}

class Empty extends Actor {
  constructor() {
    super(-1, -1, IMAGE_NAME_EMPTY);
    this.atime = Number.MAX_SAFE_INTEGER; // This has a very technical role
  }
  show() {}
  hide() {}
}

class Invalid extends Actor {
  constructor(x, y) {
    super(x, y, IMAGE_NAME_INVALID);
  }
}

class Berry extends Actor {
  constructor(x, y, color) {
    super(x, y, color);
    this.isSinking = false;
    this.sink();
  }
  
  /*
    Quando acabarem os ultimos 10s, da hide. Quando chega aos 10s, coloca a berry a afundar
  */
  sink() {
    let randomTime = 1000 * (Math.floor(Math.random() * 81) + 20);
    let disappearTime = randomTime - 10000;
    setTimeout(() => {
      this.isSinking = true;
      this.drawCircle();
      setTimeout(() => {this.hide()}, 10000);
    }, disappearTime);
  }
  
  drawCircle() {
    control.ctx.beginPath();
    control.ctx.arc((this.x * ACTOR_PIXELS_X) + 8, (this.y * ACTOR_PIXELS_Y) + 8, 3, 0, 2 * Math.PI);
    control.ctx.fillStyle = "white"; 
    control.ctx.fill();
    control.ctx.closePath();
  }
}

// Parte do corpo de uma snake
class BodyPart extends Actor {
  constructor(x, y, color) {
    super(x, y, color);
  }
}

class Snake extends Actor {
  constructor(x, y) {
    super(x, y, IMAGE_NAME_SNAKE_HEAD);
    [this.movex, this.movey] = [1, 0];
    this.body = [];
    control.score = SNAKE_INITIAL_LENGTH;
    this.berryColors = [];
    this.currentNumberOfBerries = 0;

    for (let i = 1; i < SNAKE_INITIAL_LENGTH; i++) {
      this.body.push(new BodyPart(this.x - i, this.y, IMAGE_NAME_SNAKE_BODY)); // Aumentar a snake inicialmente
    }
  }

  // Eliminar a snake
  hideSnake() {
    this.hide();
    for(let i = 0; i < this.body.length; i++) {
      this.body[i].hide();
    }
  }

  handleKey() {
    let k = control.getKey();
    if (k === null);
    else if (typeof k === "string") mesg("special command == " + k);
    else {
      // change direction
      let kx, ky;
      [kx, ky] = k;

      if (kx === -this.movex || ky === -this.movey) {
        return;
      }

      this.movex = kx;
      this.movey = ky;
    }
  }
  
  // Eliminar metade do corpo da snake
  deleteBody() {
    let finalSize = Math.floor(this.body.length / 2);
    if(finalSize < SNAKE_INITIAL_LENGTH) {
      for(let i = this.body.length - 1; i > SNAKE_INITIAL_LENGTH - 1; i--) {
        let lastElement = this.body.pop();
        lastElement.hide();
      }
      control.score = SNAKE_INITIAL_LENGTH;
    } else {
      for(let i = this.body.length - 1; i > finalSize - 1; i--) {
        let lastElement = this.body.pop();
        lastElement.hide();
      }
      control.score = finalSize + 1;
    }
  }

  hadCollision(lastX, lastY) {
    for (let i = 0; i < this.body.length; i++) {
      // Se colidir com uma parte do corpo
      if (this.x === this.body[i].x && this.y === this.body[i].y) {
        this.hideSnake();
        let form = document.getElementById("formSnake");
        form.style.display = "none";
        let menu = document.getElementById("menu");
        menu.style.display = "flex";
        let title = document.getElementById("menuTitle");
        title.textContent  = LOSER_STATUS;
        document.getElementById("lastScore").textContent = control.score;
        document.getElementById("lastTime").textContent = Math.floor((control.time % 3600) / 60) + ":" + control.time % 60;
        control.hasEnded = true;
        return true;
      } 
    }

    // Se colidir com um arbustro ou a sua extensao
    if (control.world[this.x][this.y] instanceof Shrub || control.world[this.x][this.y] instanceof ShrubExtension) {
      this.hideSnake();
      let form = document.getElementById("formSnake");
      form.style.display = "none";
      let menu = document.getElementById("menu");
      menu.style.display = "flex";
      let title = document.getElementById("menuTitle");
      title.textContent  = LOSER_STATUS;
      document.getElementById("lastScore").textContent = control.score;
      document.getElementById("lastTime").textContent = Math.floor((control.time % 3600) / 60) + ":" + control.time % 60;
      control.hasEnded = true;
      return true;
    }
    else if (control.world[this.x][this.y] instanceof Berry) { // Se colidir com uma baga
      if(control.world[this.x][this.y].isSinking) { // Se estiver a afundar (a logica e a mesma caso nao esteja)
        if(this.berryColors.includes(control.world[this.x][this.y].imageName)) { // Se for uma baga ja comeu, perde metade do corpo
          this.deleteBody();
          return false;
        } else { // caso nao tenha comido essa baga
          if(this.currentNumberOfBerries < STOMACH_LENGTH) { // Se nao tiver o estomago cheio, adiciona a baga atras da cabeca e aumenta o corpo
            this.body.unshift(new BodyPart(lastX, lastY, control.world[this.x][this.y].imageName)); 
            this.body.push(new BodyPart(this.body[this.body.length-1].x, this.body[this.body.length-1].y, IMAGE_NAME_SNAKE_BODY));
            this.berryColors.push(control.world[this.x][this.y].imageName);
            this.currentNumberOfBerries++;
            control.score += 2;
            if(control.score >= 300) { // Se chegou aos 300 acaba o jogo
              let form = document.getElementById("formSnake");
              form.style.display = "none";
              let menu = document.getElementById("menu");
              menu.style.display = "flex";
              let title = document.getElementById("menuTitle");
              title.textContent  = WINNER_STATUS;
              document.getElementById("lastScore").textContent = control.score;
              document.getElementById("lastTime").textContent = Math.floor((control.time % 3600) / 60) + ":" + control.time % 60;
              control.hasEnded = true;
            }
            return false;
          } else { // Se tiver o estomago cheio, temos de tirar a ultima cor da ultima baga do estomago (e fazer o mesmo se o estomago nao estivesse cheio)
            this.berryColors = this.berryColors.filter(item => item !== this.body[STOMACH_LENGTH - 1].imageName); // Tirar a ultima cor do array
            this.body[STOMACH_LENGTH - 1].imageName = IMAGE_NAME_SNAKE_BODY;
            this.body.unshift(new BodyPart(lastX, lastY, control.world[this.x][this.y].imageName));
            this.body.push(new BodyPart(this.body[this.body.length-1].x, this.body[this.body.length-1].y, IMAGE_NAME_SNAKE_BODY));
            this.berryColors.push(control.world[this.x][this.y].imageName);
            this.currentNumberOfBerries++;
            control.score += 2;
            if(control.score >= 300) {
              let form = document.getElementById("formSnake");
              form.style.display = "none";
              let menu = document.getElementById("menu");
              menu.style.display = "flex";
              let title = document.getElementById("menuTitle");
              title.textContent  = WINNER_STATUS;
              document.getElementById("lastScore").textContent = control.score;
              document.getElementById("lastTime").textContent = Math.floor((control.time % 3600) / 60) + ":" + control.time % 60;
              control.hasEnded = true;
            }
            return false;
          }
        }
      } else { // Se nao se estiver a afundar (logica igual aos casos anteriores)
        if(this.berryColors.includes(control.world[this.x][this.y].imageName)) {
          this.deleteBody();
          return false;
        } else {
          if(this.currentNumberOfBerries < STOMACH_LENGTH) {
            this.body.unshift(new BodyPart(lastX, lastY, control.world[this.x][this.y].imageName));
            this.berryColors.push(control.world[this.x][this.y].imageName);
            this.currentNumberOfBerries++;
            control.score++;
            if(control.score >= 300) {
              let form = document.getElementById("formSnake");
              form.style.display = "none";
              let menu = document.getElementById("menu");
              menu.style.display = "flex";
              let title = document.getElementById("menuTitle");
              title.textContent  = WINNER_STATUS;
              document.getElementById("lastScore").textContent = control.score;
              document.getElementById("lastTime").textContent = Math.floor((control.time % 3600) / 60) + ":" + control.time % 60;
              control.hasEnded = true;
            }
            return false;
          } else {
            this.berryColors = this.berryColors.filter(item => item !== this.body[STOMACH_LENGTH - 1].imageName);
            this.body[STOMACH_LENGTH - 1].imageName = IMAGE_NAME_SNAKE_BODY;
            this.body.unshift(new BodyPart(lastX, lastY, control.world[this.x][this.y].imageName));
            this.berryColors.push(control.world[this.x][this.y].imageName);
            this.currentNumberOfBerries++;
            control.score++;
            if(control.score >= 300) {
              let form = document.getElementById("formSnake");
              form.style.display = "none";
              let menu = document.getElementById("menu");
              menu.style.display = "flex";
              let title = document.getElementById("menuTitle");
              title.textContent  = WINNER_STATUS;
              document.getElementById("lastScore").textContent = control.score;
              document.getElementById("lastTime").textContent = Math.floor((control.time % 3600) / 60) + ":" + control.time % 60;
              control.hasEnded = true;
            }
            return false;
          }
        }
      }
    }
  }
  
  move(dx, dy) {
    let lastX = this.x;
    let lastY = this.y;

    this.hide();

    //Mover a cabeca tende em conta o cenario
    if (this.x === 0 && dx === -1) {
      this.x = WORLD_WIDTH - 1;
    } else if (this.x === WORLD_WIDTH - 1 && dx === 1) {
      this.x = 0;
    } else if (this.y === 0 && dy === -1) {
      this.y = WORLD_HEIGHT - 1;
    } else if (this.y === WORLD_HEIGHT - 1 && dy === 1) {
      this.y = 0;
    } else {
      this.x += dx;
      this.y += dy;
    }

    // Verificar se colidiu. Se sim, retornar e parar o movimento
    if(this.hadCollision(lastX, lastY)) {
      return;
    }

    this.show();

    // Movimentar o corpo de modo a seguir a cabeca
    for (let i = 0; i < this.body.length; i++) {
      this.body[i].hide();
      let tempX = this.body[i].x;
      let tempY = this.body[i].y;
      this.body[i].x = lastX;
      this.body[i].y = lastY;
      lastX = tempX;
      lastY = tempY;
      this.body[i].show();
    }
  }

  animation(x, y) {
    this.handleKey();
    this.move(this.movex, this.movey);
  }
}

// GAME CONTROL

class GameControl {
  constructor() {
    let c = document.getElementById("canvas1");
    control = this; // setup global var
    this.key = 0;
    this.time = 0; // current "time"
    this.ctx = document.getElementById("canvas1").getContext("2d");
    this.empty = new Empty(); // only one empty actor needed, global var
    this.world = this.createWorld();
    this.loadLevel(1);
    this.setupEvents();
    this.hasEnded = false;
    this.isPaused = false;
    this.score = 5; // current score
    this.resetButton = 0; // Tivemos de usar um event listener, porque com uma funcao nao funcionava
  }

  getEmpty() {
    return this.empty;
  }
  createWorld() {
    // matrix needs to be stored by columns
    let world = new Array(WORLD_WIDTH);
    for (let x = 0; x < WORLD_WIDTH; x++) {
      let a = new Array(WORLD_HEIGHT);
      for (let y = 0; y < WORLD_HEIGHT; y++) a[y] = this.empty;
      world[x] = a;
    }
    return world;
  }
  loadLevel(level) {
    if (level < 1 || level > MAPS.length) fatalError("Invalid level " + level);
    let map = MAPS[level - 1]; // -1 because levels start at 1
    for (let x = 0; x < WORLD_WIDTH; x++)
      for (let y = 0; y < WORLD_HEIGHT; y++) {
        // x/y reversed because map is stored by lines
        GameFactory.actorFromCode(map[y][x], x, y);
      }
  }
  loadBerry() {
    // Se estiver pausado ou acabado nao queremos dar spawn a novas bagas
    if(this.hasEnded || this.isPaused) {
      return;
    }

    let nrBerry = rand(5);
    
    for(let i = 0; i < nrBerry; i++) {
      let newX = rand(WORLD_WIDTH)
      let newY = rand(WORLD_HEIGHT)
      while(!(this.world[newX][newY] instanceof Empty)) { // Enquanto nao encontrar uma posicao valida, gerar coordenadas aleatorias
        newX = rand(WORLD_WIDTH);
        newY = rand(WORLD_HEIGHT);
      }
      new Berry(newX, newY, COLOR_ARRAY[rand(COLOR_ARRAY.length)]);
    }
  }
  getKey() {
    let k = this.key;
    this.key = 0;
    switch (k) {
      case 37:
      case 79:
      case 74:
        return [-1, 0]; // LEFT, O, J
      case 38:
      case 81:
      case 73:
        return [0, -1]; // UP, Q, I
      case 39:
      case 80:
      case 76:
        return [1, 0]; // RIGHT, P, L
      case 40:
      case 65:
      case 75:
        return [0, 1]; // DOWN, A, K
      case 0:
        return null;
      default:
        return String.fromCharCode(k);
      // http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
    }
  }
  setupEvents() {
    // Se estiver pausado ou acabado nao queremos gerar novos eventos
    if(this.hasEnded || this.isPaused) {
      return;
    }
    addEventListener("keydown", (e) => this.keyDownEvent(e), false);
    addEventListener("keyup", (e) => this.keyUpEvent(e), false);
    this.resetButton = document.getElementById("resetButton");
    this.resetButton.addEventListener("click", () => location.reload()) // reset page

    setInterval(
      () => this.animationEvent(),
      1000 / ANIMATION_EVENTS_PER_SECOND
    );

    setInterval(
      () => this.loadBerry(),
      (rand(11) + 1) * 1000
    );
  }

  animationEvent() {
    // Se estiver pausado nao queremos animacoes
    if(!this.isPaused) {
      // Se estiver acabado nao queremos animacoes
      if(this.hasEnded) {
        return;
      }

      document.getElementById("currentScore").textContent = this.score;
      document.getElementById("currentTime").textContent = Math.floor((this.time % 3600) / 60) + ":" + this.time % 60;
      this.time++;

      for (let x = 0; x < WORLD_WIDTH; x++) {
        for (let y = 0; y < WORLD_HEIGHT; y++) {
          let a = this.world[x][y];
          if (a.atime < this.time) {
            a.atime = this.time;
            a.animation(x, y);
          }
        }
      }
    }
  }
  keyDownEvent(e) {
    this.key = e.keyCode;
  }
  keyUpEvent(e) {}
}

// Functions called from the HTML page

function onLoad() {
  // Asynchronously load the images an then run the game
  GameImages.loadAll(() => new GameControl());
}

function reset() { // funcao usado para o menu
  location.reload()
}

function pause() {
  control.isPaused = !control.isPaused;
}