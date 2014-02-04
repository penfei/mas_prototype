#pragma strict

class InteractiveObjectController extends Photon.MonoBehaviour{

	public var smooth = 15f;
	
	private var correctPos:Vector3 = Vector3.zero;
	private var correctRot:Quaternion = Quaternion.identity;
	private var drag:DragingObject;
	private var hasData:boolean = false;
	
	function Start () {
		drag = GetComponent(DragingObject);
        if (!photonView.isMine)
        {	
        	rigidbody.useGravity = false;
//        	Destroy(gameObject.GetComponent(Rigidbody));
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
        	if(!drag.inHand){
        		if(rigidbody != null){
	        		Destroy(gameObject.GetComponent(Rigidbody));
	        	}
	        	transform.position = Vector3.Lerp(transform.position, correctPos, Time.deltaTime * smooth);
	        	transform.rotation = Quaternion.Lerp(transform.rotation, correctRot, Time.deltaTime * smooth);
	        } else {
	        	if(rigidbody == null){
	        		gameObject.AddComponent(Rigidbody);
	        	}
	        }
        }
	}
}