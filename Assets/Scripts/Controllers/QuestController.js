#pragma strict

class QuestController extends Photon.MonoBehaviour{
	var allQuests:QuestData[];
	
	public var activeQuests:Array;
	private var data:GameDataController;
	private var allQuestsHash:Hashtable;

	public function StartLevel () {
		activeQuests = new Array();
		data = GetComponent(GameDataController);
		allQuestsHash = new Hashtable();
		for(var quest:QuestData in allQuests){
			allQuestsHash[quest.questName] = quest;
		}
		
		var activeQuestsStr:String = data.GetStringParameter("activeQuests");
		if(activeQuestsStr != null && activeQuestsStr != ""){
			for(var questName:String in data.GetStringParameter("activeQuests").Split(","[0])){
				activeQuests.Push(allQuestsHash[questName] as QuestData);
			}
		}
	}

	function Update () {
		
	}
	
	public function getQuestDataByName(questName:String):QuestData{
		if(allQuestsHash[questName] != null) return allQuestsHash[questName] as QuestData;
		return null;
	}
	
	public function RPCCheckingQuest(questName:String, actionType:String){
		photonView.RPC("CheckingQuest", PhotonTargets.All, questName, actionType);
	}
	
	@RPC
	public function CheckingQuest(questName:String, actionType:String, info:PhotonMessageInfo){
		var quest:QuestData = getQuestDataByName(questName);
		if(actionType == "Start" && !hasQuest(quest)){
			if(quest.checkStartRequirements()){
				AddQuest(quest);
			}
		}
		if(actionType == "Finish" && hasQuest(quest)){
			if(quest.checkFinishRequirements()){
				GetReward(quest);
				RemoveQuest(quest);
			}
		}
	}
	
	public function GetReward(quest:QuestData){
		for(var reward:RewardData in quest.questRewards){
			data.GetReward(reward);
		}
	}
	
	public function AddQuest(quest:QuestData){
		activeQuests.Push(quest);
	}
	
	public function RemoveQuest(quest:QuestData){
		for(var i:uint = 0; i < activeQuests.length; i++){
			if((activeQuests[i] as QuestData).questName == quest.questName){
				activeQuests.RemoveAt(i);
			}
		}
	}
	
	public function SaveQuests(){
		var activeQuestsStr:String = "";
		for(var quest:QuestData in activeQuests){
			activeQuestsStr += quest.questName + ",";
		}
		if(activeQuestsStr != ""){
			activeQuestsStr = activeQuestsStr.Remove(activeQuestsStr.length - 1);
		}
		data.SaveStringParameter("activeQuests", activeQuestsStr);
	}
	
	public function hasQuest(questData:QuestData):boolean{
		for(var quest:QuestData in activeQuests){
			if(quest.questName == questData.questName){
				return true;
			}
		}
		return false;
	}
	
	public function hasQuestByName(questName:String):boolean{
		for(var quest:QuestData in activeQuests){
			if(quest.questName == questName){
				return true;
			}
		}
		return false;
	}
}