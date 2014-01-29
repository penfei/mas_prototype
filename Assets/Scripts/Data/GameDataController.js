#pragma strict

class GameDataController extends DataController{

	private var playerItems:Hashtable = new Hashtable();
	private var quests:QuestController;
	
	function Start () {

	}

	function Update () {
//		Debug.Log(GetItemCountByName(Items.money));
	}
	
	public function StartLevel(otherPlayerName:String):void{
		player.Init();
		
		otherPlayer.Init(otherPlayerName);
	    InitSession(PlayerPrefs.GetInt("last_game_with_" + otherPlayer.fullName));
	    
	    quests = GetComponent(QuestController);
	    quests.StartLevel();
	    
		for(var itemName:String in Items.Items){
		    playerItems[itemName] = GetSavedItemByName(itemName);
		}
	}
	
	public function SaveLevel(){
		quests.SaveQuests();
		for(var itemName:String in Items.Items){
			SaveItemCount(GetItemByName(itemName));
		}
	}
	
	public function GetReward(reward:RewardData){
		var items:Array = reward.getItems();
		for (var i:uint = 0; i < items.length; i++){
			var item:ItemData = items[i] as ItemData;
			var playerItem:ItemData = GetItemByName(item.itemName);
			if(reward.rewardActionType[i] == RewardActionType.Add){
				playerItem.itemCount += item.itemCount;
			}
			if(reward.rewardActionType[i] == RewardActionType.Remove){
				playerItem.itemCount -= item.itemCount;
			}
			if(reward.rewardActionType[i] == RewardActionType.Set){
				playerItem.itemCount = item.itemCount;
			}
	//		SaveItemCount(playerItem);
		}
	}

	public function GetItemByName(itemName:String):ItemData{
		return playerItems[itemName] as ItemData;
	}

	public function GetItemCountByName(itemName:String):float{
		return GetItemByName(itemName).itemCount;
	}

	public function GetSavedItemByName(itemName:String):ItemData{
		var item:ItemData = new ItemData();
		item.itemName = itemName;
		item.itemCount = GetSavedItemCountByName(itemName);
		return item;
	}

	public function GetSavedItemCountByName(itemName:String):float{
		return GetFloatParameter("item&" + itemName);
	}

	public function SaveItemCount(item:ItemData){
		SaveFloatParameter("item&" + item.itemName, item.itemCount);
	}
}