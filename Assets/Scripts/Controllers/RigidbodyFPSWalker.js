var speed = 8.0;
var gravity = 10.0;
var maxVelocityChange = 10.0;
var inAirControl = 0.1;
var canJump = true;
var jumpHeight = 2.0;
var airOffset = 1.0;
var grounded = false;
var collisions:Array = new Array();
private var capsule : CapsuleCollider;
private var layerMask = 10 | 11;
private var ground : CheckGround;

@script RequireComponent(Rigidbody, CapsuleCollider)

function Awake ()
{
    rigidbody.freezeRotation = true;
    rigidbody.useGravity = false;
    capsule = GetComponent(CapsuleCollider);
    ground = GetComponentInChildren(CheckGround);
}

function FixedUpdate ()
{
	grounded = ground.grounded;
    if (grounded)
    {
        var targetVelocity = new Vector3(Input.GetAxis("Horizontal"), 0, Input.GetAxis("Vertical"));
        targetVelocity = transform.TransformDirection(targetVelocity);
        targetVelocity *= speed;

        var velocity = rigidbody.velocity;
        var velocityChange = (targetVelocity - velocity);
        velocityChange.x = Mathf.Clamp(velocityChange.x, -maxVelocityChange, maxVelocityChange);
        velocityChange.z = Mathf.Clamp(velocityChange.z, -maxVelocityChange, maxVelocityChange);
        velocityChange.y = 0;

        rigidbody.AddForce(velocityChange, ForceMode.VelocityChange);

        if (canJump && Input.GetButton("Jump"))
        {
            rigidbody.velocity = Vector3(velocity.x, CalculateJumpVerticalSpeed(), velocity.z);
        }
    }
    else
    {
        targetVelocity = new Vector3(Input.GetAxis("Horizontal"), 0, Input.GetAxis("Vertical"));
        targetVelocity = transform.TransformDirection(targetVelocity) * inAirControl;

        rigidbody.AddForce(targetVelocity, ForceMode.VelocityChange);
    }
	
    rigidbody.AddForce(Vector3 (0, -gravity * rigidbody.mass, 0));
    ground.grounded = false;
}

function TrackGrounded (col : Collision):boolean
{
	if(!grounded){
	    var minimumHeight = capsule.bounds.min.y + capsule.radius;
	    
	    for (var c : ContactPoint in col.contacts)
	    {
	        if (c.point.y < minimumHeight)
	        {
	            return true;
	        }
	    }
	}
	return false;  
}

private function checkDown():boolean{
//	if(collisions.length > 0) return true;
	var fp:Vector3 = new Vector3(capsule.bounds.center.x,capsule.bounds.min.y-0.2f,capsule.bounds.center.z);
	return Physics.CheckCapsule(capsule.bounds.center,fp,0.4f);
//	var ray:Ray = new Ray(transform.position, -transform.up);
//	var	hitInfo:RaycastHit = new RaycastHit();
//	
//	if (Physics.Raycast(ray, hitInfo, 10f, layerMask)){
//		return hitInfo.distance < airOffset;
//	} else {
//		return false;
//	}
}

function OnCollisionStay (col : Collision)
{
//    if(TrackGrounded (col)){
//		grounded = true;
//	}
} 

function OnCollisionEnter (col : Collision)
{
//	if(TrackGrounded (col)){
//		grounded = true;
//		AddCollision(col.gameObject);
//	}
}

function OnCollisionExit (col : Collision)
{
//    RemoveCollision(col.gameObject);
}

private function AddCollision(col : GameObject){
	if (indexOf(collisions, col) == -1)
	{
		collisions[collisions.length] = col;
	}
}

private function RemoveCollision(col : GameObject){
	var index:int = indexOf(collisions, col);
	if (index > -1)
	{
		collisions.splice(index, 1);
	}
}

private function indexOf(arr:Array, obj:Object):int{
	var i:uint = 0;
	for (i = 0; i < arr.length; i++)
	{
		if(arr[i] == obj){
			return i;
		}
	}
	return -1;
}

private function CalculateJumpVerticalSpeed ()
{
    return Mathf.Sqrt(2 * jumpHeight * gravity);
}