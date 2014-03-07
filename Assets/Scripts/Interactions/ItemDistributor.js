#pragma strict

class ItemDistributor extends Photon.MonoBehaviour{

	private final var ACTION_TYPE_TAKE:String = "actionTypeTake";
	
	var takeRequirements:RequirementData[];
	var itemReward:RewardData;
	
	private var core:Core;
	private var data:GameDataController;
	
	private var itemName:String;
	private var flag:boolean;
	
	private var testTriggered:boolean = false;

	function Start () {
		core = GameObject.Find("Administration").GetComponent(Core);
		data = GameObject.Find("Administration").GetComponent(GameDataController);
//		Debug.Log("data: " + data);
		flag = false;
		itemName = gameObject.name + gameObject.transform.position.x.ToString() + "_" + gameObject.transform.position.y.ToString() + "_" + gameObject.transform.position.z.ToString();
	}

	function Update () {
		
	}

	function OnTriggerEnter(other:Collider){
		if(!testTriggered){
			testTriggered = true;
		}
		else{
			if(other.gameObject.tag == Tags.body){
	        	StartChecking(core.isBody);
	        }
	        if(other.gameObject.tag == Tags.head){
	        	StartChecking(core.isHead);
	        }
		}
	}
	
	@RPC
	public function CheckingItem(itemName:String, actionType:String, info:PhotonMessageInfo){
		Debug.Log("===CHECK ITEM===");
		//var item:GameObject = GameObject.Find(itemName);
		//Debug.Log("===item: " + item.name);
		//if(item != null){
			//var distributor:ItemDistributor = gameOject.GetComponent(ItemDistributor);
			//Debug.Log("===distributor: " + distributor);
			//if(distributor != null){
				//Debug.Log("===actionType: " + actionType);
				if(actionType == ACTION_TYPE_TAKE){
					Debug.Log("===flag: " + flag);
					if(!flag && checkRequirements(takeRequirements)){
						flag = true;
						data.GetReward(itemReward);
					}
				}
			//}
		//}
	}
	
	private function StartChecking (isMine:boolean):void{
		if(isMine){
			RPCChekingItemTake(itemName, ACTION_TYPE_TAKE);
		}
	}
	
	private function RPCChekingItemTake(itemName:String, actionType:String):void{
		photonView.RPC("CheckingItem", PhotonTargets.All, itemName, actionType);
	}
	
	private function checkRequirements(requirements:RequirementData[]):boolean{
		for(var requirement:RequirementData in requirements){
			if(!requirement.Satisfied()){
				return false;
			}
		}
		return true;
	}
	
}