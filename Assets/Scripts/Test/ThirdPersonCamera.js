#pragma strict

class ThirdPersonCamera extends MonoBehaviour{ 	

	public var distanceAway = 4f;			// distance from the back of the craft
	public var distanceUp = 1f;			// distance above the craft
	public var smooth = 5f;				// how smooth the camera movement is
	
	private var hovercraft:GameObject;		// to store the hovercraft
	private var targetPosition:Vector3;		// the position the camera is trying to be in
	
	public var follow:Transform;
	
	function Start(){

	}
	
	function LateUpdate ()
	{
		// setting the target position to be the correct offset from the hovercraft
		targetPosition = follow.position + Vector3.up * distanceUp - follow.forward * distanceAway;
		
		// making a smooth transition between it's current position and the position it wants to be in
		transform.position = Vector3.Lerp(transform.position, targetPosition, Time.deltaTime * smooth);
		
		// make sure the camera is looking the right way!
		transform.LookAt(follow);
	}
}