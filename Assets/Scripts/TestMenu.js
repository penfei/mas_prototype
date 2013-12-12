#pragma strict

var bodyGroup:Group = new Group();
var leftLegUpGroup:Group = new Group();
var leftLegDownGroup:Group = new Group();
var leftFootGroup:Group = new Group();
var rightLegUpGroup:Group = new Group();
var rightLegDownGroup:Group = new Group();
var rightFootGroup:Group = new Group();
var leftShoulderGroup:Group = new Group();
var leftHandGroup:Group = new Group();
var rightShoulderGroup:Group = new Group();
var rightHandGroup:Group = new Group();

class Group{
	var groupName:String;
	var currentIndex:int = 0;
	var elements:Transform[];
}

function Start () {

}

function Update () {

}

function OnGUI()
{
	AddCategory(bodyGroup);
	AddCategory(leftLegUpGroup);
	AddCategory(leftLegDownGroup);
	AddCategory(leftFootGroup);
	AddCategory(leftShoulderGroup);
	AddCategory(leftHandGroup);
	AddCategory(rightLegUpGroup);
	AddCategory(rightLegDownGroup);
	AddCategory(rightFootGroup);
	AddCategory(rightShoulderGroup);
	AddCategory(rightHandGroup);
}

function AddCategory(group:Group)
{
    GUILayout.BeginHorizontal();

    if (GUILayout.Button("<", GUILayout.Width(20)))
        ChangeElement(group, group.currentIndex - 1);

    GUILayout.Box(group.groupName, GUILayout.Width(100));

    if (GUILayout.Button(">", GUILayout.Width(20)))
        ChangeElement(group, group.currentIndex + 1);

    GUILayout.EndHorizontal();
}

function ChangeElement(group:Group, nextIndex:int)
{
   	if(nextIndex < 0) nextIndex = group.elements.Length - 1; 
   	if(nextIndex >= group.elements.Length) nextIndex = 0;  
   	if(group.elements[group.currentIndex] != null){
   		group.elements[group.currentIndex].active = false;
   	} 
   	if(group.elements[nextIndex] != null){
   		group.elements[nextIndex].active = true;
   	}  
   	group.currentIndex = nextIndex;
}