#pragma strict
private var motor : CharacterMotor;
private var leftHandController:LeftHandController;
private var anim:Animator;
private var animationController:AnimationController;
private var character:CharacterController;
private var layerMask = 10 | 11;

var target:GameObject;
var rotationOffset:float = 0.1f;

function Start () {
	motor = GetComponent(CharacterMotor);
	leftHandController = GetComponentInChildren(LeftHandController);
	anim = GetComponent(Animator);
	animationController = GetComponent(AnimationController);
	character = GetComponent(CharacterController);
//	target.GetComponent(CharacterMotor).enabled = false;
	activateCharacterController(false);
}

function Update () {
	motor.canControl = (Input.GetButton("Jump") && !animationController.IsJumpState()) || !motor.IsGrounded();
	anim.applyRootMotion = !motor.canControl;
	
	if(animationController.IsSneakState()){
		character.height = 1.6;
		character.center.y = 0.75;
	} else {
		character.height = 1.9;
		character.center.y = 0.9;
	}
	
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
			if(animationController.IsSneakState() && !Input.GetButton("Sneak") && checkUp()){
				motor.inputSneak = true;
			} else
				motor.inputSneak = Input.GetButton("Sneak");
			motor.inputWalk = Input.GetButton("Walk");
			motor.inputRightHand = Input.GetButton("RightHandAction");
			motor.inputLeftHand = Input.GetButton("LeftHandAction");
			motor.inAir = !motor.IsGrounded();

            leftHandController.gamerActive = motor.inputLeftHand;       
}

function activateCharacterController(value:boolean){
	target.GetComponent(CharacterMotor).enabledScript = value;
	target.GetComponent(SphereCollider).enabled = !value;
	target.rigidbody.useGravity = !value;
}

private function checkUp():boolean{
	var ray:Ray = new Ray(transform.position, transform.up);
	var	hitInfo:RaycastHit = new RaycastHit();
	
	if (Physics.Raycast(ray, hitInfo, 2f, layerMask)){
		return hitInfo.distance < 2;
	} else {
		return false;
	}
}