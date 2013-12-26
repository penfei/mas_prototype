#pragma strict

class HeadController extends PlayerController{
	
	override protected function PlayerStart(){
		super.PlayerStart();
		motor.enabledScript = false;
		core.head = gameObject;
		cameraObject.GetComponent(AudioListener).enabled = true;
		
		if (!photonView.isMine)
	    {
	    	GetComponent(SphereCollider).enabled = false;
			rigidbody.useGravity = false;
	    }
	}
	
	override protected function PlayerStreamMe(stream:PhotonStream, info:PhotonMessageInfo) {
		super.PlayerStreamMe(stream, info);
		
		var bodyRotCorrect:Quaternion = Quaternion.identity;
        if(core.body != null){
           	bodyRotCorrect = core.body.transform.rotation;
        }
        stream.SendNext(bodyRotCorrect);  
	}
	
	protected function PlayerStreamOther(stream:PhotonStream, info:PhotonMessageInfo) {
		super.PlayerStreamOther(stream, info);
		            
        var bodyRotCorrect:Quaternion = stream.ReceiveNext();
        if(core.body != null){
           	core.bodyCorrectPlayerRot = bodyRotCorrect;
        }
    }
	
	override protected function PlayerFixedUpdate() {
		super.PlayerFixedUpdate();
		if(photonView.isMine && core.body != null){
	    	var con:LeftHandController = core.body.GetComponent(BodyController).leftHandController;
			if(con.ikActive && con.targetFirst && con.inRadius && !core.isConnected){
				GetComponent(ImpulsController).AddImpulse(con.leftHand);
			}
		} 
	}
	
	override protected function PlayerUpdate() {
		super.PlayerUpdate();
		
		cameraObject.active = true;
		cameraContainer.active = true;
		gameObject.GetComponent(CharacterMotor).canControl = false;
	}
	
	override protected function PlayerUpdateMe() {
		super.PlayerUpdateMe();
		
		gameObject.GetComponent(MouseLook).canRotation = !core.isConnected;
        if(core.isConnected){
    		transform.position = core.body.GetComponent(BodyController).boneForHead.transform.position;
    		transform.rotation = core.body.GetComponent(BodyController).boneForHead.transform.rotation;
        }
	}
	
	override protected function PlayerUpdateOther() {
		super.PlayerUpdateOther();
		
		gameObject.GetComponent(MouseLook).canRotation = core.isConnected;
        cameraObject.GetComponent(MouseLook).canRotation = false;
        if(!core.isConnected){
           	transform.position = Vector3.Lerp(transform.position, correctPlayerPos, Time.deltaTime * smooth);
        } 
        transform.rotation = Quaternion.Lerp(transform.rotation, correctPlayerRot, Time.deltaTime * smooth);
	}
}