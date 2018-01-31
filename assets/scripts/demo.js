window.addEventListener("load", ()=> {

  const stage = new createjs.StageGL("main");
  const w = stage.canvas.width;
  const h = stage.canvas.height;

  const start = ()=> {

    const sky = new createjs.Shape();
    sky.graphics.beginBitmapFill(assets.getResult("sky")).drawRect(0, 0, w, h);
    sky.cache(0, 0, w, h);

    const groundImg = assets.getResult("ground");
    const ground = new createjs.Shape();
    ground.graphics.beginBitmapFill(groundImg).drawRect(0, 0, w + groundImg.width, groundImg.height);
    ground.tileW = groundImg.width;
    ground.y = h - groundImg.height;
    //By default swapping between Stage for StageGL will not allow for vector drawing operation such as BitmapFill, useless you cache your shape.
    ground.cache(0, 0, w + groundImg.width, groundImg.height);

    const hill1 = new createjs.Bitmap(assets.getResult("hill1"));
    hill1.setTransform(Math.random() * w, h - hill1.image.height * 4 - groundImg.height, 4, 4);
    hill1.alpha = 0.5;

    const hill2 = new createjs.Bitmap(assets.getResult("hill2"));
    hill2.setTransform(Math.random() * w, h - hill2.image.height * 3 - groundImg.height, 3, 3);

    stage.addChild(sky, ground, hill1, hill2);

    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", (e)=> {
      const delta = e.delta / 1000;
      ground.x = (ground.x - delta * 150) % ground.tileW;
      hill1.x = (hill1.x - delta * 30);
      if (hill1.x + hill1.image.width * hill1.scaleX <= 0) {
        hill1.x = w;
      }
      hill2.x = (hill2.x - delta * 45);
      if (hill2.x + hill2.image.width * hill2.scaleX <= 0) {
        hill2.x = w;
      }
      stage.update(e);
    });
  };

  const manifest = [
    { src: "spritesheet_grant.png", id: "grant" },
    { src: "sky.png", id: "sky" },
    { src: "ground.png", id: "ground" },
    { src: "hill1.png", id: "hill1" },
    { src: "hill2.png", id: "hill2" }
  ];

  const assets = new createjs.LoadQueue(false);
  assets.addEventListener("complete", start);
  assets.loadManifest(manifest, true, "images/demo/");

});

