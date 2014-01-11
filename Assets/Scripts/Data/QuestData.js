#pragma strict

var startRequirements:RequirementData[];
var finishRequirements:RequirementData[];

var questName:String;
var questRewards:RewardData[];

function Start () {

}

function Update () {

}

public function checkStartRequirements():boolean{
	return checkRequirements(startRequirements);
}

public function checkFinishRequirements():boolean{
	return checkRequirements(finishRequirements);
}

private function checkRequirements(requirements:RequirementData[]):boolean{
	for(var requirement:RequirementData in requirements){
		if(!requirement.Satisfied()){
			return false;
		}
	}
	return true;
}