#pragma strict

class QuestTrigger extends MonoBehaviour{
	enum InitializerType { OnEnter, OnExit};
	var startQuestsInitializerType:InitializerType = InitializerType.OnEnter;
	var finishQuestsInitializerType:InitializerType = InitializerType.OnEnter;
	
	var startQuests:GameObject[];
	var finishQuests:GameObject[];
	
	var isNeedRPC = true;
	var isNeedBeMine = true;
	
	private var quests:QuestController;
	private var core:Core;

	function Start () {
		quests = GameObject.Find("Administration").GetComponent(QuestController);
		core = GameObject.Find("Administration").GetComponent(Core);
	}

	function Update () {

	}

	function OnTriggerEnter (other:Collider)
    {
        if(other.gameObject.tag == "BodyCollider"){
        	StartChecking(InitializerType.OnEnter, core.isBody);
        }
        if(other.gameObject.tag == Tags.head){
        	StartChecking(InitializerType.OnEnter, core.isHead);
        }
    }
    
    function OnTriggerExit (other:Collider)
    {
    	if(other.gameObject.tag == "BodyCollider"){
        	StartChecking(InitializerType.OnExit, core.isBody);
        }
        if(other.gameObject.tag == Tags.head){
        	StartChecking(InitializerType.OnExit, core.isHead);
        }
    }
    
    private function StartChecking (initializerType:InitializerType, isMine:boolean) {
    	if(initializerType == startQuestsInitializerType){
    		for(var startQuest:GameObject in startQuests){
    			Checking(startQuest.GetComponent(QuestData).questName, isMine, "Start");
    		}
    	}
    	if(initializerType == finishQuestsInitializerType){
    		for(var finishQuest:GameObject in finishQuests){
    			Checking(finishQuest.GetComponent(QuestData).questName, isMine, "Finish");
    		}
    	}
	}
	
	private function Checking(questName:String, isMine:boolean, actionType:String){
		if(isNeedRPC){
    		if(isNeedBeMine){
    			if(isMine){
    				quests.RPCCheckingQuest(questName, actionType);
    			}
    		} else {
    			quests.RPCCheckingQuest(questName, actionType);
    		}
    	} else {
    		if(isMine){
    			quests.CheckingQuest(questName, actionType, null);
    		}
    	}
	}
}
@script AddComponentMenu ("Trigger/QuestTrigger")