#pragma strict

var impulsStrengh = 1f;

function Start () {
	
}

function Update () {
	
}

function AddImpulse (target:GameObject) {
	var direction:Vector3 = target.transform.position - transform.position;
	var distance:float = Vector3.Distance(target.transform.position, transform.position);
	rigidbody.AddForce((direction * impulsStrengh) / distance );
}