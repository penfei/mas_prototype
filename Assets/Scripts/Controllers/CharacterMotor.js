#pragma strict
#pragma implicit
#pragma downcast

var enabledScript : boolean = true;
var canControl : boolean = true;

var speed = 8.0;
var gravity = 10.0;
var maxVelocityChange = 10.0;
var inAirControl = 0.1;
var canJump = true;
var jumpHeight = 2.0;
var lastGroundY = 0;
var grounded = false;
private var lastGrounded = false;

var inputX : float = 0;
var inputY : float = 0;
var inputJump : boolean = false;
var inputSneak : boolean = false;
var inputWalk : boolean = false;
var inputRightHand : boolean = false;
var inputLeftHand : boolean = false;
var inAir:boolean = false;
var hasCollisions:boolean = false;
var jumpOffset:float = 0.2;

private var lastOnLandTime:float = 0;

private var capsule : CapsuleCollider;
private var ground : CheckGround;
private var layerMask = 10 | 11;

function Awake () {
	rigidbody.freezeRotation = true;
    rigidbody.useGravity = false;
	capsule = GetComponent(CapsuleCollider);
	ground = GetComponentInChildren(CheckGround);
}

function FixedUpdate () {
	if(ground != null){
		grounded = ground.grounded;
		if(grounded && !lastGrounded){
			lastOnLandTime = Time.time;
			lastGroundY = rigidbody.velocity.y;
//			Debug.Log(lastGroundY);
		}
		lastGrounded = grounded;
	}
	
	if(enabledScript){
		
		if(canControl){
			var targetVelocity = new Vector3(inputX, 0, inputY);
		    targetVelocity = transform.TransformDirection(targetVelocity);
		    targetVelocity *= speed;

		    var velocity = rigidbody.velocity;
		    var velocityChange = (targetVelocity - velocity);
		    velocityChange.x = Mathf.Clamp(velocityChange.x, -maxVelocityChange, maxVelocityChange);
		    velocityChange.z = Mathf.Clamp(velocityChange.z, -maxVelocityChange, maxVelocityChange);
		    velocityChange.y = 0;		        
		        
		    if (grounded)
		    {
		        if (canJump && inputJump && Time.time > lastOnLandTime + jumpOffset)
		        {		            
		            rigidbody.velocity = Vector3(velocity.x, CalculateJumpVerticalSpeed(), velocity.z);
		        } else {
//		        	rigidbody.AddForce(velocityChange, ForceMode.VelocityChange);
		        }
		    }
		    else
		    {
		    	if(!hasCollisions)
					rigidbody.AddForce(velocityChange * inAirControl, ForceMode.VelocityChange);
		    }
		    
		}
		
		rigidbody.AddForce(Vector3 (0, -gravity * rigidbody.mass, 0));
	}
	
	if(ground != null){
		ground.grounded = false;
		hasCollisions = false;
	}
}

function IsGrounded () {
	return grounded;
}

function OnCollisionStay (col : Collision)
{
	hasCollisions = true;
}

private function CalculateJumpVerticalSpeed ()
{
    return Mathf.Sqrt(2 * jumpHeight * gravity);
}

@script AddComponentMenu ("Character/Character Motor")
