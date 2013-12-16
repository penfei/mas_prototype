#pragma strict

import Photon.MonoBehaviour;
 
class Core extends Photon.MonoBehaviour{ 
	var isHead = false;
	var isBody = false;
	
	var bodyPrefab:Transform;
	var headPrefab:Transform;

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
				isHead = true;
				PhotonNetwork.Instantiate(this.headPrefab.name, transform.position, Quaternion.identity, 0);
			}
			if (GUI.Button (new Rect(10,90,100,30),"Body")){
				isBody = true;
				PhotonNetwork.Instantiate(this.bodyPrefab.name, transform.position, Quaternion.identity, 0);
			}
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
        
        Application.LoadLevel(Levels.Menu);
    }

    function OnFailedToConnectToPhoton()
    {
        Debug.Log("OnFailedToConnectToPhoton");
     
        Application.LoadLevel(Levels.Menu);
    }
}