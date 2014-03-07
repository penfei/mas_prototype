#pragma strict

private var animator:Animator;

function Start () {
	animator = GetComponent(Animator);
}

function Update () {
	
}

function OnTriggerEnter(other:Collider){
	if(other.tag == Tags.body || other.tag == Tags.head){
		animator.SetInteger("visitors", animator.GetInteger("visitors") + 1);
		//Debug.Log("enter, visitors = " + animator.GetInteger("visitors"));
	}
}
	
function OnTriggerExit(other:Collider){
	if(other.tag == Tags.body || other.tag == Tags.head){
		animator.SetInteger("visitors", animator.GetInteger("visitors") - 1);
		if(animator.GetInteger("visitors") < 0){
			animator.SetInteger("visitors", 0);
		}
	}
}