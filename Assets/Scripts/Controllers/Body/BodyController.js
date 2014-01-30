#pragma strict

class BodyController extends PlayerController{
	public var leftHandController:LeftHandController;
	public var boneForHead:GameObject;
	public var boneForHeadCamera:GameObject;
	
	private var gestures:GestureController;
	private var animationController:AnimationController;
	private var leftHandAction = false;
	private var rightHandAction = false;
	private var layerMask = 10 | 11;
	
	override protected function PlayerAwake(){
		super.PlayerAwake();
		leftHandController = GetComponentInChildren(LeftHandController);
		animationController = GetComponent(AnimationController);
		
		if (photonView.isMine)
	    {
	    	gestures = GameObject.Find("BodyGestures").GetComponent(GestureController);
	    	gestures.Init();
	    }
	}
	
	override protected function PlayerStart(){
		super.PlayerStart();
		motor.enabledScript = photonView.isMine;
		motor.canControl = false;
		GetComponent(Animator).applyRootMotion = photonView.isMine;
		core.body = gameObject;
		core.PlayerInit();
		gameObject.GetComponent(MouseLook).canRotation = false;
		cameraObject.GetComponent(MouseLook).canRotation = false;
	}
	
	override protected function PlayerStreamMe(stream:PhotonStream, info:PhotonMessageInfo) {
		super.PlayerStreamMe(stream, info);
		
		stream.SendNext(Input.GetButton("RightHandAction"));
		stream.SendNext(Input.GetButton("LeftHandAction"));
	}
	
	override protected function PlayerStreamOther(stream:PhotonStream, info:PhotonMessageInfo) {
		super.PlayerStreamOther(stream, info);
		
		rightHandAction = stream.ReceiveNext();
		leftHandAction = stream.ReceiveNext();
	}
	
	override protected function PlayerLateUpdateMe() {
		super.PlayerLateUpdateMe();
		
        if(core.isConnected){
            rotationObject.transform.rotation = Quaternion.Lerp(rotationObject.transform.rotation, core.bodyCorrectPlayerRot, Time.deltaTime * smooth);
        }
	}
	
	override protected function PlayerLateUpdateOther() {
		super.PlayerLateUpdateOther();
		
      	transform.position = Vector3.Lerp(transform.position, correctPlayerPos, Time.deltaTime * smooth);
        if(!core.isConnected){
           rotationObject.transform.rotation = Quaternion.Lerp(rotationObject.transform.rotation, correctPlayerRot, Time.deltaTime * smooth);
        }
	}
	
	override protected function PlayerUpdate() {		
		super.PlayerUpdate();
		
		cameraObject.active = false;
		
		if(animationController.IsSneakState()){
			character.height = 1.6;
			character.center.y = 0.75;
		} else {
			character.height = 1.9;
			character.center.y = 0.9;
		}
		
		if(animationController.IsSneakState() && !motor.inputSneak && checkUp()){
			motor.inputSneak = true;
		} 
//		gameObject.GetComponent(CharacterMotor).canControl = photonView.isMine;
	}
	
	override protected function PlayerUpdateMe() {
		super.PlayerUpdateMe();
        
        if(Input.GetMouseButton(0) && core.head != null)
		{
			gestures.AddPoint(core.head.GetComponent(HeadController).cameraObject.GetComponent(HeadCameraController).basicCamera);
		}
		
		if(Input.GetMouseButtonUp(0) && core.head != null){
			gestures.Recognize();
		}
        
        motor.inputLeftHand = Input.GetButton("LeftHandAction");
        motor.inputRightHand = Input.GetButton("RightHandAction");
        
        motor.canControl = (Input.GetButton("Jump") && !animationController.IsJumpState()) || !motor.IsGrounded();
		animationController.applyRootMotion(!motor.canControl);

        leftHandController.gamerActive = motor.inputLeftHand;
	}
	
	override protected function PlayerUpdateOther() {
		super.PlayerUpdateOther();
		
		gameObject.GetComponent(MouseLook).canRotation = core.isConnected;
            
       	motor.inputLeftHand = leftHandAction;
       	motor.inputRightHand = rightHandAction;

        leftHandController.gamerActive = motor.inputLeftHand;
	}
	
	function OnGUI(){
		if (photonView.isMine)
	    {
        	var GUIPosition:Rect = new Rect(15,Screen.height - 100,800,100);
			GUI.Label(GUIPosition, gestures.matchStroke);
		}
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
}