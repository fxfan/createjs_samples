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

    stage.addChild(sky, ground);

    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", (e)=> {
      const delta = e.delta / 1000;
      ground.x = (ground.x - delta * 150) % ground.tileW;
      stage.update(e);
    });
  };

  const manifest = [
    { src: "spritesheet_grant.png", id: "grant" },
    { src: "sky.png", id: "sky" },
    { src: "ground.png", id: "ground" },
    { src: "hill1.png", id: "hill" },
    { src: "hill2.png", id: "hill2" }
  ];

  const assets = new createjs.LoadQueue(false);
  assets.addEventListener("complete", start);
  assets.loadManifest(manifest, true, "images/demo/");

});

