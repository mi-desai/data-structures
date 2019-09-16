# Week03 HW Assignment
Task instructions provided by [Aaron Hill](https://github.com/aaronxhill).

Full instructions for this tasks can be found on the Parsons MSDV [Data Structures GitHub Page](https://github.com/visualizedata/data-structures/blob/master/weekly_assignment_03.md).

### Step 1 - Fixing Last Week's Mistakes

I had to update my solution to Week02's HW before I even started on this assignment, since I realized that extraneous information was present that would otherwise mess up the apiRequest function argument "value". 

See HW02's update, for the full code I used, but I was able to reduce down the addresses to this common format: 

<blockquote>
  122 East 37th Street NY 10016 <br>
  30 East 35th Street NY 10016 <br>
  350 East 56th Street NY 10022 <br>
  619 Lexington Avenue NY 10022 <br>
</blockquote>

However, there were two mistakes with this file that I corrected early on with rawData[0], and .split('\n'). First was that my output4.txt file was structured as an array with a single string entry. That was being passed through to the apiRequest variable, resulting in a huge http address that returned an error. 

So first I had to make sure the first string which contained all of my addresses was selected. I did this with rawData[0]. Then I applied a split by line breaks, which split output4 into multiple indices. This successfully created the entire array.

### Step 2 - Securing the API Key w/ An Environmental Variable

Per the instructions, I defined a const using an environmental variable to hold my API key. This way, the reference to the variable is not seen in the code. 


### Step 3 - Correctly Formating Addresses



### Step 4 - Debugging - Console Logging Variables at Various Points to Ensure Correct returns



### Step 5 - Parsing down the returned JSON



### Step 6 - Structuring the JSON to look better


