#pragma strict
class EnemyAI extends MonoBehaviour{
	public var deadZone:float = 5f;
	public var patrolSpeed:float = 2f;							
	public var chaseSpeed:float = 5f;							
	public var chaseWaitTime:float = 5f;						
	public var patrolWaitTime:float = 1f;
	public var speedDampTime:float = 0.1f;
	public var angularSpeedDampTime:float = 0.7f;
	public var angleResponseTime:float = 0.6f;
	public var fieldOfViewAngle:float = 110f;
	public var playerInSight:boolean;	
	public var personalLastSighting:Vector3;
	public var personalPreviosSighting:Vector3;					
	public var patrolWayPoints:Transform[];
	public var flashIntensity:float = 3f;
	public var fadeSpeed:float = 10f;
	public var player:GameObject;						
	
	private var nav:NavMeshAgent;
	private var anim:Animator;								
	private var playerAnim:AnimationController;
	private var lastPlayerSighting:LastPlayerSighting;
	private var col:SphereCollider;
	private var laserShotLine:LineRenderer;
	private var laserShotLight:Light;							
	
	private var resetPosition:Vector3 = new Vector3(1000f, 1000f, 1000f);
	private var chaseTimer:float;								
	private var patrolTimer:float;								
	private var wayPointIndex:int;	
	private var previousSighting:Vector3;
	private var shooting:boolean;	

	function Awake () {
		col = GetComponent(SphereCollider);
		nav = GetComponent(NavMeshAgent);
		nav.updateRotation = false;
		anim = GetComponent(Animator);
		anim.SetLayerWeight(1, 1f);
		anim.SetLayerWeight(2, 1f);
		lastPlayerSighting = GameObject.Find("Administration").GetComponent(LastPlayerSighting);
//		player = GameObject.FindGameObjectWithTag("BodyCollider");
		playerAnim = GameObject.Find("BodyPlayer_test").GetComponent(AnimationController);
		
		deadZone *= Mathf.Deg2Rad;
		personalLastSighting = resetPosition;
		previousSighting = resetPosition;
		
		laserShotLine = GetComponentInChildren(LineRenderer);
		laserShotLight = laserShotLine.gameObject.light;
		laserShotLine.enabled = false;
		laserShotLight.intensity = 0f;
	}

	function Update () {		
		if(IsPlayerVisible()){
			playerInSight = true;
			personalLastSighting = player.transform.position;
		} else 
			playerInSight = false;
			
		anim.SetBool("PlayerInSight", playerInSight);		
		if(playerInSight)
			Shooting();
		else if(IsRestless())
			Chasing();
		else
			Patrolling();
			
		var shot:float = anim.GetFloat("Shot");
		if(shot > 0.5f && !shooting)
			Shoot();
				
		if(shot < 0.5f)
		{
			shooting = false;
			laserShotLine.enabled = false;
		}
				
		laserShotLight.intensity = Mathf.Lerp(laserShotLight.intensity, 0f, fadeSpeed * Time.deltaTime);
			
		NavAnimSetup();
	}
	
	function OnTriggerStay (other:Collider)
	{
		var otherEnemyAI:EnemyAI = other.gameObject.GetComponent(EnemyAI);
		if(otherEnemyAI != null){
			if(IsRestless() && !otherEnemyAI.IsRestless())
				otherEnemyAI.TellAboutPlayer(personalLastSighting);
		}
		if(other.gameObject == player)
		{
			if(playerAnim.IsRunState())
				if(CalculatePathLength(player.transform.position) <= col.radius)
					personalLastSighting = player.transform.position;
		}
	}
	
	function IsRestless():boolean{
		return personalLastSighting != resetPosition;
	}
	
	function IsPlayerVisible():boolean{
		var direction:Vector3 = player.transform.position - transform.position;
		var angle:float = Vector3.Angle(direction, transform.forward);		
					
		if(angle < fieldOfViewAngle * 0.5f)
		{
			var hit:RaycastHit;
			
			var radius:float = col.radius;
			if(playerInSight)
				radius = Mathf.Infinity;			
			if(Physics.Raycast(transform.position + transform.up, direction.normalized, hit, radius)){
				return hit.collider.gameObject == player;
			}
		}
		return false;
	}
	
	function TellAboutPlayer(position:Vector3){
		if(personalPreviosSighting != position)
			personalLastSighting = position;
	}
	
