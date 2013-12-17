#pragma strict

import Photon.MonoBehaviour;
 
class NetworkController extends Photon.MonoBehaviour{
	var cameraContainer:GameObject;
	var cameraObject:GameObject;
	public var boneForHead:GameObject;
	public var boneForHeadCamera:GameObject;
	var smooth = 20f;
	
	enum CharacterType { Body, Head};
	var type:CharacterType = CharacterType.Body;
	
	private var motor : CharacterMotor;
	private var correctPlayerPos:Vector3 = Vector3.zero; 
    private var correctPlayerRot:Quaternion = Quaternion.identity; 
    private var v = 0f;
	private var h = 0f;
	private var sneak = false;
	private var jump = false;
	private var core:Core;
	
	function Awake () {
		motor = GetComponent(CharacterMotor);
		core = GameObject.Find("Administration").GetComponent(Core);
	}
	
	function Start(){
		if(type == CharacterType.Body){
		   core.body = gameObject;
		}
		if(type == CharacterType.Head){
		   core.head = gameObject;
		   cameraObject.GetComponent(AudioListener).enabled = true;
		}
		                    
		if (photonView.isMine)
	    {
	       
	    }
	    else
	    {        
	        gameObject.GetComponent(CharacterMotor).movement.gravity = 0;
		}
	}

	function OnPhotonSerializeView(stream:PhotonStream, info:PhotonMessageInfo)
    {
        if (stream.isWriting)
        {
            stream.SendNext(transform.position);
            stream.SendNext(transform.rotation); 
            stream.SendNext(Input.GetAxis("Horizontal")); 
            stream.SendNext(Input.GetAxis("Vertical"));  
            stream.SendNext(Input.GetButton("Sneak")); 
            stream.SendNext(Input.GetButton("Jump"));
            var bodyRotCorrect:Quaternion = Quaternion.identity;
            if(core.body != null){
            	bodyRotCorrect = core.body.transform.rotation;
            }
            stream.SendNext(bodyRotCorrect);  
        }
        else
        {
            correctPlayerPos = stream.ReceiveNext();
            correctPlayerRot = stream.ReceiveNext();
            h = stream.ReceiveNext();
            v = stream.ReceiveNext();
            sneak = stream.ReceiveNext();
            jump = stream.ReceiveNext();            
            var bodyRotCorrect2:Quaternion = stream.ReceiveNext();
            if(type == CharacterType.Head && core.body != null){
            	core.bodyCorrectPlayerRot = bodyRotCorrect2;
            }
        }
    }

    function Update()
    {
   		cameraContainer.active = (photonView.isMine && core.isHead) || (!photonView.isMine && core.isBody);
		cameraObject.active = (photonView.isMine && core.isHead) || (!photonView.isMine && core.isBody);
		gameObject.GetComponent(CharacterMotor).canControl = photonView.isMine && core.isBody;
		
        if (!photonView.isMine)
        {
       		gameObject.GetComponent(MouseLook).canRotation = core.isHead && core.isConnected;
          	cameraObject.GetComponent(MouseLook).canRotation = false;
          	if(type != CharacterType.Head || !core.isConnected){
            	transform.position = Vector3.Lerp(transform.position, correctPlayerPos, Time.deltaTime * smooth);
            } 
            if(type != CharacterType.Body || !core.isConnected){
            	transform.rotation = Quaternion.Lerp(transform.rotation, correctPlayerRot, Time.deltaTime * smooth);
            }
            motor.inputJump = jump;
            motor.inputSneak = sneak;
            motor.inputX = h;
            motor.inputY = v;
        } else{
       		gameObject.GetComponent(MouseLook).canRotation = true;
       		if(type == CharacterType.Body && core.isConnected){
            	transform.rotation = Quaternion.Lerp(transform.rotation, core.bodyCorrectPlayerRot, Time.deltaTime * smooth);
            	gameObject.GetComponent(MouseLook).canRotation = false;
            }
            if(type == CharacterType.Head && core.isConnected){
    			transform.position = core.body.GetComponent(NetworkController).boneForHead.transform.position;
    			transform.rotation = core.body.GetComponent(NetworkController).boneForHead.transform.rotation;
    			gameObject.GetComponent(MouseLook).canRotation = false;
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
			motor.inputJump = Input.GetButton("Jump");
			motor.inputSneak = Input.GetButton("Sneak");;
            motor.inputX = Input.GetAxis("Horizontal");
            motor.inputY = Input.GetAxis("Vertical");
		}
	}
}