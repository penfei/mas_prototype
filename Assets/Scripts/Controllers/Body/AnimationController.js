#pragma strict

import Photon.MonoBehaviour;

class AnimationController extends Photon.MonoBehaviour{

	private var anim:Animator;
	private var hash:HashIds;
	private var currentBaseState:AnimatorStateInfo ;
	private var motor : CharacterMotor;
	
	private var isRotating:boolean = false;
	
	var smooth:float = 10f;
	var united = false;
	
	private var v:float = 0f;
	private var h:float = 0f;
	private var d:float = 0f;
	
	//static int idleState = Animator.StringToHash("Base Layer.Idle");	
	//static int locoState = Animator.StringToHash("Base Layer.Locomotion");
	static private var jumpState:int = Animator.StringToHash("Base Layer.Jump");
	
	private var leftHandController:LeftHandController;
	private var core:Core;

	function Awake ()
	{
		anim = GetComponent(Animator);
		hash = GameObject.FindGameObjectWithTag(Tags.gameController).GetComponent(HashIds);
		motor = GetComponent(CharacterMotor);
		anim.SetLayerWeight(1, 1f);
		leftHandController = GetComponentInChildren(LeftHandController);
		core = GameObject.Find("Administration").GetComponent(Core);
	}
	
	function OnAnimatorIK(layerIndex:int)
	{	
		leftHandController.OnAnimatorIK(layerIndex);
	}
		
	function FixedUpdate ()
	{
		
	}
	
	public function IsJumpState():boolean{
		var stateName:int = anim.GetCurrentAnimatorStateInfo(0).nameHash;
		for(var a:AnimationInfo in anim.GetCurrentAnimationClipState(0)){
			if(a.clip.name.Contains("Jump")) return true;
		}
		return false;
	}
	
	public function IsSneakState():boolean{
		var stateName:int = anim.GetCurrentAnimatorStateInfo(0).nameHash;
		for(var a:AnimationInfo in anim.GetCurrentAnimationClipState(0)){
			if(a.clip.name.Contains("Sneak")) return true;
		}
		return false;
	}
		
	function Update ()
	{	
		if(core){
			united = core.isConnected;
		}
		
		movementManagement(
			motor.inputX, 
			motor.inputY, 
			motor.inputSneak, 
			motor.inputJump, 
			motor.inputWalk,
			motor.inputX == -1,
			motor.inputX == 1
		);
	}
		
		
	public function movementManagement (
		horizontal:float, 
		vertical:float, 
		sneak:boolean, 
		jump:boolean,
		walk:boolean,
		turnLeft:boolean,
		turnRight:boolean
	){
		currentBaseState = anim.GetCurrentAnimatorStateInfo(0);
		
		v = Mathf.Lerp(v, vertical, Time.deltaTime * smooth);
		h = Mathf.Lerp(h, horizontal, Time.deltaTime * smooth);
		
		anim.SetBool("InAir", !motor.IsGrounded());
		anim.SetFloat("Horizontal", h);
		anim.SetFloat("Vertical", v);
		anim.SetBool("Sneak", sneak);
		anim.SetBool("United", united);
		anim.SetBool("Jump", jump && !IsJumpState());
		anim.SetBool(hash.sneakBool, sneak);
		
		if(motor.IsGrounded()){
			if(united){
				anim.SetBool(hash.walkBool, (vertical != 0f || horizontal != 0f) && walk);
				anim.SetBool(hash.runBool, (vertical != 0f || horizontal != 0f) && !walk);
			} else {
				anim.SetBool(hash.walkBool, vertical != 0f && walk);
				anim.SetBool(hash.runBool, vertical != 0f && !walk);
			}
		} 
		
		isRotating = (turnLeft || turnRight) && !(turnLeft && turnRight);
		anim.SetBool("Turn", isRotating);
		if(isRotating){
			if(turnLeft){
				d = Mathf.Lerp(d, -1, Time.deltaTime * smooth);
			}
			if(turnRight){
				d = Mathf.Lerp(d, 1, Time.deltaTime * smooth);
			} 
		} else {
			d = Mathf.Lerp(d, 0, Time.deltaTime * smooth);
		}
		anim.SetFloat("Direction", d);
	}
}