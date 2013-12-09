#pragma strict
var player:UserData = UserData();
var otherPlayer:OtherPlayerData = OtherPlayerData();
var session:SessionData = SessionData();

class UserData {
	var userName:String;
	var userId:String;
	
	public function Init():void{
		userId = PlayerPrefs.GetString("user_id");
		if (String.IsNullOrEmpty(userId))
	    {
	    	userId = Random.Range(1, 99999).ToString();
	    	PlayerPrefs.SetString("user_id", userId);
	    }
	    SetUserName(PlayerPrefs.GetString("user_name"));
	}
	
	public function SetUserName(userName:String){
		this.userName = userName;
		PlayerPrefs.SetString("user_name", userName);
		if (!String.IsNullOrEmpty(userName))
	    {
	    	PhotonNetwork.playerName = userName + "&" + userId;
	    }
	}
}

class OtherPlayerData {
	var userName:String;
	var userId:String;
	var fullName:String;
	
	public function Init(data:String){
		fullName = data;
		var arr:String[] = data.Split("&"[0]);
		this.userName = arr[0];
		this.userId = arr[1];
//		Debug.Log(userName);
//		Debug.Log(userId);
	}
}

class SessionData {
	var sessionId:int;
	var levelName:String;
	
	public function Init(sessionId:int, levelName:String){
		this.sessionId = sessionId;
		this.levelName = levelName;
	}
}

function Start () {
    player.Init();
    
    if(PhotonNetwork.otherPlayers.Length == 1){
    	otherPlayer.Init(PhotonNetwork.otherPlayers[0].ToString());
    	InitSession(PlayerPrefs.GetInt("last_game_with_" + otherPlayer.fullName));
    }

//	Debug.Log(PhotonNetwork.playerName);
}

function InitSession (sessionId:int) {
    var lastLevel = PlayerPrefs.GetString("last_level_with_" + otherPlayer.fullName + "_in_game_" + sessionId.ToString());
    if (String.IsNullOrEmpty(lastLevel))
	{
	   	lastLevel = Levels.Tutorial;
	}
   	session.Init(sessionId, lastLevel);
}

public function Save():void{
	PlayerPrefs.SetInt("last_game_with_" + otherPlayer.fullName, session.sessionId);
	PlayerPrefs.SetString("last_level_with_" + otherPlayer.fullName + "_in_game_" + session.sessionId.ToString(), session.levelName);
}

public function SaveStringParameter(parameterName:String, parameterValue:String):void{
	PlayerPrefs.SetString(otherPlayer.fullName + "&" + session.sessionId + "&" + parameterName, parameterValue);
}

public function SaveIntParameter(parameterName:String, parameterValue:int):void{
	PlayerPrefs.SetInt(otherPlayer.fullName + "&" + session.sessionId + "&" + parameterName, parameterValue);
}

public function SaveFloatParameter(parameterName:String, parameterValue:float):void{
	PlayerPrefs.SetFloat(otherPlayer.fullName + "&" + session.sessionId + "&" + parameterName, parameterValue);
}

function Update () {

}