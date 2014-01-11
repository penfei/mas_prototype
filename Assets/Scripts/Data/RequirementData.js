#pragma strict

var hasQuests:String[];
var noQuests:String[];

var requirementItemsName:String[];
var requirementItemsCount:float[];
enum RequirementItemsCompareType { More, Less, Equally};
var requirementItemsCompareType:RequirementItemsCompareType[];

function Start () {
	
}

function Update () {

}

public function Satisfied ():boolean {
	var data:GameDataController = GameObject.Find("Administration").GetComponent(GameDataController);
	var quests:QuestController = GameObject.Find("Administration").GetComponent(QuestController);
	var questName:String;
	for (var i:uint = 0; i < requirementItemsName.length; i++){
		if(requirementItemsCompareType[i] == RequirementItemsCompareType.More){
			if(data.GetItemCountByName(requirementItemsName[i]) <= requirementItemsCount[i]){
				return false;
			}
		}
		if(requirementItemsCompareType[i] == RequirementItemsCompareType.Less){
			if(data.GetItemCountByName(requirementItemsName[i]) >= requirementItemsCount[i]){
				return false;
			}
		}
		
		if(requirementItemsCompareType[i] == RequirementItemsCompareType.Equally){
			if(data.GetItemCountByName(requirementItemsName[i]) != requirementItemsCount[i]){
				return false;
			}
		}
	}
	for(questName in hasQuests){
		if(!quests.hasQuestByName(questName)){
			return false;
		}
	}
	for(questName in noQuests){
		if(quests.hasQuestByName(questName)){
			return false;
		}
	}
	return true;
}