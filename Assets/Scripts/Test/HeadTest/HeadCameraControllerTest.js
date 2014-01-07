#pragma strict

class HeadCameraControllerTest extends Photon.MonoBehaviour{

	public var smooth = 15f;
	public var basicCamera:Camera;

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
//        	gameObject.GetComponent(MouseLook).canRotation = false;
//        	transform.rotation = Quaternion.Lerp(transform.rotation, correctCameraRot, Time.deltaTime * smooth);
        }
	}
}