#pragma strict

var impulsStrengh = 1f;
var impulsUpStrengh = 100f;

function Start () {
	
}

function Update () {
	
}

function AddImpulse (target:GameObject, isImpulse:boolean) {
	if(isImpulse){
		rigidbody.mass = 0.05;
		rigidbody.drag = 10;
		var direction:Vector3 = target.transform.position - transform.position;
		var distance:float = Vector3.Distance(target.transform.position, transform.position);
		rigidbody.AddForce((direction * impulsStrengh) / distance );
	} else {
		rigidbody.mass = 1;
		rigidbody.drag = 0;
	}
}

function AddUpImpulse () {
	rigidbody.AddForce(transform.up * impulsUpStrengh);
}