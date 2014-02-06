#pragma strict

private var core:Core;
private var body:GameObject;
private var leftHandController:LeftHandController;
private var motor:CharacterMotor;

public var inHand = false;
public var inActive = false;

var offsetY:float = 0;
var distance:float = 2;
var distanceToConnect:float = 0.2;
var angle:float = 0;
var rightHandTimeOffset:float = 0.2;

private var rightHandTime:float = 0;
private var rightHandDown = false;

function Start () {
	
}

function Update () {
	core = GameObject.Find("Administration").GetComponent(Core);
	if(core == null){
		body = GameObject.Find("BodyPlayer_test");
	} else {
		if(core.isInited()){
			body = core.body;
		}	
	}
	if(body != null){
		if(leftHandController == null){
			leftHandController = body.GetComponentInChildren(LeftHandController);
			motor = body.GetComponent(CharacterMotor);
		}
		else {
			ObjectUpdate();			
		}
	}
}

function SetInHand () {
	leftHandController.hasObject = true;
	inHand = true;
	leftHandController.targetObject = null;
	leftHandController.HandToForward();
	if(gameObject.GetComponent(CharacterController)){
		gameObject.GetComponent(CharacterController).enabled = false;
	}
}

function SetOutHand () {
	rightHandDown = false;
	inHand = false;
	inActive = false;
	leftHandController.hasObject = false;
	if(gameObject.GetComponent(CharacterController)){
		gameObject.GetComponent(CharacterController).enabled = true;
	}
	if(canChangeObject()){
		GetComponent(ImpulsController).SetNormalMass();
	}
}

function canChangeObject():boolean{
	if(core != null){
		if(core.isHead && gameObject == core.head){
			return true;
		}
		if(gameObject != core.head && gameObject.GetComponent(InteractiveObjectController).photonView.isMine){
			return true;
		}
	}
	else{
		return true;
	}
	return false;		
}

function canChangePhotonObject():boolean{
	if(core != null){
		if(core.isHead && gameObject == core.head){
			return true;
		}
		if(gameObject != core.head){
			return true;
		}
	}
	else{
		return true;
	}
	return false;		
}

function getTarget():Vector3{
	var a:float = (body.transform.localEulerAngles.y + angle) * Mathf.Deg2Rad;
	var point:Vector3 = new Vector3();
	point.x = leftHandController.gameObject.transform.position.x + Mathf.Sin(a)*distance;
	point.y = leftHandController.gameObject.transform.position.y + offsetY;
	point.z = leftHandController.gameObject.transform.position.z + Mathf.Cos(a)*distance;
	return point;
}

function ObjectUpdate () {
	if(gameObject == leftHandController.targetObject){
		inActive = true;
	}
	if(rigidbody != null){
		rigidbody.useGravity = !inActive && canChangeObject();
	}
	if(gameObject == leftHandController.targetObject && !leftHandController.hasObject && Vector3.Distance(getTarget(), transform.position) < distanceToConnect){
		SetInHand();
	}
	if(!motor.inputLeftHand && inHand){
		SetOutHand();
	}
	if(motor.inputRightHand && inHand && !rightHandDown){
		rightHandDown = true;
		rightHandTime = Time.time;
	}
	if(motor.inputRightHand && inHand && rightHandDown && Time.time > rightHandTime + rightHandTimeOffset){
		leftHandController.isButtonUp = false;
		SetOutHand();
		if(core != null && core.isBody && gameObject == core.head){
			core.RPCConnection();
		}
		Debug.Log("action");
	}
	if(!motor.inputRightHand && inHand && rightHandDown && Time.time < rightHandTime + rightHandTimeOffset){
		leftHandController.isButtonUp = false;
		SetOutHand();
		if(canChangeObject()){
			Debug.Log("addForce");
			GetComponent(ImpulsController).AddImpulseForward(body);
		}
	}
	if(inHand && canChangePhotonObject()){
		if(rigidbody != null){
			rigidbody.velocity = Vector3.Lerp(rigidbody.velocity, Vector3.zero, Time.deltaTime * 15);
			rigidbody.angularVelocity = Vector3.Lerp(rigidbody.angularVelocity, Vector3.zero, Time.deltaTime * 15);
		}
		transform.position = Vector3.Lerp(transform.position, getTarget(), Time.deltaTime * 10);
	}
}
@script AddComponentMenu ("Trigger/DragingObject")