#pragma strict

import Photon.MonoBehaviour;
 
class PlayerController extends Photon.MonoBehaviour{
	var cameraObject:GameObject;
	
	var smooth = 15f;
	
	enum CharacterType { Body, Head};
	var type:CharacterType = CharacterType.Body;
	
	protected var motor : CharacterMotor;
	protected var correctPlayerPos:Vector3 = Vector3.zero; 
    protected var correctPlayerRot:Quaternion = Quaternion.identity;
    public var rotationObject:GameObject; 
    protected var v = 0f;
	protected var h = 0f;
	protected var sneak = false;
	protected var jump = false;
	protected var action = false;
	protected var walk = false;
	protected var inAir = false;
	protected var core:Core;
	protected var character:CharacterController;
	
	function Awake () {
		PlayerAwake();
	}
	
	protected function PlayerAwake(){
		motor = GetComponent(CharacterMotor);
		core = GameObject.Find("Administration").GetComponent(Core);
		rotationObject = GetComponent(MouseLook).target;
		character = GetComponent(CharacterController);
	}
	
	function Start(){
		PlayerStart();
	}
	
	protected function PlayerStart(){
		
	}

	function OnPhotonSerializeView(stream:PhotonStream, info:PhotonMessageInfo)
    {
        if (stream.isWriting)
        {	
        	PlayerStreamMe(stream, info);
        }
        else
        {
        	PlayerStreamOther(stream, info);
            
        }
    }
    
    protected function PlayerStreamMe(stream:PhotonStream, info:PhotonMessageInfo) {
    	stream.SendNext(transform.position);
        stream.SendNext(rotationObject.transform.rotation); 
        stream.SendNext(Input.GetAxis("Horizontal")); 
        stream.SendNext(Input.GetAxis("Vertical"));  
        stream.SendNext(Input.GetButton("Sneak")); 
        stream.SendNext(Input.GetButton("Jump"));
        stream.SendNext(Input.GetButton("Walk"));
        stream.SendNext(!motor.IsGrounded());
    }
    
    protected function PlayerStreamOther(stream:PhotonStream, info:PhotonMessageInfo) {
    	correctPlayerPos = stream.ReceiveNext();
        correctPlayerRot = stream.ReceiveNext();
        h = stream.ReceiveNext();
        v = stream.ReceiveNext();
        sneak = stream.ReceiveNext();
        jump = stream.ReceiveNext();
        walk = stream.ReceiveNext();
        inAir = stream.ReceiveNext();         
    }
    
    function FixedUpdate () {
    	PlayerFixedUpdate();
	}
	
	protected function PlayerFixedUpdate() {
	
	}
	
	function LateUpdate()
    {
    	PlayerLateUpdate();
    	if(photonView.isMine){
    		PlayerLateUpdateMe();
    	}else{
    		PlayerLateUpdateOther();
    	}
	}
	
	protected function PlayerLateUpdate() {
	
	}
	
	protected function PlayerLateUpdateMe() {
	
	}
	
	protected function PlayerLateUpdateOther() {
	
	}

    function Update()
    {
    	PlayerUpdate();
    	if(photonView.isMine){
    		PlayerUpdateMe();
    	}else{
    		PlayerUpdateOther();
    	}
	}
	
	protected function PlayerUpdate() {
	
	}
	
	protected function PlayerUpdateMe() {
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
		motor.inputSneak = Input.GetButton("Sneak");
        motor.inputX = Input.GetAxis("Horizontal");
       	motor.inputY = Input.GetAxis("Vertical");
       	motor.inputWalk = Input.GetButton("Walk");
       	motor.inAir = !motor.IsGrounded();
	}
	
	protected function PlayerUpdateOther() {
		motor.inputJump = jump;
       	motor.inputSneak = sneak;
        motor.inputX = h;
        motor.inputY = v;
        motor.inputWalk = walk;
        motor.inAir = inAir;
	}
	
	/*@RPC
	public function Chat(newLine:String, mi:PhotonMessageInfo){
		
	}*/
}