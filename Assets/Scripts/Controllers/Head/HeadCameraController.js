#pragma strict

class HeadCameraController extends Photon.MonoBehaviour{

	private var correctCameraRot:Quaternion = Quaternion.identity;
	
	function Start () {
		
	}
	
	function OnPhotonSerializeView(stream:PhotonStream, info:PhotonMessageInfo)
    {
        if (stream.isWriting)
        {
            stream.SendNext(transform.rotation); 
        }
        else
        {
            correctCameraRot = stream.ReceiveNext();
        }
    }
	
	function Update () {
		if (!photonView.isMine)
        {
        	transform.rotation = Quaternion.Lerp(transform.rotation, correctCameraRot, Time.deltaTime * 5);
        }
	}
}