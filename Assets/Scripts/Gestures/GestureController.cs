using UnityEngine;
using System.Collections;

public class GestureController : MonoBehaviour {
	
	public GestureSet myGestures;
	public Camera cam;
	public HyperGlyphResult match;
	
	void Start () {
		HyperGlyph.Init(myGestures);
	}
	
	void Update () {
		if(Input.GetMouseButton(0))
		{
			//This next line moves our empty gameobject so the trail renderer can draw a line for us.
			transform.position = cam.ScreenToWorldPoint (new Vector3 (Input.mousePosition.x,Input.mousePosition.y,10));
			HyperGlyph.AddPoint(Input.mousePosition);
		}
		
		if(Input.GetMouseButtonUp(0)){
			match = HyperGlyph.Recognize();
		}
	}
	
	void OnGUI()
	{
		Rect GUIPosition = new Rect(15,Screen.height - 100,800,100);
		GUI.Label(GUIPosition, match.glyphname + 
		          "\nscore: " + match.score +
		          "\nbounds: " + match.bounds +
		          "\ndirec:" + match.direction );
	}
}
