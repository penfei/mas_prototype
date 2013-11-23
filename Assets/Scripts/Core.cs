using UnityEngine;
using System.Collections;

public class Core : Photon.MonoBehaviour {
	public bool isHead = false;
	public bool isBody = false;
	
	public Transform bodyPrefab;
	public Transform headPrefab;

	public void Awake()
    {
		if (!PhotonNetwork.connected)
        {
            Application.LoadLevel(WorkerMenu.SceneNameMenu);
            return;
        }
		
	}
	
	public void OnGUI()
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
	
	 public void OnMasterClientSwitched(PhotonPlayer player)
    {
        Debug.Log("OnMasterClientSwitched: " + player);

        string message;
        InRoomChat chatComponent = GetComponent<InRoomChat>();  // if we find a InRoomChat component, we print out a short message

        if (chatComponent != null)
        {
            // to check if this client is the new master...
            if (player.isLocal)
            {
                message = "You are Master Client now.";
            }
            else
            {
                message = player.name + " is Master Client now.";
            }


            chatComponent.AddLine(message); // the Chat method is a RPC. as we don't want to send an RPC and neither create a PhotonMessageInfo, lets call AddLine()
        }
    }

    public void OnLeftRoom()
    {
        Debug.Log("OnLeftRoom (local)");
        
        // back to main menu        
        Application.LoadLevel(WorkerMenu.SceneNameMenu);
    }

    public void OnDisconnectedFromPhoton()
    {
        Debug.Log("OnDisconnectedFromPhoton");

        // back to main menu        
        Application.LoadLevel(WorkerMenu.SceneNameMenu);
    }

    public void OnPhotonInstantiate(PhotonMessageInfo info)
    {
        Debug.Log("OnPhotonInstantiate " + info.sender);    // you could use this info to store this or react
    }

    public void OnPhotonPlayerConnected(PhotonPlayer player)
    {
        Debug.Log("OnPhotonPlayerConnected: " + player);
    }

    public void OnPhotonPlayerDisconnected(PhotonPlayer player)
    {
        Debug.Log("OnPlayerDisconneced: " + player);
    }

    public void OnFailedToConnectToPhoton()
    {
        Debug.Log("OnFailedToConnectToPhoton");

        // back to main menu        
        Application.LoadLevel(WorkerMenu.SceneNameMenu);
    }
}
