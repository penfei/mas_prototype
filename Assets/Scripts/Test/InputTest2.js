#pragma strict
private var motor : CharacterMotor;
private var leftHandController:LeftHandController;
private var anim:Animator;
private var animationController:AnimationController;
private var character:CharacterController;
private var layerMask = 10 | 11;
var headCamera:GameObject;
var headProjector:Projector;
var headProjectorContainer:GameObject;

var customFont:Font;
var fontCountX = 10;
var fontCountY = 10;
var text:String = "lolololo";
var textPlacementY = 615;
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

private var isMouseDown = false;

function Start () {
	HyperGlyph.Init(myGestures);
	motor = GetComponent(CharacterMotor);
	leftHandController = GetComponentInChildren(LeftHandController);
	anim = GetComponent(Animator);
	animationController = GetComponent(AnimationController);
	character = GetComponent(CharacterController);
	activateCharacterController(false);
	if(headProjectorContainer != null){
		headProjectorContainer.active = false;
		text = "heall\nasdas\nasdas\nasdas";
		var textToTexture:TextToTexture = new TextToTexture(customFont, fontCountX, fontCountY, perCharacterKerning, true);
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
		character.height = 1.6;
		character.center.y = 0.75;
	} else {
		character.height = 1.9;
		character.center.y = 0.9;
	}
	
	if(Input.GetButtonDown("Chat")){
		headProjectorContainer.active = !headProjectorContainer.active;
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
			motor.inputX = Input.GetAxis("Horizontal") && !isMouseDown;
            motor.inputY = Input.GetAxis("Vertical") && !isMouseDown;
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