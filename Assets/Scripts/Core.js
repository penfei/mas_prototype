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
	
	public var body:GameObject;
	public var head:GameObject;
	
	private var timeAction = 0f;
	
	var bodyCorrectPlayerRot:Quaternion = Quaternion.identity;

	function Awake()
    {
		if (!PhotonNetwork.connected)
        {
            Application.LoadLevel(Levels.Menu);
            return;
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
			}
			if (GUI.Button (new Rect(10,90,100,30),"Body")){
				InitBody(null);
				photonView.RPC("InitHead", PhotonTargets.Others);
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
   		if(CanConnection()){
  			RPCConnection();
  		}
  		if(CanDisconnection()){
  			RPCDisconnection();
  		}
    }
    
    public function CanConnection():boolean{
   		if(!isBody) return false;
    	return !isConnected && Input.GetButton("Action")
    	&& Time.time > timeAction + actionTimeOffset && body.GetComponent(NetworkController).leftHandController.CanConnection();
    }
    
    public function CanDisconnection():boolean{
    	return isConnected && Input.GetButton("Action") && Time.time > timeAction + actionTimeOffset;
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
    	head.transform.position = body.GetComponent(NetworkController).boneForHead.transform.position;
    	head.transform.rotation = body.GetComponent(NetworkController).boneForHead.transform.rotation;
    	head.transform.parent = body.GetComponent(NetworkController).boneForHead.transform;
    	
    	head.GetComponent(NetworkController).cameraObject.transform.position = body.GetComponent(NetworkController).boneForHeadCamera.transform.position;
    	head.GetComponent(NetworkController).cameraObject.transform.rotation = body.GetComponent(NetworkController).boneForHeadCamera.transform.rotation;
    	head.GetComponent(NetworkController).cameraObject.transform.parent = body.GetComponent(NetworkController).boneForHeadCamera.transform;
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
    	head.transform.parent = null;
    	head.transform.rotation.x = 0;
    	head.transform.rotation.z = 0;
    	head.GetComponent(NetworkController).cameraObject.transform.position = head.transform.position;
   		head.GetComponent(NetworkController).cameraObject.transform.parent = head.transform;
   		head.GetComponent(NetworkController).cameraObject.transform.rotation.y = 0;
    	head.GetComponent(NetworkController).cameraObject.transform.rotation.z = 0;
   		head.GetComponent(CharacterController).enabled = true;
    }
}