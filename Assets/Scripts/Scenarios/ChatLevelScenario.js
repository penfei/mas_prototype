#pragma strict
private var core:Core;

function Start () {
	core = GameObject.Find("Administration").GetComponent(Core);
	core.eventInit.subscribe(LevelStart);
}

function LevelStart(){
	core.eventInit.unsubscribe(LevelStart);
	GameObject.Find("Camera").active = false;
}