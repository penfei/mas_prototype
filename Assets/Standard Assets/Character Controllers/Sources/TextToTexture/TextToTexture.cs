﻿// TextToTexture - Class for apply Text-To-Texture without need for Render Texture
//
// released under MIT License
// http://www.opensource.org/licenses/mit-license.php
//
//@author		Devin Reimer
//@version		1.0.0
//@website 		http://blog.almostlogical.com

//Copyright (c) 2010 Devin Reimer
/*
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class TextToTexture
{
	private const int ASCII_START_OFFSET = 32;
	private Font customFont;
	private Texture2D fontTexture;
	private int fontCountX;
	private int fontCountY;
	private float[] kerningValues;
	private bool supportSpecialCharacters;
	
	private int maxWidth;
	private int maxLines;
	
	public TextToTexture(Font customFont, int fontCountX, int fontCountY,PerCharacterKerning[] perCharacterKerning,bool supportSpecialCharacters,int maxWidth, int maxLines)
	{
		this.customFont = customFont;
		fontTexture = (Texture2D)customFont.material.mainTexture;
		this.fontCountX = fontCountX;
		this.fontCountY = fontCountY;
		kerningValues = GetCharacterKerningValuesFromPerCharacterKerning(perCharacterKerning);
		this.supportSpecialCharacters = supportSpecialCharacters;
		this.maxWidth = maxWidth;
		this.maxLines = maxLines;
	}
	
	public string getFormatText(string message, float characterSize){
		string text = "";
		float tempWidth = 0;
		float letterWidth = 0;
		char letter;
		int fontItemWidth = (int)((fontTexture.width / fontCountX) * characterSize);
		int lines = 0;
		
		for (int n = 0; n < message.Length; n++)
		{
			letter = message[n];
			if ((letter == '\n' || letter == '\r'))
			{
				letterWidth = 0;
				tempWidth = 0;
			} else {
				if (n < message.Length - 1)
				{
					letterWidth = fontItemWidth * GetKerningValue(letter);
				}
				else 
				{
					letterWidth = fontItemWidth;
				}
			}
			tempWidth += letterWidth;
			text += letter;
			if(tempWidth > maxWidth){
				tempWidth = 0;
				if (n < message.Length - 1)
				{
					text += "\n";
					lines++;
				}
			}
		}

		while (lines > maxLines)
		{
			letter = text[0];
			if ((letter == '\n' || letter == '\r'))
			{
				lines--;
			}
			text = text.Substring(1, text.Length - 1);
		}
		return text;
	}
	
	//placementX and Y - placement within texture size, texture size = textureWidth and textureHeight (square)
	public Texture2D CreateTextToTexture(string text, int textPlacementX, int textPlacementY, int textureSize, float characterSize, float lineSpacing)
	{
		Texture2D txtTexture = CreatefillTexture2D(Color.white, textureSize, textureSize);
		int fontGridCellWidth = (int)(fontTexture.width / fontCountX);
		int fontGridCellHeight = (int)(fontTexture.height / fontCountY);
		int fontItemWidth = (int)(fontGridCellWidth * characterSize);
		int fontItemHeight = (int)(fontGridCellHeight * characterSize);
		Vector2 charTexturePos;
		Color[] charPixels;
		float textPosX = textPlacementX;
		float textPosY = textPlacementY;
		float charKerning;
		bool nextCharacterSpecial = false;
		char letter;
		
		for (int n = 0; n < text.Length; n++)
		{
			letter = text[n];
			nextCharacterSpecial = false;
			if ((letter == '\n' || letter == '\r') && supportSpecialCharacters)
			{
				nextCharacterSpecial = true;
				textPosY -= fontItemHeight * lineSpacing;
				textPosX = textPlacementX;
			}
			if (letter == '\t' && supportSpecialCharacters)
			{
				nextCharacterSpecial = true;
				textPosX += fontItemWidth * GetKerningValue(' ') * 5; //5 spaces
			}
			
			if (!nextCharacterSpecial && customFont.HasCharacter(letter))
			{
				charTexturePos = GetCharacterGridPosition(letter);
				charTexturePos.x *= fontGridCellWidth;
				charTexturePos.y *= fontGridCellHeight;
				charPixels = fontTexture.GetPixels((int)charTexturePos.x, fontTexture.height - (int)charTexturePos.y - fontGridCellHeight, fontGridCellWidth, fontGridCellHeight);
				charPixels = changeDimensions(charPixels, fontGridCellWidth, fontGridCellHeight, fontItemWidth, fontItemHeight);
				
				txtTexture = AddPixelsToTextureIfClear(txtTexture, charPixels, (int)textPosX, (int)textPosY, fontItemWidth, fontItemHeight);
				charKerning = GetKerningValue(letter);
				textPosX += (fontItemWidth * charKerning); //add kerning here
			}
			else if (!nextCharacterSpecial)
			{
				Debug.Log("Letter Not Found:" + letter);
			}
			
		}
		txtTexture.Apply();
		return txtTexture;
	}
	
	//doesn't yet support special characters
	//trailing buffer is to allow for area where the character might be at the end
	public int CalcTextWidthPlusTrailingBuffer(string text,int decalTextureSize,float characterSize)
	{
		char letter;
		float width = 0;
		float w = 0;
		int fontItemWidth = (int)((fontTexture.width / fontCountX) * characterSize);
		
		for (int n = 0; n < text.Length; n++)
		{
			letter = text[n];
			if ((letter == '\n' || letter == '\r'))
			{
				if(w > width){
					width = w;
				}
				w = 0;
			} else {
				if (n < text.Length - 1)
				{
					w+= fontItemWidth * GetKerningValue(letter);
				}
				else //last letter ignore kerning for buffer
				{
					w += fontItemWidth;
				}
			}
		}
		if(w > width){
			width = w;
		}
		
		return (int)width;
	}
	
	public int CalcTextHeightOffset(string text,float characterSize,float lineSpacing)
	{
		char letter;
		int fontItemHeight = (int)((fontTexture.height / fontCountY) * characterSize);
		float height = -(fontItemHeight * lineSpacing) / 2;
		
		for (int n = 0; n < text.Length; n++)
		{
			letter = text[n];
			if ((letter == '\n' || letter == '\r'))
			{
				height += (fontItemHeight * lineSpacing) / 2;
			}
		}
		
		return (int)height;
	}
	
	//look for a faster way of calculating this
	private Color[] changeDimensions(Color[] originalColors, int originalWidth, int originalHeight, int newWidth, int newHeight)
	{
		Color[] newColors;
		Texture2D originalTexture;
		int pixelCount;
		float u;
		float v;
		
		if (originalWidth == newWidth && originalHeight == newHeight)
		{
			newColors = originalColors;
		}
		else
		{
			newColors = new Color[newWidth * newHeight];
			originalTexture = new Texture2D(originalWidth, originalHeight);
			
			originalTexture.SetPixels(originalColors);
			for (int y = 0; y < newHeight; y++)
			{
				for (int x = 0; x < newWidth; x++)
				{
					pixelCount = x + (y * newWidth);
					u = (float)x / newWidth;
					v = (float)y / newHeight;
					newColors[pixelCount] = originalTexture.GetPixelBilinear(u, v);
				}
			}
		}
		
		return newColors;
	}
	
	//add pixels to texture if pixels are currently clear
	private Texture2D AddPixelsToTextureIfClear(Texture2D texture, Color[] newPixels, int placementX, int placementY, int placementWidth, int placementHeight)
	{
		int pixelCount = 0;
		Color[] currPixels;
		
		if (placementX + placementWidth < texture.width)
		{
			currPixels = texture.GetPixels(placementX, placementY, placementWidth, placementHeight);
			
			for (int y = 0; y < placementHeight; y++) //vert
			{
				for (int x = 0; x < placementWidth; x++) //horiz
				{
					pixelCount = x + (y * placementWidth);
					//                    if (currPixels[pixelCount] != Color.clear) //if pixel is not empty take the previous value
					//                    {
					//                        newPixels[pixelCount] = currPixels[pixelCount];
					//                    }
				}
			}
			
			texture.SetPixels(placementX, placementY, placementWidth, placementHeight, newPixels);
		}
		else
		{
			Debug.Log("Letter Falls Outside Bounds of Texture" + (placementX + placementWidth));
		}
		return texture;
	}
	
	private Vector2 GetCharacterGridPosition(char c)
	{
		int codeOffset = c - ASCII_START_OFFSET;
		
		return new Vector2(codeOffset % fontCountX, (int)codeOffset / fontCountX);
	}
	
	private float GetKerningValue(char c)
	{
		int res = ((int)c) - ASCII_START_OFFSET;
		if (res < 0 || res >= kerningValues.Length) {
			res = 0;
		}
		//return kerningValues[((int)c) - ASCII_START_OFFSET];
		return kerningValues[res];
	}
	
	private Texture2D CreatefillTexture2D(Color color, int textureWidth, int textureHeight)
	{
		Texture2D texture = new Texture2D(textureWidth, textureHeight);
		texture.wrapMode = TextureWrapMode.Clamp;
		int numOfPixels = texture.width * texture.height;
		Color[] colors = new Color[numOfPixels];
		for (int x = 0; x < numOfPixels; x++)
		{
			colors[x] = color;
		}
		
		texture.SetPixels(colors);
		
		return texture;
	}
	
	private float[] GetCharacterKerningValuesFromPerCharacterKerning(PerCharacterKerning[] perCharacterKerning)
	{
		float[] perCharKerning = new float[128 - ASCII_START_OFFSET];
		int charCode;
		
		foreach (PerCharacterKerning perCharKerningObj in perCharacterKerning)
		{
			if (perCharKerningObj.First != "")
			{
				charCode = (int)perCharKerningObj.GetChar(); ;
				if (charCode >= 0 && charCode - ASCII_START_OFFSET < perCharKerning.Length)
				{
					perCharKerning[charCode - ASCII_START_OFFSET] = perCharKerningObj.GetKerningValue();
				}
			}
		}
		return perCharKerning;
	}
}

[System.Serializable]
public class PerCharacterKerning
{
	//these are named First and Second not because I'm terrible at naming things, but to make it look and act more like Custom Font natively do within Unity
	public string First = ""; //character
	public float Second; //kerning ex: 0.201
	
	public PerCharacterKerning(string character, float kerning)
	{
		this.First = character;
		this.Second = kerning;
	}
	
	public PerCharacterKerning(char character, float kerning)
	{
		this.First = "" + character;
		this.Second = kerning;
	}
	
	public char GetChar()
	{
		return First[0];
	}
	public float GetKerningValue() { return Second; }
}