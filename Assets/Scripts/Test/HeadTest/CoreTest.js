#pragma strict

import Photon.MonoBehaviour;
 
class CoreTest extends Photon.MonoBehaviour{ 
	var headPrefab:Transform;

	function Awake()
    {
//		if (!PhotonNetwork.connected)
//        {
//            Application.LoadLevel(Levels.Menu);
//            return;
//        }
		
	}
	
	function OnGUI()
    {
        if (GUI.Button (new Rect(10,10,100,30),"Return to Loby"))
        {
            PhotonNetwork.LeaveRoom();
        }
		if (GUI.Button (new Rect(10,50,100,30),"Head")){
			InitHead(null);
			photonView.RPC("InitBody", PhotonTargets.Others);
		}
    }
    
    @RPC
    function InitHead(info:PhotonMessageInfo)
    {
		PhotonNetwork.Instantiate(this.headPrefab.name, transform.position, transform.rotation, 0);
		GameObject.Find("Camera").active = false;
    }
    
    @RPC
    function InitBody(info:PhotonMessageInfo)
    {
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
   		
    }
}