#pragma strict

class BodyController extends PlayerController{
	public var leftHandController:LeftHandController;
	public var boneForHead:GameObject;
	public var boneForHeadCamera:GameObject;
	
	override protected function PlayerAwake(){
		super.PlayerAwake();
		leftHandController = GetComponentInChildren(LeftHandController);
	}
	
	override protected function PlayerStart(){
		super.PlayerStart();
		motor.enabledScript = photonView.isMine;
		core.body = gameObject;
	}
	
	override protected function PlayerStreamMe(stream:PhotonStream, info:PhotonMessageInfo) {
		super.PlayerStreamMe(stream, info);
	}
	
	override protected function PlayerStreamOther(stream:PhotonStream, info:PhotonMessageInfo) {
		super.PlayerStreamOther(stream, info);
	}
	
	override protected function PlayerUpdate() {		
		super.PlayerUpdate();
		
		cameraObject.active = false;
		cameraContainer.active = false;
		gameObject.GetComponent(CharacterMotor).canControl = photonView.isMine;
	}
	
	override protected function PlayerUpdateMe() {
		super.PlayerUpdateMe();
		
		gameObject.GetComponent(MouseLook).canRotation = !core.isConnected;
       	if(core.isConnected){
            transform.rotation = Quaternion.Lerp(transform.rotation, core.bodyCorrectPlayerRot, Time.deltaTime * smooth);
        }
        
        leftHandController.ikActive = Input.GetButton("Action");
	}
	
	override protected function PlayerUpdateOther() {
		super.PlayerUpdateOther();
		
		gameObject.GetComponent(MouseLook).canRotation = core.isConnected;
        cameraObject.GetComponent(MouseLook).canRotation = false;
        transform.position = Vector3.Lerp(transform.position, correctPlayerPos, Time.deltaTime * smooth);
        if(!core.isConnected){
           	transform.rotation = Quaternion.Lerp(transform.rotation, correctPlayerRot, Time.deltaTime * smooth);
        }
            
       	leftHandController.ikActive = action;
	}
}