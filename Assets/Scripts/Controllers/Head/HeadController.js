#pragma strict

class HeadController extends PlayerController{

	var headProjector:Projector;
	var headProjectorContainer:GameObject;
	
	var customFont:Font;
	var fontCountX = 10;
	var fontCountY = 10;
	var text:String = "";
	var perCharacterKerning:PerCharacterKerning[]; 
	var lineSpacing:float = 1;
	var decalTextureSize = 1024;
	var characterSize = 1;
	
	override protected function PlayerStart(){
		super.PlayerStart();
		motor.enabledScript = false;
		core.head = gameObject;
		core.PlayerInit();
		cameraObject.GetComponent(AudioListener).enabled = true;
		
		if (!photonView.isMine){
	    	GetComponent(SphereCollider).enabled = false;
			rigidbody.useGravity = false;
	    }
	    
	    if(headProjectorContainer != null){
			headProjectorContainer.active = false;
			text = "";
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
//		if(photonView.isMine && core.body != null){
//	    	var con:LeftHandController = core.body.GetComponent(BodyController).leftHandController;
//	    	GetComponent(ImpulsController).AddImpulse(con.gameObject, con.CanPulling() && con.targetFirst && con.inRadius && !core.isConnected);
//		} 
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
	}
	
	override protected function PlayerUpdateOther() {
		super.PlayerUpdateOther();
		
		gameObject.GetComponent(MouseLook).canRotation = false;
        cameraObject.GetComponent(MouseLook).canRotation = false;
	}
	
	public function updateMessage(newMessage:String):void{
		text = newMessage;
		Debug.Log("text = " + text);
		var textToTexture:TextToTexture = new TextToTexture(customFont, fontCountX, fontCountY, perCharacterKerning, true, decalTextureSize - 100);
		var textWidthPlusTrailingBuffer:int = textToTexture.CalcTextWidthPlusTrailingBuffer(text, decalTextureSize, characterSize);
		text = textToTexture.getTextChanged();
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
	
	public function switchProjector():void{
		headProjectorContainer.active = !headProjectorContainer.active;
	}
}