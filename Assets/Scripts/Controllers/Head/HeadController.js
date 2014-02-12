#pragma strict

class HeadController extends PlayerController{

	var headProjector:Projector;
	var headProjectorContainer:GameObject;
	
	var customFont:Font;
	var fontCountX = 10;
	var fontCountY = 10;
	var perCharacterKerning:PerCharacterKerning[]; 
	var lineSpacing:float = 1;
	var decalTextureSize = 1024;
	var characterSize = 1;
	
	private var textToTexture:TextToTexture;
	private var message:String = "";
	private var isActivePrint:boolean = false;
	
	override protected function PlayerStart(){
		super.PlayerStart();
		motor.enabledScript = false;
		core.head = gameObject;
		core.PlayerInit();
		cameraObject.GetComponent(AudioListener).enabled = true;
		
		textToTexture = new TextToTexture(customFont, fontCountX, fontCountY, perCharacterKerning, true, 200, 4);
		
		if (!photonView.isMine){
	    	GetComponent(SphereCollider).enabled = false;
			rigidbody.useGravity = false;
	    }
	    
	    if(headProjectorContainer != null){
			headProjectorContainer.active = false;
		}
	}
	
	override protected function PlayerStreamMe(stream:PhotonStream, info:PhotonMessageInfo) {
		super.PlayerStreamMe(stream, info);
		
		var bodyRotCorrect:Quaternion = Quaternion.identity;
        if(core.body != null){
           	bodyRotCorrect = core.body.GetComponent(BodyController).rotationObject.transform.rotation;
        }
        stream.SendNext(bodyRotCorrect);  
	}
	
	override protected function PlayerStreamOther(stream:PhotonStream, info:PhotonMessageInfo) {
		super.PlayerStreamOther(stream, info);
		            
        var bodyRotCorrect:Quaternion = stream.ReceiveNext();
        if(core.body != null){
           	core.bodyCorrectPlayerRot = bodyRotCorrect;
        }
    }
	
	override protected function PlayerFixedUpdate() {
		super.PlayerFixedUpdate();
	}
	
	override protected function PlayerLateUpdate() {
		super.PlayerLateUpdate();
	
		if(core.isConnected){
			cameraObject.transform.position = core.body.GetComponent(BodyController).boneForHeadCamera.transform.position;
			cameraObject.transform.localEulerAngles.y = core.body.transform.localEulerAngles.y;
		}
	}
	
	override protected function PlayerLateUpdateMe() {
		super.PlayerLateUpdateMe();
		
        if(core.isConnected){
    		transform.position = core.body.GetComponent(BodyController).boneForHead.transform.position;
    		rotationObject.transform.rotation = core.body.GetComponent(BodyController).boneForHead.transform.rotation;
        }
	}
	
	override protected function PlayerLateUpdateOther() {
		super.PlayerLateUpdateOther();
		
        if(!core.isConnected){
           	transform.position = Vector3.Lerp(transform.position, correctPlayerPos, Time.deltaTime * smooth);
        } 
        rotationObject.transform.rotation = Quaternion.Lerp(rotationObject.transform.rotation, correctPlayerRot, Time.deltaTime * smooth);
	}
	
	override protected function PlayerUpdate() {
		super.PlayerUpdate();
		
		cameraObject.active = true;
		motor.canControl = false;
	}
	
	override protected function PlayerUpdateMe() {
		super.PlayerUpdateMe();
		
		gameObject.GetComponent(MouseLook).canRotation = !core.isConnected;
		if(core.isConnected){
			cameraObject.GetComponent(MouseLook).axes = 2;
		} else {
			cameraObject.GetComponent(MouseLook).axes = 0;
		}
		
		if(Input.GetButtonDown("Chat")){
			message = "";
			isActivePrint = !isActivePrint;
			if(isActivePrint){
				core.RPCUpdateMessage(message);
			}
			switchProjector();
			core.RPCSwitchProjector();
		}
		if(Input.inputString != "" && Input.inputString != "`" && isActivePrint){
	  		for (var c : char in Input.inputString) {
				if (c == "\b"[0]) {
					if (message.Length != 0){
						message = message.Substring(0, message.Length - 1);
					}
				}
				else {
					message += c;
				}
			}
			core.RPCUpdateMessage(message);
	  	}
	}
	
	override protected function PlayerUpdateOther() {
		super.PlayerUpdateOther();
		
		gameObject.GetComponent(MouseLook).canRotation = false;
        cameraObject.GetComponent(MouseLook).canRotation = false;
	}
	
	public function updateMessage(newMessage:String):void{
		message = newMessage;
		Debug.Log("text = " + message);
		var text:String = textToTexture.getFormatText(message, characterSize);
		var textWidthPlusTrailingBuffer:int = textToTexture.CalcTextWidthPlusTrailingBuffer(text, decalTextureSize, characterSize);
		var textHeightOffset:int = textToTexture.CalcTextHeightOffset(text, characterSize, lineSpacing);
	    var posX:int = (decalTextureSize - textWidthPlusTrailingBuffer) / 2;
	    var posY:int = decalTextureSize / 2 + textHeightOffset;
	    if(posX < 0){
	    	posX = 0;
	    }
	    if(posY < 0){
	    	posY = 0;
	    }
		headProjector.material.SetTexture("_ShadowTex", textToTexture.CreateTextToTexture(text, posX, posY, decalTextureSize, characterSize, lineSpacing));
	}
	
	override public function CanDisconnection():boolean{
		return Input.GetButton("Disconnection") && !isActivePrint;
	}
	
	public function switchProjector():void{
		headProjectorContainer.active = !headProjectorContainer.active;
	}
}