#pragma strict

var speed:int = 300;

private var isNeedOpen:boolean = false;
private var isNeedClose:boolean = false;
private var doorView:GameObject;
private var beginPositionZ:float;
private var speedZ:float;

function Start () {
	doorView = GameObject.Find("DoorView");
	beginPositionZ = doorView.transform.localPosition.z;
	speedZ = speed/60;
}

function Update () {
	if(isNeedOpen){
		if(doorView.transform.eulerAngles.y + Time.deltaTime*speed < 90){
			doorView.transform.eulerAngles.y += Time.deltaTime*speed;
		}
		else{
			doorView.transform.eulerAngles.y = 90;
			isNeedOpen = false;
		}
		if(doorView.transform.localPosition.z - Time.deltaTime*speedZ > beginPositionZ - 1.5){
			doorView.transform.localPosition.z -= Time.deltaTime*speedZ;
		}
		else{
			doorView.transform.localPosition.z = beginPositionZ - 1.5;
			isNeedOpen = false;
		}
	}
	else if(isNeedClose){
		if(doorView.transform.eulerAngles.y - Time.deltaTime*speed > 0){
			doorView.transform.eulerAngles.y -= Time.deltaTime*speed;
		}
		else{
			doorView.transform.eulerAngles.y = 0;
			isNeedClose = false;
		}
		if(doorView.transform.localPosition.z + Time.deltaTime*speedZ < beginPositionZ){
			doorView.transform.localPosition.z += Time.deltaTime*speedZ;
		}
		else{
			doorView.transform.localPosition.z = beginPositionZ;
			isNeedClose = false;
		}
	}
}

function OnTriggerEnter(other:Collider){
	if(other.tag == "Body"){
		isNeedClose = false;
		isNeedOpen = true;
	}
}
	
function OnTriggerExit(other:Collider){
	if(other.tag == "Body"){
		isNeedOpen = false;
		isNeedClose = true;
	}
}