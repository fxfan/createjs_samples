
window.addEventListener("load", ()=> {

  const stage = new createjs.Stage("main");

  const circle = new createjs.Shape();
  circle.graphics.beginFill("DarkRed").drawCircle(0, 0, 10);
  circle.x = stage.canvas.width / 2
  circle.y = stage.canvas.height / 2
  stage.addChild(circle);

  createjs.Ticker.addEventListener("tick", ()=> {
    circle.x += Math.floor(Math.random() * 5) - 2;
    circle.y += Math.floor(Math.random() * 5) - 2;
    stage.update();
  });

});
