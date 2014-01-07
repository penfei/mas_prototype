#pragma strict

import Photon.MonoBehaviour;
 
class StartMenu extends Photon.MonoBehaviour{    
	var userName = "";
	private var data:DataController = null;
	private var scrollPos:Vector2 = Vector2.zero;
	private var scrollPosGame:Vector2 = Vector2.zero;
	private var connected = false;
	private var complete = false;
	private var gamesCount = 0;
	var fastStart = false;
	
	private var connectToRoom = false;

	function Start () {
		PhotonNetwork.automaticallySyncScene = true;
		
		if (PhotonNetwork.connectionStateDetailed == PeerState.PeerCreated)
	    {
	        PhotonNetwork.ConnectUsingSettings("1.0");
	    }
	    
		connected = false;
		complete = false;
		connectToRoom = false;
		gamesCount = 0;
		data = GetComponent(DataController);
	}
	
	function OnGUI()
    {
    	if(String.IsNullOrEmpty(data.player.userName)){
	    	GUI.Box(new Rect((Screen.width - 400) / 2, (Screen.height - 350) / 2, 400, 100), "Enter Your Name");
	    	
	    	GUILayout.BeginArea(new Rect((Screen.width - 400) / 2, (Screen.height - 350) / 2, 400, 100));
	    	GUILayout.Space(50);
			GUILayout.BeginHorizontal();
			
			GUILayout.Space(25);
	    	
	    	userName = GUILayout.TextField(userName, GUILayout.Width(275));
	    	
	    	GUILayout.Space(25);
	    	
	    	if (GUILayout.Button("Ok", GUILayout.Width(50)))
        	{
        		data.player.SetUserName(userName);
        	}
	    	
	    	GUILayout.EndHorizontal();
	    	
	    	GUILayout.EndArea();
	    	return;
	    }
	    if(!connected){
		    GUI.Box(new Rect((Screen.width - 400) / 2, (Screen.height - 350) / 2, 400, 300), "Join or Create a Room");
		    	
		    GUILayout.BeginArea(new Rect((Screen.width - 400) / 2, (Screen.height - 350) / 2, 400, 300));
		    GUILayout.Space(50);
			GUILayout.BeginHorizontal();
			
			if (GUILayout.Button("Create Room", GUILayout.Width(100)))
	        {
	        	connectToRoom = true;
	            PhotonNetwork.CreateRoom(PhotonNetwork.playerName, true, true, 2);
	        }
	        
	        GUILayout.EndHorizontal();
	        GUILayout.Space(15);
	        GUILayout.BeginHorizontal();
	
	        GUILayout.Label(PhotonNetwork.countOfPlayers + " users are online in " + PhotonNetwork.countOfRooms + " rooms.");
	        GUILayout.FlexibleSpace();
	        if (GUILayout.Button("Join Random", GUILayout.Width(100)))
	        {
	        	connectToRoom = true;
	            PhotonNetwork.JoinRandomRoom();
	        }
	        
	
	        GUILayout.EndHorizontal();
	        GUILayout.Space(15);
	        if (PhotonNetwork.GetRoomList().Length != 0)
	        {
	            GUILayout.Label(PhotonNetwork.GetRoomList().Length + " currently available. Join either:");
	
	            this.scrollPos = GUILayout.BeginScrollView(this.scrollPos);
	            for each (var roomInfo:RoomInfo  in PhotonNetwork.GetRoomList())
	            {
	                GUILayout.BeginHorizontal();
	                GUILayout.Label(roomInfo.name.Split("&"[0])[0]);
	                if (GUILayout.Button("Join"))
	                {
	                	connectToRoom = true;
	                    PhotonNetwork.JoinRoom(roomInfo.name);
	                }
	
	                GUILayout.EndHorizontal();
	            }
	
	            GUILayout.EndScrollView();
	        }
	        
	        GUILayout.EndArea();
	        return;
	    }
	    if(!complete){
	    	GUI.Box(new Rect((Screen.width - 400) / 2, (Screen.height - 350) / 2, 400, 50), "Waiting Player");
	    	return;
	    }
	    if(gamesCount != 0){
	    	GUI.Box(new Rect((Screen.width - 400) / 2, (Screen.height - 350) / 2, 400, 300), "Game");
	    	GUILayout.BeginArea(new Rect((Screen.width - 400) / 2, (Screen.height - 350) / 2, 400, 300));
	    	
	    	GUILayout.Space(15);
	    	
	    	if (GUILayout.Button("Continue Game", GUILayout.Width(100)))
	        {
	            ContinueGame(true);
	        }
	        
	    	GUILayout.Space(15);
	    	
	    	if (GUILayout.Button("New Game", GUILayout.Width(100)))
	        {
	            NewGame(true);
	        }
	        
	        GUILayout.Space(15);
	        if (gamesCount > 1)
	        {	
	            this.scrollPosGame = GUILayout.BeginScrollView(this.scrollPosGame);
	            for (var i:uint = 0; i < gamesCount; i++)
	            {
	                GUILayout.BeginHorizontal();
	                GUILayout.Label(PlayerPrefs.GetString("last_level_with_" + data.otherPlayer.fullName + "_in_game_" + i.ToString()));
	                if (GUILayout.Button("Continue"))
	                {
	                    StartGame(i, true);
	                }
	
	                GUILayout.EndHorizontal();
	            }
	
	            GUILayout.EndScrollView();
	        }
	        
	        GUILayout.Space(15);
	    	
	    	GUILayout.EndArea();
	        return;
	    }
    }
    
