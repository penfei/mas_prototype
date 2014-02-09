#pragma strict

import Photon.MonoBehaviour;
 
class Core extends Photon.MonoBehaviour{ 
	public var isHead = false;
	public var isBody = false;
	
	var isConnected = false;
	var actionTimeOffset = 2f;
	
	var bodyPrefab:Transform;
	var headPrefab:Transform;
	
	var bodyStartPosition:Transform;
	var headStartPosition:Transform;
	
	var fastStart = false;
	
	public var body:GameObject;
	public var head:GameObject;
	
	private var timeAction = 0f;
	private var data:GameDataController;
	private var initedPrefabs:int = 0;
	private var message:String = "";
	private var isActivePrint:boolean = false;
	
	var bodyCorrectPlayerRot:Quaternion = Quaternion.identity;

	function Awake()
    {
    	data = GetComponent(GameDataController);
		if (!PhotonNetwork.connected && !fastStart)
        {
            Application.LoadLevel(Levels.Menu);
            return;
        }
		if (fastStart){
			PhotonNetwork.automaticallySyncScene = true;
		
			if (PhotonNetwork.connectionStateDetailed == PeerState.PeerCreated)
		    {
		        PhotonNetwork.ConnectUsingSettings("1.0");
		    }
		}
	}
	
	function Start()
	{
		if(!fastStart){
			data.StartLevel(PhotonNetwork.otherPlayers[0].ToString());
		}
	}
	
	function OnGUI()
    {
        if (GUI.Button (new Rect(10,10,100,30),"Return to Loby"))
        {
            PhotonNetwork.LeaveRoom();
        }
		if(!isHead && !isBody){
			if (GUI.Button (new Rect(10,50,100,30),"Head")){
				InitHead(null);
				photonView.RPC("InitBody", PhotonTargets.Others);
				if(fastStart){
					InitBody(null);
				}
			}
			if (GUI.Button (new Rect(10,90,100,30),"Body")){
				InitBody(null);
				photonView.RPC("InitHead", PhotonTargets.Others);
				if(fastStart){
					InitHead(null);
				}
			}
		}
    }
    
    @RPC
    function InitHead(info:PhotonMessageInfo)
    {
    	isHead = true;
		PhotonNetwork.Instantiate(this.headPrefab.name, headStartPosition.position, headStartPosition.rotation, 0);
		GameObject.Find("Camera").active = false;
    }
    
    @RPC
    function InitBody(info:PhotonMessageInfo)
    {
    	isBody = true;
		PhotonNetwork.Instantiate(this.bodyPrefab.name, bodyStartPosition.position, bodyStartPosition.rotation, 0);
		GameObject.Find("Camera").active = false;
    }
    
    function PlayerInit(){
		initedPrefabs++;
    }
    
    function isInited():boolean{
    	return initedPrefabs == 2;
    }
    
    function OnJoinedLobby(){
    	if(fastStart){
			PhotonNetwork.CreateRoom("solo" + Random.Range(1, 99999), true, true, 2);
			data.StartLevel("test_bot&" + data.player.userId);
		}
    }
	
	function OnMasterClientSwitched(player:PhotonPlayer)
    {
        Debug.Log("OnMasterClientSwitched: " + player);
    }

    function OnLeftRoom()
    {
        Debug.Log("OnLeftRoom (local)");
                
        Application.LoadLevel(Levels.Menu);
    }

    function OnDisconnectedFromPhoton()
    {
        Debug.Log("OnDisconnectedFromPhoton");
  
        Application.LoadLevel(Levels.Menu);
    }

    function OnPhotonInstantiate(info:PhotonMessageInfo)
    {
        Debug.Log("OnPhotonInstantiate " + info.sender);    // you could use this info to store this or react
    }

    function OnPhotonPlayerConnected(player:PhotonPlayer)
    {
        Debug.Log("OnPhotonPlayerConnected: " + player);
    }

    function OnPhotonPlayerDisconnected(player:PhotonPlayer)
    {
        Debug.Log("OnPlayerDisconneced: " + player);
        
       PhotonNetwork.LeaveRoom();
    }

    function OnFailedToConnectToPhoton()
    {
        Debug.Log("OnFailedToConnectToPhoton");
     
        Application.LoadLevel(Levels.Menu);
    }
    
    function Update()
    {
    	if(isInited()){
//	   		if(CanConnection()){
//	  			RPCConnection();
//	  		}
	  		if(CanDisconnection()){
	  			RPCDisconnection();
	  		}
	  		/* print message */
	  		if(Input.GetButtonDown("Chat")){
				head.GetComponent(HeadController).switchProjector();
				if(isHead){
					message = "";
					isActivePrint = !isActivePrint;
				}
			}
	  		if(isHead){
				if(Input.inputString != "" && Input.inputString != "\n"){
				//Input.GetKeyDown(KeyCode.KeypadEnter) || Input.GetKeyDown(KeyCode.Return)){
					if(isActivePrint){
						message += Input.inputString;
						//message += "\n";
						photonView.RPC("UpdateMessage", PhotonTargets.All, message);
					}
				}
	  		}
	  	}
    }
    
    public function CanConnection():boolean{
   		if(!isBody) return false;
    	return !isConnected 
    	&& Time.time > timeAction + actionTimeOffset && body.GetComponent(BodyController).leftHandController.CanConnection();
    }
    
    public function CanDisconnection():boolean{
    	return isConnected && Input.GetButton("Disconnection") && Time.time > timeAction + actionTimeOffset;
    }
    
    public function RPCConnection(){
    	photonView.RPC("Connection", PhotonTargets.All);
    }
    
    public function RPCDisconnection(){
    	if(isBody){
    		photonView.RPC("DisconnectionFromBody", PhotonTargets.All);
    	}
    	if(isHead){
    		photonView.RPC("DisconnectionFromHead", PhotonTargets.All);
    	}
    }
    
    @RPC
    public function Connection():void{
    	timeAction = Time.time;
    	isConnected = true;
    	head.transform.position = body.GetComponent(BodyController).boneForHead.transform.position;
    	head.transform.rotation = body.GetComponent(BodyController).boneForHead.transform.rotation;
    	head.transform.parent = body.GetComponent(BodyController).boneForHead.transform;
    	
    	head.GetComponent(PlayerController).cameraObject.transform.position = body.GetComponent(BodyController).boneForHeadCamera.transform.position;
    	head.GetComponent(PlayerController).cameraObject.transform.rotation = Quaternion.identity;
//    	head.GetComponent(PlayerController).cameraObject.transform.parent = body.GetComponent(BodyController).boneForHeadCamera.transform;
		head.GetComponent(PlayerController).cameraObject.transform.parent = null;
    	head.GetComponent(CharacterController).enabled = false;
    }
    
    @RPC
    public function DisconnectionFromHead():void{
    	Disconnection();
    	if(isHead){
    		head.GetComponent(ImpulsController).AddUpImpulse();
    	}
    }
    
    @RPC
    public function DisconnectionFromBody():void{
    	Disconnection();
    }
    
    public function Disconnection():void{
    	timeAction = Time.time;
    	isConnected = false;
		head.transform.rotation = Quaternion.identity;
		head.transform.rotation.y = body.transform.rotation.y;
    	head.transform.parent = null;
    	head.GetComponent(PlayerController).cameraObject.transform.position = head.transform.position;
   		head.GetComponent(PlayerController).cameraObject.transform.parent = head.transform;
   		head.GetComponent(CharacterController).enabled = true;
    }
    
    @RPC
	public function UpdateMessage(message:String, info:PhotonMessageInfo):void{
		head.GetComponent(HeadController).updateMessage(message);
	}
}