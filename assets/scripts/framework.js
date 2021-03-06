class WebFonts {

  constructor() {
    this._fonts = [];
  }

  add(fontface) {
    this._fonts.push(fontface);
  }

  load() {
    return Promise.all(this._fonts.map(f => f.load()))
      .then(fonts => fonts.forEach(f => document.fonts.add(f)));
  }
}


class Scene extends createjs.Container {

  constructor() {
    super();
  }

  onStart() {
  }

  onResume() {
  }

  onPause() {
  }

  onStop() {
  }

}


class Game {

  constructor(title, width, height, fps) {

    this.title = title;
    this.width = width;
    this.height = height;

    createjs.Ticker.framerate = fps;

    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    document.body.appendChild(this.canvas);
    this.stage = new createjs.Stage(this.canvas);

    this.scenes = [];

    this.data = {};
    this.assets = new createjs.LoadQueue(true);
    this.assets.installPlugin(createjs.Sound);

    this.fonts = new WebFonts();
  }

  pushScene(scene) {
    scene.game = this;
    if (this.scenes.length > 0) {
      this.currentScene.onPause();
    }
    this.scenes.push(scene);
    this._displayCurrentScene();
    this.currentScene.onStart();
  }

  popScene() {
    if (this.scenes.length < 2) {
      throw `Number of scenes: ${this.scenes.length}. Can't pop it out`;
    }
    this.scenes.pop().onStop();
    this._displayCurrentScene();
    this.currentScene.onResume();
  }

  changeScene(scene) {
    scene.game = this;
    if (this.scenes.length > 0) {
      this.scenes.pop().onStop();
    }
    this.scenes.push(scene);
    this._displayCurrentScene();
    this.currentScene.onStart();
  }

  start() {
    createjs.Ticker.addEventListener("tick", ()=> {
      this.stage.update(this);
    });
  }

  get currentScene() {
    if (this.scenes.length === 0) {
      throw "Current scene isn't pushed";
    }
    return this.scenes[this.scenes.length - 1];
  }

  _displayCurrentScene() {
    this.stage.removeAllChildren();
    this.stage.addChild(this.currentScene);
  }

}

class LoadingBar extends createjs.Shape {

  constructor(graphics) {
    super(graphics);
    this.progress = 0;
    this.addEventListener("tick", (e)=> {
      this.graphics
        .clear()
        .setStrokeStyle(5)
        .beginStroke("#fff")
        .rect(0, 0, 200, 20)
        .endStroke()
        .beginFill("#fff")
        .rect(0, 0, Math.floor(200 * this.progress), 20)
    });
  }
}

class LoadingScene extends Scene {

  onStart() {

    const bg = new createjs.Shape();
    bg.graphics
      .beginFill("#000")
      .rect(0, 0, this.game.width, this.game.height);
    this.addChild(bg);

    this.text = new createjs.Text("Now Loading...", "bold 20px monospace", "#fff");
    this.text.textAlign = "center";
    this.text.x = this.game.width / 2;
    this.text.y = (this.game.height - 20) / 2 - 40;
    this.addChild(this.text);

    this.bar = new LoadingBar();
    this.bar.x = (this.game.width - 200) / 2;
    this.bar.y = (this.game.height - 20) / 2;
    this.addChild(this.bar);

    this.game.assets.load();
    this.game.assets.addEventListener("complete", ()=> {
      this.game.changeScene(new TitleScene());
    });
    this.game.assets.addEventListener("progress", (e)=> {
      this.bar.progress = e.loaded;
    });
  }
}

class TitleScene extends Scene {

  onStart() {
    const bg = new createjs.Bitmap(this.game.assets.getResult("bg001"));
    this.addChild(bg);
    const start = new StartButton(this.game);
    start.x = (this.game.width - start.width) / 2;
    start.y = (this.game.height - start.height) / 2;
    this.addChild(start);
    this.bgm = createjs.Sound.play("8bit13", { loop: -1, volume: 0.5 });
    this.addEventListener("click", ()=> createjs.Sound.play("onepoint07"));
  }

  onPause() {
    this.bgm.stop();
  }
}

class StartButton extends createjs.Bitmap {

  constructor(game) {
    super(game.assets.getResult("msg06"));
    this.game = game;
    this.sourceRect = {
      x: 0,
      y: 0,
      width: 300,
      height: 60
    };
    this.width = 300;
    this.height = 60;
    this.addEventListener("click", (e)=> {
      createjs.Sound.play("onepoint16");
      this.blink(()=> this.game.pushScene(new GameScene()));
    });
  }

