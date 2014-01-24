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
	public var ikActive = false;
	public var inRadius = false;
	public var targetInSight = false;
	public var targetFirst = false;
	
	public var lastTargetPosition:Vector3;
	
	public var backObject:GameObject;
	public var rightObject:GameObject;
	public var forwardObject:GameObject;
	public var fromCamera:GameObject;
	public var hero:GameObject;
	
	private var targetObject:GameObject;
	private var targetObjectHand:GameObject;
	
	function Start () {
		targetObjectHand = forwardObject;
		layerMaskWithHead = ~layerMaskWithHead;
		avatar = hero.GetComponent(Animator);
		core = GameObject.Find("Administration").GetComponent(Core);
	}
	
	function Update () {
		avatar.SetBool("Connect", ikActive);
	}
	
	public function CanConnection():boolean{
		if(targetObject == null){
			return false;
		}
		return Vector3.Distance(targetObject.transform.position, gameObject.transform.position) < distanceConnection;
	}
	
	function OnAnimatorIK(layerIndex:int)
	{	
		if((ikActive || handWeight > 0) && layerIndex == 1)
		{	
			var target:Vector3 = targetObjectHand.transform.position;
			
			if(ikActive && handWeight != handWeightMax){
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
			avatar.SetLookAtPosition(targetObjectHand.transform.position);
	        avatar.SetLookAtWeight(handWeight, 0.3f, 0.3f, 0.0f, 0.3f); 
		}
		if(!ikActive && layerIndex == 1){
			if(handWeight != 0){
				handWeight = Mathf.Lerp(handWeight, 0, Time.deltaTime * smoothDown);
			}
			if(handWeight < 0.01){
				handWeight = 0;
			}
		}
	}
    
    function FixedUpdate(){
    	if(targetObject != null && (ikActive || handWeight > 0)){
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
		if(ikActive && targetObject == null){
			FindTarget();
		}
		if(!ikActive){
			ResetTarget();
		}
		AddImpulseToTarget();
    }
    
    function AddImpulseToTarget(){
    	if(targetObject != null){
    		targetObject.GetComponent(ImpulsController).AddImpulse(gameObject, ikActive && targetFirst && inRadius);
    	}
    }
	
	function FindTarget(){
		if(core){
			if(!core.isConnected){
				SetObjectToTarget(core.head);
			}
			else FindTargetRayCast();
		} else {
			FindTargetRayCast();
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
			targetObjectHand = forwardObject;
		}
	}
	
	private function ResetTarget(){
		if(targetObject != null){
			targetObject.GetComponent(ImpulsController).SetNormalMass();
			targetObject = null;
		}
	}
	
	private function FindTargetRayCast(){
		var ray:Ray = new Ray(fromCamera.transform.position, fromCamera.transform.forward);
		var	hitInfo:RaycastHit = new RaycastHit();
		if (Physics.Raycast(ray, hitInfo, Mathf.Infinity, layerMaskWithHead)){
			SetObjectToTarget(hitInfo.collider.gameObject);
		} 
	}
}