	function Shooting ()
	{
		nav.Stop();
	}
	
	function Shoot ()
	{
		shooting = true;
		
		ShotEffects();
	}
	
	function ShotEffects ()
	{
		laserShotLine.SetPosition(0, laserShotLine.transform.position);
		laserShotLine.SetPosition(1, player.transform.position + Vector3.up * 1.5f);
		laserShotLine.enabled = true;
		laserShotLight.intensity = flashIntensity;
	}
	
	function Chasing ()
	{
		var sightingDeltaPos:Vector3 = personalLastSighting - transform.position;
		
		if(sightingDeltaPos.sqrMagnitude > 4f)
			nav.destination = personalLastSighting;
		
		nav.speed = chaseSpeed;
		
		if(nav.remainingDistance < nav.stoppingDistance)
		{
			chaseTimer += Time.deltaTime;
			
			if(chaseTimer >= chaseWaitTime)
			{
				personalPreviosSighting = personalLastSighting;
				personalLastSighting = resetPosition;
				chaseTimer = 0f;
			}
		}
		else
			chaseTimer = 0f;
	}
	
	function Patrolling ()
	{
		nav.speed = patrolSpeed;
		
		if(nav.remainingDistance < nav.stoppingDistance)
		{
			patrolTimer += Time.deltaTime;
			
			if(patrolTimer >= patrolWaitTime)
			{
				if(wayPointIndex == patrolWayPoints.Length - 1)
					wayPointIndex = 0;
				else
					wayPointIndex++;
				
				patrolTimer = 0;
			}
		}
		else
			patrolTimer = 0;
		
		nav.destination = patrolWayPoints[wayPointIndex].position;
	}
	
	function OnAnimatorIK (layerIndex:int)
	{
		var aimWeight:float = anim.GetFloat("AimWeight");
		anim.SetIKPosition(AvatarIKGoal.RightHand, player.transform.position + Vector3.up);
		anim.SetIKPositionWeight(AvatarIKGoal.RightHand, aimWeight);
	}
	
	function OnAnimatorMove()
	{
		nav.velocity = anim.deltaPosition / Time.deltaTime;
		transform.rotation = anim.rootRotation;
	}
	
	function NavAnimSetup ()
	{
		var speed:float;
		var angle:float;
		
		if(playerInSight)
		{
			speed = 0f;
			angle = FindAngle(transform.forward, player.transform.position - transform.position, transform.up);
		}
		else
		{
			speed = Vector3.Project(nav.desiredVelocity, transform.forward).magnitude;
			angle = FindAngle(transform.forward, nav.desiredVelocity, transform.up);
			
			if(Mathf.Abs(angle) < deadZone)
			{
				transform.LookAt(transform.position + nav.desiredVelocity);
				angle = 0f;
			}
		}
		
		var angularSpeed:float = angle / angleResponseTime;
        
        anim.SetFloat("Speed", speed, speedDampTime, Time.deltaTime);
		anim.SetFloat("AngularSpeed", angularSpeed, angularSpeedDampTime, Time.deltaTime);
	}
	
	
	function FindAngle (fromVector:Vector3, toVector:Vector3, upVector:Vector3):float
	{
		if(toVector == Vector3.zero)
			return 0f;
		
		var angle:float = Vector3.Angle(fromVector, toVector);
		var normal:Vector3 = Vector3.Cross(fromVector, toVector);
		angle *= Mathf.Sign(Vector3.Dot(normal, upVector));
		angle *= Mathf.Deg2Rad;
		
		return angle;
	}
	
	function CalculatePathLength (targetPosition:Vector3):float
	{
		var path:NavMeshPath = new NavMeshPath();
		if(nav.enabled)
			nav.CalculatePath(targetPosition, path);
		
		var allWayPoints:Vector3 [] = new Vector3[path.corners.Length + 2];
		
		allWayPoints[0] = transform.position;
		
		allWayPoints[allWayPoints.Length - 1] = targetPosition;
		
		for(var i:int = 0; i < path.corners.Length; i++)
		{
			allWayPoints[i + 1] = path.corners[i];
		}
		
		var pathLength:float = 0;
		
		for(var j:int = 0; j < allWayPoints.Length - 1; j++)
		{
			pathLength += Vector3.Distance(allWayPoints[j], allWayPoints[j + 1]);
		}
		
		return pathLength;
	}
}