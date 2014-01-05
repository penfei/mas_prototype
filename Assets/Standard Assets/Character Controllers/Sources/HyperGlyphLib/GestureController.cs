using UnityEngine;
using System.Collections;

public class GestureController : MonoBehaviour {

	public GestureSet myGestures;
	public HyperGlyphResult match;
	public string matchStroke;

	// Use this for initialization
	public void Init () {
		HyperGlyph.Init(myGestures);
	}
	
	// Update is called once per frame
	public void AddPoint (Camera cam) {
		transform.position = cam.ScreenToWorldPoint (new Vector3 (Input.mousePosition.x,Input.mousePosition.y,10));
		HyperGlyph.AddPoint(Input.mousePosition);
	}

	public void Recognize () {
		match = HyperGlyph.Recognize();
	}

	void Update()
	{
		matchStroke = match.glyphname + 
			"\nscore: " + match.score +
				"\nbounds: " + match.bounds +
				"\ndirec:" + match.direction ;
	}
}
