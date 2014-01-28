#pragma strict

private var body:GameObject;
private var leftHandController:LeftHandController;
private var motor:CharacterMotor;

public var inHand = false;

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
	if(body == null){
		if(GameObject.Find("Administration").GetComponent(Core) != null){
			body = GameObject.Find("Administration").GetComponent(Core).body;
		}
		if(GameObject.Find("BodyPlayer_test") != null){
			body = GameObject.Find("BodyPlayer_test");
		}
	} else{
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
	leftHandController.ResetTarget();
	leftHandController.HandToForward();
	rigidbody.useGravity = false;
}

function SetOutHand () {
	rightHandDown = false;
	inHand = false;
	leftHandController.hasObject = false;
	GetComponent(ImpulsController).SetNormalMass();
	rigidbody.useGravity = true;
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
		Debug.Log("action");
	}
	if(!motor.inputRightHand && inHand && rightHandDown && Time.time < rightHandTime + rightHandTimeOffset){
		leftHandController.isButtonUp = false;
		SetOutHand();
		GetComponent(ImpulsController).AddImpulseForward(body);
	}
	if(inHand){
		rigidbody.velocity = Vector3.Lerp(rigidbody.velocity, Vector3.zero, Time.deltaTime * 15);
		rigidbody.angularVelocity = Vector3.Lerp(rigidbody.angularVelocity, Vector3.zero, Time.deltaTime * 15);
		transform.position = Vector3.Lerp(transform.position, getTarget(), Time.deltaTime * 15);
	}
}
@script AddComponentMenu ("Trigger/DragingObject")