#pragma strict
private var motor : CharacterMotor;
private var leftHandController:LeftHandController;
var target:GameObject;

function Start () {
	motor = GetComponent(CharacterMotor);
	leftHandController = GetComponentInChildren(LeftHandController);
//	target.GetComponent(CharacterMotor).enabled = false;
	activateCharacterController(false);
}

function Update () {
	var directionVector = new Vector3(Input.GetAxis("Horizontal"), 0, Input.GetAxis("Vertical"));
			if (directionVector != Vector3.zero) {
				var directionLength = directionVector.magnitude;
				directionVector = directionVector / directionLength;
				directionLength = Mathf.Min(1, directionLength);	
				directionLength = directionLength * directionLength;	
				directionVector = directionVector * directionLength;	
			}
			
			motor.inputMoveDirection = transform.rotation * directionVector;
			motor.inputX = Input.GetAxis("Horizontal");
            motor.inputY = Input.GetAxis("Vertical");
			motor.inputJump = Input.GetButton("Jump");
			motor.inputSneak = Input.GetButton("Sneak");
			motor.inputRun = Input.GetButton("Run");
			motor.inputSeatDown = Input.GetButton("SeatDown");
			motor.inputTurnLeft = Input.GetButton("TurnLeft");
			motor.inputTurnRight = Input.GetButton("TurnRight");
			//motor.inputSneakIdle = Input.GetButton("SneakIdle");
            
            leftHandController.ikActive = Input.GetButton("Action");
}

function FixedUpdate () {
	if(leftHandController.ikActive && leftHandController.targetFirst && leftHandController.inRadius){
		target.GetComponent(ImpulsController).AddImpulse(leftHandController.leftHand);
	}
}

function activateCharacterController(value:boolean){
	target.GetComponent(CharacterMotor).enabledScript = value;
	target.GetComponent(SphereCollider).enabled = !value;
	target.rigidbody.useGravity = !value;
}