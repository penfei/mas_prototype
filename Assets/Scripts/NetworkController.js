#pragma strict

import Photon.MonoBehaviour;
 
class NetworkController extends Photon.MonoBehaviour{
	var cameraContainer:GameObject;
	var cameraObject:GameObject;
	
	enum CharacterType { Body, Head};
	var type:CharacterType = CharacterType.Body;
	private var motor : CharacterMotor;
	private var correctPlayerPos:Vector3 = Vector3.zero; //We lerp towards this
    private var correctPlayerRot:Quaternion = Quaternion.identity; //We lerp towards this
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
        }
        else
        {
            correctPlayerPos = stream.ReceiveNext();
            correctPlayerRot = stream.ReceiveNext();
            h = stream.ReceiveNext();
            v = stream.ReceiveNext();
            sneak = stream.ReceiveNext();
            jump = stream.ReceiveNext();
        }
    }

    function Update()
    {
   		cameraContainer.active = (photonView.isMine && core.isHead) || (!photonView.isMine && core.isBody);
		cameraObject.active = (photonView.isMine && core.isHead) || (!photonView.isMine && core.isBody);
		gameObject.GetComponent(CharacterMotor).canControl = photonView.isMine && core.isBody;
        if (!photonView.isMine)
        {
       		gameObject.GetComponent(MouseLook).sensitivityX = 0;
       		if(core.isHead){
            	if(core.isConnected){
            		gameObject.GetComponent(MouseLook).sensitivityX = 15;
            	} 
            }
          	cameraObject.GetComponent(MouseLook).sensitivityY = 0;
            transform.position = Vector3.Lerp(transform.position, correctPlayerPos, Time.deltaTime * 5);
            transform.rotation = Quaternion.Lerp(transform.rotation, correctPlayerRot, Time.deltaTime * 5);
            motor.inputJump = jump;
            motor.inputSneak = sneak;
            motor.inputX = h;
            motor.inputY = v;
        } else{
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
            if(core.isBody){
            	if(core.isConnected){
            		gameObject.GetComponent(MouseLook).sensitivityX = 0;
            	} else {
            		gameObject.GetComponent(MouseLook).sensitivityX = 15;
            	}
            }
		}
		
	}
}