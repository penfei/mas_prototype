#pragma strict
private var motor : CharacterMotor;
private var leftHandController:LeftHandController;
var target:GameObject;

	public var runSpeed : float = 4.6;
	public var runStrafeSpeed : float = 3.07;
	public var runBackSpeed : float = 2.5;
	public var walkSpeed : float = 1.22;
	public var walkStrafeSpeed : float = 1.22;
	public var walkBackSpeed : float = 1.1;
	public var crouchRunSpeed : float = 5;
	public var crouchRunStrafeSpeed : float = 5;
	public var crouchRunBackSpeed : float = 5;
	public var crouchWalkSpeed : float = 1.8;
	public var crouchWalkStrafeSpeed : float = 1.8;
	public var crouchWalkBackSpeed : float = 1.8;

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
			motor.inputWalk = Input.GetButton("Walk");
            
            leftHandController.gamerActive = Input.GetButton("Action");
            
            var crouch:boolean = motor.inputSneak;
            var walk:boolean = ((motor.inputX != 0f) || (motor.inputY!= 0f)) && !motor.inputWalk;
            
            motor.movement.maxForwardSpeed = ((walk) ? ((crouch) ? crouchWalkSpeed : walkSpeed) : ((crouch) ? crouchRunSpeed : runSpeed));
			motor.movement.maxBackwardsSpeed = ((walk) ? ((crouch) ? crouchWalkBackSpeed : walkBackSpeed) : ((crouch) ? crouchRunBackSpeed : runBackSpeed));
			motor.movement.maxSidewaysSpeed = ((walk) ? ((crouch) ? crouchWalkStrafeSpeed : walkStrafeSpeed) : ((crouch) ? crouchRunStrafeSpeed : runStrafeSpeed));
}

function FixedUpdate () {
	target.GetComponent(ImpulsController).AddImpulse(leftHandController.gameObject, leftHandController.CanPulling() && leftHandController.targetFirst && leftHandController.inRadius);
}

function activateCharacterController(value:boolean){
	target.GetComponent(CharacterMotor).enabledScript = value;
	target.GetComponent(SphereCollider).enabled = !value;
	target.rigidbody.useGravity = !value;
}