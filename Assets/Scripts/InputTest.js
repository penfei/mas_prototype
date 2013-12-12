#pragma strict
private var motor : CharacterMotor;
function Start () {
	motor = GetComponent(CharacterMotor);
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
			motor.inputJump = Input.GetButton("Jump");
			motor.inputSneak = Input.GetButton("Sneak");;
            motor.inputX = Input.GetAxis("Horizontal");
            motor.inputY = Input.GetAxis("Vertical");
}