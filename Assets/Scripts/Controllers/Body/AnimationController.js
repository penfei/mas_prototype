#pragma strict

import Photon.MonoBehaviour;

class AnimationController extends Photon.MonoBehaviour{

	private var anim:Animator;
	private var hash:HashIds;
	var player:GameObject;
	private var currentBaseState:AnimatorStateInfo ;
	private var motor : CharacterMotor;
	
	private var doTurnLeft:boolean = false;
	private var doTurnRight:boolean = false;
	private var targetTurnLeft:float = -90;
	private var targetTurnRight:float = 90;
	private var targetRotation:Quaternion;
	private var isRotating:boolean = false;
	private var rotateFrom:float;
	private var rotateTo:float;
	private var sumRotate:float;
	
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
		movementManagement(
			motor.inputX, 
			motor.inputY, 
			motor.inputSneak, 
			motor.inputJump, 
			motor.inputRun,
			motor.inputSeatDown,
			motor.inputTurnLeft,
			motor.inputTurnRight
		);
	//	AudioManagement();
	}
		
		
	public function movementManagement (
		horizontal:float, 
		vertical:float, 
		sneak:boolean, 
		jump:boolean,
		run:boolean,
		seatDown:boolean,
		turnLeft:boolean,
		turnRight:boolean
	){
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
		
		// если движение вперед или назад
		if(vertical != 0f){
			// если движение вперед
			if(vertical == 1){
				if(run){
					anim.SetBool(hash.runBool, true);
					anim.SetBool(hash.walkBool, false);
					anim.SetBool(hash.sneakBool, false);
					Debug.Log("run");
				}
				else if(sneak){
					anim.SetBool(hash.sneakBool, true);
					anim.SetBool(hash.runBool, false);
					anim.SetBool(hash.walkBool, false);
					Debug.Log("sneak");
				}
				else{
					anim.SetBool(hash.sneakBool, false);
					anim.SetBool(hash.runBool, false);
					anim.SetBool(hash.walkBool, true);
					Debug.Log("walk");
				}
				anim.SetBool(hash.walkBackBool, false);
			}
			// если движение назад
			else{
				anim.SetBool(hash.walkBackBool, true);
				anim.SetBool(hash.walkBool, false);
				anim.SetBool(hash.runBool, false);
				anim.SetBool(hash.sneakBool, false);
				Debug.Log("back");
			}
		}
		// если нет движения вперед и назад
		else{
			anim.SetBool(hash.runBool, false);
			anim.SetBool(hash.walkBool, false);
			anim.SetBool(hash.walkBackBool, false);
			anim.SetBool(hash.sneakBool, false);
			Debug.Log("none");
		}
		
		
		
		// если движение влево или вправо
		if(horizontal != 0f){
			// если движение влево
			if(horizontal == -1){
				anim.SetBool(hash.walkLeftBool, true);
				anim.SetBool(hash.walkRightBool, false);
			}
			// если движение вправо
			else{
				anim.SetBool(hash.walkLeftBool, false);
				anim.SetBool(hash.walkRightBool, true);
			}
		}
		// если нет движения влево и вправо
		else{
			anim.SetBool(hash.walkLeftBool, false);
			anim.SetBool(hash.walkRightBool, false);
		}
		
		
		
		if(seatDown){
			anim.SetBool(hash.seatDownBool, true);
		}else{
			anim.SetBool(hash.seatDownBool, false);
		}
		
		
		// перешаг влево
		if(turnLeft && !isRotating){
			doTurnLeft = true;
			isRotating = true;
			rotateFrom = player.transform.localEulerAngles.y;
			rotateTo = rotateFrom - 90;
			sumRotate = 0;
		}
		else if(turnRight && !isRotating){
			doTurnRight = true;
			isRotating = true;
			rotateFrom = player.transform.localEulerAngles.y;
			rotateTo = rotateFrom + 90;
			sumRotate = 0;
		}
		if(turnLeft){
			anim.SetBool("Turn", doTurnLeft);
			anim.SetFloat("Direction", targetTurnLeft);
		}
		else if(turnRight){
			anim.SetBool("Turn", doTurnRight);
			anim.SetFloat("Direction", targetTurnRight);
		}
		else{
			anim.SetFloat("Direction", targetTurnLeft);
			anim.SetBool("Turn", false);
		}
		//if (anim.GetCurrentAnimatorStateInfo(0).IsName("Base Layer.Idle")){
			//if(doTurnLeft){
				//targetRotation = transform.rotation * Quaternion.AngleAxis(targetTurnLeft, Vector3.up); // Compute target rotation when doTurn is triggered
				//doTurnLeft = false;
				//player.transform.localEulerAngles = new Vector3(player.transform.localEulerAngles.x, player.transform.localEulerAngles.y-90, player.transform.localEulerAngles.z);
			//}
			//else if(doTurnRight){
			//	targetRotation = transform.rotation * Quaternion.AngleAxis(targetTurnRight, Vector3.up); // Compute target rotation when doTurn is triggered
			//	doTurnRight = false;
				//player.transform.localEulerAngles = new Vector3(player.transform.localEulerAngles.x, player.transform.localEulerAngles.y+90, player.transform.localEulerAngles.z);
			//}
		//}
		//else if (anim.GetCurrentAnimatorStateInfo(0).IsName("Base Layer.Turn"))
		//{
			// calls MatchTarget when in Turn state, subsequent calls are ignored until targetTime (0.9f) is reached .
		//	anim.MatchTarget(Vector3.one, targetRotation, AvatarTarget.Root, new MatchTargetWeightMask(Vector3.zero, 1), anim.GetCurrentAnimatorStateInfo(0).normalizedTime, 0.9f);			
		//}
		if(isRotating){
			if(sumRotate > 90){
				player.transform.localEulerAngles.y = rotateTo;
				isRotating = false;
				doTurnLeft = false;
				doTurnRight = false;
			}
			else{
				sumRotate += 100*Time.deltaTime;
				if(doTurnLeft){
					player.transform.localEulerAngles.y -= 100*Time.deltaTime;
				}
				else if(doTurnRight){
					player.transform.localEulerAngles.y += 100*Time.deltaTime;
				}
//				Debug.Log(player.transform.localEulerAngles.y);
			}
		}
		
		//Debug.Log("horizontal = " + horizontal);
		//Debug.Log("vertical = " + vertical);
	}
}