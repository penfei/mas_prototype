#pragma strict

var impulsStrengh = 1f;
var impulsUpStrengh = 100f;
var impulsForwardStrengh = 200f;

function Start () {
	
}

function Update () {
	
}

function AddImpulse (target:GameObject, isImpulse:boolean) {
	rigidbody.useGravity = !isImpulse;
	if(isImpulse){
		var t:Vector3 = target.transform.position;
		if(target.GetComponent(DragingObject) != null){
			t = target.GetComponent(DragingObject).getTarget();
		}
		var direction:Vector3 = t - transform.position;
		var distance:float = Vector3.Distance(t, transform.position);
		rigidbody.AddForce((direction * impulsStrengh) / distance );
	} 
}

function AddImpulseForward (target:GameObject) {
	rigidbody.AddForce((transform.position - target.transform.position) * impulsForwardStrengh);
}

function SetNormalMass(){
	rigidbody.useGravity = true;
	rigidbody.mass = 1;
	rigidbody.drag = 0;
}

function SetImpulsMass(){
	rigidbody.mass = 0.05;
	rigidbody.drag = 10;
}

function AddUpImpulse () {
	rigidbody.AddForce(transform.up * impulsUpStrengh);
}