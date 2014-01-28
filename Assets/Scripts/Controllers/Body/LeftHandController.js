#pragma strict

class LeftHandController extends MonoBehaviour{ 

	private var avatar:Animator;
	private var core:Core;
	
	private var handTarget:Vector3;
	private var angleRight = 0f;
	private var layerMaskWithHead = 1 << 11;
	
	public var fieldOfViewAngle = 110f;
	public var smoothUp = 2f;
	public var smoothDown = 2f;
	public var smoothTarget = 10f;
	public var offset = 0f;
	public var distanceConnection = 1;
	
	public var handWeight = 0f;
	public var handWeightMax = 0.9f;
	public var angleRightLimit = 90f;
	public var gamerActive = false;
	public var inRadius = false;
	public var targetInSight = false;
	public var targetFirst = false;
	public var hasObject = false;
	public var isButtonUp = true;
	
	public var lastTargetPosition:Vector3;
	
	public var backObject:GameObject;
	public var rightObject:GameObject;
	public var forwardObject:GameObject;
	public var fromCamera:GameObject;
	public var hero:GameObject;
	
	public var targetObject:GameObject;
	private var targetObjectHand:GameObject;
	
	function CanPulling ():boolean {
		return gamerActive && isButtonUp;
	}
	
	function Start () {
		targetObjectHand = forwardObject;
		layerMaskWithHead = ~layerMaskWithHead;
		avatar = hero.GetComponent(Animator);
		core = GameObject.Find("Administration").GetComponent(Core);
	}
	
	function Update () {
		avatar.SetBool("Connect", CanPulling());
	}
	
	public function CanConnection():boolean{
		if(targetObject == null){
			return false;
		}
		return Vector3.Distance(targetObject.transform.position, gameObject.transform.position) < distanceConnection;
	}
	
	function OnAnimatorIK(layerIndex:int)
	{	
		if((CanPulling() || handWeight > 0) && layerIndex == 1)
		{	
			var target:Vector3 = targetObjectHand.transform.position;
			
			if(CanPulling() && handWeight != handWeightMax){
				handWeight = Mathf.Lerp(handWeight, handWeightMax, Time.deltaTime * smoothUp);
			}
			
			if(!targetInSight && targetObject != null){
				if(angleRight>angleRightLimit){
					target = rightObject.transform.position;
				}else{
					target = backObject.transform.position;
				}
			} 
			
			handTarget = Vector3.Lerp(handTarget, target, Time.deltaTime * smoothTarget);
			
			avatar.SetIKPosition(AvatarIKGoal.LeftHand, handTarget);
			avatar.SetIKPositionWeight(AvatarIKGoal.LeftHand, handWeight);
			if(!hasObject){
				avatar.SetLookAtPosition(targetObjectHand.transform.position);
		        avatar.SetLookAtWeight(handWeight, 0.3f, 0.3f, 0.0f, 0.3f);
		    } 
		}
		if(!CanPulling() && layerIndex == 1){
			if(handWeight != 0){
				handWeight = Mathf.Lerp(handWeight, 0, Time.deltaTime * smoothDown);
			}
			if(handWeight < 0.01){
				handWeight = 0;
			}
		}
	}
    
    function FixedUpdate(){
    	if(!gamerActive && !isButtonUp){
    		isButtonUp = true;
    	}
    	if(targetObject != null && (CanPulling() || handWeight > 0)){
	    	targetInSight = false;
			targetFirst = false;
				
	        var direction:Vector3 = targetObject.transform.position - hero.transform.position;
			var angle:float = Vector3.Angle(direction, hero.transform.forward);
			angleRight = Vector3.Angle(direction, hero.transform.right);
	
			if(angle < fieldOfViewAngle * 0.5f + offset)
			{
				targetInSight = true;
			}
			var hit:RaycastHit;
			if(Physics.Raycast(hero.transform.position, direction, hit))
			{
				if(hit.collider.gameObject == targetObject)
				{
					targetFirst = true;
				}
			}
			inRadius = targetObject && Vector3.Distance(hero.transform.position, targetObject.transform.position) < gameObject.GetComponent(SphereCollider).radius;
		}
		if(CanPulling() && targetObject == null && !hasObject){
			FindTarget();
		}
		if(!CanPulling()){
			ResetTarget();
		}
		AddImpulseToTarget();
    }
    
    function AddImpulseToTarget(){
    	if(targetObject != null){
    		targetObject.GetComponent(ImpulsController).AddImpulse(gameObject, CanPulling() && targetFirst && inRadius);
    	}
    }
	
	function FindTarget(){
		if(core){
			if(!core.isConnected){
				SetObjectToTarget(core.head);
			}
			else {
				FindTargetRayCast();
				HandToForward();
			}
		} else {
			FindTargetRayCast();
			HandToForward();
		}
	}
	
	private function SetObjectToTarget(t:GameObject){
		if(targetObject){
			targetObject.GetComponent(ImpulsController).SetNormalMass();
		}
		if(t != null && t.GetComponent(ImpulsController) != null){
			targetObject = t;
			targetObjectHand = t;
			targetObject.GetComponent(ImpulsController).SetImpulsMass();
		} else {
			ResetTarget();
			HandToForward();
		}
	}
	
	public function ResetTarget(){
		if(targetObject != null){
			targetObject.GetComponent(ImpulsController).SetNormalMass();
			targetObject = null;
		}
	}
	
	public function HandToForward(){
		targetObjectHand = forwardObject;
	}
	
	private function FindTargetRayCast(){
		var ray:Ray = new Ray(fromCamera.transform.position, fromCamera.transform.forward);
		var	hitInfo:RaycastHit = new RaycastHit();
		if (Physics.Raycast(ray, hitInfo, Mathf.Infinity, layerMaskWithHead)){
			SetObjectToTarget(hitInfo.collider.gameObject);
		} 
	}
}