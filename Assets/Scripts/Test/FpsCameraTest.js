#pragma strict

var boneForHeadCamera:GameObject;
var body:GameObject;

function Start () {

}

function LateUpdate () {
	transform.position = boneForHeadCamera.transform.position;
	transform.localEulerAngles.y = body.transform.localEulerAngles.y;
}