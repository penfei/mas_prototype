#pragma strict

class HeadControllerTest extends PlayerController{
	
	override protected function PlayerStart(){
		super.PlayerStart();
		
		if (!photonView.isMine)
	    {
	    	motor.enabledScript = false;
	    }
	}
	
	override protected function PlayerStreamMe(stream:PhotonStream, info:PhotonMessageInfo) {
		super.PlayerStreamMe(stream, info);
	}
	
	override protected function PlayerStreamOther(stream:PhotonStream, info:PhotonMessageInfo) {
		super.PlayerStreamOther(stream, info);
    }
	
	override protected function PlayerUpdate() {
	
		super.PlayerUpdate();
	}
	
	override protected function PlayerUpdateMe() {
		var directionVector = new Vector3(Input.GetAxis("Horizontal"), 0, Input.GetAxis("Vertical"));
		if (directionVector != Vector3.zero) {
			var directionLength = directionVector.magnitude;
			directionVector = directionVector / directionLength;
			directionLength = Mathf.Min(1, directionLength);	
			directionLength = directionLength * directionLength;	
			directionVector = directionVector * directionLength;	
		}
			
		motor.inputMoveDirection = rotationObject.transform.rotation * directionVector;
		motor.inputJump = Input.GetButton("Jump");
		motor.inputSneak = Input.GetButton("Sneak");;
        motor.inputX = Input.GetAxis("Horizontal");
       	motor.inputY = Input.GetAxis("Vertical");
	}
	
	override protected function PlayerUpdateOther() {
		super.PlayerUpdateOther();
		
		transform.position = Vector3.Lerp(transform.position, correctPlayerPos, Time.deltaTime * smooth);
	}
}