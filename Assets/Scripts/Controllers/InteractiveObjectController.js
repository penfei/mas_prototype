#pragma strict

class InteractiveObjectController extends Photon.MonoBehaviour{

	public var smooth = 15f;
	
	private var correctPos:Vector3 = Vector3.zero;
	private var correctRot:Quaternion = Quaternion.identity;
	
	function Start () {
        if (!photonView.isMine)
        {	
        	Destroy(gameObject.GetComponent(Rigidbody));
        }
	}
	
	function OnPhotonSerializeView(stream:PhotonStream, info:PhotonMessageInfo)
    {
        if (stream.isWriting)
        {
        	stream.SendNext(transform.position); 
            stream.SendNext(transform.rotation); 
        }
        else
        {
        	correctPos = stream.ReceiveNext();
            correctRot = stream.ReceiveNext();
        }
    }
	
	function Update () {
		if (!photonView.isMine)
        {	
        	transform.position = Vector3.Lerp(transform.position, correctPos, Time.deltaTime * smooth);
        	transform.rotation = Quaternion.Lerp(transform.rotation, correctRot, Time.deltaTime * smooth);
        }
	}
}