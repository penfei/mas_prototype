#pragma strict

class BodyController extends PlayerController{
	public var leftHandController:LeftHandController;
	public var boneForHead:GameObject;
	public var boneForHeadCamera:GameObject;
	
	private var gestures:GestureController;
	
	override protected function PlayerAwake(){
		super.PlayerAwake();
		leftHandController = GetComponentInChildren(LeftHandController);
		
		if (photonView.isMine)
	    {
	    	gestures = GameObject.Find("BodyGestures").GetComponent(GestureController);
	    	gestures.Init();
	    }
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
		gameObject.GetComponent(CharacterMotor).canControl = photonView.isMine;
	}
	
	override protected function PlayerUpdateMe() {
		super.PlayerUpdateMe();
		
		gameObject.GetComponent(MouseLook).canRotation = !core.isConnected;
       	if(core.isConnected){
            transform.rotation = Quaternion.Lerp(transform.rotation, core.bodyCorrectPlayerRot, Time.deltaTime * smooth);
        }
        
        if(Input.GetMouseButton(0) && core.head != null)
		{
			gestures.AddPoint(core.head.GetComponent(HeadController).cameraObject.GetComponent(HeadCameraController).basicCamera);
		}
		
		if(Input.GetMouseButtonUp(0) && core.head != null){
			gestures.Recognize();
		}
        
        leftHandController.ikActive = Input.GetButton("Action");
	}
	
	function OnGUI(){
		if (photonView.isMine)
	    {
        	var GUIPosition:Rect = new Rect(15,Screen.height - 100,800,100);
			GUI.Label(GUIPosition, gestures.matchStroke);
		}
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