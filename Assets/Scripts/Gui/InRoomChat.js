#pragma strict

import System.Collections.Generic;
import UnityEngine;
import System.Collections;

@script RequireComponent(PhotonView)
class InRoomChat extends Photon.MonoBehaviour 
{	
	public var GuiRect:Rect = new Rect(0,0, 250,300);
	public var IsVisible:boolean = true;
	public var AlignBottom:boolean = false;
	public var messages:List.<String> = new List.<String>();
	private var inputLine:String = "";
	private var scrollPos:Vector2 = Vector2.zero;
	private var core:Core;
	
	public static var ChatRPC:String = "Chat";
	
	function Start()
	{
		core = GameObject.Find("Administration").GetComponent(Core);
		if (this.AlignBottom)
		{
			this.GuiRect.y = Screen.height - this.GuiRect.height + 200;
		}
	}
	
	public function OnGUI():void
	{
		if (!this.IsVisible || PhotonNetwork.connectionStateDetailed != PeerState.Joined)
		{
			return;
		}
		if (core == null || core.isBody || (!core.isBody && !core.isHead)) {
			return;
		}
		
		if (Event.current.type == EventType.KeyDown && (Event.current.keyCode == KeyCode.KeypadEnter || Event.current.keyCode == KeyCode.Return))
		{
			if (!String.IsNullOrEmpty(this.inputLine))
			{
				this.photonView.RPC("Chat", PhotonTargets.All, this.inputLine);
				this.inputLine = "";
				GUI.FocusControl("");
				return; // printing the now modified list would result in an error. to avoid this, we just skip this single frame
			}
			else
			{
				GUI.FocusControl("ChatInput");
			}
		}
		
		GUI.SetNextControlName("");
		GUILayout.BeginArea(this.GuiRect);
		
		scrollPos = GUILayout.BeginScrollView(scrollPos);
		GUILayout.FlexibleSpace();
		for (var i:int = messages.Count - 1; i >= 0; i--)
		{
			GUILayout.Label(messages[i]);
		}
		GUILayout.EndScrollView();
		
		GUILayout.BeginHorizontal();
		GUI.SetNextControlName("ChatInput");
		inputLine = GUILayout.TextField(inputLine);
		if (GUILayout.Button("Send", GUILayout.ExpandWidth(false)))
		{
			this.photonView.RPC("Chat", PhotonTargets.All, this.inputLine);
			this.inputLine = "";
			GUI.FocusControl("");
		}
		GUILayout.EndHorizontal();
		GUILayout.EndArea();
	}
	
	@RPC
	public function Chat(newLine:String, mi:PhotonMessageInfo):void
	{
		var senderName:String = "anonymous";
		Debug.Log("newLine = " + newLine);
        if (mi != null && mi.sender != null)
        {
            if (!String.IsNullOrEmpty(mi.sender.name))
            {
                senderName = mi.sender.name;
            }
            else
            {
                senderName = "player " + mi.sender.ID;
            }
        }

        this.messages.Add(senderName +": " + newLine);
	}
	
	public function AddLine(newLine:String):void
	{
		this.messages.Add(newLine);
	}
}