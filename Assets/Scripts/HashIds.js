#pragma strict

var runBool:int;
var sneakingBool:int;
var sneakIdleBool:int;
var jumpBool:int;
var connectBool:int;
	
function Awake ()
{
	sneakIdleBool = Animator.StringToHash("Sneak Idle");
	runBool = Animator.StringToHash("Run");
	sneakingBool = Animator.StringToHash("Sneaking");
	jumpBool = Animator.StringToHash("Jump");
	connectBool = Animator.StringToHash("Connect");
}