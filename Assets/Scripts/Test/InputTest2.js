#pragma strict
private var motor : CharacterMotor;
private var leftHandController:LeftHandController;
private var anim:Animator;
private var animationController:AnimationController;
var target:GameObject;
var rotationOffset:float = 0.1f;

function Start () {
	motor = GetComponent(CharacterMotor);
	leftHandController = GetComponentInChildren(LeftHandController);
	anim = GetComponent(Animator);
	animationController = GetComponent(AnimationController);
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

            leftHandController.ikActive = Input.GetButton("Action");       
}

function FixedUpdate () {
	if(leftHandController.ikActive && leftHandController.targetFirst && leftHandController.inRadius){
		target.GetComponent(ImpulsController).AddImpulse(leftHandController.gameObject);
	}
}

function activateCharacterController(value:boolean){
	target.GetComponent(CharacterMotor).enabledScript = value;
	target.GetComponent(SphereCollider).enabled = !value;
	target.rigidbody.useGravity = !value;
}