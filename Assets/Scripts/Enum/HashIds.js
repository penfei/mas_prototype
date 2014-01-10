#pragma strict

var runBool:int;
var sneakBool:int;
var sneakIdleBool:int;
var jumpBool:int;
var connectBool:int;
var walkBool:int;
var walkBackBool:int;
var walkLeftBool:int;
var walkRightBool:int;
var seatDownBool:int;
	
function Awake ()
{
	sneakIdleBool = Animator.StringToHash("Sneak Idle");
	runBool = Animator.StringToHash("Run");
	sneakBool = Animator.StringToHash("Sneak");
	jumpBool = Animator.StringToHash("Jump");
	connectBool = Animator.StringToHash("Connect");
	walkBool = Animator.StringToHash("Walk");
	walkBackBool = Animator.StringToHash("WalkBack");
	walkLeftBool = Animator.StringToHash("WalkLeft");
	walkRightBool = Animator.StringToHash("WalkRight");
	seatDownBool = Animator.StringToHash("SeatDown");
}