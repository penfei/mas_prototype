#pragma strict

class Broadcaster{

	private var queue:Array = new Array();
	private var callbacks:Array = new Array();

	public function broadcast ()
	{
		var l:uint = callbacks.length;
		if (l == 0)
		{
			return;
		}
				
		var i:uint = 0;
		for (i = 0; i < l; i++)
		{
			queue[i] = callbacks[i];
		}
		for (i = 0; i < l; i++)
		{
			var q:Function = queue[i] as Function;
			q();
		}
		queue.length = 0;
	}
			
	public function subscribe (method:Function)
	{
		if (indexOf(callbacks, method) == -1)
		{
			callbacks[callbacks.length] = method;
		}
	}
			
	public function unsubscribe (method:Function)
	{
		var index:int = indexOf(callbacks, method);
		if (index > -1)
		{
			callbacks.splice(index, 1);
		}
	}

	private function indexOf(arr:Array, obj:Object):int{
		var i:uint = 0;
		for (i = 0; i < arr.length; i++)
		{
			if(arr[i] == obj){
				return i;
			}
		}
		return -1;
	}
}