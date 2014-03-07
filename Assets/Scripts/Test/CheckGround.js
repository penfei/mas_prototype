#pragma strict
class CheckGround extends MonoBehaviour{
	var ignoredObjects:GameObject[];
	var grounded:boolean = false;
	
	function OnTriggerStay (col:Collider)
	{
		if(col.isTrigger) return;
		for(var obj:GameObject in ignoredObjects){
			if(obj == col.gameObject) return;
		}
		grounded = true;	
	}
}