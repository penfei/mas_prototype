#pragma strict

enum RewardActionType { Add, Remove, Set};

var rewardItemsName:String[];
var rewardItemsCount:float[];
var rewardActionType:RewardActionType[];

private var rewardItems:Array;

function Start () {

}

function Update () {

}

function getItems():Array{
	if(rewardItems == null){
		rewardItems = new Array();
		for (var i:uint = 0; i < rewardItemsName.length; i++){
			var item:ItemData = new ItemData();
			item.itemName = rewardItemsName[i];
			item.itemCount = rewardItemsCount[i];
			rewardItems.Push(item);
		}
	} 
	return rewardItems;
}