    @RPC
    function SendNewGame(info:PhotonMessageInfo)
    {
    	gamesCount++;
		PlayerPrefs.SetInt("games_with_" + data.otherPlayer.fullName, gamesCount);
   		SendStartGame(gamesCount - 1, info);
    }
    
    @RPC
    function SendStartGame(gameId:int, info:PhotonMessageInfo)
    {
        data.InitSession(gameId);
		data.Save();
		PhotonNetwork.LoadLevel(data.session.levelName);
//		PhotonNetwork.LoadLevel("HeadTest");
    }
	
	function Update () {
		if(PhotonNetwork.countOfPlayers > 0 && fastStart && !connectToRoom){
			connectToRoom = true;
			if (PhotonNetwork.countOfPlayers == 1){
				PhotonNetwork.CreateRoom(PhotonNetwork.playerName, true, true, 2);
			} else {
				PhotonNetwork.JoinRandomRoom();
			}
		}
		if(connected && PhotonNetwork.otherPlayers.Length == 1 && !complete){
			complete = true;
			data.otherPlayer.Init(PhotonNetwork.otherPlayers[0].ToString());
			gamesCount = PlayerPrefs.GetInt("games_with_" + data.otherPlayer.fullName);
			if(gamesCount == 0){
				NewGame(true);
			}
			if(fastStart){
				ContinueGame(false);
			} 
		}
	}
	
	function ContinueGame(toAll:boolean){
		StartGame(PlayerPrefs.GetInt("last_game_with_" + data.otherPlayer.fullName), toAll);
	}
	
	function NewGame(toAll:boolean){
		if(toAll){
			photonView.RPC("SendNewGame", PhotonTargets.All);
		} else {
			SendNewGame(null);
		}	
	}
	
	function StartGame(gameId:int, toAll:boolean):void{
		if(toAll){
			photonView.RPC("SendStartGame", PhotonTargets.All, gameId);
		} else {
			SendStartGame(gameId, null);
		}	
	}
	
	function OnJoinedRoom()
    {
    	connected = true;
        Debug.Log("OnJoinedRoom");
    }

    function OnCreatedRoom()
    {
    	connected = true;
        Debug.Log("OnCreatedRoom");
    }

    function OnDisconnectedFromPhoton()
    {
        Debug.Log("Disconnected from Photon.");
    }

    function OnFailedToConnectToPhoton(parameters:Object)
    {
        Debug.Log("OnFailedToConnectToPhoton. StatusCode: " + parameters);
    }
}