  blink(callback) {
    const tween = createjs.Tween.get(this);
    for (let i = 0; i < 10; i++) {
      tween.to( { alpha: 0 }, 100).to( { alpha: 1 }, 100);
    }
    tween.call(callback);
  }
}

class GameScene extends Scene {

  onStart() {
    const bg = new createjs.Bitmap(this.game.assets.getResult("bg009"));
    this.addChild(bg);
    const mainConsole = new Window(this.game, this.game.width - 100, 150);
    mainConsole.x = 50;
    mainConsole.y = 300;
    this.addChild(mainConsole);
    const monster = new Monster(this.game, "boss001");
    monster.scaleX = 0.5;
    monster.scaleY = 0.5;
    this.addChild(monster);
    this.bgm = createjs.Sound.play("fantasy11", { loop: -1, volume: 0.5 });
  }
}

class Window extends createjs.Shape {

  constructor(game, w, h) {
    super();
    this.game = game;
    this.w = w;
    this.h = h;
    this.graphics
      .beginFill("#000")
      .drawRoundRect(0, 0, w, h, 10)
      .endFill()
      .setStrokeStyle(5)
      .beginStroke("#fff")
      .drawRoundRect(0, 0, w, h, 10)
      .endStroke();
  }
}

class Monster extends createjs.Bitmap {

  constructor(game, id) {
    super(game.assets.getResult(id));
    this.game = game;
    this.id = id;
    this.effectSheet = new Effect(game);
    this.addEventListener("click", ()=> {
      const attack = new createjs.Sprite(this.effectSheet, "attack");
      attack.x = (this.game.width - 240) / 2
      this.game.currentScene.addChild(attack);
      createjs.Sound.play("sword-slash4");
      attack.gotoAndPlay();
    });
  }
}

class Effect extends createjs.SpriteSheet {

  constructor(game) {
    super({
      images: [ game.assets.getResult("effect001") ],
      frames: {
        width: 240,
        height: 240,
        regX: 0,
        regY: 0
      },
      animations: {
        attack: { frames: [0, 1, 2, 3, 4, 5], next: false, frequency: 4 }
      }
    });
    this.game = game;
  }
}


