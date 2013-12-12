#pragma strict

import Photon.MonoBehaviour;

class PlayerMove extends Photon.MonoBehaviour{
	private var anim:Animator;
	private var hash:HashIds;
	var player:GameObject;
	private var currentBaseState:AnimatorStateInfo ;
	private var motor : CharacterMotor;
	
	//static int idleState = Animator.StringToHash("Base Layer.Idle");	
	//static int locoState = Animator.StringToHash("Base Layer.Locomotion");
	static private var jumpState:int = Animator.StringToHash("Base Layer.Jump");

	function Awake ()
		{
			anim = GetComponent(Animator);
			hash = GameObject.FindGameObjectWithTag(Tags.gameController).GetComponent(HashIds);
			motor = player.GetComponent(CharacterMotor);
		}
		
	function FixedUpdate ()
	{
		
	}
		
	function Update ()
	{	
		movementManagement(motor.inputX, motor.inputY, motor.inputSneak, motor.inputJump);
	//	AudioManagement();
	}
		
		
	public function movementManagement (horizontal:float, vertical:float, sneaking:boolean, jump:boolean)
	{
		currentBaseState = anim.GetCurrentAnimatorStateInfo(0);
	//	Debug.Log(currentBaseState.length );
	//	Debug.Log(contr.isGrounded);
		if (currentBaseState.nameHash != jumpState)
		{
			if(jump)
			{
				anim.SetBool("Jump", true);
			}
		}
			
		else if(currentBaseState.nameHash == jumpState)
		{
			if(!anim.IsInTransition(0))
			{
	//			if(useCurves)
	//				col.height = anim.GetFloat("ColliderHeight");
					
				anim.SetBool("Jump", false);
			}
				
	//		Ray ray = new Ray(transform.position + Vector3.up, -Vector3.up);
	//		RaycastHit hitInfo = new RaycastHit();
	//			
	//		if (Physics.Raycast(ray, out hitInfo))
	//		{
	//			if (hitInfo.distance > 1.75f)
	//			{	
	//				anim.MatchTarget(hitInfo.point, Quaternion.identity, AvatarTarget.Root, new MatchTargetWeightMask(new Vector3(0, 1, 0), 0), 0.35f, 0.5f);
	//			}
	//		}
		}
		if(horizontal != 0f || vertical != 0f) anim.SetBool(hash.runBool, true);
		else anim.SetBool(hash.runBool, false);
		if(sneaking){
			if(horizontal != 0f || vertical != 0f) {
				anim.SetBool(hash.sneakingBool, true);
				anim.SetBool(hash.sneakIdleBool, false);
			} else {
				anim.SetBool(hash.sneakingBool, false);
				anim.SetBool(hash.sneakIdleBool, true);
			}
		} else {
			anim.SetBool(hash.sneakingBool, false);
			anim.SetBool(hash.sneakIdleBool, false);
		}
	}
}