#pragma strict

@script RequireComponent(PhotonView)
class HeadController extends PlayerController{

	var headProjector:Projector;
	var headProjectorContainer:GameObject;
	
	var customFont:Font;
	var fontCountX = 10;
	var fontCountY = 10;
	var text:String = "";
	var textPlacementY = 615;
	var perCharacterKerning:PerCharacterKerning[]; 
	var lineSpacing = 1;
	var useSharedMaterial = true;
	var decalTextureSize = 1024;
	var characterSize = 1;
	var maxMugTextWidth = 280;
	
	public var GuiRect:Rect = new Rect(0,0,250,300);
	public var IsVisible:boolean = true;
	public var AlignBottom:boolean = false;
	private var inputLine:String = "";
	private var scrollPos:Vector2 = Vector2.zero;
	private var isActive:boolean = false;
	
	override protected function PlayerStart(){
		super.PlayerStart();
		motor.enabledScript = false;
		core.head = gameObject;
		core.PlayerInit();
		cameraObject.GetComponent(AudioListener).enabled = true;
		
		if (this.AlignBottom){
			this.GuiRect.y = Screen.height - this.GuiRect.height + 200;
			//this.GuiRect.y = Screen.height - 100;
		}
		
		if (!photonView.isMine){
	    	GetComponent(SphereCollider).enabled = false;
			rigidbody.useGravity = false;
	    }
	    
	    if(headProjectorContainer != null){
			headProjectorContainer.active = false;
			updateText(text);
		}
	}
	
	override function Update(){
		super.Update();
		if(Input.GetButtonDown("Chat") && core.isBody){
			switchProjector();
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
	
	public function updateText(newText:String):void{
		text = newText;
		var textToTexture:TextToTexture = new TextToTexture(customFont, fontCountX, fontCountY, perCharacterKerning, false);
		var textWidthPlusTrailingBuffer:int = textToTexture.CalcTextWidthPlusTrailingBuffer(text, decalTextureSize, characterSize);
		var posX:int = (decalTextureSize - textWidthPlusTrailingBuffer) / 2;
		if(posX < 0){
			posX = 0;
		}
		headProjector.material.SetTexture("_ShadowTex", textToTexture.CreateTextToTexture(text, posX, textPlacementY, decalTextureSize, characterSize, lineSpacing));
	}
	
	public function switchProjector():void{
		headProjectorContainer.active = !headProjectorContainer.active;
	}
	
	public function OnGUI():void{
		//return;
		if (!this.IsVisible || PhotonNetwork.connectionStateDetailed != PeerState.Joined){
			return;
		}
		if (core == null || core.isBody || (!core.isBody && !core.isHead)) {
			return;
		}
		
		if (Event.current.type == EventType.KeyDown){
			if(Event.current.keyCode == KeyCode.KeypadEnter || Event.current.keyCode == KeyCode.Return){
				//if (!String.IsNullOrEmpty(this.inputLine)){
				Debug.Log("this.inputLine = " + this.inputLine);
				photonView.RPC("UpdateMessage", PhotonTargets.All, this.inputLine);
				this.inputLine = "";
				if(!this.isActive){
					GUI.FocusControl("");
					this.isActive = true;
				}
				else{
					GUI.FocusControl("ChatInput");
					this.isActive = false;
				}
				return; // printing the now modified list would result in an error. to avoid this, we just skip this single frame
			}
			else{
				if(this.isActive){
					photonView.RPC("UpdateMessage", PhotonTargets.All, this.inputLine);
				}
			}
		}
		
		GUI.SetNextControlName("");
		GUILayout.BeginArea(this.GuiRect);
		
		scrollPos = GUILayout.BeginScrollView(scrollPos);
		GUILayout.FlexibleSpace();
		GUILayout.EndScrollView();
		
		GUILayout.BeginHorizontal();
		GUI.SetNextControlName("ChatInput");
		inputLine = GUILayout.TextField(inputLine);
		if (GUILayout.Button("Send", GUILayout.ExpandWidth(false)))
		{
			photonView.RPC("UpdateMessage", PhotonTargets.All, inputLine);
			inputLine = "";
			GUI.FocusControl("");
		}
		GUILayout.EndHorizontal();
		GUILayout.EndArea();
	}
	
}