window.addEventListener('load', () => {

  const game = new Game("Typing", 640, 480, 60);
  game.assets.loadManifest([
    { "id": "8bit13", "src": "/audios/bgm_maoudamashii_8bit13.mp3" },
    { "id": "fantasy11", "src": "/audios/bgm_maoudamashii_fantasy11.mp3" },
    { "id": "onepoint07", "src": "/audios/se_maoudamashii_onepoint07.mp3" },
    { "id": "onepoint16", "src": "/audios/se_maoudamashii_onepoint16.mp3" },
    { "id": "sword-slash4", "src": "/audios/sword-slash4.mp3" },
    { "id": "bg001", "src": "/images/bg/pipo-battlebg001.jpg" },
    { "id": "bg002", "src": "/images/bg/pipo-battlebg002.jpg" },
    { "id": "bg003", "src": "/images/bg/pipo-battlebg003.jpg" },
    { "id": "bg004", "src": "/images/bg/pipo-battlebg004.jpg" },
    { "id": "bg005", "src": "/images/bg/pipo-battlebg005.jpg" },
    { "id": "bg006", "src": "/images/bg/pipo-battlebg006.jpg" },
    { "id": "bg007", "src": "/images/bg/pipo-battlebg007.jpg" },
    { "id": "bg008", "src": "/images/bg/pipo-battlebg008.jpg" },
    { "id": "bg009", "src": "/images/bg/pipo-battlebg009.jpg" },
    { "id": "bg010", "src": "/images/bg/pipo-battlebg010.jpg" },
    { "id": "bg011", "src": "/images/bg/pipo-battlebg011.jpg" },
    { "id": "bg012", "src": "/images/bg/pipo-battlebg012.jpg" },
    { "id": "bg013", "src": "/images/bg/pipo-battlebg013.jpg" },
    { "id": "bg014", "src": "/images/bg/pipo-battlebg014.jpg" },
    { "id": "bg015", "src": "/images/bg/pipo-battlebg015.jpg" },
    { "id": "bg016", "src": "/images/bg/pipo-battlebg016.jpg" },
    { "id": "bg017", "src": "/images/bg/pipo-battlebg017.jpg" },
    { "id": "bg018", "src": "/images/bg/pipo-battlebg018.jpg" },
    { "id": "bg019", "src": "/images/bg/pipo-battlebg019.jpg" },
    { "id": "bg020", "src": "/images/bg/pipo-battlebg020.jpg" },
    { "id": "effect001", "src": "/images/effect/pipo-btleffect001.png" },
    { "id": "msg01", "src": "/images/text/mes01_f01_d01_c06_01.png" },
    { "id": "msg02", "src": "/images/text/mes01_f01_d01_c06_02.png" },
    { "id": "msg03", "src": "/images/text/mes01_f01_d01_c06_03.png" },
    { "id": "msg04", "src": "/images/text/mes01_f01_d01_c06_04.png" },
    { "id": "msg05", "src": "/images/text/mes01_f01_d01_c06_05.png" },
    { "id": "msg06", "src": "/images/text/mes01_f01_d01_c06_06.png" },
    { "id": "msg07", "src": "/images/text/mes01_f01_d01_c06_07.png" },
    { "id": "msg08", "src": "/images/text/mes01_f01_d01_c06_08.png" },
    { "id": "msg09", "src": "/images/text/mes01_f01_d01_c06_09.png" },
    { "id": "msg10", "src": "/images/text/mes01_f01_d01_c06_10.png" },
    { "id": "boss001", "src": "/images/enemy/pipo-boss001.png" },
    { "id": "boss002", "src": "/images/enemy/pipo-boss002.png" },
    { "id": "boss003", "src": "/images/enemy/pipo-boss003.png" },
    { "id": "boss004", "src": "/images/enemy/pipo-boss004.png" },
    { "id": "enemy001", "src": "/images/enemy/pipo-enemy001.png" },
    { "id": "enemy001a", "src": "/images/enemy/pipo-enemy001a.png" },
    { "id": "enemy001b", "src": "/images/enemy/pipo-enemy001b.png" },
    { "id": "enemy002", "src": "/images/enemy/pipo-enemy002.png" },
    { "id": "enemy002a", "src": "/images/enemy/pipo-enemy002a.png" },
    { "id": "enemy002b", "src": "/images/enemy/pipo-enemy002b.png" },
    { "id": "enemy003", "src": "/images/enemy/pipo-enemy003.png" },
    { "id": "enemy003a", "src": "/images/enemy/pipo-enemy003a.png" },
    { "id": "enemy003b", "src": "/images/enemy/pipo-enemy003b.png" },
    { "id": "enemy004", "src": "/images/enemy/pipo-enemy004.png" },
    { "id": "enemy004a", "src": "/images/enemy/pipo-enemy004a.png" },
    { "id": "enemy004b", "src": "/images/enemy/pipo-enemy004b.png" },
    { "id": "enemy005", "src": "/images/enemy/pipo-enemy005.png" },
    { "id": "enemy005a", "src": "/images/enemy/pipo-enemy005a.png" },
    { "id": "enemy005b", "src": "/images/enemy/pipo-enemy005b.png" },
    { "id": "enemy006", "src": "/images/enemy/pipo-enemy006.png" },
    { "id": "enemy006a", "src": "/images/enemy/pipo-enemy006a.png" },
    { "id": "enemy006b", "src": "/images/enemy/pipo-enemy006b.png" },
    { "id": "enemy007", "src": "/images/enemy/pipo-enemy007.png" },
    { "id": "enemy007a", "src": "/images/enemy/pipo-enemy007a.png" },
    { "id": "enemy007b", "src": "/images/enemy/pipo-enemy007b.png" },
    { "id": "enemy008", "src": "/images/enemy/pipo-enemy008.png" },
    { "id": "enemy008a", "src": "/images/enemy/pipo-enemy008a.png" },
    { "id": "enemy008b", "src": "/images/enemy/pipo-enemy008b.png" },
    { "id": "enemy009", "src": "/images/enemy/pipo-enemy009.png" },
    { "id": "enemy009a", "src": "/images/enemy/pipo-enemy009a.png" },
    { "id": "enemy009b", "src": "/images/enemy/pipo-enemy009b.png" },
    { "id": "enemy010", "src": "/images/enemy/pipo-enemy010.png" },
    { "id": "enemy010a", "src": "/images/enemy/pipo-enemy010a.png" },
    { "id": "enemy010b", "src": "/images/enemy/pipo-enemy010b.png" },
    { "id": "enemy011", "src": "/images/enemy/pipo-enemy011.png" },
    { "id": "enemy011a", "src": "/images/enemy/pipo-enemy011a.png" },
    { "id": "enemy011b", "src": "/images/enemy/pipo-enemy011b.png" },
    { "id": "enemy012", "src": "/images/enemy/pipo-enemy012.png" },
    { "id": "enemy012a", "src": "/images/enemy/pipo-enemy012a.png" },
    { "id": "enemy012b", "src": "/images/enemy/pipo-enemy012b.png" },
    { "id": "enemy013", "src": "/images/enemy/pipo-enemy013.png" },
    { "id": "enemy013a", "src": "/images/enemy/pipo-enemy013a.png" },
    { "id": "enemy013b", "src": "/images/enemy/pipo-enemy013b.png" },
    { "id": "enemy014", "src": "/images/enemy/pipo-enemy014.png" },
    { "id": "enemy014a", "src": "/images/enemy/pipo-enemy014a.png" },
    { "id": "enemy014b", "src": "/images/enemy/pipo-enemy014b.png" },
    { "id": "enemy015", "src": "/images/enemy/pipo-enemy015.png" },
    { "id": "enemy015a", "src": "/images/enemy/pipo-enemy015a.png" },
    { "id": "enemy015b", "src": "/images/enemy/pipo-enemy015b.png" },
    { "id": "enemy016", "src": "/images/enemy/pipo-enemy016.png" },
    { "id": "enemy016a", "src": "/images/enemy/pipo-enemy016a.png" },
    { "id": "enemy016b", "src": "/images/enemy/pipo-enemy016b.png" },
    { "id": "enemy017", "src": "/images/enemy/pipo-enemy017.png" },
    { "id": "enemy017a", "src": "/images/enemy/pipo-enemy017a.png" },
    { "id": "enemy017b", "src": "/images/enemy/pipo-enemy017b.png" },
    { "id": "enemy018", "src": "/images/enemy/pipo-enemy018.png" },
    { "id": "enemy018a", "src": "/images/enemy/pipo-enemy018a.png" },
    { "id": "enemy018b", "src": "/images/enemy/pipo-enemy018b.png" },
    { "id": "enemy019", "src": "/images/enemy/pipo-enemy019.png" },
    { "id": "enemy019a", "src": "/images/enemy/pipo-enemy019a.png" },
    { "id": "enemy019b", "src": "/images/enemy/pipo-enemy019b.png" },
    { "id": "enemy020", "src": "/images/enemy/pipo-enemy020.png" },
    { "id": "enemy020a", "src": "/images/enemy/pipo-enemy020a.png" },
    { "id": "enemy020b", "src": "/images/enemy/pipo-enemy020b.png" },
    { "id": "enemy021", "src": "/images/enemy/pipo-enemy021.png" },
    { "id": "enemy021a", "src": "/images/enemy/pipo-enemy021a.png" },
    { "id": "enemy021b", "src": "/images/enemy/pipo-enemy021b.png" },
    { "id": "enemy022", "src": "/images/enemy/pipo-enemy022.png" },
    { "id": "enemy022a", "src": "/images/enemy/pipo-enemy022a.png" },
    { "id": "enemy022b", "src": "/images/enemy/pipo-enemy022b.png" },
    { "id": "enemy023", "src": "/images/enemy/pipo-enemy023.png" },
    { "id": "enemy023a", "src": "/images/enemy/pipo-enemy023a.png" },
    { "id": "enemy023b", "src": "/images/enemy/pipo-enemy023b.png" },
    { "id": "enemy024", "src": "/images/enemy/pipo-enemy024.png" },
    { "id": "enemy024a", "src": "/images/enemy/pipo-enemy024a.png" },
    { "id": "enemy024b", "src": "/images/enemy/pipo-enemy024b.png" },
    { "id": "enemy025", "src": "/images/enemy/pipo-enemy025.png" },
    { "id": "enemy025a", "src": "/images/enemy/pipo-enemy025a.png" },
    { "id": "enemy025b", "src": "/images/enemy/pipo-enemy025b.png" },
    { "id": "enemy026", "src": "/images/enemy/pipo-enemy026.png" },
    { "id": "enemy026a", "src": "/images/enemy/pipo-enemy026a.png" },
    { "id": "enemy026b", "src": "/images/enemy/pipo-enemy026b.png" },
    { "id": "enemy027", "src": "/images/enemy/pipo-enemy027.png" },
    { "id": "enemy027a", "src": "/images/enemy/pipo-enemy027a.png" },
    { "id": "enemy027b", "src": "/images/enemy/pipo-enemy027b.png" },
    { "id": "enemy028", "src": "/images/enemy/pipo-enemy028.png" },
    { "id": "enemy028a", "src": "/images/enemy/pipo-enemy028a.png" },
    { "id": "enemy028b", "src": "/images/enemy/pipo-enemy028b.png" },
    { "id": "enemy029", "src": "/images/enemy/pipo-enemy029.png" },
    { "id": "enemy029a", "src": "/images/enemy/pipo-enemy029a.png" },
    { "id": "enemy029b", "src": "/images/enemy/pipo-enemy029b.png" },
    { "id": "enemy030", "src": "/images/enemy/pipo-enemy030.png" },
    { "id": "enemy030a", "src": "/images/enemy/pipo-enemy030a.png" },
    { "id": "enemy030b", "src": "/images/enemy/pipo-enemy030b.png" },
    { "id": "enemy031", "src": "/images/enemy/pipo-enemy031.png" },
    { "id": "enemy031a", "src": "/images/enemy/pipo-enemy031a.png" },
    { "id": "enemy031b", "src": "/images/enemy/pipo-enemy031b.png" },
    { "id": "enemy032", "src": "/images/enemy/pipo-enemy032.png" },
    { "id": "enemy032a", "src": "/images/enemy/pipo-enemy032a.png" },
    { "id": "enemy032b", "src": "/images/enemy/pipo-enemy032b.png" },
    { "id": "enemy033", "src": "/images/enemy/pipo-enemy033.png" },
    { "id": "enemy033a", "src": "/images/enemy/pipo-enemy033a.png" },
    { "id": "enemy033b", "src": "/images/enemy/pipo-enemy033b.png" },
    { "id": "enemy034", "src": "/images/enemy/pipo-enemy034.png" },
    { "id": "enemy034a", "src": "/images/enemy/pipo-enemy034a.png" },
    { "id": "enemy034b", "src": "/images/enemy/pipo-enemy034b.png" },
    { "id": "enemy035", "src": "/images/enemy/pipo-enemy035.png" },
    { "id": "enemy035a", "src": "/images/enemy/pipo-enemy035a.png" },
    { "id": "enemy035b", "src": "/images/enemy/pipo-enemy035b.png" },
    { "id": "enemy036", "src": "/images/enemy/pipo-enemy036.png" },
    { "id": "enemy036a", "src": "/images/enemy/pipo-enemy036a.png" },
    { "id": "enemy036b", "src": "/images/enemy/pipo-enemy036b.png" },
    { "id": "enemy037", "src": "/images/enemy/pipo-enemy037.png" },
    { "id": "enemy037a", "src": "/images/enemy/pipo-enemy037a.png" },
    { "id": "enemy037b", "src": "/images/enemy/pipo-enemy037b.png" },
    { "id": "enemy038", "src": "/images/enemy/pipo-enemy038.png" },
    { "id": "enemy038a", "src": "/images/enemy/pipo-enemy038a.png" },
    { "id": "enemy038b", "src": "/images/enemy/pipo-enemy038b.png" },
    { "id": "enemy039", "src": "/images/enemy/pipo-enemy039.png" },
    { "id": "enemy039a", "src": "/images/enemy/pipo-enemy039a.png" },
    { "id": "enemy039b", "src": "/images/enemy/pipo-enemy039b.png" },
    { "id": "enemy040", "src": "/images/enemy/pipo-enemy040.png" },
    { "id": "enemy040a", "src": "/images/enemy/pipo-enemy040a.png" },
    { "id": "enemy040b", "src": "/images/enemy/pipo-enemy040b.png" }
  ], false);

  game.fonts.add(new FontFace("Shinonome14", "url(/fonts/JF-Dot-Shinonome14.woff2)"));
  game.fonts.add(new FontFace("Shinonome16", "url(/fonts/JF-Dot-Shinonome16.woff2)"));
  game.fonts.add(new FontFace("Kappa20", "url(/fonts/JF-Dot-Kappa20.woff2)"));
  game.fonts.add(new FontFace("Kappa20B", "url(/fonts/JF-Dot-Kappa20B.woff2)"));

  // game.fonts.add(new FontFace("DQ", "url(/fonts/GD-DOTFONT-DQ-TTF_008.woff2)"));
  // game.fonts.add(new FontFace("dot-mplus", "url(/fonts/JF-Dot-MPlusH12.woff2)"));
  // game.fonts.add(new FontFace("chibit", "url(/fonts/chibit.woff2)"));
  // game.fonts.add(new FontFace("coopoppo", "url(/fonts/coopoppo.woff2)"));

  game.fonts.load().then(()=> {
    game.pushScene(new LoadingScene());
    game.start();
  });

});
