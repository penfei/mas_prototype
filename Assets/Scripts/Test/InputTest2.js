﻿#pragma strict
private var motor : CharacterMotor;
private var leftHandController:LeftHandController;
private var anim:Animator;
private var animationController:AnimationController;
private var capsule:CapsuleCollider;
private var layerMask = 10 | 11;
var headCamera:GameObject;
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

var core:GameObject;
var target:GameObject;
var rotationOffset:float = 0.1f;

var myGestures:GestureSet;
var cam:Camera;
var match:HyperGlyphResult;
var distance:float = 10f;

private var textToTexture:TextToTexture;

private var isMouseDown = false;

function Start () {
	HyperGlyph.Init(myGestures);
	motor = GetComponent(CharacterMotor);
	leftHandController = GetComponentInChildren(LeftHandController);
	anim = GetComponent(Animator);
	animationController = GetComponent(AnimationController);
	capsule = GetComponent(CapsuleCollider);
	activateCharacterController(false);
	if(headProjectorContainer != null){
		headProjectorContainer.active = false;
		textToTexture = new TextToTexture(customFont, fontCountX, fontCountY, perCharacterKerning, true, 200, 4);
	}
}

function Update () {
	if(Input.GetMouseButton(0))
	{
		core.transform.position = cam.ScreenToWorldPoint (new Vector3 (Input.mousePosition.x,Input.mousePosition.y,distance));
		HyperGlyph.AddPoint(Input.mousePosition);
		isMouseDown = true;
	}
		
	if(Input.GetMouseButtonUp(0)){
		match = HyperGlyph.Recognize();
		animationController.StartGesture(match.glyphname);
		isMouseDown = false;
	}

	motor.canControl = ((Input.GetButton("Jump") && !animationController.IsJumpState()) || !motor.IsGrounded()) && !isMouseDown;
	anim.applyRootMotion = !motor.canControl && !isMouseDown;
	GetComponent(MouseLook).enabled = !isMouseDown;
	headCamera.GetComponent(MouseLook).enabled = !isMouseDown;
	
	if(animationController.IsSneakState()){
//		capsule.height = 1.6;
//		capsule.center.y = 0.75;
	} else {
//		capsule.height = 1.9;
//		capsule.center.y = 0.9;
	}
	
	if(Input.GetButtonDown("Chat")){
		text = "";
		updateMessage();
		headProjectorContainer.active = !headProjectorContainer.active;
	}
	
	if(Input.inputString != "" && Input.inputString != "`" && headProjectorContainer.active){
	  	for (var c : char in Input.inputString) {
			if (c == "\b"[0]) {
				if (text.Length != 0){
					text = text.Substring(0, text.Length - 1);
				}
			}
			else {
				text += c;
			}
		}
		updateMessage();
	 }
	
	var directionVector = new Vector3(Input.GetAxis("Horizontal"), 0, Input.GetAxis("Vertical"));
			if (directionVector != Vector3.zero) {
				var directionLength = directionVector.magnitude;
				directionVector = directionVector / directionLength;
				directionLength = Mathf.Min(1, directionLength);	
				directionLength = directionLength * directionLength;	
				directionVector = directionVector * directionLength;	
			}
			
//			motor.inputMoveDirection = transform.rotation * directionVector;
			if(!isMouseDown){
				motor.inputX = Input.GetAxis("Horizontal");
            	motor.inputY = Input.GetAxis("Vertical");
			} else {
				motor.inputX = 0;
            	motor.inputY = 0;
			}
			
			motor.inputJump = Input.GetButton("Jump") && !isMouseDown;
			if(animationController.IsSneakState() && !Input.GetButton("Sneak") && checkUp()){
				motor.inputSneak = true;
			} else
				motor.inputSneak = Input.GetButton("Sneak");
			motor.inputWalk = Input.GetButton("Walk") && !isMouseDown;
			motor.inputRightHand = Input.GetButton("RightHandAction") && !isMouseDown;
			motor.inputLeftHand = Input.GetButton("LeftHandAction") && !isMouseDown;
			motor.inAir = !motor.IsGrounded();

            leftHandController.gamerActive = motor.inputLeftHand;       
}

function updateMessage():void{
		var t:String = textToTexture.getFormatText(text, characterSize);
		var textWidthPlusTrailingBuffer:int = textToTexture.CalcTextWidthPlusTrailingBuffer(t, decalTextureSize, characterSize);
		var textHeightOffset:int = textToTexture.CalcTextHeightOffset(t, characterSize, lineSpacing);
	    var posX:int = (decalTextureSize - textWidthPlusTrailingBuffer) / 2;
	    var posY:int = decalTextureSize / 2 + textHeightOffset;
	    if(posX < 0){
	    	posX = 0;
	    }
	    if(posY < 0){
	    	posY = 0;
	    }
		headProjector.material.SetTexture("_ShadowTex", textToTexture.CreateTextToTexture(t, posX, posY, decalTextureSize, characterSize, lineSpacing));
	}

function activateCharacterController(value:boolean){
	target.GetComponent(CharacterMotor).enabledScript = value;
	target.GetComponent(SphereCollider).enabled = !value;
	target.rigidbody.useGravity = !value;
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

function OnGUI()
	{
		var GUIPosition:Rect = new Rect(15,Screen.height - 100,800,100);
		GUI.Label(GUIPosition, match.glyphname + 
		          "\nscore: " + match.score +
		          "\nbounds: " + match.bounds +
		          "\ndirec:" + match.direction );
	}